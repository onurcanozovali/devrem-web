import Link from 'next/link';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import type { EditorialSource } from '@/src/fixtures/content';

export function ArticleSources({ sources }: { sources: EditorialSource[] }) {
  return (
    <div className="article-sources-list">
      <h2>Kaynaklar</h2>
      <ul>
        {sources.map((source) => {
          const content = (
            <>
              <span>{source.label}</span>
              {source.href.startsWith('/') ? (
                <ArrowUpRight
                  className="size-3.5 shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <ExternalLink
                  className="size-3.5 shrink-0"
                  aria-hidden="true"
                />
              )}
            </>
          );

          return (
            <li key={source.href}>
              {source.href.startsWith('/') ? (
                <Link href={source.href}>{content}</Link>
              ) : (
                <a href={source.href} rel="noreferrer" target="_blank">
                  {content}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
