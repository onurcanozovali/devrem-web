import {
  FirebaseConfigurationError,
  commitFirestoreWritesAsUser,
  getFirestoreDocumentAsUser,
  getPublicFirestoreDocumentPath,
  isFirebasePublicConfigured,
  queryPublicFirestoreDocuments,
  type FirestoreQueryFilter,
  type FirestoreQueryOrder,
} from '@/lib/firebase/server';
import {
  COMMUNITY_REPORT_COLLECTION,
  COMMUNITY_REPLY_COLLECTION,
  COMMUNITY_TOPIC_COLLECTION,
  COMMUNITY_USER_COLLECTION,
  DUPLICATE_WINDOW_MS,
  HOME_TOPIC_PREVIEW_COUNT,
  REPLY_PAGE_SIZE,
  TOPIC_PAGE_SIZE,
  WRITE_COOLDOWN_MS,
  isCommunityCategoryId,
  type CommunityCategoryId,
  type CommunitySortId,
} from './constants';
import { contentFingerprint, slugifyTitle } from './text';
import type {
  CommunityAuthIdentity,
  CommunityContentStatus,
  CommunityReply,
  CommunityTopic,
  CommunityTopicListQuery,
} from './types';

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function number(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function boolean(value: unknown) {
  return value === true;
}

function isoDate(value: unknown, fallback = '') {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
    ? value
    : fallback;
}

function statusOf(value: unknown): CommunityContentStatus {
  return value === 'hidden' || value === 'deleted' ? value : 'published';
}

function createId() {
  return crypto.randomUUID().replace(/-/g, '');
}

function mapTopic(id: string, data: Record<string, unknown>): CommunityTopic | null {
  const category = text(data.category);
  if (!isCommunityCategoryId(category)) return null;
  const slug = text(data.slug, id);
  const title = text(data.title);
  const body = text(data.body);
  if (!slug || !title || !body) return null;
  return {
    id,
    slug,
    title,
    body,
    category,
    authorId: text(data.authorId),
    authorDisplayName: text(data.authorDisplayName, 'Anonim Devre'),
    authorIsAnonymous: boolean(data.authorIsAnonymous),
    createdAt: isoDate(data.createdAt),
    updatedAt: isoDate(data.updatedAt),
    lastActivityAt: isoDate(data.lastActivityAt, isoDate(data.createdAt)),
    replyCount: number(data.replyCount),
    likeCount: number(data.likeCount),
    status: statusOf(data.status),
    isPinned: boolean(data.isPinned),
    isLocked: boolean(data.isLocked),
    lastReplyId: text(data.lastReplyId) || null,
    militaryUnitId: text(data.militaryUnitId) || null,
    militaryUnitName: text(data.militaryUnitName) || null,
    celpPeriod: text(data.celpPeriod) || null,
  };
}

function mapReply(
  id: string,
  data: Record<string, unknown>,
): CommunityReply | null {
  const body = text(data.body);
  const topicId = text(data.topicId);
  if (!body || !topicId) return null;
  return {
    id,
    topicId,
    body,
    authorId: text(data.authorId),
    authorDisplayName: text(data.authorDisplayName, 'Anonim Devre'),
    authorIsAnonymous: boolean(data.authorIsAnonymous),
    createdAt: isoDate(data.createdAt),
    updatedAt: isoDate(data.updatedAt),
    likeCount: number(data.likeCount),
    status: statusOf(data.status),
  };
}

export async function listPublishedCommunityTopics(
  query: CommunityTopicListQuery = {},
) {
  if (!isFirebasePublicConfigured()) {
    throw new FirebaseConfigurationError(
      'Topluluk için FIREBASE_PROJECT_ID ve FIREBASE_WEB_API_KEY gerekli.',
    );
  }
  const category = query.category && query.category !== 'all' ? query.category : null;
  const sort: CommunitySortId = query.sort ?? 'aktif';
  const orderField =
    sort === 'yeni'
      ? 'createdAt'
      : sort === 'populer'
        ? 'replyCount'
        : 'lastActivityAt';
  const filters: FirestoreQueryFilter[] = [
    { field: 'status', op: 'EQUAL', value: 'published' },
  ];
  if (category) {
    filters.unshift({ field: 'category', op: 'EQUAL', value: category });
  }
  const orderBy: FirestoreQueryOrder[] = [
    { field: orderField, direction: 'DESCENDING' },
  ];
  const { records, nextCursor } = await queryPublicFirestoreDocuments({
    collection: COMMUNITY_TOPIC_COLLECTION,
    filters,
    orderBy,
    limit: query.limit ?? TOPIC_PAGE_SIZE,
    cursor: query.cursor ?? undefined,
  });
  return {
    topics: records.flatMap(({ id, data }) => {
      const topic = mapTopic(id, data);
      return topic && topic.status === 'published' ? [topic] : [];
    }),
    nextCursor,
  };
}

export async function listHomeCommunityTopics() {
  try {
    const { topics } = await listPublishedCommunityTopics({
      sort: 'aktif',
      limit: HOME_TOPIC_PREVIEW_COUNT,
    });
    return topics;
  } catch (error) {
    if (error instanceof FirebaseConfigurationError) return [];
    throw error;
  }
}

export async function getPublishedCommunityTopicBySlug(slug: string) {
  if (!slug) return null;
  const { records } = await queryPublicFirestoreDocuments({
    collection: COMMUNITY_TOPIC_COLLECTION,
    filters: [
      { field: 'slug', op: 'EQUAL', value: slug },
      { field: 'status', op: 'EQUAL', value: 'published' },
    ],
    limit: 1,
  });
  const record = records[0];
  return record ? mapTopic(record.id, record.data) : null;
}

export async function getPublishedCommunityTopicById(id: string) {
  if (!id) return null;
  const document = await getPublicFirestoreDocumentPath(
    `${COMMUNITY_TOPIC_COLLECTION}/${id}`,
  );
  if (!document) return null;
  const topic = mapTopic(document.id, document.data);
  return topic?.status === 'published' ? topic : null;
}

export async function listPublishedCommunityReplies(
  topicId: string,
  cursor?: string | null,
  limit = REPLY_PAGE_SIZE,
) {
  const { records, nextCursor } = await queryPublicFirestoreDocuments({
    parent: `${COMMUNITY_TOPIC_COLLECTION}/${topicId}`,
    collection: COMMUNITY_REPLY_COLLECTION,
    filters: [{ field: 'status', op: 'EQUAL', value: 'published' }],
    orderBy: [{ field: 'createdAt', direction: 'ASCENDING' }],
    limit,
    cursor: cursor ?? undefined,
  });
  return {
    replies: records.flatMap(({ id, data }) => {
      const reply = mapReply(id, data);
      return reply && reply.status === 'published' ? [reply] : [];
    }),
    nextCursor,
  };
}

export async function listCommunitySitemapEntries(limit = 400) {
  const { topics } = await listPublishedCommunityTopics({
    sort: 'yeni',
    limit,
  });
  return topics.map((topic) => ({
    path: `/topluluk/${topic.slug}`,
    lastModified: topic.updatedAt || topic.lastActivityAt || topic.createdAt,
  }));
}

async function assertCanWrite(identity: CommunityAuthIdentity) {
  const access = await getFirestoreDocumentAsUser(
    `_accountAccess/${identity.uid}`,
    identity.idToken,
  );
  if (!access) return;
  if (access.data.status !== 'active') {
    throw new CommunityWriteError(
      'Hesabın topluluk yazma yetkisi şu anda kapalı.',
      403,
    );
  }
}

async function resolveAuthorDisplayName(
  identity: CommunityAuthIdentity,
  nickname: string,
) {
  const existing = await getFirestoreDocumentAsUser(
    `${COMMUNITY_USER_COLLECTION}/${identity.uid}`,
    identity.idToken,
  );
  const storedName = text(existing?.data.displayName);
  if (nickname) return nickname;
  if (storedName) return storedName;
  if (!identity.isAnonymous) {
    const profile = await getFirestoreDocumentAsUser(
      `users/${identity.uid}`,
      identity.idToken,
    );
    const firstName = text(profile?.data.firstName);
    if (firstName.length >= 2) return firstName;
    if (identity.displayName) return identity.displayName;
  }
  return identity.displayName;
}

async function communityUserWrite(
  identity: CommunityAuthIdentity,
  displayName: string,
  fingerprint: string,
) {
  const now = new Date().toISOString();
  const existing = await getFirestoreDocumentAsUser(
    `${COMMUNITY_USER_COLLECTION}/${identity.uid}`,
    identity.idToken,
  );
  const isNew = !existing;
  return {
    path: `${COMMUNITY_USER_COLLECTION}/${identity.uid}`,
    data: {
      displayName,
      isAnonymous: identity.isAnonymous,
      ...(isNew ? {} : { createdAt: isoDate(existing.data.createdAt, now) }),
      lastWriteHash: fingerprint,
    },
    serverTimestampFields: [
      ...(isNew ? ['createdAt'] : []),
      'updatedAt',
      'lastWriteAt',
    ],
  };
}

async function assertWriteCooldown(
  identity: CommunityAuthIdentity,
  fingerprint: string,
) {
  const existing = await getFirestoreDocumentAsUser(
    `${COMMUNITY_USER_COLLECTION}/${identity.uid}`,
    identity.idToken,
  );
  if (!existing) return;
  const lastWriteAt = isoDate(existing.data.lastWriteAt);
  if (lastWriteAt) {
    const elapsed = Date.now() - Date.parse(lastWriteAt);
    if (elapsed < WRITE_COOLDOWN_MS) {
      throw new CommunityWriteError(
        'Biraz yavaş ol. Yeni bir gönderi için kısa süre bekle.',
        429,
      );
    }
    if (
      elapsed < DUPLICATE_WINDOW_MS &&
      text(existing.data.lastWriteHash) === fingerprint
    ) {
      throw new CommunityWriteError(
        'Aynı içeriği kısa süre içinde tekrar gönderemezsin.',
        429,
      );
    }
  }
}

export class CommunityWriteError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'CommunityWriteError';
    this.status = status;
  }
}

