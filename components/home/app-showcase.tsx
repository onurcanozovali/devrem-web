import { ArrowRight, Check, MessageCircle, Search, ShieldCheck, Smartphone, UsersRound } from 'lucide-react';
import { appSteps } from '@/src/fixtures/home';
import { Container } from '@/components/site/container';
import { SectionHeader } from './section-header';

function AppPhone({ variant }: { variant: 'match' | 'chat' }) {
  return (
    <figure className={`showcase-phone showcase-phone-${variant}`} aria-label={`Devrem ${variant === 'match' ? 'devre bulma' : 'sohbet'} ekranı demo görünümü`}>
      <span className="showcase-phone-island" aria-hidden="true" />
      <div className="showcase-phone-status"><span>09:41</span><span>Demo</span></div>
      {variant === 'match' ? (
        <div className="px-4 pb-5 pt-2 text-foreground">
          <div className="flex items-center justify-between"><div><p className="text-[9px] text-secondary-foreground">Aynı dönem · aynı birlik</p><p className="mt-1 text-sm font-bold">Devreni Bul</p></div><span className="flex size-8 items-center justify-center rounded-full bg-primary-dark text-primary-ink"><Search className="size-3.5" aria-hidden="true" /></span></div>
          <div className="mt-5 space-y-2.5">{['A', 'M', 'E'].map((initial, index) => <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated p-3" key={initial}><span className="flex size-9 items-center justify-center rounded-full bg-primary-dark text-[10px] font-bold text-primary-ink">{initial}</span><div className="flex-1"><p className="text-[10px] font-bold">Örnek devre profili</p><p className="mt-1 text-[8px] text-secondary-foreground">Aynı dönem · aynı birlik</p></div>{index === 0 ? <Check className="size-3.5 text-success" aria-hidden="true" /> : null}</div>)}</div>
        </div>
      ) : (
        <div className="flex min-h-[420px] flex-col px-4 pb-5 pt-2 text-foreground">
          <div className="flex items-center gap-3 border-b border-border pb-3"><span className="flex size-8 items-center justify-center rounded-full bg-primary-dark text-[9px] font-bold text-primary-ink">D</span><div><p className="text-[10px] font-bold">Devre grubun</p><p className="text-[8px] text-secondary-foreground">Aynı birlik ve dönem</p></div></div>
          <div className="mt-5 max-w-[86%] rounded-2xl rounded-tl-md bg-surface-elevated px-3 py-2.5 text-[9px] leading-4">Yol planını birlikte yapalım mı?</div>
          <div className="ml-auto mt-3 max-w-[86%] rounded-2xl rounded-tr-md border border-primary/15 bg-primary-dark px-3 py-2.5 text-[9px] leading-4">Birlik bilgilerine baktım, grupta paylaşırım.</div>
          <div className="mt-3 max-w-[86%] rounded-2xl rounded-tl-md bg-surface-elevated px-3 py-2.5 text-[9px] leading-4">Hazırlık listesi de bayağı işime yaradı.</div>
          <div className="mt-auto flex items-center gap-2 rounded-2xl border border-border bg-surface-elevated p-2.5"><span className="flex-1 text-[9px] text-secondary-foreground">Mesaj yaz…</span><span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground"><MessageCircle className="size-3.5" aria-hidden="true" /></span></div>
        </div>
      )}
    </figure>
  );
}

export function AppShowcase() {
  return (
    <section className="app-showcase overflow-hidden py-20 sm:py-24 lg:py-28" id="uygulama">
      <Container>
        <SectionHeader inverse eyebrow="Devrem mobil uygulaması" title="Askerlik başlamadan devrelerinle tanış." description="Web’de araştır, mobil uygulamada aynı yolculuğu paylaşacağın insanlarla buluş." />
        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[0.84fr_1.16fr]">
          <div className="space-y-3">
            {appSteps.map((item) => (
              <article className="app-step" key={item.step}>
                <span>{item.step}</span><div><h3>{item.title}</h3><p>{item.description}</p></div>
              </article>
            ))}
            <div className="mt-6 rounded-2xl border border-border bg-surface/70 p-4">
              <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary-ink" aria-hidden="true" /><p className="text-xs leading-5 text-secondary-foreground">Ekranlar Devrem’in ürün akışını temsil eden yeniden kullanılabilir demo kompozisyonlarıdır; kalıcı kullanıcı verisi içermez.</p></div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {['Google Play', 'App Store'].map((store) => <button className="store-placeholder" disabled key={store} type="button"><Smartphone className="size-5" aria-hidden="true" /><span><small>Yakında</small>{store}</span></button>)}
            </div>
          </div>
          <div className="showcase-phones">
            <div className="showcase-orbit" aria-hidden="true" />
            <AppPhone variant="match" />
            <AppPhone variant="chat" />
            <div className="showcase-chip showcase-chip-a"><UsersRound className="size-4" aria-hidden="true" /> Aynı devre</div>
            <div className="showcase-chip showcase-chip-b"><Check className="size-4" aria-hidden="true" /> Hazırlık tamam</div>
          </div>
        </div>
        <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground"><ArrowRight className="size-3.5" aria-hidden="true" /> Resmî mağaza URL’leri yayınlandığında butonlar etkinleştirilecek.</p>
      </Container>
    </section>
  );
}
