import {
  countFirestoreDocuments,
  getFirestoreDocument,
  getFirestoreDocumentPath,
  queryFirestoreDocuments,
  type FirestoreQueryFilter,
} from '@/lib/firebase/server';
import {
  groupDisplayName,
  isAccountStatus,
  isReportStatus,
  type AccountStatus,
  type ReportStatus,
} from '@/src/admin/domain';
import {
  aggregateProvinceValues,
  dashboardDateKey,
  emptyProvinceCounts,
  fillDailyRegistrations,
  isMilitaryProfileComplete,
  normalizeAggregateCounts,
  periodKey,
  periodLabel,
} from '@/src/admin/dashboard';

type RecordData = Record<string, unknown>;

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function number(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function boolean(value: unknown) {
  return value === true;
}

function isoDate(value: unknown) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
    ? value
    : null;
}

function accessStatus(value: unknown): AccountStatus {
  return isAccountStatus(value) ? value : 'active';
}

export type AdminUserListItem = {
  uid: string;
  firstName: string;
  lastName: string;
  photoPath: string | null;
  status: AccountStatus;
  publicProfileHidden: boolean;
  createdAt: string | null;
  onboardingCompleted: boolean;
  militaryPeriod: string;
  militaryCity: number | null;
  militaryUnit: string;
  militaryType: string;
  groupId: string | null;
  hasReports: boolean;
};

function mapUser(data: RecordData): AdminUserListItem {
  const year = number(data.militaryPeriodYear);
  const month = number(data.militaryPeriodMonth);
  return {
    uid: text(data.uid),
    firstName: text(data.firstName, '—'),
    lastName: text(data.lastName),
    photoPath: text(data.photoPath) || null,
    status: 'active',
    publicProfileHidden: false,
    createdAt: isoDate(data.createdAt),
    onboardingCompleted: boolean(data.onboardingCompleted),
    militaryPeriod:
      year && month ? `${String(month).padStart(2, '0')}/${year}` : '—',
    militaryCity: number(data.militaryCity),
    militaryUnit:
      text(data.militaryUnitNameSnapshot) || text(data.militaryUnit, '—'),
    militaryType: text(data.militaryType, '—'),
    groupId: null,
    hasReports: false,
  };
}

async function enrichUsers(users: AdminUserListItem[]) {
  const uids = users.map((user) => user.uid).filter(Boolean).slice(0, 30);
  if (!uids.length) return users;
  const [access, memberships, reports] = await Promise.all([
    queryFirestoreDocuments({
      collection: '_accountAccess',
      filters: [{ field: 'uid', op: 'IN', value: uids }],
      limit: 30,
    }).catch(() => ({ records: [], nextCursor: null })),
    queryFirestoreDocuments({
      collection: '_devreGroupMemberships',
      filters: [{ field: 'uid', op: 'IN', value: uids }],
      limit: 30,
    }).catch(() => ({ records: [], nextCursor: null })),
    queryFirestoreDocuments({
      collection: 'moderationReports',
      filters: [{ field: 'reportedUid', op: 'IN', value: uids }],
      limit: 100,
    }).catch(() => ({ records: [], nextCursor: null })),
  ]);
  const accessByUid = new Map(
    access.records.map((record) => [text(record.data.uid, record.id), record.data]),
  );
  const groupByUid = new Map(
    memberships.records.map((record) => [
      text(record.data.uid, record.id),
      text(record.data.groupId) || null,
    ]),
  );
  const reportedUids = new Set(reports.records.map((record) => text(record.data.reportedUid)));
  return users.map((user) => {
    const accessRecord = accessByUid.get(user.uid);
    return {
      ...user,
      status: accessStatus(accessRecord?.status),
      publicProfileHidden: boolean(accessRecord?.publicProfileHidden),
      groupId: groupByUid.get(user.uid) ?? null,
      hasReports: reportedUids.has(user.uid),
    };
  });
}

export type UserListFilters = {
  q?: string;
  searchField?: 'name' | 'surname' | 'uid';
  status?: AccountStatus;
  period?: string;
  city?: string;
  unit?: string;
  militaryType?: string;
  registeredFrom?: string;
  registeredTo?: string;
  cursor?: string;
};

