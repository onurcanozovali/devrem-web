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

export type MilitaryUnitFacilityStatus = 'unknown' | 'reported' | 'verified';
export type MilitaryUnitFacility = {
  status: MilitaryUnitFacilityStatus;
  note: string;
};
export type MilitaryUnitSource = {
  title: string;
  url: string;
  note: string;
};

export type MilitaryUnitInput = {
  name: string;
  shortName: string;
  aliases: string[];
  city: string;
  district: string;
  force: string;
  unitType: string;
  audiences: string[];
  verificationStatus: 'unverified' | 'reviewing' | 'verified';
  publicationStatus: 'draft' | 'published';
  latitude: number | null;
  longitude: number | null;
  mapStatus: 'query-only' | 'candidate' | 'verified';
  coordinateVerificationStatus: 'unverified' | 'reviewing' | 'verified';
  mapSourceUrl: string;
  address: string;
  transportation: {
    busStation: string;
    airport: string;
    trainStation: string;
    cityCenter: string;
    general: string;
  };
  introduction: string;
  verifiedFacts: string[];
  joiningNotes: string;
  preparationNotes: string;
  facilities: Record<'canteen' | 'infirmary' | 'atm' | 'barber' | 'diningHall' | 'communication', MilitaryUnitFacility>;
  otherFacilities: MilitaryUnitFacility[];
  sources: MilitaryUnitSource[];
  verifiedAt: string;
  sourceNote: string;
  internalAdminNote: string;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  indexable: boolean;
};

function list(value: unknown, limit = 20, itemLimit = 240) {
  const items = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[\n,]/)
      : [];
  return items
    .flatMap((item) => {
      const normalized = text(item).trim().slice(0, itemLimit);
      return normalized ? [normalized] : [];
    })
    .slice(0, limit);
}

function slug(value: unknown) {
  return text(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .toLocaleLowerCase('tr-TR')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160);
}

function safeUrl(value: unknown) {
  const candidate = text(value).trim().slice(0, 500);
  if (!candidate) return '';
  try {
    const parsed = new URL(candidate);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : '';
  } catch {
    return '';
  }
}

function facility(value: unknown): MilitaryUnitFacility {
  const data = value && typeof value === 'object' ? value as RecordData : {};
  const status = text(data.status);
  return {
    status: ['unknown', 'reported', 'verified'].includes(status)
      ? status as MilitaryUnitFacilityStatus
      : 'unknown',
    note: text(data.note).trim().slice(0, 500),
  };
}

