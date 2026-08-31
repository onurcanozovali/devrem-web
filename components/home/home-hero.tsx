import {
  ArrowRight,
  CalendarDays,
  Check,
  MapPin,
  UsersRound,
  Settings,
  ChevronRight,
  Home,
  CircleCheck,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { ButtonLink } from "@/components/site/button-link";
import { Container } from "@/components/site/container";
import { currentMilitaryInfo } from "@/src/fixtures/home";

const heroSignals = [
  {
    label: "Teslime",
    value: "10 gün",
    icon: CalendarDays,
    position: "hero-signal-a",
  },
  {
    label: "Hazırlık",
    value: "9 / 31",
    icon: Check,
    position: "hero-signal-b",
  },
  {
    label: "Devre",
    value: "184 kişi",
    icon: UsersRound,
    position: "hero-signal-c",
  },
] as const;

export function HomeHero() {
  return (
    <>
      <section className="home-hero overflow-hidden">
        <Container className="grid min-h-[690px] items-center gap-12 pb-20 pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:pb-24 lg:pt-16">
          <div className="relative z-10 min-w-0 max-w-2xl animate-reveal">
            <h1 className="hero-title mt-7 text-balance">
              Askere hazırlanmanın <span>tek platformu.</span>
            </h1>
            <p className="mt-7 max-w-xl text-balance text-lg leading-8 text-secondary-foreground sm:text-xl">
              Devrelerini bul, birliğin hakkında bilgi edin, hazırlığını tamamla
              ve askere gitmeden önce seni nelerin beklediğini öğren.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#devreler" size="lg">
                Devrelerini Bul <ArrowRight aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#uygulama" size="lg" variant="outline">
                Devrem&apos;i Keşfet
              </ButtonLink>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-secondary-foreground">
              {["Birlik bilgileri", "Hazırlık araçları", "Devre topluluğu"].map(
                (item) => (
                  <span className="inline-flex items-center gap-2" key={item}>
                    <Check
                      className="size-4 text-primary-ink"
                      aria-hidden="true"
                    />{" "}
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="hero-product relative mx-auto min-h-[590px] w-full max-w-[590px] lg:ml-auto">
            <div className="hero-product-glow" aria-hidden="true" />
            <div
              className="relative mx-auto w-[320px] sm:w-[350px] lg:w-[370px]"
              aria-label="Devrem mobil uygulaması önizlemesi"
            >
              {/* Arka plan halkaları */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 -z-20 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#17372D] lg:h-[500px] lg:w-[500px]" />

              <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#55C89D]/20 lg:h-[420px] lg:w-[420px]" />

              {/* Telefon */}
              <div className="relative overflow-hidden rounded-[46px] border-[8px] border-[#090E0C] bg-[#101614] shadow-[0_35px_80px_rgba(0,0,0,0.38)]">
                {/* Dynamic island */}
                <div className="absolute left-1/2 top-[11px] z-30 h-[22px] w-[82px] -translate-x-1/2 rounded-full bg-black" />

                {/* Ekran */}
                <div className="relative min-h-[675px] bg-[#101614] px-5 pb-[74px] pt-10 text-[#F5F6F5]">
                  {/* Status */}
                  

                  {/* Selamlama */}
                  <div className="relative mb-6">
                    <p className="text-[20px] font-bold tracking-[-0.02em]">
                      İyi akşamlar, Onurcan
                    </p>
                  </div>

                  {/* Teslime kalan */}
                  <div className="mb-7 rounded-[24px] bg-[#55C89D] px-6 py-5 text-[#101614] shadow-[0_12px_30px_rgba(85,200,157,0.10)]">
                    <p className="text-[13px] font-bold">Teslime</p>

                    <div className="mt-1 flex items-end gap-2">
                      <span className="text-[38px] font-extrabold leading-none tracking-[-0.05em]">
                        25
                      </span>
                      <span className="pb-[3px] text-[15px] font-bold">
                        gün kaldı
                      </span>
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-[11px] font-medium">
                      <CalendarDays className="h-4 w-4" />
                      <span>24 Eylül 2026</span>
                    </div>
                  </div>

                  {/* Görev yeri */}
                  <div className="mb-5">
                    <p className="mb-2 pl-[56px] text-[13px] font-bold">
                      Görev yerin
                    </p>

                    <div className="flex items-center">
                      {/* Birlik ikonu */}
                      <div className="mr-3 flex h-[47px] w-[47px] shrink-0 items-center justify-center rounded-[14px] bg-[#19231F]">
                        
                        <img src="/public/kuvvetler/hava.png" alt="" />
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

                      <ChevronRight className="ml-3 h-5 w-5 shrink-0 text-[#55C89D]" />
                    </div>
                  </div>

                  {/* Bilgi kartları */}
                  <div className="mb-6 grid grid-cols-2 gap-3">
                    <div className="rounded-[18px] bg-[#1D2822] p-4">
                      <p className="text-[9px] text-[#A9B0AC]">Askerlik türü</p>

                      <p className="mt-2 text-[14px] font-bold">Bedelli</p>
                    </div>

                    <div className="rounded-[18px] bg-[#1D2822] p-4">
                      <p className="text-[9px] text-[#A9B0AC]">Celp dönemi</p>

                      <p className="mt-2 text-[14px] font-bold">Eylül 2026</p>
                    </div>
                  </div>

                  {/* Hazırlık */}
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

                    <div className="mt-4 h-[8px] overflow-hidden rounded-full bg-[#202C28]">
                      <div className="h-full w-[29%] rounded-full bg-[#55C89D]" />
                    </div>

                    <p className="mt-4 text-[11px] font-semibold text-[#A9B0AC]">
                      Önemli işlerin tamam
                    </p>
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    className="mt-5 flex h-[52px] w-full items-center justify-center rounded-[18px] bg-[#55C89D] text-[13px] font-extrabold text-[#101614] transition-colors hover:bg-[#49B98F]"
                  >
                    Hazırlığa devam et
                  </button>

                  {/* Bottom nav */}
                  <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.04] bg-[#16201C] px-4 pb-3 pt-3">
                    <div className="grid grid-cols-5">
                      <div className="flex flex-col items-center gap-1 text-[#55C89D]">
                        <Home className="h-[18px] w-[18px]" />
                        <span className="text-[7px] font-semibold">
                          Ana Sayfa
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1 text-[#A9B0AC]">
                        <CircleCheck className="h-[18px] w-[18px]" />
                        <span className="text-[7px]">Hazırlık</span>
                      </div>

                      <div className="flex flex-col items-center gap-1 text-[#A9B0AC]">
                        <UsersRound className="h-[18px] w-[18px]" />
                        <span className="text-[7px]">Devreni Bul</span>
                      </div>

                      <div className="flex flex-col items-center gap-1 text-[#A9B0AC]">
                        <MessageCircle className="h-[18px] w-[18px]" />
                        <span className="text-[7px]">Topluluk</span>
                      </div>

                      <div className="flex flex-col items-center gap-1 text-[#A9B0AC]">
                        <UserRound className="h-[18px] w-[18px]" />
                        <span className="text-[7px]">Profil</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alt gölge */}
              <div className="pointer-events-none absolute -bottom-8 left-1/2 -z-10 h-16 w-[76%] -translate-x-1/2 rounded-[100%] bg-black/25 blur-2xl" />
            </div>
          </div>
        </Container>
      </section>

      <section
        className="relative z-20 -mt-8 pb-8"
        aria-labelledby="current-info-title"
      >
        <Container>
          <div className="current-info-panel">
            <div className="flex items-center gap-3 border-b border-border px-5 py-4 lg:border-b-0 lg:border-r lg:px-6">
              <span className="status-pulse-danger size-2 rounded-full bg-danger" />
              <div>
                <p id="current-info-title" className="text-sm font-bold">
                  Askerlik gündeminde
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-secondary-foreground">
                  Canlı + demo özet
                </p>
              </div>
            </div>
            {currentMilitaryInfo.map((item) => (
              <div className="current-info-item" key={item.label}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary-ink">
                  {item.label}
                </p>
                <p className="mt-1.5 text-sm font-bold">{item.value}</p>
                <p className="mt-1 text-[10px] text-secondary-foreground">
                  {item.meta}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