export async function createCommunityTopic(input: {
  identity: CommunityAuthIdentity;
  title: string;
  body: string;
  category: CommunityCategoryId;
  nickname: string;
  militaryUnitId?: string | null;
  militaryUnitName?: string | null;
  celpPeriod?: string | null;
}) {
  await assertCanWrite(input.identity);
  const fingerprint = contentFingerprint(input.title, input.body);
  await assertWriteCooldown(input.identity, fingerprint);
  const displayName = await resolveAuthorDisplayName(
    input.identity,
    input.nickname,
  );
  if (!displayName) {
    throw new CommunityWriteError('Yazar adı oluşturulamadı.');
  }
  const id = createId();
  const now = new Date().toISOString();
  const slug = slugifyTitle(input.title, id);
  const topic: CommunityTopic = {
    id,
    slug,
    title: input.title,
    body: input.body,
    category: input.category,
    authorId: input.identity.uid,
    authorDisplayName: displayName,
    authorIsAnonymous: input.identity.isAnonymous,
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
    replyCount: 0,
    likeCount: 0,
    status: 'published',
    isPinned: false,
    isLocked: false,
    lastReplyId: null,
    militaryUnitId: input.militaryUnitId ?? null,
    militaryUnitName: input.militaryUnitName ?? null,
    celpPeriod: input.celpPeriod ?? null,
  };
  const {
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    lastActivityAt: _lastActivityAt,
    ...topicFields
  } = topic;
  const userWrite = await communityUserWrite(
    input.identity,
    displayName,
    fingerprint,
  );
  await commitFirestoreWritesAsUser(input.identity.idToken, [
    {
      path: `${COMMUNITY_TOPIC_COLLECTION}/${id}`,
      data: topicFields,
      serverTimestampFields: ['createdAt', 'updatedAt', 'lastActivityAt'],
    },
    userWrite,
  ]);
  return topic;
}

