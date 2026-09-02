import type { AdminRole } from '@/src/admin/access';

export const accountStatuses = ['active', 'suspended', 'banned'] as const;
export type AccountStatus = (typeof accountStatuses)[number];

export const reportStatuses = [
  'open',
  'reviewing',
  'resolved',
  'dismissed',
] as const;
export type ReportStatus = (typeof reportStatuses)[number];

export const accountStatusLabels: Record<AccountStatus, string> = {
  active: 'Aktif',
  suspended: 'Askıya alınmış',
  banned: 'Yasaklı',
};

export const reportStatusLabels: Record<ReportStatus, string> = {
  open: 'Yeni',
  reviewing: 'İnceleniyor',
  resolved: 'İşlem yapıldı',
  dismissed: 'Reddedildi',
};

export function isAccountStatus(value: unknown): value is AccountStatus {
  return accountStatuses.includes(value as AccountStatus);
}

export function canUseSocialFeatures(status: AccountStatus) {
  return status === 'active';
}

export function isReportStatus(value: unknown): value is ReportStatus {
  return reportStatuses.includes(value as ReportStatus);
}

export function canTransitionReport(
  current: ReportStatus,
  next: ReportStatus,
) {
  if (current === next) return true;
  if (current === 'open') return true;
  if (current === 'reviewing') return next !== 'open';
  return false;
}

export function normalizeReason(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, 500);
}

export function assertReason(value: unknown) {
  const reason = normalizeReason(value);
  if (reason.length < 8) {
    throw new Error('İşlem nedeni en az 8 karakter olmalı.');
  }
  return reason;
}

export function groupDisplayName(data: Record<string, unknown>) {
  const period = [data.militaryPeriodMonth, data.militaryPeriodYear]
    .filter(Boolean)
    .join('/');
  const unit =
    typeof data.militaryUnitName === 'string' && data.militaryUnitName.trim()
      ? data.militaryUnitName
      : `Şehir ${typeof data.militaryCity === 'string' || typeof data.militaryCity === 'number' ? data.militaryCity : '—'}`;
  return `${unit}${period ? ` · ${period}` : ''}`;
}

export function canUsePush(role: AdminRole, broadcast: boolean) {
  if (broadcast) return role === 'super_admin';
  return role === 'super_admin' || role === 'moderator';
}

export function appConfigIsConnected() {
  return false as const;
}
