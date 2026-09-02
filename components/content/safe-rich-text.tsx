import type { ReactNode } from 'react';
import Link from 'next/link';

const inlinePattern =
  /(\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*|_([^_\n]+)_)/g;

function safeLink(value: string) {
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol)
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}

export function SafeRichText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(inlinePattern)) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(text.slice(cursor, index));

    if (match[2] && match[3]) {
      const href = safeLink(match[3]);
      if (!href) {
        nodes.push(match[0]);
      } else if (href.startsWith('/')) {
        nodes.push(<Link href={href} key={`${index}-${href}`}>{match[2]}</Link>);
      } else {
        nodes.push(
          <a href={href} key={`${index}-${href}`} rel="noreferrer" target="_blank">
            {match[2]}
          </a>,
        );
      }
    } else if (match[4]) {
      nodes.push(<strong key={`${index}-strong`}>{match[4]}</strong>);
    } else {
      nodes.push(<em key={`${index}-em`}>{match[5] ?? match[6]}</em>);
    }
    cursor = index + match[0].length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}