export function buildAdminUserQuerySpec(filters: UserListFilters) {
  const where: FirestoreQueryFilter[] = [];
  const query = filters.q?.trim();
  if (query) {
    const searchField = filters.searchField ?? 'name';
    where.push({
      field:
        searchField === 'uid'
          ? 'uid'
          : searchField === 'surname'
            ? 'lastName'
            : 'firstName',
      op: 'EQUAL',
      value: query,
    });
  }
  if (filters.period?.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = filters.period.split('-').map(Number);
    where.push(
      { field: 'militaryPeriodYear', op: 'EQUAL', value: year },
      { field: 'militaryPeriodMonth', op: 'EQUAL', value: month },
    );
  }
  const city = Number(filters.city);
  if (city >= 1 && city <= 81) {
    where.push({ field: 'militaryCity', op: 'EQUAL', value: city });
  }
  if (filters.unit?.trim()) {
    where.push({ field: 'militaryUnit', op: 'EQUAL', value: filters.unit.trim() });
  }
  if (filters.militaryType?.trim()) {
    where.push({ field: 'militaryType', op: 'EQUAL', value: filters.militaryType.trim() });
  }
  if (filters.registeredFrom && !Number.isNaN(Date.parse(filters.registeredFrom))) {
    where.push({ field: 'createdAt', op: 'GREATER_THAN_OR_EQUAL', value: new Date(filters.registeredFrom).toISOString() });
  }
  if (filters.registeredTo && !Number.isNaN(Date.parse(filters.registeredTo))) {
    const end = new Date(filters.registeredTo);
    end.setUTCDate(end.getUTCDate() + 1);
    where.push({ field: 'createdAt', op: 'LESS_THAN', value: end.toISOString() });
  }
  return {
    collection: 'users',
    filters: where,
    orderBy: [
      { field: 'createdAt', direction: 'DESCENDING' as const },
      { field: '__name__', direction: 'DESCENDING' as const },
    ],
    limit: 25,
    cursor: filters.cursor,
  };
}

export async function listAdminUsers(filters: UserListFilters) {
  const limit = 25;
  if (filters.status && filters.status !== 'active') {
    const access = await queryFirestoreDocuments({
      collection: '_accountAccess',
      filters: [{ field: 'status', op: 'EQUAL', value: filters.status }],
      orderBy: [
        { field: 'updatedAt', direction: 'DESCENDING' },
        { field: '__name__', direction: 'DESCENDING' },
      ],
      limit,
      cursor: filters.cursor,
    });
    const uids = access.records.map((record) => text(record.data.uid, record.id));
    if (!uids.length) return { users: [], nextCursor: null };
    const matches = await queryFirestoreDocuments({
      collection: 'users',
      filters: [{ field: 'uid', op: 'IN', value: uids }],
      limit,
    });
    const mapped = new Map(matches.records.map((record) => [record.id, mapUser(record.data)]));
    const ordered = uids.flatMap((uid) => (mapped.has(uid) ? [mapped.get(uid)!] : []));
    return { users: await enrichUsers(ordered), nextCursor: access.nextCursor };
  }

  const result = await queryFirestoreDocuments(buildAdminUserQuerySpec(filters));
  const users = await enrichUsers(result.records.map((record) => mapUser({ uid: record.id, ...record.data })));
  return {
    users:
      filters.status === 'active'
        ? users.filter((user) => user.status === 'active')
        : users,
    nextCursor: result.nextCursor,
  };
}

export async function getAdminUserDetail(uid: string) {
  const [user, profile, access, moderation, membership, reports] = await Promise.all([
    getFirestoreDocument('users', uid),
    getFirestoreDocument('publicProfiles', uid),
    getFirestoreDocument('_accountAccess', uid),
    getFirestoreDocument('_adminUserModeration', uid),
    getFirestoreDocument('_devreGroupMemberships', uid),
    queryFirestoreDocuments({
      collection: 'moderationReports',
      filters: [{ field: 'reportedUid', op: 'EQUAL', value: uid }],
      limit: 20,
    }),
  ]);
  if (!user) return null;
  const groupId = text(membership?.data.groupId);
  const group = groupId ? await getFirestoreDocument('devreGroups', groupId) : null;
  return {
    uid,
    user: user.data,
    profile: profile?.data ?? null,
    access: access?.data ?? { status: 'active', publicProfileHidden: false },
    moderation: moderation?.data ?? null,
    membership: membership?.data ?? null,
    group: group?.data ?? null,
    reports: reports.records,
  };
}

