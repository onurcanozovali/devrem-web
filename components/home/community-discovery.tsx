import { BookOpenCheck, MessageCircleMore, UsersRound } from 'lucide-react';
import { Container } from '@/components/site/container';

const benefits = [
  {
    icon: UsersRound,
    number: '01',
    title: 'Doğru insanlarla eşleş',
    description:
      'Celp dönemi ve birlik bilgine göre aynı yolculuğa çıkacak devrelerini keşfet.',
  },
  {
    icon: MessageCircleMore,
    number: '02',
    title: 'Yola çıkmadan konuş',
    description:
      'Teslim, ulaşım ve ilk gün hakkındaki sorularını aynı süreçteki insanlarla paylaş.',
  },
  {
    icon: BookOpenCheck,
    number: '03',
    title: 'Bilgiyi sade biçimde bul',
    description:
      'Karmaşık resmî bilgileri anlaşılır rehberler ve güncel veri araçlarıyla takip et.',
  },
] as const;

export function CommunityDiscovery() {
  return (
    <section
      className="landing-benefits py-20 sm:py-24"
      aria-labelledby="benefits-title"
    >
      <Container>
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">
            Devrem neyi değiştiriyor?
          </p>
          <h2 className="section-title mt-4 text-balance" id="benefits-title">
            Belirsizliği azaltır.
            <br />
            İnsanları yakınlaştırır.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-secondary-foreground">
            Devrem bir araç listesi değil; askere gitmeden önce bilgi, veri ve
            topluluğu anlamlı bir akışta buluşturan yol arkadaşın.
          </p>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-[2rem] border border-border bg-border md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article className="landing-benefit-card" key={benefit.number}>
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-subtle text-primary-ink">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    {benefit.number}
                  </span>
                </div>
                <h3 className="mt-9 text-xl font-bold tracking-[-0.04em]">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-secondary-foreground">
                  {benefit.description}
                </p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
