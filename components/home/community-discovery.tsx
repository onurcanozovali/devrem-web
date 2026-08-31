import { ArrowRight, Shield, UsersRound } from 'lucide-react';
import { conscriptionCommunity } from '@/src/fixtures/home';
import { ButtonLink } from '@/components/site/button-link';
import { Container } from '@/components/site/container';

const forceAbbreviations = ['KK', 'HK', 'DK', 'JG'] as const;

export function CommunityDiscovery() {
  return (
    <section className="community-section overflow-hidden py-20 sm:py-24" id="devreler">
      <Container className="grid items-center gap-12 lg:grid-cols-[1fr_0.92fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">Celp topluluğu · Demo veri</p>
          <h2 className="section-title mt-4 max-w-2xl text-balance text-foreground">{conscriptionCommunity.period} devreleri burada.</h2>
          <div className="mt-7 flex items-baseline gap-3">
            <span className="text-5xl font-bold tracking-[-0.06em] text-foreground sm:text-6xl">{new Intl.NumberFormat('tr-TR').format(conscriptionCommunity.memberCount)}</span>
            <span className="text-base font-semibold text-secondary-foreground">kişi · örnek sayaç</span>
          </div>
          <p className="mt-5 max-w-xl text-base leading-7 text-secondary-foreground sm:text-lg">Bu dönem askere gidecek devrelerini bul, teslim olmadan önce tanış.</p>
          <div className="mt-8"><ButtonLink href="#uygulama" size="lg" variant="light">Devrelerini Bul <ArrowRight aria-hidden="true" /></ButtonLink></div>
        </div>
        <div className="community-visual">
          <div className="community-core">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><UsersRound className="size-6" aria-hidden="true" /></span>
            <div><p className="text-xs font-bold text-foreground">Devre topluluğun</p><p className="mt-1 text-[10px] text-secondary-foreground">Aynı dönem · aynı birlik · aynı tür</p></div>
            <span className="status-pulse-success ml-auto size-2 rounded-full bg-success" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {conscriptionCommunity.forces.map((force, index) => (
              <div className="force-card" key={force}>
                <span className="force-placeholder" aria-hidden="true">{forceAbbreviations[index]}</span>
                <div><p className="text-[11px] font-bold text-foreground">{force}</p><p className="mt-1 text-[9px] text-muted-foreground">Logo alanı hazır</p></div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-surface/70 p-4 text-[10px] leading-5 text-secondary-foreground">
            <Shield className="size-4 shrink-0 text-primary-ink" aria-hidden="true" /> Kuvvet kimlikleri için kalıcı sahte logo kullanılmadı; onaylı varlıklar daha sonra eklenebilir.
          </div>
        </div>
      </Container>
    </section>
  );
}