export type AdminReportListItem = {
  id: string;
  reporterUid: string;
  reportedUid: string;
  conversationType: string;
  conversationId: string;
  messageId: string | null;
  reason: string;
  status: ReportStatus;
  createdAt: string | null;
};

function mapReport(id: string, data: RecordData): AdminReportListItem {
  return {
    id,
    reporterUid: text(data.reporterUid),
    reportedUid: text(data.reportedUid),
    conversationType: text(data.conversationType, 'user'),
    conversationId: text(data.conversationId),
    messageId: text(data.messageId) || null,
    reason: text(data.reason, 'Belirtilmedi'),
    status: isReportStatus(data.status) ? data.status : 'open',
    createdAt: isoDate(data.createdAt),
  };
}

export async function listModerationReports({
  status,
  type,
  cursor,
}: {
  status?: string;
  type?: string;
  cursor?: string;
}) {
  const where: FirestoreQueryFilter[] = [];
  if (isReportStatus(status)) where.push({ field: 'status', op: 'EQUAL', value: status });
  if (type === 'direct' || type === 'group') {
    where.push({ field: 'conversationType', op: 'EQUAL', value: type });
  }
  const result = await queryFirestoreDocuments({
    collection: 'moderationReports',
    filters: where,
    orderBy: [
      { field: 'createdAt', direction: 'DESCENDING' },
      { field: '__name__', direction: 'DESCENDING' },
    ],
    limit: 25,
    cursor,
  });
  return {
    reports: result.records.map((record) => mapReport(record.id, record.data)),
    nextCursor: result.nextCursor,
  };
}

export async function getModerationReportDetail(reportId: string) {
  const report = await getFirestoreDocument('moderationReports', reportId);
  if (!report) return null;
  const mapped = mapReport(reportId, report.data);
  const [reporter, reported, previousReports, audit] = await Promise.all([
    mapped.reporterUid ? getFirestoreDocument('publicProfiles', mapped.reporterUid) : null,
    mapped.reportedUid ? getFirestoreDocument('publicProfiles', mapped.reportedUid) : null,
    mapped.reportedUid
      ? queryFirestoreDocuments({
          collection: 'moderationReports',
          filters: [{ field: 'reportedUid', op: 'EQUAL', value: mapped.reportedUid }],
          limit: 10,
        })
      : { records: [], nextCursor: null },
    queryFirestoreDocuments({
      collection: '_adminAuditLogs',
      filters: [{ field: 'targetId', op: 'EQUAL', value: reportId }],
      limit: 20,
    }),
  ]);
  const messagePath =
    mapped.messageId && mapped.conversationId
      ? mapped.conversationType === 'direct'
        ? `directConversations/${mapped.conversationId}/messages/${mapped.messageId}`
        : `devreGroups/${mapped.conversationId}/messages/${mapped.messageId}`
      : null;
  const message = messagePath ? await getFirestoreDocumentPath(messagePath) : null;
  return {
    report: mapped,
    raw: report.data,
    reporter: reporter?.data ?? null,
    reported: reported?.data ?? null,
    reportedMessage: message?.data ?? null,
    previousReports: previousReports.records,
    audit: audit.records,
  };
}

export type AdminGroupListItem = {
  id: string;
  name: string;
  kind: string;
  period: string;
  city: number | null;
  unit: string;
  militaryType: string;
  force: string;
  memberCount: number | null;
  lastActivityAt: string | null;
  status: 'active' | 'disabled';
  createdAt: string | null;
};

export function mapAdminGroup(
  id: string,
  data: RecordData,
  status: string | undefined,
): AdminGroupListItem {
  return {
    id,
    name: groupDisplayName(data),
    kind: text(data.kind, 'devre'),
    period: `${String(number(data.militaryPeriodMonth) ?? '—').padStart(2, '0')}/${number(data.militaryPeriodYear) ?? '—'}`,
    city: number(data.militaryCity),
    unit: text(data.militaryUnitName, '—'),
    militaryType: text(data.militaryType, '—'),
    force: text(data.forceCode, '—'),
    memberCount: number(data.memberCount),
    lastActivityAt: isoDate(data.lastActivityAt) ?? isoDate(data.lastMessageAt),
    status: status === 'disabled' ? 'disabled' : 'active',
    createdAt: isoDate(data.createdAt),
  };
}

