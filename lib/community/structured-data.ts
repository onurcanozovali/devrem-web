import type { CommunityTopic } from '@/lib/community/types';
import { absoluteUrl } from '@/src/config/seo';

export function discussionForumPostingSchema(
  topic: CommunityTopic,
  commentPreview: Array<{ author: string; body: string; createdAt: string }>,
) {
  const url = absoluteUrl(`/topluluk/${topic.slug}`);
  return {
    '@type': 'DiscussionForumPosting',
    '@id': `${url}#discussion`,
    url,
    headline: topic.title,
    text: topic.body,
    datePublished: topic.createdAt,
    dateModified: topic.updatedAt || topic.lastActivityAt,
    inLanguage: 'tr',
    author: {
      '@type': 'Person',
      name: topic.authorDisplayName,
    },
    commentCount: topic.replyCount,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/CommentAction',
      userInteractionCount: topic.replyCount,
    },
    ...(commentPreview.length
      ? {
          comment: commentPreview.slice(0, 8).map((item) => ({
            '@type': 'Comment',
            text: item.body,
            datePublished: item.createdAt,
            author: { '@type': 'Person', name: item.author },
          })),
        }
      : {}),
  };
}
