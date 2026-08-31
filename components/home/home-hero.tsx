import Image from 'next/image';
import { Check, MessageCircle, ShieldCheck, UsersRound } from 'lucide-react';
import { Container } from '@/components/site/container';
import { StoreButtons } from '@/components/site/store-buttons';

const promises = [
  'Aynı dönem ve birlikteki devrelerin',
  'Sade, güncel askerlik içerikleri',
  'Veriye dayalı Bedelli karşılaştırması',
] as const;

export function HomeHero() {
  return (
    <section className="landing-hero">
      <Container className="grid min-h-[760px] items-center gap-14 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
        <div className="relative z-10 max-w-2xl animate-reveal">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-primary-ink">
            <ShieldCheck className="size-4" aria-hidden="true" /> Askere
            gitmeden önce Devrem var
          </div>
          <h1 className="mt-7 text-balance text-[clamp(3.5rem,7vw,7rem)] font-extrabold leading-[0.9] tracking-[-0.08em]">
            Aynı yolu
            <br />
            <span className="text-primary-ink">yalnız yürüme.</span>
          </h1>
          <p className="mt-7 max-w-xl text-balance text-lg leading-8 text-secondary-foreground sm:text-xl">
            Birliğin ve celp dönemin belli olduğunda, aynı yere gidecek
            devrelerinle tanış. Sorularına yanıt bul, süreci daha sakin karşıla.
          </p>
          <StoreButtons className="mt-9" />
          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {promises.map((item) => (
              <span
                className="inline-flex items-start gap-2 text-xs font-semibold leading-5 text-secondary-foreground"
                key={item}
              >
                <Check
                  className="mt-0.5 size-4 shrink-0 text-primary-ink"
                  aria-hidden="true"
                />{' '}
                {item}
              </span>
            ))}
          </div>
        </div>

        <div
          className="landing-product"
          aria-label="Devrem mobil uygulaması önizlemesi"
        >
          <div className="landing-product-orbit" aria-hidden="true" />
          <div className="landing-phone">
            <span className="landing-phone-island" aria-hidden="true" />
            <div className="landing-phone-screen">
              <Image
                alt="Devrem mobil uygulamasının ana ekranı"
                fill
                priority
                sizes="(max-width: 1024px) 320px, 390px"
                src="/ss1.png"
              />
            </div>
          </div>
          <div className="landing-float-card landing-float-card-a">
            <span>
              <UsersRound className="size-5" aria-hidden="true" />
            </span>
            <div>
              <strong>Aynı devre</strong>
              <small>Aynı dönem, aynı yolculuk</small>
            </div>
          </div>
          <div className="landing-float-card landing-float-card-b">
            <span>
              <MessageCircle className="size-5" aria-hidden="true" />
            </span>
            <div>
              <strong>Topluluk</strong>
              <small>Yola çıkmadan tanış</small>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