export async function createCommunityReply(input: {
  identity: CommunityAuthIdentity;
  topicId: string;
  body: string;
  nickname: string;
}) {
  await assertCanWrite(input.identity);
  const topic = await getPublishedCommunityTopicById(input.topicId);
  if (!topic) {
    throw new CommunityWriteError('Konu bulunamadı.', 404);
  }
  if (topic.isLocked) {
    throw new CommunityWriteError('Bu konu yanıtlara kapatıldı.', 403);
  }
  const fingerprint = contentFingerprint(topic.id, input.body);
  await assertWriteCooldown(input.identity, fingerprint);
  const displayName = await resolveAuthorDisplayName(
    input.identity,
    input.nickname,
  );
  if (!displayName) {
    throw new CommunityWriteError('Yazar adı oluşturulamadı.');
  }
  const id = createId();
  const now = new Date().toISOString();
  const reply: CommunityReply = {
    id,
    topicId: topic.id,
    body: input.body,
    authorId: input.identity.uid,
    authorDisplayName: displayName,
    authorIsAnonymous: input.identity.isAnonymous,
    createdAt: now,
    updatedAt: now,
    likeCount: 0,
    status: 'published',
  };
  const {
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...replyFields
  } = reply;
  const userWrite = await communityUserWrite(
    input.identity,
    displayName,
    fingerprint,
  );
  await commitFirestoreWritesAsUser(input.identity.idToken, [
    {
      path: `${COMMUNITY_TOPIC_COLLECTION}/${topic.id}/${COMMUNITY_REPLY_COLLECTION}/${id}`,
      data: replyFields,
      serverTimestampFields: ['createdAt', 'updatedAt'],
    },
    {
      path: `${COMMUNITY_TOPIC_COLLECTION}/${topic.id}`,
      data: {
        replyCount: topic.replyCount + 1,
        lastReplyId: id,
      },
      updateFields: ['replyCount', 'lastReplyId'],
      serverTimestampFields: ['lastActivityAt', 'updatedAt'],
    },
    userWrite,
  ]);
  return reply;
}

