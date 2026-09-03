'use client';

import { useMemo, useState } from 'react';
import { MapPinned } from 'lucide-react';
import { cities } from 'turkey-map-react/lib/data/index.js';
import { provinceByKey, normalizeProvinceKey } from '@/src/admin/dashboard';

type Mode = 'residence' | 'military';
type ProvinceCounts = Record<string, number>;

const palette = ['#edf3f0', '#dcefe7', '#b8e2d2', '#7ccbab', '#3f9e78', '#176146'];

function formatNumber(value: number) {
  return new Intl.NumberFormat('tr-TR').format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 }).format(value);
}

function colorForCount(count: number, max: number) {
  if (count <= 0 || max <= 0) return palette[0];
  const ratio = Math.sqrt(count / max);
  return palette[Math.min(palette.length - 1, Math.max(1, Math.ceil(ratio * (palette.length - 1))))];
}

export function TurkeyDensityMap({
  residence,
  military,
  source,
  updatedAt,
}: {
  residence: { counts: ProvinceCounts; matched: number; unmatched: number };
  military: { counts: ProvinceCounts; matched: number; unmatched: number };
  source: 'aggregate' | 'bounded-server-fallback' | 'unavailable';
  updatedAt: string | null;
}) {
  const [mode, setMode] = useState<Mode>('residence');
  const [selectedPlate, setSelectedPlate] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, plate: 34 });
  const current = mode === 'residence' ? residence : military;
  const byPlate = useMemo(() => new Map(cities.map((city) => [city.plateNumber, city])), []);
  const max = Math.max(0, ...Object.values(current.counts));
  const selected = byPlate.get(selectedPlate ?? -1) ?? cities[0];
  const selectedKey = normalizeProvinceKey(selected.name) ?? '';
  const selectedCount = current.counts[selectedKey] ?? 0;
  const selectedPercent = current.matched > 0 ? (selectedCount / current.matched) * 100 : 0;
  const ranking = Object.entries(current.counts)
    .flatMap(([key, count]) => {
      const province = provinceByKey(key);
      return province && count > 0 ? [{ ...province, count }] : [];
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'tr'))
    .slice(0, 10);
  const tooltipCity = byPlate.get(tooltip.plate) ?? selected;
  const tooltipKey = normalizeProvinceKey(tooltipCity.name) ?? '';
  const tooltipCount = current.counts[tooltipKey] ?? 0;
  const tooltipPercent = current.matched > 0 ? (tooltipCount / current.matched) * 100 : 0;

  function revealPointer(event: React.PointerEvent<SVGPathElement>, plate: number) {
    const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      visible: true,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      plate,
    });
  }

  const sourceLabel = source === 'aggregate'
    ? 'Sunucu özeti'
    : source === 'bounded-server-fallback'
      ? 'Güvenli küçük veri seti'
      : 'Özet bekleniyor';

  return (
    <section className="admin-map-section" aria-labelledby="admin-map-title">
      <div className="admin-map-heading">
        <div>
          <p className="admin-kicker">Coğrafi dağılım</p>
          <h2 id="admin-map-title">Türkiye&apos;deki Devreler</h2>
          <p>İl bazındaki yoğunluğu, kullanıcı kimliklerini açığa çıkarmadan gösterir.</p>
        </div>
        <div className="admin-map-modes" aria-label="Harita veri türü">
          <button type="button" className={mode === 'residence' ? 'is-active' : ''} aria-pressed={mode === 'residence'} onClick={() => setMode('residence')}>İkamet İli</button>
          <button type="button" className={mode === 'military' ? 'is-active' : ''} aria-pressed={mode === 'military'} onClick={() => setMode('military')}>Görev Yeri</button>
        </div>
      </div>

      <div className="admin-map-layout">
        <div className="admin-map-column">
          <div className="admin-map-canvas">
            <svg viewBox="0 80 1050 585" aria-label={`${mode === 'residence' ? 'İkamet ili' : 'Görev yeri'} kullanıcı yoğunluğu Türkiye haritası`}>
              <g>
                {cities.map((city) => {
                  const key = normalizeProvinceKey(city.name) ?? '';
                  const count = current.counts[key] ?? 0;
                  const isSelected = selectedPlate === city.plateNumber;
                  const percent = current.matched > 0 ? (count / current.matched) * 100 : 0;
                  const label = `${city.name}, ${formatNumber(count)} kullanıcı${current.matched ? `, toplamın yüzde ${formatPercent(percent)}` : ''}`;
                  return (
                    <path
                      key={city.id}
                      d={city.path}
                      fill={colorForCount(count, max)}
                      className={isSelected ? 'is-selected' : ''}
                      tabIndex={0}
                      aria-label={label}
                      onPointerEnter={(event) => revealPointer(event, city.plateNumber)}
                      onPointerMove={(event) => revealPointer(event, city.plateNumber)}
                      onPointerLeave={() => setTooltip((value) => ({ ...value, visible: false }))}
                      onFocus={() => setSelectedPlate(city.plateNumber)}
                      onClick={() => setSelectedPlate(city.plateNumber)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setSelectedPlate(city.plateNumber);
                        }
                      }}
                    >
                      <title>{label}</title>
                    </path>
                  );
                })}
              </g>
            </svg>
            {tooltip.visible ? (
              <div className="admin-map-tooltip" style={{ left: tooltip.x, top: tooltip.y }} role="tooltip">
                <strong>{tooltipCity.name}</strong>
                <span>{formatNumber(tooltipCount)} kullanıcı</span>
                {current.matched > 0 ? <small>Toplamın %{formatPercent(tooltipPercent)}&apos;i</small> : null}
              </div>
            ) : null}
          </div>

          <div className={`admin-map-selection ${selectedPlate === null ? 'is-empty' : ''}`} aria-live="polite">
            <MapPinned aria-hidden="true" />
            <div>
              <strong>{selectedPlate === null ? 'Bir il seçin' : selected.name}</strong>
              <span>{selectedPlate === null ? 'Ayrıntı için haritaya dokunun.' : `${formatNumber(selectedCount)} kullanıcı${current.matched ? ` · %${formatPercent(selectedPercent)}` : ''}`}</span>
            </div>
          </div>

          <div className="admin-map-legend" aria-label={`Yoğunluk ölçeği 0 ile ${max} kullanıcı arasında`}>
            <span>Az yoğunluk</span>
            <div>{palette.map((color) => <i key={color} style={{ backgroundColor: color }} />)}</div>
            <span>Yüksek yoğunluk</span>
            <span aria-hidden="true" />
            <div className="admin-map-legend-values"><small>0</small><small>{Math.ceil(max / 2)}</small><small>{max}</small></div>
            <span aria-hidden="true" />
          </div>
          <div className="admin-map-meta">
            <span>{sourceLabel}{updatedAt ? ` · ${new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeZone: 'Europe/Istanbul' }).format(new Date(updatedAt))}` : ''}</span>
            <span>{formatNumber(current.matched)} eşleşen · {formatNumber(current.unmatched)} eşleşmeyen kayıt</span>
          </div>
        </div>

        <aside className="admin-map-ranking" aria-labelledby="admin-map-ranking-title">
          <div>
            <p className="admin-kicker">İlk 10</p>
            <h3 id="admin-map-ranking-title">En yoğun iller</h3>
          </div>
          {ranking.length ? (
            <ol>
              {ranking.map((province, index) => (
                <li key={province.key}>
                  <button type="button" onClick={() => setSelectedPlate(province.plate)}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{province.name}</strong>
                    <small>{formatNumber(province.count)}{current.matched ? ` · %${formatPercent((province.count / current.matched) * 100)}` : ''}</small>
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <div className="admin-map-empty">
              <strong>Henüz dağılım yok</strong>
              <p>{source === 'unavailable' ? 'Coğrafi özet hazır olduğunda sıralama burada görünecek.' : 'Bu görünüm için eşleşen il kaydı bulunmuyor.'}</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
