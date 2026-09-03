import assert from 'node:assert/strict';
import {
  communityCategories,
  isCommunityCategoryId,
  isCommunityReportReason,
} from '../lib/community/constants';
import { discussionForumPostingSchema } from '../lib/community/structured-data';
import {
  anonymousDisplayName,
  seoDescriptionFromBody,
  slugifyTitle,
  validateNickname,
  validateReplyBody,
  validateTopicBody,
  validateTopicTitle,
} from '../lib/community/text';
import { pageSitemapEntries, sitemapGroups } from '../src/config/seo-routes';
import { mainNavigation } from '../src/config/site';

assert.equal(communityCategories.length, 6);
assert.equal(isCommunityCategoryId('bedelli'), true);
assert.equal(isCommunityCategoryId('Tümü'), false);
assert.equal(isCommunityReportReason('Spam'), true);
assert.equal(isCommunityReportReason('hack'), false);

assert.equal(validateTopicTitle('kısa'), 'Başlık en az 10 karakter olmalı.');
assert.equal(validateTopicTitle('Sevk belgesini ne zaman almalıyım?'), null);
assert.equal(validateTopicBody('çok kısa'), 'İçerik en az 20 karakter olmalı.');
assert.equal(
  validateTopicBody('Askere gitmeden önce valizime neler koymalıyım acaba?'),
  null,
);
assert.equal(validateReplyBody('ok'), 'Yanıt en az 4 karakter olmalı.');
assert.equal(validateReplyBody('Bende öyle oldu.'), null);
assert.equal(validateNickname(''), null);
assert.equal(validateNickname('A'), 'Takma ad en az 2 karakter olmalı.');
assert.equal(validateNickname('Devre Ali'), null);

const nameA = anonymousDisplayName('uid-stable-1');
const nameB = anonymousDisplayName('uid-stable-1');
const nameC = anonymousDisplayName('uid-stable-2');
assert.equal(nameA, nameB);
assert.notEqual(nameA, nameC);
assert.match(nameA, /^Anonim Devre \d{4}$/);

const slug = slugifyTitle('Sevk belgesi nedir?', 'abc123zz');
assert.match(slug, /^sevk-belgesi-nedir-abc123zz$/);

assert.equal(
  seoDescriptionFromBody('  Deneyim   metni  '),
  'Deneyim metni',
);

const schema = discussionForumPostingSchema(
  {
    id: 'topic1',
    slug: 'sevk-belgesi',
    title: 'Sevk belgesi ne zaman gelir?',
    body: 'Celp dönemim yaklaştı, sevk belgesini bekliyorum.',
    category: 'celp-donemleri',
    authorId: 'u1',
    authorDisplayName: 'Anonim Devre 4821',
    authorIsAnonymous: true,
    createdAt: '2026-09-03T10:00:00.000Z',
    updatedAt: '2026-09-03T10:00:00.000Z',
    lastActivityAt: '2026-09-03T10:00:00.000Z',
    replyCount: 1,
    likeCount: 0,
    status: 'published',
    isPinned: false,
    isLocked: false,
    militaryUnitId: null,
    militaryUnitName: null,
    celpPeriod: null,
  },
  [
    {
      author: 'Anonim Devre 1102',
      body: 'Bende bir hafta içinde geldi.',
      createdAt: '2026-09-03T11:00:00.000Z',
    },
  ],
);
assert.equal(schema['@type'], 'DiscussionForumPosting');
assert.equal(
  schema.url,
  'https://devrem.co/topluluk/sevk-belgesi',
);
assert.equal(schema.commentCount, 1);

assert.equal(
  mainNavigation.some((item) => item.href === '/topluluk'),
  true,
);
assert.equal(
  pageSitemapEntries.some((item) => item.path === '/topluluk'),
  true,
);
assert.equal(
  sitemapGroups.includes('/sitemaps/community.xml'),
  true,
);

console.log('Community unit checks passed.');
