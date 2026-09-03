import {
  countFirestoreDocuments,
  listFirestoreDocuments,
  replaceFirestoreDocument,
} from '../lib/firebase/server';
import {
  aggregateProvinceValues,
  dashboardDateKey,
  isMilitaryProfileComplete,
  lastDateKeys,
  periodKey,
} from '../src/admin/dashboard';

const args = new Set(process.argv.slice(2));
const writeRequested = args.has('--write');
const projectConfirmation = process.argv.find((value) => value.startsWith('--confirm-project='))?.split('=')[1];
const configuredProject = process.env.FIREBASE_PROJECT_ID?.trim();

if (writeRequested && (!configuredProject || projectConfirmation !== configuredProject)) {
  throw new Error('Yazma işlemi için --confirm-project=<FIREBASE_PROJECT_ID> zorunludur.');
}

const users = await listFirestoreDocuments('users');
const memberships = await countFirestoreDocuments({ collection: '_devreGroupMemberships' });
const residence = aggregateProvinceValues(users.map(({ data }) => data.residenceCity));
const military = aggregateProvinceValues(users.map(({ data }) => data.militaryCity));
const allowedDates = new Set(lastDateKeys(120));
const registrations: Record<string, number> = {};
const periods: Record<string, number> = {};
let onboardingCompleted = 0;
let serviceProfileCompleted = 0;

for (const { data } of users) {
  if (data.onboardingCompleted === true) onboardingCompleted += 1;
  if (isMilitaryProfileComplete(data)) serviceProfileCompleted += 1;
  const date = dashboardDateKey(typeof data.createdAt === 'string' ? data.createdAt : '');
  if (date && allowedDates.has(date)) registrations[date] = (registrations[date] ?? 0) + 1;
  const key = periodKey(data.militaryPeriodYear, data.militaryPeriodMonth);
  if (key) periods[key] = (periods[key] ?? 0) + 1;
}

const updatedAt = new Date().toISOString();
const documents = {
  geography: {
    residence: residence.counts,
    military: military.counts,
    totalMatchedResidence: residence.matched,
    totalMatchedMilitary: military.matched,
    unmatchedResidence: residence.unmatched,
    unmatchedMilitary: military.unmatched,
    updatedAt,
  },
  daily: { registrations, updatedAt },
  dashboard: {
    registered: users.length,
    onboardingCompleted,
    serviceProfileCompleted,
    devreAssigned: Math.min(users.length, memberships),
    periods,
    updatedAt,
  },
};

if (writeRequested) {
  await Promise.all(Object.entries(documents).map(([id, data]) => replaceFirestoreDocument('_adminStats', id, data)));
  console.log(`_adminStats uzlaştırıldı: ${users.length} kullanıcı, proje ${configuredProject}.`);
} else {
  console.log(JSON.stringify({
    mode: 'dry-run',
    users: users.length,
    residenceMatched: residence.matched,
    residenceUnmatched: residence.unmatched,
    militaryMatched: military.matched,
    militaryUnmatched: military.unmatched,
    dailyBuckets: Object.keys(registrations).length,
    periods: Object.keys(periods).length,
    hint: 'Yazmak için --write --confirm-project=<FIREBASE_PROJECT_ID> kullanın.',
  }, null, 2));
}

