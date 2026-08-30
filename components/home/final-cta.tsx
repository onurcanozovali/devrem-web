import { ArrowRight, Check, MapPin, UsersRound } from 'lucide-react';
import { ButtonLink } from '@/components/site/button-link';
import { Container } from '@/components/site/container';

export function FinalCTA() {
  return (
    <section className="px-4 pb-6 pt-10 sm:px-6 sm:pb-8">
      <Container className="final-cta">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9EA6FF]">Devrem topluluğu</p>
          <h2 className="mt-5 text-balance text-4xl font-bold leading-[1.04] tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">Birliğin belli olduysa devrelerin seni bekliyor.</h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#B8BCD3] sm:text-lg">Aynı celp döneminde aynı birliğe gidecek kişilerle askere gitmeden önce tanış.</p>
          <div className="mt-8"><ButtonLink href="#uygulama" size="lg" variant="light">Devrelerini Bul <ArrowRight aria-hidden="true" /></ButtonLink></div>
        </div>
        <div className="final-cta-visual" aria-hidden="true">
          <div className="final-cta-node final-cta-node-main"><UsersRound className="size-7" /></div>
          <div className="final-cta-node final-cta-node-a"><MapPin className="size-5" /></div>
          <div className="final-cta-node final-cta-node-b"><Check className="size-5" /></div>
          <span className="final-cta-line final-cta-line-a" />
          <span className="final-cta-line final-cta-line-b" />
          <div className="final-cta-pill final-cta-pill-a">Aynı dönem</div>
          <div className="final-cta-pill final-cta-pill-b">Aynı birlik</div>
        </div>
      </Container>
    </section>
  );
}
