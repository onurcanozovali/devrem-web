import { auditWrite, recordAudit, type AuditAction } from '@/lib/admin/audit';
import type { AdminSession } from '@/lib/admin/session';
import {
  commitFirestoreWrites,
  getFirestoreDocument,
} from '@/lib/firebase/server';
import { setFirebaseAdminRole } from '@/lib/firebase/auth-admin';
import {
  assertReason,
  canTransitionReport,
  isAccountStatus,
  isReportStatus,
  type AccountStatus,
  type ReportStatus,
} from '@/src/admin/domain';
import {
  canChangeFinalSuperAdmin,
  isAdminRole,
  type AdminRole,
} from '@/src/admin/access';

type RecordData = Record<string, unknown>;

function text(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function accountAuditAction(
  current: AccountStatus,
  next: AccountStatus,
): AuditAction {
  if (next === 'banned') return 'USER_BANNED';
  if (next === 'suspended') return 'USER_SUSPENDED';
  return current === 'banned' ? 'USER_UNBANNED' : 'USER_UNSUSPENDED';
}

export async function updateUserAccountStatus({
  uid,
  status,
  reason,
  admin,
}: {
  uid: string;
  status: unknown;
  reason: unknown;
  admin: AdminSession;
}) {
  if (!uid) throw new Error('Kullanıcı kimliği gerekli.');
  if (!isAccountStatus(status)) throw new Error('Hesap durumu geçerli değil.');
  const safeReason = assertReason(reason);
  const existing = await getFirestoreDocument('_accountAccess', uid);
  const current = isAccountStatus(existing?.data.status)
    ? existing.data.status
    : 'active';
  if (current === status) return { changed: false, status };
  const now = new Date().toISOString();
  await commitFirestoreWrites([
    {
      path: `_accountAccess/${uid}`,
      data: {
        uid,
        status,
        publicProfileHidden: existing?.data.publicProfileHidden === true,
        reason: safeReason,
        updatedAt: now,
        updatedBy: admin.uid,
      },
    },
    auditWrite({
      action: accountAuditAction(current, status),
      admin,
      targetType: 'user',
      targetId: uid,
      reason: safeReason,
      metadata: { previousStatus: current, nextStatus: status },
      now,
    }),
  ]);
  return { changed: true, status };
}

export async function updatePublicProfileVisibility({
  uid,
  hidden,
  reason,
  admin,
}: {
  uid: string;
  hidden: unknown;
  reason: unknown;
  admin: AdminSession;
}) {
  if (!uid || typeof hidden !== 'boolean') {
    throw new Error('Profil görünürlüğü isteği geçerli değil.');
  }
  const safeReason = assertReason(reason);
  const existing = await getFirestoreDocument('_accountAccess', uid);
  if ((existing?.data.publicProfileHidden === true) === hidden) {
    return { changed: false, hidden };
  }
  const now = new Date().toISOString();
  await commitFirestoreWrites([
    {
      path: `_accountAccess/${uid}`,
      data: {
        uid,
        status: isAccountStatus(existing?.data.status)
          ? existing.data.status
          : 'active',
        publicProfileHidden: hidden,
        visibilityReason: safeReason,
        updatedAt: now,
        updatedBy: admin.uid,
      },
    },
    auditWrite({
      action: hidden ? 'PROFILE_HIDDEN' : 'PROFILE_UNHIDDEN',
      admin,
      targetType: 'user',
      targetId: uid,
      reason: safeReason,
      metadata: { hidden },
      now,
    }),
  ]);
  return { changed: true, hidden };
}

function reportAuditAction(status: ReportStatus): AuditAction {
  if (status === 'reviewing') return 'REPORT_REVIEWING';
  if (status === 'dismissed') return 'REPORT_DISMISSED';
  return 'REPORT_RESOLVED';
}

export async function updateModerationReport({
  reportId,
  status,
  note,
  reason,
  admin,
}: {
  reportId: string;
  status: unknown;
  note?: unknown;
  reason: unknown;
  admin: AdminSession;
}) {
  if (!reportId || !isReportStatus(status) || status === 'open') {
    throw new Error('Rapor işlemi geçerli değil.');
  }
  const safeReason = assertReason(reason);
  const report = await getFirestoreDocument('moderationReports', reportId);
  if (!report) throw new Error('Rapor bulunamadı.');
  const current = isReportStatus(report.data.status)
    ? report.data.status
    : 'open';
  if (!canTransitionReport(current, status)) {
    throw new Error('Bu rapor durum geçişine izin verilmiyor.');
  }
  const now = new Date().toISOString();
  await commitFirestoreWrites([
    {
      path: `moderationReports/${reportId}`,
      data: {
        status,
        moderationNote: text(note).trim().slice(0, 2_000),
        resolvedAt: status === 'reviewing' ? null : now,
        resolvedBy: status === 'reviewing' ? null : admin.uid,
      },
      updateFields: ['status', 'moderationNote', 'resolvedAt', 'resolvedBy'],
    },
    auditWrite({
      action: reportAuditAction(status),
      admin,
      targetType: 'moderationReport',
      targetId: reportId,
      reason: safeReason,
      metadata: { previousStatus: current, nextStatus: status },
      now,
    }),
  ]);
  return { status };
}

export async function updateReportedMessageVisibility({
  reportId,
  hidden,
  reason,
  admin,
}: {
  reportId: string;
  hidden: unknown;
  reason: unknown;
  admin: AdminSession;
}) {
  if (hidden !== true) throw new Error('Mesaj kaldırma isteği geçerli değil.');
  const safeReason = assertReason(reason);
  const report = await getFirestoreDocument('moderationReports', reportId);
  if (!report) throw new Error('Rapor bulunamadı.');
  const messageId = text(report.data.messageId);
  const conversationId = text(report.data.conversationId);
  const conversationType = text(report.data.conversationType);
  if (!messageId || !conversationId || !['direct', 'group'].includes(conversationType)) {
    throw new Error('Rapora bağlı mesaj bulunamadı.');
  }
  const path =
    conversationType === 'direct'
      ? `directConversations/${conversationId}/messages/${messageId}`
      : `devreGroups/${conversationId}/messages/${messageId}`;
  const now = new Date().toISOString();
  await commitFirestoreWrites([
    {
      path,
      data: {
        deletedForEveryone: true,
        deletedAt: now,
        deletedBy: admin.uid,
      },
      updateFields: ['deletedForEveryone', 'deletedAt', 'deletedBy'],
    },
    auditWrite({
      action: 'MESSAGE_REMOVED',
      admin,
      targetType: `${conversationType}Message`,
      targetId: messageId,
      reason: safeReason,
      metadata: { reportId, conversationId },
      now,
    }),
  ]);
  return { hidden: true };
}

export async function updateGroupStatus({
  groupId,
  disabled,
  reason,
  admin,
}: {
  groupId: string;
  disabled: unknown;
  reason: unknown;
  admin: AdminSession;
}) {
  if (!groupId || typeof disabled !== 'boolean') {
    throw new Error('Grup işlemi geçerli değil.');
  }
  const safeReason = assertReason(reason);
  const now = new Date().toISOString();
  await commitFirestoreWrites([
    {
      path: `_adminGroupControls/${groupId}`,
      data: {
        groupId,
        status: disabled ? 'disabled' : 'active',
        reason: safeReason,
        updatedAt: now,
        updatedBy: admin.uid,
      },
    },
    auditWrite({
      action: disabled ? 'GROUP_DISABLED' : 'GROUP_ENABLED',
      admin,
      targetType: 'devreGroup',
      targetId: groupId,
      reason: safeReason,
      metadata: { disabled },
      now,
    }),
  ]);
  return { status: disabled ? 'disabled' : 'active' };
}

export type MilitaryUnitInput = {
  name: string;
  city: string;
  district: string;
  force: string;
  verificationStatus: 'unverified' | 'reviewing' | 'verified';
  publicationStatus: 'draft' | 'reviewed' | 'published';
  latitude: number | null;
  longitude: number | null;
  mapStatus: 'query-only' | 'candidate' | 'verified';
  about: string;
  transport: string;
  facilities: string;
  notes: string;
};

export function parseMilitaryUnitInput(value: unknown): MilitaryUnitInput {
  const input = (value ?? {}) as RecordData;
  const verificationStatus = text(input.verificationStatus);
  const publicationStatus = text(input.publicationStatus);
  const mapStatus = text(input.mapStatus);
  const latitude = input.latitude === '' || input.latitude == null ? null : Number(input.latitude);
  const longitude = input.longitude === '' || input.longitude == null ? null : Number(input.longitude);
  const result: MilitaryUnitInput = {
    name: text(input.name).trim().slice(0, 180),
    city: text(input.city).trim().slice(0, 80),
    district: text(input.district).trim().slice(0, 80),
    force: text(input.force).trim().slice(0, 80),
    verificationStatus: ['unverified', 'reviewing', 'verified'].includes(verificationStatus)
      ? (verificationStatus as MilitaryUnitInput['verificationStatus'])
      : 'unverified',
    publicationStatus: ['draft', 'reviewed', 'published'].includes(publicationStatus)
      ? (publicationStatus as MilitaryUnitInput['publicationStatus'])
      : 'draft',
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    mapStatus: ['query-only', 'candidate', 'verified'].includes(mapStatus)
      ? (mapStatus as MilitaryUnitInput['mapStatus'])
      : 'query-only',
    about: text(input.about).trim().slice(0, 5_000),
    transport: text(input.transport).trim().slice(0, 5_000),
    facilities: text(input.facilities).trim().slice(0, 5_000),
    notes: text(input.notes).trim().slice(0, 5_000),
  };
  if (result.name.length < 3 || !result.city) {
    throw new Error('Birlik adı ve şehir zorunludur.');
  }
  if (
    result.mapStatus === 'verified' &&
    (result.latitude == null || result.longitude == null)
  ) {
    throw new Error('Doğrulanmış harita durumu için koordinatlar zorunludur.');
  }
  if (
    result.verificationStatus !== 'verified' &&
    result.mapStatus === 'verified'
  ) {
    throw new Error('Doğrulanmamış birlik koordinatı doğrulanmış olarak işaretlenemez.');
  }
  return result;
}

export async function saveMilitaryUnit({
  unitId,
  input,
  reason,
  admin,
}: {
  unitId: string;
  input: unknown;
  reason: unknown;
  admin: AdminSession;
}) {
  if (!/^[a-zA-Z0-9_-]{8,160}$/.test(unitId)) {
    throw new Error('Birlik kimliği geçerli değil.');
  }
  const safeReason = assertReason(reason);
  const unit = parseMilitaryUnitInput(input);
  const existing = await getFirestoreDocument('_adminMilitaryUnits', unitId);
  const now = new Date().toISOString();
  await commitFirestoreWrites([
    {
      path: `_adminMilitaryUnits/${unitId}`,
      data: {
        ...unit,
        createdAt: existing?.data.createdAt ?? now,
        updatedAt: now,
        updatedBy: admin.uid,
        mobileSourceConnected: false,
      },
    },
    auditWrite({
      action: existing ? 'UNIT_UPDATED' : 'UNIT_CREATED',
      admin,
      targetType: 'militaryUnit',
      targetId: unitId,
      reason: safeReason,
      metadata: {
        verificationStatus: unit.verificationStatus,
        publicationStatus: unit.publicationStatus,
      },
      now,
    }),
  ]);
  return { id: unitId, ...unit };
}

export async function changeAdminRole({
  uid,
  role,
  reason,
  admin,
  superAdminCount,
  targetRole,
}: {
  uid: string;
  role: unknown;
  reason: unknown;
  admin: AdminSession;
  superAdminCount: number;
  targetRole: AdminRole | null;
}) {
  const nextRole = role === null || role === '' ? null : role;
  if (nextRole !== null && !isAdminRole(nextRole)) {
    throw new Error('Admin rolü geçerli değil.');
  }
  if (
    !canChangeFinalSuperAdmin({ targetRole, nextRole, superAdminCount })
  ) {
    throw new Error('Son süper adminin erişimi kaldırılamaz.');
  }
  if (uid === admin.uid && targetRole === 'super_admin' && nextRole !== 'super_admin') {
    throw new Error('Kendi süper admin erişiminizi bu oturumdan kaldıramazsınız.');
  }
  const safeReason = assertReason(reason);
  await setFirebaseAdminRole(uid, nextRole);
  await recordAudit({
    action: nextRole ? 'ADMIN_ROLE_CHANGED' : 'ADMIN_ACCESS_REVOKED',
    admin,
    targetType: 'adminUser',
    targetId: uid,
    reason: safeReason,
    metadata: {
      previousRole: targetRole ?? 'none',
      nextRole: nextRole ?? 'none',
    },
  });
  return { role: nextRole };
}