export async function listAdminGroups(cursor?: string) {
  const result = await queryFirestoreDocuments({
    collection: 'devreGroups',
    orderBy: [
      { field: 'createdAt', direction: 'DESCENDING' },
      { field: '__name__', direction: 'DESCENDING' },
    ],
    limit: 25,
    cursor,
  });
  const ids = result.records.map((record) => record.id);
  const controls = ids.length
    ? await queryFirestoreDocuments({
        collection: '_adminGroupControls',
        filters: [{ field: 'groupId', op: 'IN', value: ids }],
        limit: 30,
      }).catch(() => ({ records: [], nextCursor: null }))
    : { records: [], nextCursor: null };
  const statusById = new Map(
    controls.records.map((record) => [text(record.data.groupId, record.id), text(record.data.status)]),
  );
  return {
    groups: result.records.map(({ id, data }) =>
      mapAdminGroup(id, data, statusById.get(id)),
    ),
    nextCursor: result.nextCursor,
  };
}

export async function getAdminGroupDetail(groupId: string, cursor?: string) {
  const [group, control, members, incidents, memberCount] = await Promise.all([
    getFirestoreDocument('devreGroups', groupId),
    getFirestoreDocument('_adminGroupControls', groupId),
    queryFirestoreDocuments({
      parent: `devreGroups/${groupId}`,
      collection: 'members',
      orderBy: [{ field: '__name__', direction: 'ASCENDING' }],
      limit: 25,
      cursor,
    }),
    queryFirestoreDocuments({
      collection: 'moderationReports',
      filters: [{ field: 'conversationId', op: 'EQUAL', value: groupId }],
      limit: 20,
    }),
    countFirestoreDocuments({ parent: `devreGroups/${groupId}`, collection: 'members' }),
  ]);
  if (!group) return null;
  return {
    id: groupId,
    group: group.data,
    control: control?.data ?? { status: 'active' },
    members: members.records,
    nextCursor: members.nextCursor,
    incidents: incidents.records,
    memberCount,
  };
}

export async function listAdminMilitaryUnits(cursor?: string) {
  const result = await queryFirestoreDocuments({
    collection: '_adminMilitaryUnits',
    orderBy: [
      { field: 'updatedAt', direction: 'DESCENDING' },
      { field: '__name__', direction: 'DESCENDING' },
    ],
    limit: 25,
    cursor,
  });
  return { units: result.records, nextCursor: result.nextCursor };
}

export async function getAdminMilitaryUnit(unitId: string) {
  return getFirestoreDocument('_adminMilitaryUnits', unitId);
}

export async function listAuditLogs({
  admin,
  action,
  targetType,
  from,
  to,
  cursor,
}: {
  admin?: string;
  action?: string;
  targetType?: string;
  from?: string;
  to?: string;
  cursor?: string;
}) {
  const filters: FirestoreQueryFilter[] = [];
  if (admin?.trim()) filters.push({ field: 'adminUid', op: 'EQUAL', value: admin.trim() });
  if (action?.trim()) filters.push({ field: 'action', op: 'EQUAL', value: action.trim() });
  if (targetType?.trim()) filters.push({ field: 'targetType', op: 'EQUAL', value: targetType.trim() });
  if (from && !Number.isNaN(Date.parse(from))) {
    filters.push({ field: 'timestamp', op: 'GREATER_THAN_OR_EQUAL', value: new Date(from).toISOString() });
  }
  if (to && !Number.isNaN(Date.parse(to))) {
    const end = new Date(to);
    end.setUTCDate(end.getUTCDate() + 1);
    filters.push({ field: 'timestamp', op: 'LESS_THAN', value: end.toISOString() });
  }
  const result = await queryFirestoreDocuments({
    collection: '_adminAuditLogs',
    filters,
    orderBy: [
      { field: 'timestamp', direction: 'DESCENDING' },
      { field: '__name__', direction: 'DESCENDING' },
    ],
    limit: 50,
    cursor,
  });
  return { logs: result.records, nextCursor: result.nextCursor };
}

export async function getAdminAnalyticsMetrics() {
  const [dashboard, memberships] = await Promise.all([
    getAdminDashboardMetrics(),
    countFirestoreDocuments({ collection: '_devreGroupMemberships' }),
  ]);
  return {
    ...dashboard,
    onboardingIncomplete: Math.max(0, dashboard.users - dashboard.onboarding),
    memberships,
  };
}

