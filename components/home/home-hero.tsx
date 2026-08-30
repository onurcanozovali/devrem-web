import { ArrowRight, CalendarDays, Check, MapPin, UsersRound } from 'lucide-react';
import { ButtonLink } from '@/components/site/button-link';
import { Container } from '@/components/site/container';
import { currentMilitaryInfo } from '@/src/fixtures/home';

const heroSignals = [
  { label: 'Teslime', value: '18 gün', icon: CalendarDays, position: 'hero-signal-a' },
  { label: 'Hazırlık', value: '23 / 30', icon: Check, position: 'hero-signal-b' },
  { label: 'Devre', value: '184 kişi', icon: UsersRound, position: 'hero-signal-c' },
] as const;

export function HomeHero() {
  return (
    <>
      <section className="home-hero overflow-hidden">
        <Container className="grid min-h-[690px] items-center gap-12 pb-20 pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:pb-24 lg:pt-16">
          <div className="relative z-10 max-w-2xl animate-reveal">
            <div className="hero-kicker"><span /> Devrem web platformu</div>
            <h1 className="hero-title mt-7 text-balance">Askere hazırlanmanın <span>tek platformu.</span></h1>
            <p className="mt-7 max-w-xl text-balance text-lg leading-8 text-secondary-foreground sm:text-xl">
              Devrelerini bul, birliğin hakkında bilgi edin, hazırlığını tamamla ve askere gitmeden önce seni nelerin beklediğini öğren.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#devreler" size="lg">Devrelerini Bul <ArrowRight aria-hidden="true" /></ButtonLink>
              <ButtonLink href="#uygulama" size="lg" variant="outline">Devrem&apos;i Keşfet</ButtonLink>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-secondary-foreground">
              {['Birlik bilgileri', 'Hazırlık araçları', 'Devre topluluğu'].map((item) => (
                <span className="inline-flex items-center gap-2" key={item}>
                  <Check className="size-4 text-primary" aria-hidden="true" /> {item}
                </span>
              ))}
            </div>
          </div>

          <div className="hero-product relative mx-auto min-h-[590px] w-full max-w-[590px] lg:ml-auto">
            <div className="hero-product-glow" aria-hidden="true" />
            <figure className="hero-phone animate-phone" aria-label="Devrem mobil uygulaması demo görünümü">
              <div className="hero-phone-island" aria-hidden="true" />
              <div className="hero-phone-status"><span>09:41</span><span>Demo görünüm</span></div>
              <div className="px-5 pb-6 pt-3">
                <div className="flex items-center justify-between">
                  <div><p className="text-[10px] text-[#72747D]">Günaydın</p><p className="mt-1 text-sm font-bold text-[#1C1D21]">Hazırlığın burada.</p></div>
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#EAECFF] text-xs font-bold text-[#5B67F1]">D</span>
                </div>
                <div className="mt-5 rounded-[1.4rem] bg-gradient-to-br from-[#5B67F1] to-[#414BC4] p-5 text-white shadow-[0_16px_34px_rgb(65_75_196/22%)]">
                  <p className="text-[10px] text-white/70">Birliğine teslim olmana</p>
                  <div className="mt-2 flex items-end justify-between"><p className="text-3xl font-bold tracking-[-0.05em]">18 gün</p><CalendarDays className="mb-1 size-5 text-white/75" aria-hidden="true" /></div>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full w-[72%] rounded-full bg-white" /></div>
                  <p className="mt-2 text-[9px] text-white/65">23 / 30 hazırlık tamamlandı</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="hero-phone-card"><MapPin className="size-4 text-[#5B67F1]" aria-hidden="true" /><p className="mt-4 text-[11px] font-bold">Birliğin</p><p className="mt-1 text-[9px] leading-4 text-[#72747D]">Bilgi ve ulaşım notları</p></div>
                  <div className="hero-phone-card"><UsersRound className="size-4 text-[#5B67F1]" aria-hidden="true" /><p className="mt-4 text-[11px] font-bold">Devrelerin</p><p className="mt-1 text-[9px] leading-4 text-[#72747D]">Aynı dönem, aynı birlik</p></div>
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#E7E8ED] bg-white p-3.5">
                  <div className="flex -space-x-2" aria-hidden="true">{['A', 'M', 'E'].map((item) => <span className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#EAECFF] text-[9px] font-bold text-[#5B67F1]" key={item}>{item}</span>)}</div>
                  <div className="min-w-0 flex-1"><p className="text-[10px] font-bold text-[#1C1D21]">Devreni bul</p><p className="truncate text-[9px] text-[#72747D]">Teslim olmadan önce tanış</p></div>
                  <ArrowRight className="size-3.5 text-[#5B67F1]" aria-hidden="true" />
                </div>
              </div>
            </figure>
            {heroSignals.map(({ label, value, icon: Icon, position }) => (
              <div className={`hero-signal ${position}`} key={label}>
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary-subtle text-primary"><Icon className="size-4" aria-hidden="true" /></span>
                <div><p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-secondary-foreground">{label}</p><p className="mt-0.5 text-sm font-bold text-foreground">{value}</p></div>
                <span className="ml-auto rounded-full bg-warning/10 px-2 py-1 text-[8px] font-bold text-warning">ÖRNEK</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative z-20 -mt-8 pb-8" aria-labelledby="current-info-title">
        <Container>
          <div className="current-info-panel">
            <div className="flex items-center gap-3 border-b border-border px-5 py-4 lg:border-b-0 lg:border-r lg:px-6">
              <span className="size-2 rounded-full bg-danger shadow-[0_0_0_5px_rgb(229_83_83/10%)]" />
              <div><p id="current-info-title" className="text-sm font-bold">Askerlik gündeminde</p><p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-secondary-foreground">Demo içerik</p></div>
            </div>
            {currentMilitaryInfo.map((item) => (
              <div className="current-info-item" key={item.label}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">{item.label}</p>
                <p className="mt-1.5 text-sm font-bold">{item.value}</p>
                <p className="mt-1 text-[10px] text-secondary-foreground">{item.meta}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
