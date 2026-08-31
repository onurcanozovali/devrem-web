import { MessageCircleMore, UsersRound } from 'lucide-react';
import { Container } from '@/components/site/container';
import { StoreButtons } from '@/components/site/store-buttons';

export function FinalCTA() {
  return (
    <section className="px-4 pb-6 pt-10 sm:px-6 sm:pb-8">
      <Container className="final-landing-cta">
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">
            Yola çıkmadan önce
          </p>
          <h2 className="mt-5 text-balance text-4xl font-bold leading-[1.02] tracking-[-0.065em] text-white sm:text-6xl">
            Aklındaki sorularla tek başına kalma.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#A9B0AC] sm:text-lg">
            Devrem’i indir; aynı dönem ve birlikteki devrelerinle daha askere
            gitmeden tanış.
          </p>
          <StoreButtons className="mt-8" />
        </div>
        <div
          className="final-landing-signal final-landing-signal-a"
          aria-hidden="true"
        >
          <UsersRound className="size-7" />
        </div>
        <div
          className="final-landing-signal final-landing-signal-b"
          aria-hidden="true"
        >
          <MessageCircleMore className="size-6" />
        </div>
      </Container>
    </section>
  );
}
