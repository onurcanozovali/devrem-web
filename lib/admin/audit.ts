import { commitFirestoreWrites, type FirestoreCommitWrite } from '@/lib/firebase/server';
import type { AdminSession } from '@/lib/admin/session';

export type AuditAction =
  | 'BLOG_CREATED'
  | 'BLOG_UPDATED'
  | 'BLOG_STATUS_CHANGED'
  | 'BLOG_DELETED'
  | 'BLOG_MEDIA_UPDATED'
  | 'USER_SUSPENDED'
  | 'USER_UNSUSPENDED'
  | 'USER_BANNED'
  | 'USER_UNBANNED'
  | 'PROFILE_HIDDEN'
  | 'PROFILE_UNHIDDEN'
  | 'REPORT_REVIEWING'
  | 'REPORT_RESOLVED'
  | 'REPORT_DISMISSED'
  | 'MESSAGE_REMOVED'
  | 'GROUP_DISABLED'
  | 'GROUP_ENABLED'
  | 'UNIT_CREATED'
  | 'UNIT_UPDATED'
  | 'PUSH_SENT'
  | 'APP_CONFIG_UPDATED'
  | 'ADMIN_ROLE_CHANGED'
  | 'ADMIN_ACCESS_REVOKED';

export function buildAuditEntry({
  action,
  admin,
  targetType,
  targetId,
  reason,
  metadata = {},
  now = new Date().toISOString(),
}: {
  action: AuditAction;
  admin: AdminSession;
  targetType: string;
  targetId: string;
  reason: string;
  metadata?: Record<string, string | number | boolean | null>;
  now?: string;
}) {
  return {
    action,
    adminUid: admin.uid,
    adminEmail: admin.email,
    adminRole: admin.role,
    targetType,
    targetId,
    timestamp: now,
    reason,
    metadata,
  };
}

export function auditWrite(input: Parameters<typeof buildAuditEntry>[0]) {
  return {
    path: `_adminAuditLogs/${crypto.randomUUID()}`,
    data: buildAuditEntry(input),
  } satisfies FirestoreCommitWrite;
}

export async function recordAudit(
  input: Parameters<typeof buildAuditEntry>[0],
) {
  await commitFirestoreWrites([auditWrite(input)]);
}
