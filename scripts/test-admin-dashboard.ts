import assert from 'node:assert/strict';
import {
  TURKISH_PROVINCES,
  aggregateProvinceValues,
  fillDailyRegistrations,
  isMilitaryProfileComplete,
  normalizeAggregateCounts,
  normalizeProvinceKey,
  periodKey,
} from '../src/admin/dashboard';

assert.equal(TURKISH_PROVINCES.length, 81, 'all 81 provinces are canonical');
assert.equal(new Set(TURKISH_PROVINCES.map((province) => province.key)).size, 81, 'province keys are unique');
assert.equal(normalizeProvinceKey('İstanbul'), 'ISTANBUL');
assert.equal(normalizeProvinceKey('istanbul'), 'ISTANBUL');
assert.equal(normalizeProvinceKey('ŞANLIURFA'), 'SANLIURFA');
assert.equal(normalizeProvinceKey('Kahraman Maraş'), 'KAHRAMANMARAS');
assert.equal(normalizeProvinceKey('Iğdır'), 'IGDIR');
assert.equal(normalizeProvinceKey('35'), 'IZMIR');
assert.equal(normalizeProvinceKey(17), 'CANAKKALE');
assert.equal(normalizeProvinceKey('İçel'), 'MERSIN');
assert.equal(normalizeProvinceKey('desteklenmeyen'), null);

const distribution = aggregateProvinceValues(['Samsun', 55, 'İzmir', 'bozuk', null]);
assert.equal(distribution.counts.SAMSUN, 2);
assert.equal(distribution.counts.IZMIR, 1);
assert.equal(distribution.matched, 3);
assert.equal(distribution.unmatched, 2);

const aggregate = normalizeAggregateCounts({ İstanbul: 4, 6: 2, bad: 3, İzmir: -4 });
assert.equal(aggregate.counts.ISTANBUL, 4);
assert.equal(aggregate.counts.ANKARA, 2);
assert.equal(aggregate.counts.IZMIR, 0);
assert.equal(aggregate.unmatched, 3);

const points = fillDailyRegistrations({ '2026-09-01': 3 }, 3, new Date('2026-09-02T12:00:00Z'));
assert.deepEqual(points, [
  { date: '2026-08-31', registrations: 0 },
  { date: '2026-09-01', registrations: 3 },
  { date: '2026-09-02', registrations: 0 },
]);

assert.equal(periodKey(2026, 9), '2026-09');
assert.equal(periodKey(2026, 13), null);
assert.equal(isMilitaryProfileComplete({ militaryCity: 55, militaryPeriodYear: 2026, militaryPeriodMonth: 9, militaryType: 'bedelli', militaryUnit: 'unit-1' }), true);
assert.equal(isMilitaryProfileComplete({ militaryCity: 55, militaryPeriodYear: 2026, militaryPeriodMonth: 9, militaryType: 'bedelli' }), false);

console.log('Admin dashboard tests passed (fixtures only; no Firebase calls or mutations).');

