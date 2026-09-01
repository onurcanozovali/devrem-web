import Image from 'next/image';
import { MessageCircleMore, ShieldCheck, UsersRound } from 'lucide-react';
import { Container } from '@/components/site/container';

const appPromises = [
  {
    icon: UsersRound,
    title: 'Devrelerini bul',
    description:
      'Celp dönemi ve birlik bilgine göre aynı yere gidecek insanlarla eşleş.',
  },
  {
    icon: MessageCircleMore,
    title: 'Birlikte hazırlan',
    description: 'Teslim, yol ve ilk gün sorularını topluluk içinde konuş.',
  },
  {
    icon: ShieldCheck,
    title: 'Süreci sakinleştir',
    description:
      'Bilgiyi, önemli tarihleri ve topluluk deneyimini tek yerde tut.',
  },
] as const;

export function AppShowcase() {
  return (
    <section
      className="app-landing-section"
      id="uygulama"
      aria-labelledby="app-showcase-title"
    >
      <Container className="grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="app-landing-visual">
          <div className="app-landing-phone">
            <span aria-hidden="true" />
            <div>
              <Image
                alt="Devrem mobil uygulaması ana ekranı"
                fill
                sizes="(max-width: 1024px) 310px, 370px"
                src="/ss1.png"
              />
            </div>
          </div>
        </div>
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">
            Devrem mobil uygulaması
          </p>
          <h2
            className="mt-4 text-balance text-4xl font-bold leading-[1.02] tracking-[-0.06em] sm:text-5xl"
            id="app-showcase-title"
          >
            Askerlik başlamadan devrelerinle tanış.
          </h2>
          <p className="mt-5 text-base leading-7 text-secondary-foreground">
            Devrem, web’de okuduğun bilgiyi mobilde gerçek bir topluluğa
            dönüştürür. Aynı dönemde aynı yere gidecek kişilerle daha yola
            çıkmadan buluşursun.
          </p>
          <div className="mt-8 space-y-3">
            {appPromises.map((item) => {
              const Icon = item.icon;
              return (
                <article className="app-landing-promise" key={item.title}>
                  <span>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