export async function getAdminDashboardMetrics() {
  const now = new Date();
  const startToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const sevenDays = new Date(now);
  sevenDays.setUTCDate(sevenDays.getUTCDate() - 7);
  const thirtyDays = new Date(now);
  thirtyDays.setUTCDate(thirtyDays.getUTCDate() - 30);
  const [
    users,
    today,
    last7,
    last30,
    onboarding,
    groups,
    disabledGroups,
    openReports,
    suspended,
    banned,
    blogPosts,
    publishedPosts,
    conversations,
    resolvedReports,
  ] = await Promise.all([
    countFirestoreDocuments({ collection: 'users' }),
    countFirestoreDocuments({ collection: 'users', filters: [{ field: 'createdAt', op: 'GREATER_THAN_OR_EQUAL', value: startToday.toISOString() }] }),
    countFirestoreDocuments({ collection: 'users', filters: [{ field: 'createdAt', op: 'GREATER_THAN_OR_EQUAL', value: sevenDays.toISOString() }] }),
    countFirestoreDocuments({ collection: 'users', filters: [{ field: 'createdAt', op: 'GREATER_THAN_OR_EQUAL', value: thirtyDays.toISOString() }] }),
    countFirestoreDocuments({ collection: 'users', filters: [{ field: 'onboardingCompleted', op: 'EQUAL', value: true }] }),
    countFirestoreDocuments({ collection: 'devreGroups' }),
    countFirestoreDocuments({ collection: '_adminGroupControls', filters: [{ field: 'status', op: 'EQUAL', value: 'disabled' }] }),
    countFirestoreDocuments({ collection: 'moderationReports', filters: [{ field: 'status', op: 'IN', value: ['open', 'reviewing'] }] }),
    countFirestoreDocuments({ collection: '_accountAccess', filters: [{ field: 'status', op: 'EQUAL', value: 'suspended' }] }),
    countFirestoreDocuments({ collection: '_accountAccess', filters: [{ field: 'status', op: 'EQUAL', value: 'banned' }] }),
    countFirestoreDocuments({ collection: 'blogPosts' }),
    countFirestoreDocuments({ collection: 'blogPosts', filters: [{ field: 'status', op: 'EQUAL', value: 'published' }] }),
    countFirestoreDocuments({ collection: 'directConversations' }),
    countFirestoreDocuments({ collection: 'moderationReports', filters: [{ field: 'status', op: 'EQUAL', value: 'resolved' }] }),
  ]);
  return {
    users,
    today,
    last7,
    last30,
    onboarding,
    groups: Math.max(0, groups - disabledGroups),
    disabledGroups,
    openReports,
    suspended,
    banned,
    blogPosts,
    publishedPosts,
    conversations,
    resolvedReports,
  };
}

type DashboardDataSource = 'aggregate' | 'bounded-server-fallback' | 'unavailable';

function aggregateNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.trunc(value))
    : null;
}

function aggregateDate(value: unknown) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null;
}

function registrationsFromAggregate(value: Record<string, unknown> | null) {
  const registrations: Record<string, number> = {};
  const source = value?.registrations ?? value?.days;
  if (source && typeof source === 'object' && !Array.isArray(source)) {
    for (const [date, count] of Object.entries(source as Record<string, unknown>)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date) && aggregateNumber(count) !== null) {
        registrations[date] = aggregateNumber(count)!;
      }
    }
  }
  const buckets = value?.buckets;
  if (Array.isArray(buckets)) {
    for (const bucket of buckets) {
      if (!bucket || typeof bucket !== 'object') continue;
      const item = bucket as Record<string, unknown>;
      if (typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
        registrations[item.date] = aggregateNumber(item.registrations) ?? 0;
      }
    }
  }
  return registrations;
}

function periodsFromAggregate(value: unknown, currentPeriod: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>)
    .flatMap(([key, rawCount]) => {
      const count = aggregateNumber(rawCount);
      return /^\d{4}-\d{2}$/.test(key) && key >= currentPeriod && count !== null
        ? [{ key, label: periodLabel(key), count }]
        : [];
    })
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(0, 8);
}