export async function createCommunityReport(input: {
  identity: CommunityAuthIdentity;
  targetType: 'topic' | 'reply';
  targetId: string;
  topicId: string;
  reason: string;
}) {
  await assertCanWrite(input.identity);
  const topic = await getPublishedCommunityTopicById(input.topicId);
  if (!topic) throw new CommunityWriteError('Konu bulunamadı.', 404);
  if (input.targetType === 'reply') {
    const document = await getPublicFirestoreDocumentPath(
      `${COMMUNITY_TOPIC_COLLECTION}/${input.topicId}/${COMMUNITY_REPLY_COLLECTION}/${input.targetId}`,
    );
    if (!document) throw new CommunityWriteError('Yanıt bulunamadı.', 404);
  } else if (input.targetId !== topic.id) {
    throw new CommunityWriteError('Konu eşleşmiyor.');
  }
  const id = createId();
  await commitFirestoreWritesAsUser(input.identity.idToken, [
    {
      path: `${COMMUNITY_REPORT_COLLECTION}/${id}`,
      data: {
        id,
        targetType: input.targetType,
        targetId: input.targetId,
        topicId: input.topicId,
        reporterId: input.identity.uid,
        reason: input.reason,
        status: 'open',
      },
      serverTimestampFields: ['createdAt'],
    },
  ]);
  return { id };
}