export function parseMilitaryUnitInput(value: unknown): MilitaryUnitInput {
  const input = (value ?? {}) as RecordData;
  const verificationStatus = text(input.verificationStatus);
  const publicationStatus = text(input.publicationStatus);
  const mapStatus = text(input.mapStatus);
  const coordinateVerificationStatus = text(input.coordinateVerificationStatus);
  const latitude = input.latitude === '' || input.latitude == null ? null : Number(input.latitude);
  const longitude = input.longitude === '' || input.longitude == null ? null : Number(input.longitude);
  const transportation = input.transportation && typeof input.transportation === 'object'
    ? input.transportation as RecordData
    : {};
  const facilityInput = input.facilities && typeof input.facilities === 'object'
    ? input.facilities as RecordData
    : {};
  const sources = Array.isArray(input.sources)
    ? input.sources.flatMap((item) => {
        const source = item && typeof item === 'object' ? item as RecordData : {};
        const url = safeUrl(source.url);
        const title = text(source.title).trim().slice(0, 180);
        const note = text(source.note).trim().slice(0, 1_000);
        return title || url ? [{ title, url, note }] : [];
      }).slice(0, 8)
    : safeUrl(input.sourceUrl) || text(input.sourceTitle).trim()
      ? [{
          title: text(input.sourceTitle).trim().slice(0, 180),
          url: safeUrl(input.sourceUrl),
          note: '',
        }]
      : [];
  const defaultSlug = slug(input.name);
  const name = text(input.name).trim().slice(0, 180);
  const result: MilitaryUnitInput = {
    name,
    shortName: text(input.shortName).trim().slice(0, 120),
    aliases: list(input.aliases, 20, 120),
    city: text(input.city).trim().slice(0, 80),
    district: text(input.district).trim().slice(0, 80),
    force: text(input.force).trim().slice(0, 80),
    unitType: text(input.unitType).trim().slice(0, 120),
    audiences: list(input.audiences, 12, 80),
    verificationStatus: ['unverified', 'reviewing', 'verified'].includes(verificationStatus)
      ? (verificationStatus as MilitaryUnitInput['verificationStatus'])
      : 'unverified',
    publicationStatus: publicationStatus === 'published' ? 'published' : 'draft',
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    mapStatus: ['query-only', 'candidate', 'verified'].includes(mapStatus)
      ? (mapStatus as MilitaryUnitInput['mapStatus'])
      : 'query-only',
    coordinateVerificationStatus: ['unverified', 'reviewing', 'verified'].includes(coordinateVerificationStatus)
      ? coordinateVerificationStatus as MilitaryUnitInput['coordinateVerificationStatus']
      : 'unverified',
    mapSourceUrl: safeUrl(input.mapSourceUrl),
    address: text(input.address).trim().slice(0, 1_000),
    transportation: {
      busStation: text(transportation.busStation).trim().slice(0, 2_000),
      airport: text(transportation.airport).trim().slice(0, 2_000),
      trainStation: text(transportation.trainStation).trim().slice(0, 2_000),
      cityCenter: text(transportation.cityCenter).trim().slice(0, 2_000),
      general: text(transportation.general ?? input.transport).trim().slice(0, 2_000),
    },
    introduction: text(input.introduction ?? input.about).trim().slice(0, 3_000),
    verifiedFacts: list(input.verifiedFacts, 30, 500),
    joiningNotes: text(input.joiningNotes).trim().slice(0, 3_000),
    preparationNotes: text(input.preparationNotes).trim().slice(0, 3_000),
    facilities: {
      canteen: facility(facilityInput.canteen),
      infirmary: facility(facilityInput.infirmary),
      atm: facility(facilityInput.atm),
      barber: facility(facilityInput.barber),
      diningHall: facility(facilityInput.diningHall),
      communication: facility(facilityInput.communication),
    },
    otherFacilities: Array.isArray(input.otherFacilities)
      ? input.otherFacilities.map(facility).filter((item) => item.note).slice(0, 12)
      : [],
    sources,
    verifiedAt: text(input.verifiedAt).trim().slice(0, 40),
    sourceNote: text(input.sourceNote).trim().slice(0, 2_000),
    internalAdminNote: text(input.internalAdminNote ?? input.notes ?? input.facilities).trim().slice(0, 5_000),
    slug: slug(input.slug) || defaultSlug,
    seoTitle: text(input.seoTitle).trim().slice(0, 120) || `${name}: Konum, Ulaşım ve Birlik Bilgileri | Devrem`,
    metaDescription: text(input.metaDescription).trim().slice(0, 200) || `${name} için konum, kuvvet, doğrulanmış birlik bilgileri ve ulaşım rehberi.`,
    indexable: input.indexable === true,
  };
  if (result.name.length < 3 || !result.city || !result.force) {
    throw new Error('Birlik adı, kuvvet ve şehir zorunludur.');
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result.slug)) {
    throw new Error('Public slug geçerli değil.');
  }
  if (result.latitude !== null && (result.latitude < -90 || result.latitude > 90)) {
    throw new Error('Enlem -90 ile 90 arasında olmalıdır.');
  }
  if (result.longitude !== null && (result.longitude < -180 || result.longitude > 180)) {
    throw new Error('Boylam -180 ile 180 arasında olmalıdır.');
  }
  if (
    result.mapStatus === 'verified' &&
    (result.latitude == null || result.longitude == null)
  ) {
    throw new Error('Doğrulanmış harita durumu için koordinatlar zorunludur.');
  }
  if (
    (result.verificationStatus !== 'verified' || result.coordinateVerificationStatus !== 'verified') &&
    result.mapStatus === 'verified'
  ) {
    throw new Error('Doğrulanmamış birlik koordinatı doğrulanmış olarak işaretlenemez.');
  }
  if (result.verificationStatus === 'verified') {
    if (!result.verifiedAt || Number.isNaN(Date.parse(result.verifiedAt))) {
      throw new Error('Doğrulanmış kayıt için doğrulama tarihi zorunludur.');
    }
    if (!result.sources.some((source) => source.url)) {
      throw new Error('Doğrulanmış kayıt için en az bir kaynak URL zorunludur.');
    }
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
        status: unit.publicationStatus,
        isPublished: unit.publicationStatus === 'published',
        verified: unit.verificationStatus === 'verified',
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
