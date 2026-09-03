import type { CommunityCategoryId, CommunitySortId } from './constants';

export type CommunityContentStatus = 'published' | 'hidden' | 'deleted';

export type CommunityTopic = {
  id: string;
  slug: string;
  title: string;
  body: string;
  category: CommunityCategoryId;
  authorId: string;
  authorDisplayName: string;
  authorIsAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  replyCount: number;
  likeCount: number;
  status: CommunityContentStatus;
  isPinned: boolean;
  isLocked: boolean;
  militaryUnitId: string | null;
  militaryUnitName: string | null;
  celpPeriod: string | null;
};

export type CommunityReply = {
  id: string;
  topicId: string;
  body: string;
  authorId: string;
  authorDisplayName: string;
  authorIsAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  status: CommunityContentStatus;
};

export type CommunityTopicListQuery = {
  category?: CommunityCategoryId | 'all';
  sort?: CommunitySortId;
  cursor?: string | null;
  limit?: number;
};

export type CommunityAuthIdentity = {
  uid: string;
  isAnonymous: boolean;
  displayName: string | null;
  email: string | null;
};
