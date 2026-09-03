export const COMMUNITY_TOPIC_COLLECTION = 'communityTopics';
export const COMMUNITY_USER_COLLECTION = 'communityUsers';
export const COMMUNITY_REPORT_COLLECTION = 'communityReports';
export const COMMUNITY_REPLY_COLLECTION = 'replies';

export const TOPIC_TITLE_MIN = 10;
export const TOPIC_TITLE_MAX = 140;
export const TOPIC_BODY_MIN = 20;
export const TOPIC_BODY_MAX = 5000;
export const REPLY_BODY_MIN = 4;
export const REPLY_BODY_MAX = 3000;
export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 32;
export const TOPIC_PAGE_SIZE = 18;
export const REPLY_PAGE_SIZE = 40;
export const HOME_TOPIC_PREVIEW_COUNT = 3;
export const WRITE_COOLDOWN_MS = 8_000;
export const DUPLICATE_WINDOW_MS = 60_000;

export const communityCategories = [
  { id: 'bedelli', label: 'Bedelli' },
  { id: 'celp-donemleri', label: 'Celp Dönemleri' },
  { id: 'birlikler', label: 'Birlikler' },
  { id: 'hazirlik', label: 'Hazırlık' },
  { id: 'askerlik-hayati', label: 'Askerlik Hayatı' },
  { id: 'genel', label: 'Genel' },
] as const;

export type CommunityCategoryId = (typeof communityCategories)[number]['id'];

export const communitySorts = [
  { id: 'aktif', label: 'Son Aktif' },
  { id: 'yeni', label: 'Yeni' },
  { id: 'populer', label: 'Popüler' },
] as const;

export type CommunitySortId = (typeof communitySorts)[number]['id'];

export const communityReportReasons = [
  'Spam',
  'Hakaret / Taciz',
  'Yanlış Bilgi',
  'Uygunsuz İçerik',
  'Diğer',
] as const;

export type CommunityReportReason = (typeof communityReportReasons)[number];

export const communityCategoryIds = communityCategories.map((item) => item.id);

export function isCommunityCategoryId(
  value: string,
): value is CommunityCategoryId {
  return communityCategoryIds.includes(value as CommunityCategoryId);
}

export function isCommunitySortId(value: string): value is CommunitySortId {
  return communitySorts.some((item) => item.id === value);
}

export function isCommunityReportReason(
  value: string,
): value is CommunityReportReason {
  return communityReportReasons.includes(value as CommunityReportReason);
}

export function categoryLabel(id: CommunityCategoryId) {
  return communityCategories.find((item) => item.id === id)?.label ?? id;
}
