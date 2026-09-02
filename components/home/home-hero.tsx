import Image from 'next/image';
import {
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  Home,
  MessageCircle,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react';
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
      <Container className="grid min-h-[800px] items-center gap-14 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
        <div className="relative z-10 max-w-2xl animate-reveal">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-primary-ink">
            <ShieldCheck className="size-4" aria-hidden="true" /> Askere
            gitmeden önce Devrem var
          </div>
          <h1 className="mt-7 text-balance text-[clamp(3.5rem,7vw,7rem)] font-extrabold leading-[0.9] tracking-[-0.08em]">
            Askere hazırlanmanın
            <br />
            <span className="text-primary-ink">tek yolu.</span>
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
          <div className="landing-phone-wrap">
            <div className="landing-phone">
              <div className="landing-phone-island" aria-hidden="true" />
              <div className="relative min-h-[675px] bg-[#101614] px-5 pb-[74px] pt-10 text-[#F5F6F5]">
                <div className="mb-7 flex items-center justify-between text-[9px] font-semibold text-[#F5F6F5]/80">
                  <span>19:30</span>
                  <div className="flex items-center gap-1">
                    <span>Vo</span>
                    <span>WiFi</span>
                    <span className="flex h-[12px] min-w-[22px] items-center justify-center rounded-[3px] bg-[#F5F6F5] px-1 text-[7px] font-bold text-[#101614]">
                      35
                    </span>
                  </div>
                </div>

                <div className="relative mb-6">
                  <p className="pr-12 text-[20px] font-bold tracking-[-0.02em]">
                    İyi akşamlar, Onurcan
                  </p>
                  <span
                    className="absolute -right-1 -top-1 flex size-10 items-center justify-center rounded-full border border-white/10 bg-[#25302C] shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
                    aria-hidden="true"
                  >
                    <Settings className="size-[19px] text-[#A9B0AC]" />
                  </span>
                </div>

                <div className="mb-7 rounded-[24px] bg-[#55C89D] px-6 py-5 text-[#101614] shadow-[0_12px_30px_rgba(85,200,157,0.10)]">
                  <p className="text-[13px] font-bold">Teslime</p>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-[38px] font-extrabold leading-none tracking-[-0.05em]">
                      10
                    </span>
                    <span className="pb-[3px] text-[15px] font-bold">
                      gün kaldı
                    </span>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-[11px] font-medium">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    <span>24 Ağustos 2026</span>
                  </div>
                </div>

                <div className="mb-5">
                  <p className="mb-2 pl-[60px] text-[13px] font-bold">
                    Görev yerin
                  </p>
                  <div className="flex items-center">
                    <div className="mr-3 flex size-[47px] shrink-0 items-center justify-center rounded-[14px] border border-[#35433E] bg-[#19231F] p-1.5">
                      <Image
                        alt=""
                        className="h-full w-full object-contain"
                        height={47}
                        src="/kuvvetler/hava.png"
                        width={47}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[22px] font-extrabold leading-none tracking-[-0.03em]">
                        Kütahya
                      </p>
                      <p className="mt-2 truncate text-[11px] text-[#A9B0AC]">
                        Hava Er Eğitim Tugay Komutanlığı
                      </p>
                      <p className="mt-1 text-[9px] text-[#7D8782]">
                        Hava Kuvvetleri Komutanlığı
                      </p>
                    </div>
                    <ChevronRight
                      className="ml-3 size-5 shrink-0 text-[#55C89D]"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] bg-[#1D2822] p-4">
                    <p className="text-[9px] text-[#A9B0AC]">Askerlik türü</p>
                    <p className="mt-2 text-[14px] font-bold">Bedelli</p>
                  </div>
                  <div className="rounded-[18px] bg-[#1D2822] p-4">
                    <p className="text-[9px] text-[#A9B0AC]">Celp dönemi</p>
                    <p className="mt-2 text-[14px] font-bold">Ağustos 2026</p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#33433D] bg-[#18211E] px-5 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[15px] font-bold">Hazırlığın</p>
                      <p className="mt-1 text-[11px] text-[#A9B0AC]">
                        9 / 31 görev tamamlandı
                      </p>
                    </div>
                    <span className="text-[28px] font-extrabold tracking-[-0.04em] text-[#55C89D]">
                      %29
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#202C28]">
                    <div className="h-full w-[29%] rounded-full bg-[#55C89D]" />
                  </div>
                  <p className="mt-4 text-[11px] font-semibold text-[#A9B0AC]">
                    Önemli işlerin tamam
                  </p>
                </div>

                <div className="mt-5 flex h-[52px] w-full items-center justify-center rounded-[18px] bg-[#55C89D] text-[13px] font-extrabold text-[#101614]">
                  Hazırlığa devam et
                </div>

                <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.04] bg-[#16201C] px-4 pb-3 pt-3">
                  <div className="grid grid-cols-5">
                    <div className="flex flex-col items-center gap-1 text-[#55C89D]">
                      <Home className="size-[18px]" aria-hidden="true" />
                      <span className="text-[7px] font-semibold">
                        Ana Sayfa
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-[#A9B0AC]">
                      <CircleCheck className="size-[18px]" aria-hidden="true" />
                      <span className="text-[7px]">Hazırlık</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-[#A9B0AC]">
                      <UsersRound className="size-[18px]" aria-hidden="true" />
                      <span className="text-[7px]">Devreni Bul</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-[#A9B0AC]">
                      <MessageCircle
                        className="size-[18px]"
                        aria-hidden="true"
                      />
                      <span className="text-[7px]">Topluluk</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-[#A9B0AC]">
                      <UserRound className="size-[18px]" aria-hidden="true" />
                      <span className="text-[7px]">Profil</span>
                    </div>
                  </div>
                </div>
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
        </div>
      </Container>
    </section>
  );
}
