'use client';

import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { ChevronDown, ListTree } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { ArticleTocItem } from '@/lib/content';

type ArticleTocProps = {
  items: ArticleTocItem[];
  variant: 'desktop' | 'mobile';
};

export function ArticleToc({ items, variant }: ArticleTocProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    if (!headings.length) return;

    let frame = 0;
    const updateActiveHeading = () => {
      const current = [...headings]
        .reverse()
        .find((heading) => heading.getBoundingClientRect().top <= 152);
      setActiveId(current?.id ?? headings[0].id);
    };
    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActiveHeading);
    };

    updateActiveHeading();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [items]);

  function selectHeading(id: string) {
    const heading = document.getElementById(id);
    if (!heading) return;

    if (variant === 'mobile') flushSync(() => setMobileOpen(false));
    window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      heading.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      window.history.replaceState(null, '', `#${id}`);
      setActiveId(id);
    });
  }

  const links = (
    <ol className="article-toc-list">
      {items.map((item) => (
        <li
          className={item.level === 3 ? 'article-toc-subitem' : undefined}
          key={item.id}
        >
          <a
            aria-current={activeId === item.id ? 'location' : undefined}
            className="article-toc-link"
            href={`#${item.id}`}
            onClick={(event) => {
              event.preventDefault();
              selectHeading(item.id);
            }}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === 'mobile') {
    return (
      <Collapsible
        className="article-mobile-toc"
        onOpenChange={setMobileOpen}
        open={mobileOpen}
      >
        <CollapsibleTrigger>
          <span className="inline-flex items-center gap-2">
            <ListTree className="size-4" aria-hidden="true" /> İçindekiler
          </span>
          <ChevronDown
            className="article-mobile-toc-chevron size-4"
            aria-hidden="true"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <nav aria-label="Mobil içindekiler">{links}</nav>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return <nav aria-label="İçindekiler">{links}</nav>;
}
