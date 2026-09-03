'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Source = 'aggregate' | 'bounded-server-fallback' | 'unavailable';

function formatNumber(value: number) {
  return new Intl.NumberFormat('tr-TR').format(value);
}

function sourceLabel(source: Source) {
  if (source === 'aggregate') return 'Günlük özet';
  if (source === 'bounded-server-fallback') return 'Güvenli küçük veri seti';
  return 'Özet bekleniyor';
}

export function UserGrowthChart({
  points,
  source,
}: {
  points: Array<{ date: string; registrations: number }>;
  source: Source;
}) {
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const visible = useMemo(() => points.slice(-range).map((point) => ({
    ...point,
    label: new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', timeZone: 'Europe/Istanbul' }).format(new Date(`${point.date}T12:00:00Z`)),
  })), [points, range]);
  const total = visible.reduce((sum, point) => sum + point.registrations, 0);

  return (
    <section className="admin-dashboard-panel admin-growth-panel" aria-labelledby="growth-title">
      <div className="admin-dashboard-panel-heading">
        <div>
          <p className="admin-kicker">Kayıt trendi</p>
          <h2 id="growth-title">Kullanıcı büyümesi</h2>
        </div>
        <div className="admin-range-picker" aria-label="Grafik tarih aralığı">
          {([7, 30, 90] as const).map((item) => (
            <button key={item} type="button" className={range === item ? 'is-active' : ''} aria-pressed={range === item} onClick={() => setRange(item)}>{item} gün</button>
          ))}
        </div>
      </div>
      <div className="admin-growth-summary">
        <strong>{formatNumber(total)}</strong>
        <span>seçili dönemde yeni kayıt · {sourceLabel(source)}</span>
      </div>
      {source === 'unavailable' ? (
        <div className="admin-chart-empty"><strong>Günlük özet henüz hazır değil</strong><p>İstatistik uzlaştırması tamamlandığında trend burada görünecek.</p></div>
      ) : (
        <figure className="admin-chart" aria-label={`Son ${range} günde toplam ${formatNumber(total)} yeni kullanıcı. Sıfır kayıtlı günler dahil edilmiştir.`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visible} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="adminGrowthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#55c89d" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#55c89d" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e1e9e5" strokeDasharray="4 4" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={28} tick={{ fill: '#7b8882', fontSize: 10 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={34} tick={{ fill: '#7b8882', fontSize: 10 }} />
              <Tooltip cursor={{ stroke: '#9ccfbb', strokeDasharray: '4 4' }} contentStyle={{ border: '1px solid #d7e2dc', borderRadius: 12, boxShadow: '0 12px 28px rgb(20 55 42 / 10%)', fontSize: 12 }} formatter={(value) => [`${formatNumber(Number(value ?? 0))} kayıt`, 'Yeni kullanıcı']} labelFormatter={(label) => String(label)} />
              <Area type="monotone" dataKey="registrations" stroke="#26805f" strokeWidth={2.5} fill="url(#adminGrowthFill)" activeDot={{ r: 4, fill: '#176146', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </figure>
      )}
    </section>
  );
}

export function UserJourney({
  stages,
  source,
}: {
  stages: Array<{ key: string; label: string; count: number | null }>;
  source: Source;
}) {
  const base = stages[0]?.count ?? 0;
  return (
    <section className="admin-dashboard-panel admin-journey-panel" aria-labelledby="journey-title">
      <div className="admin-dashboard-panel-heading">
        <div>
          <p className="admin-kicker">Dönüşüm</p>
          <h2 id="journey-title">Kullanıcı yolculuğu</h2>
        </div>
        <span className="admin-data-source">{sourceLabel(source)}</span>
      </div>
      <ol className="admin-journey-list">
        {stages.map((stage, index) => {
          const previous = index === 0 ? stage.count : stages[index - 1]?.count;
          const conversion = stage.count !== null && previous !== null && previous > 0
            ? (stage.count / previous) * 100
            : index === 0 && stage.count !== null
              ? 100
              : null;
          const width = stage.count !== null && base > 0 ? Math.max(5, (stage.count / base) * 100) : 0;
          return (
            <li key={stage.key}>
              <div>
                <span>{stage.label}</span>
                {stage.count === null ? <small>Veri henüz ölçülmüyor</small> : <strong>{formatNumber(stage.count)} <small>{conversion !== null ? `%${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 }).format(conversion)}` : '—'}</small></strong>}
              </div>
              <i aria-hidden="true"><span style={{ width: `${width}%` }} /></i>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function ServicePeriodChart({
  items,
  source,
}: {
  items: Array<{ key: string; label: string; count: number }>;
  source: Source;
}) {
  return (
    <section className="admin-dashboard-panel admin-period-panel" aria-labelledby="period-title">
      <div className="admin-dashboard-panel-heading">
        <div>
          <p className="admin-kicker">Celp yoğunluğu</p>
          <h2 id="period-title">Yaklaşan dönemler</h2>
        </div>
        <span className="admin-data-source">{sourceLabel(source)}</span>
      </div>
      {source === 'unavailable' || !items.length ? (
        <div className="admin-chart-empty"><strong>{source === 'unavailable' ? 'Dönem özeti henüz hazır değil' : 'Yaklaşan dönem kaydı yok'}</strong><p>{source === 'unavailable' ? 'Uzlaştırma tamamlandığında dağılım burada görünecek.' : 'Güncel veya gelecek döneme atanmış kullanıcı bulunmuyor.'}</p></div>
      ) : (
        <figure className="admin-period-chart" aria-label={items.map((item) => `${item.label}: ${item.count} kullanıcı`).join(', ')}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={items} layout="vertical" margin={{ top: 4, right: 28, left: 2, bottom: 4 }}>
              <CartesianGrid horizontal={false} stroke="#e1e9e5" strokeDasharray="4 4" />
              <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#7b8882', fontSize: 10 }} />
              <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} width={92} tick={{ fill: '#4d5d55', fontSize: 10, fontWeight: 650 }} />
              <Tooltip cursor={{ fill: 'rgb(85 200 157 / 8%)' }} contentStyle={{ border: '1px solid #d7e2dc', borderRadius: 12, fontSize: 12 }} formatter={(value) => [`${formatNumber(Number(value ?? 0))} kullanıcı`, 'Dönem']} />
              <Bar dataKey="count" fill="#55c89d" radius={[0, 7, 7, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </figure>
      )}
    </section>
  );
}