async function listDashboardModerationQueue() {
  try {
    return await queryFirestoreDocuments({
      collection: 'moderationReports',
      filters: [{ field: 'status', op: 'IN', value: ['open', 'reviewing'] }],
      orderBy: [{ field: 'createdAt', direction: 'DESCENDING' }],
      limit: 6,
    });
  } catch {
    // The composite index may still be building. Keep the dashboard operational
    // with a bounded recent-report window instead of issuing an unbounded scan.
    return queryFirestoreDocuments({
      collection: 'moderationReports',
      orderBy: [{ field: 'createdAt', direction: 'DESCENDING' }],
      limit: 100,
    });
  }
}

export type AdminOperationsDashboard = Awaited<ReturnType<typeof getAdminOperationsDashboard>>;

/**
 * Dashboard reads precomputed `_adminStats/*` documents first. If they do not
 * exist yet, a complete server-only fallback is allowed only while the entire
 * users collection fits in a hard 100-record ceiling. Individual profiles are
 * never serialized to the browser, and larger installations receive an
 * explicit unavailable state until the reconciliation job has run.
 */
export async function getAdminOperationsDashboard() {
  const now = new Date();
  const thirtyDays = new Date(now);
  thirtyDays.setUTCDate(thirtyDays.getUTCDate() - 30);
  const sixtyDays = new Date(now);
  sixtyDays.setUTCDate(sixtyDays.getUTCDate() - 60);
  const currentPeriod = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
  }).format(now);

  const [
    users,
    last30,
    previous30,
    onboarding,
    groups,
    disabledGroups,
    openReports,
    memberships,
    blogPosts,
    publishedPosts,
    geographyDocument,
    dailyDocument,
    journeyDocument,
    moderationResult,
    contentResult,
  ] = await Promise.all([
    countFirestoreDocuments({ collection: 'users' }),
    countFirestoreDocuments({
      collection: 'users',
      filters: [{ field: 'createdAt', op: 'GREATER_THAN_OR_EQUAL', value: thirtyDays.toISOString() }],
    }),
    countFirestoreDocuments({
      collection: 'users',
      filters: [
        { field: 'createdAt', op: 'GREATER_THAN_OR_EQUAL', value: sixtyDays.toISOString() },
        { field: 'createdAt', op: 'LESS_THAN', value: thirtyDays.toISOString() },
      ],
    }),
    countFirestoreDocuments({ collection: 'users', filters: [{ field: 'onboardingCompleted', op: 'EQUAL', value: true }] }),
    countFirestoreDocuments({ collection: 'devreGroups' }),
    countFirestoreDocuments({ collection: '_adminGroupControls', filters: [{ field: 'status', op: 'EQUAL', value: 'disabled' }] }),
    countFirestoreDocuments({ collection: 'moderationReports', filters: [{ field: 'status', op: 'IN', value: ['open', 'reviewing'] }] }),
    countFirestoreDocuments({ collection: '_devreGroupMemberships' }),
    countFirestoreDocuments({ collection: 'blogPosts' }),
    countFirestoreDocuments({ collection: 'blogPosts', filters: [{ field: 'status', op: 'EQUAL', value: 'published' }] }),
    getFirestoreDocument('_adminStats', 'geography'),
    getFirestoreDocument('_adminStats', 'daily'),
    getFirestoreDocument('_adminStats', 'dashboard'),
    listDashboardModerationQueue(),
    queryFirestoreDocuments({
      collection: 'blogPosts',
      orderBy: [{ field: 'updatedAt', direction: 'DESCENDING' }],
      limit: 4,
    }),
  ]);

  const requiresFallback = !geographyDocument || !dailyDocument || !journeyDocument;
  const canUseCompleteFallback = users <= 100;
  const fallbackResult = requiresFallback && canUseCompleteFallback && users > 0
    ? await queryFirestoreDocuments({
      collection: 'users',
        orderBy: [{ field: 'createdAt', direction: 'DESCENDING' }],
        limit: 100,
      })
    : { records: [], nextCursor: null };
  const fallbackUsers = fallbackResult.records.map((record) => record.data);
  const fallbackComplete = canUseCompleteFallback && fallbackUsers.length === users;

  let geographySource: DashboardDataSource = 'unavailable';
  let residence = { counts: emptyProvinceCounts(), matched: 0, unmatched: 0 };
  let military = { counts: emptyProvinceCounts(), matched: 0, unmatched: 0 };
  let geographyUpdatedAt: string | null = null;
  if (geographyDocument) {
    residence = normalizeAggregateCounts(geographyDocument.data.residence);
    military = normalizeAggregateCounts(geographyDocument.data.military);
    residence.unmatched = aggregateNumber(geographyDocument.data.unmatchedResidence) ?? residence.unmatched;
    military.unmatched = aggregateNumber(geographyDocument.data.unmatchedMilitary) ?? military.unmatched;
    geographySource = 'aggregate';
    geographyUpdatedAt = aggregateDate(geographyDocument.data.updatedAt);
  } else if (fallbackComplete) {
    residence = aggregateProvinceValues(fallbackUsers.map((user) => user.residenceCity));
    military = aggregateProvinceValues(fallbackUsers.map((user) => user.militaryCity));
    geographySource = 'bounded-server-fallback';
  }

  let growthSource: DashboardDataSource = 'unavailable';
  let registrationBuckets: Record<string, number> = {};
  if (dailyDocument) {
    registrationBuckets = registrationsFromAggregate(dailyDocument.data);
    growthSource = 'aggregate';
  } else if (fallbackComplete) {
    for (const user of fallbackUsers) {
      const key = dashboardDateKey(typeof user.createdAt === 'string' ? user.createdAt : '');
      if (key) registrationBuckets[key] = (registrationBuckets[key] ?? 0) + 1;
    }
    growthSource = 'bounded-server-fallback';
  }

  let serviceProfileCompleted: number | null = null;
  let periods: ReturnType<typeof periodsFromAggregate> = [];
  let journeySource: DashboardDataSource = 'unavailable';
  let communityInteraction: number | null = null;
  if (journeyDocument) {
    serviceProfileCompleted = aggregateNumber(journeyDocument.data.serviceProfileCompleted);
    communityInteraction = aggregateNumber(journeyDocument.data.communityInteraction);
    periods = periodsFromAggregate(journeyDocument.data.periods, currentPeriod);
    journeySource = 'aggregate';
  } else if (fallbackComplete) {
    serviceProfileCompleted = fallbackUsers.filter(isMilitaryProfileComplete).length;
    const periodCounts: Record<string, number> = {};
    for (const user of fallbackUsers) {
      const key = periodKey(user.militaryPeriodYear, user.militaryPeriodMonth);
      if (key) periodCounts[key] = (periodCounts[key] ?? 0) + 1;
    }
    periods = periodsFromAggregate(periodCounts, currentPeriod);
    journeySource = 'bounded-server-fallback';
  }

  return {
    generatedAt: now.toISOString(),
    kpis: {
      users,
      last30,
      previous30,
      last30TrendPercent: previous30 > 0
        ? Math.round(((last30 - previous30) / previous30) * 1000) / 10
        : null,
      activeGroups: Math.max(0, groups - disabledGroups),
      openReports,
    },
    geography: {
      source: geographySource,
      updatedAt: geographyUpdatedAt,
      residence,
      military,
    },
    growth: {
      source: growthSource,
      points: fillDailyRegistrations(registrationBuckets, 90, now),
    },
    funnel: {
      source: journeySource,
      stages: [
        { key: 'registered', label: 'Kayıt', count: users },
        { key: 'onboarding', label: 'Onboarding tamamlandı', count: onboarding },
        { key: 'service-profile', label: 'Askerlik profili tamamlandı', count: serviceProfileCompleted },
        { key: 'assigned', label: 'Devre atandı', count: Math.min(users, memberships) },
        { key: 'community', label: 'Topluluk etkileşimi', count: communityInteraction },
      ],
    },
    periods: {
      source: journeySource,
      items: periods,
    },
    moderation: moderationResult.records
      .map((record) => mapReport(record.id, record.data))
      .filter((report) => report.status === 'open' || report.status === 'reviewing')
      .slice(0, 6),
    groupActivityAvailable: false,
    content: {
      total: blogPosts,
      published: publishedPosts,
      drafts: Math.max(0, blogPosts - publishedPosts),
      latest: contentResult.records.map((record) => ({
        id: record.id,
        title: text(record.data.title, 'Başlıksız yazı'),
        status: record.data.status === 'published' ? 'published' as const : 'draft' as const,
        updatedAt: isoDate(record.data.updatedAt),
      })),
    },
  };
}
