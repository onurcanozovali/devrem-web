import { Buffer } from 'node:buffer';

type FirebaseServerConfig = {
  projectId: string;
  storageBucket: string;
  clientEmail: string | null;
  privateKey: string | null;
  accessToken: string | null;
};

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { stringValue: string }
  | { referenceValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

type FirestoreDocument = {
  name?: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
};

export class FirebaseConfigurationError extends Error {
  constructor(message = 'Firebase sunucu yapılandırması eksik.') {
    super(message);
    this.name = 'FirebaseConfigurationError';
  }
}

function getConfig(): FirebaseServerConfig {
  return {
    projectId: process.env.FIREBASE_PROJECT_ID?.trim() ?? '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET?.trim() ?? '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.trim() || null,
    privateKey:
      process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim() || null,
    accessToken: process.env.FIREBASE_ACCESS_TOKEN?.trim() || null,
  };
}

export function isFirebaseServerConfigured() {
  const config = getConfig();
  return Boolean(
    config.projectId &&
    (config.accessToken || (config.clientEmail && config.privateKey)),
  );
}

export function getFirebaseStorageBucket() {
  const config = getConfig();
  if (!config.storageBucket) {
    throw new FirebaseConfigurationError('FIREBASE_STORAGE_BUCKET eksik.');
  }
  return config.storageBucket;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

function base64Url(value: string | Uint8Array) {
  const bytes =
    typeof value === 'string' ? Buffer.from(value, 'utf8') : Buffer.from(value);
  return bytes.toString('base64url');
}

async function createServiceAccountToken(config: FirebaseServerConfig) {
  if (!config.clientEmail || !config.privateKey) {
    throw new FirebaseConfigurationError(
      'FIREBASE_CLIENT_EMAIL ve FIREBASE_PRIVATE_KEY eksik.',
    );
  }
  const now = Math.floor(Date.now() / 1_000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64Url(
    JSON.stringify({
      iss: config.clientEmail,
      sub: config.clientEmail,
      aud: 'https://oauth2.googleapis.com/token',
      scope:
        'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/devstorage.read_write https://www.googleapis.com/auth/identitytoolkit',
      iat: now,
      exp: now + 3_600,
    }),
  );
  const unsigned = `${header}.${payload}`;
  const der = Buffer.from(
    config.privateKey
      .replace(/-----BEGIN PRIVATE KEY-----/g, '')
      .replace(/-----END PRIVATE KEY-----/g, '')
      .replace(/\s/g, ''),
    'base64',
  );
  const key = await crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned),
  );
  const assertion = `${unsigned}.${base64Url(new Uint8Array(signature))}`;
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(
      `Firebase kimlik doğrulaması başarısız (${response.status}).`,
    );
  }
  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + Math.max(60, data.expires_in - 120) * 1_000,
  };
  return cachedToken.value;
}

export async function getFirebaseAccessToken() {
  const config = getConfig();
  if (!config.projectId) {
    throw new FirebaseConfigurationError('FIREBASE_PROJECT_ID eksik.');
  }
  if (config.accessToken) return config.accessToken;
  if (cachedToken && cachedToken.expiresAt > Date.now())
    return cachedToken.value;
  return createServiceAccountToken(config);
}

function encodeValue(value: unknown, key = ''): FirestoreValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (typeof value === 'string') {
    if (
      [
        'createdAt',
        'updatedAt',
        'publishedAt',
        'timestamp',
        'resolvedAt',
        'disabledAt',
        'scheduledAt',
        'lastActivityAt',
        'lastWriteAt',
      ].includes(key) &&
      !Number.isNaN(Date.parse(value))
    ) {
      return { timestampValue: new Date(value).toISOString() };
    }
    return { stringValue: value };
  }
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((item) =>
          Array.isArray(item)
            ? {
                mapValue: {
                  fields: { __devremArray: encodeValue(item) },
                },
              }
            : encodeValue(item),
        ),
      },
    };
  }
  if (typeof value === 'object') {
    const fields = Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, nested]) => nested !== undefined)
        .map(([nestedKey, nested]) => [
          nestedKey,
          encodeValue(nested, nestedKey),
        ]),
    );
    return { mapValue: { fields } };
  }
  throw new Error(`Firestore değeri desteklenmiyor: ${typeof value}`);
}

function decodeValue(value: FirestoreValue): unknown {
  if ('nullValue' in value) return null;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('stringValue' in value) return value.stringValue;
  if ('referenceValue' in value) return value.referenceValue;
  if ('arrayValue' in value) {
    return (value.arrayValue.values ?? []).map(decodeValue);
  }
  if ('mapValue' in value) {
    const fields = value.mapValue.fields ?? {};
    if (
      Object.keys(fields).length === 1 &&
      fields.__devremArray &&
      'arrayValue' in fields.__devremArray
    ) {
      return decodeValue(fields.__devremArray);
    }
    return decodeFields(fields);
  }
  return null;
}

function encodeFields(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, encodeValue(item, key)]),
  );
}

function decodeFields(fields: Record<string, FirestoreValue>) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]),
  );
}

function documentId(name = '') {
  return decodeURIComponent(name.split('/').at(-1) ?? '');
}

async function firebaseFetch(path: string, init: RequestInit = {}) {
  const config = getConfig();
  if (!config.projectId) {
    throw new FirebaseConfigurationError('FIREBASE_PROJECT_ID eksik.');
  }
  const token = await getFirebaseAccessToken();
  const headers = new Headers(init.headers);
  headers.set('authorization', `Bearer ${token}`);
  if (init.body) headers.set('content-type', 'application/json');
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/(default)/documents${path}`,
    {
      ...init,
      headers,
      cache: 'no-store',
    },
  );
  return response;
}

export async function listFirestoreDocuments(collection: string) {
  const documents: Array<{ id: string; data: Record<string, unknown> }> = [];
  let pageToken = '';
  do {
    const query = new URLSearchParams({ pageSize: '100' });
    if (pageToken) query.set('pageToken', pageToken);
    const response = await firebaseFetch(`/${collection}?${query.toString()}`);
    if (!response.ok) {
      throw new Error(`Firestore listesi alınamadı (${response.status}).`);
    }
    const payload = (await response.json()) as {
      documents?: FirestoreDocument[];
      nextPageToken?: string;
    };
    for (const document of payload.documents ?? []) {
      documents.push({
        id: documentId(document.name),
        data: decodeFields(document.fields ?? {}),
      });
    }
    pageToken = payload.nextPageToken ?? '';
  } while (pageToken);
  return documents;
}

export type FirestoreQueryFilter = {
  field: string;
  op:
    | 'EQUAL'
    | 'NOT_EQUAL'
    | 'LESS_THAN'
    | 'LESS_THAN_OR_EQUAL'
    | 'GREATER_THAN'
    | 'GREATER_THAN_OR_EQUAL'
    | 'ARRAY_CONTAINS'
    | 'IN';
  value: unknown;
};

export type FirestoreQueryOrder = {
  field: string;
  direction?: 'ASCENDING' | 'DESCENDING';
};

export type FirestoreQuerySpec = {
  collection: string;
  parent?: string;
  allDescendants?: boolean;
  filters?: FirestoreQueryFilter[];
  orderBy?: FirestoreQueryOrder[];
  limit?: number;
  cursor?: string;
};

type QueryCursor = { values: FirestoreValue[] };

function encodeQueryCursor(cursor: QueryCursor) {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

function decodeQueryCursor(cursor: string | undefined) {
  if (!cursor) return null;
  try {
    const value = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8'),
    ) as QueryCursor;
    return Array.isArray(value.values) ? value : null;
  } catch {
    return null;
  }
}

function queryEndpoint(parent: string | undefined, action: string) {
  const normalizedParent = parent
    ? `/${parent
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/')}`
    : '';
  return `${normalizedParent}:${action}`;
}

function buildStructuredQuery(spec: FirestoreQuerySpec) {
  const filters = spec.filters ?? [];
  const orderBy = spec.orderBy ?? [];
  const fieldFilters = filters.map((filter) => ({
    fieldFilter: {
      field: { fieldPath: filter.field },
      op: filter.op,
      value: encodeValue(filter.value, filter.field),
    },
  }));
  const cursor = decodeQueryCursor(spec.cursor);

  return {
    from: [
      {
        collectionId: spec.collection,
        ...(spec.allDescendants ? { allDescendants: true } : {}),
      },
    ],
    ...(fieldFilters.length === 1
      ? { where: fieldFilters[0] }
      : fieldFilters.length > 1
        ? {
            where: {
              compositeFilter: { op: 'AND', filters: fieldFilters },
            },
          }
        : {}),
    ...(orderBy.length
      ? {
          orderBy: orderBy.map((order) => ({
            field: { fieldPath: order.field },
            direction: order.direction ?? 'ASCENDING',
          })),
        }
      : {}),
    ...(cursor ? { startAt: { before: false, values: cursor.values } } : {}),
    limit: Math.min(Math.max(spec.limit ?? 25, 1), 100),
  };
}

function cursorValueForDocument(
  document: FirestoreDocument,
  data: Record<string, unknown>,
  order: FirestoreQueryOrder,
) {
  if (order.field === '__name__') {
    return { referenceValue: document.name ?? '' } satisfies FirestoreValue;
  }
  return encodeValue(data[order.field], order.field);
}

export async function queryFirestoreDocuments(spec: FirestoreQuerySpec) {
  const response = await firebaseFetch(queryEndpoint(spec.parent, 'runQuery'), {
    method: 'POST',
    body: JSON.stringify({ structuredQuery: buildStructuredQuery(spec) }),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(
      `Firestore sorgusu çalıştırılamadı (${response.status}): ${detail}`,
    );
  }
  const payload = (await response.json()) as Array<{
    document?: FirestoreDocument;
  }>;
  const records = payload.flatMap(({ document }) => {
    if (!document) return [];
    return [
      {
        id: documentId(document.name),
        data: decodeFields(document.fields ?? {}),
        name: document.name ?? '',
      },
    ];
  });
  const lastDocument = payload.findLast((item) => item.document)?.document;
  const orderBy = spec.orderBy ?? [];
  const lastRecord = records.at(-1);
  const nextCursor =
    records.length === (spec.limit ?? 25) && lastDocument && lastRecord && orderBy.length
      ? encodeQueryCursor({
          values: orderBy.map((order) =>
            cursorValueForDocument(lastDocument, lastRecord.data, order),
          ),
        })
      : null;
  return { records, nextCursor };
}

export async function countFirestoreDocuments(
  spec: Omit<FirestoreQuerySpec, 'cursor' | 'limit' | 'orderBy'>,
) {
  const structuredQuery = buildStructuredQuery({ ...spec, limit: 1 });
  delete (structuredQuery as { limit?: number }).limit;
  const response = await firebaseFetch(
    queryEndpoint(spec.parent, 'runAggregationQuery'),
    {
      method: 'POST',
      body: JSON.stringify({
        structuredAggregationQuery: {
          structuredQuery,
          aggregations: [{ alias: 'total', count: {} }],
        },
      }),
    },
  );
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(
      `Firestore sayımı çalıştırılamadı (${response.status}): ${detail}`,
    );
  }
  const payload = (await response.json()) as Array<{
    result?: {
      aggregateFields?: { total?: { integerValue?: string } };
    };
  }>;
  return Number(payload[0]?.result?.aggregateFields?.total?.integerValue ?? 0);
}

export async function getFirestoreDocumentPath(path: string) {
  const normalized = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  const response = await firebaseFetch(`/${normalized}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Firestore belgesi alınamadı (${response.status}).`);
  }
  const document = (await response.json()) as FirestoreDocument;
  return {
    id: documentId(document.name),
    data: decodeFields(document.fields ?? {}),
  };
}

export type FirestoreCommitWrite = {
  path: string;
  data: Record<string, unknown>;
  updateFields?: string[];
};

export async function commitFirestoreWrites(writes: FirestoreCommitWrite[]) {
  const config = getConfig();
  const response = await firebaseFetch(':commit', {
    method: 'POST',
    body: JSON.stringify({
      writes: writes.map((write) => ({
        update: {
          name: `projects/${config.projectId}/databases/(default)/documents/${write.path}`,
          fields: encodeFields(write.data),
        },
        ...(write.updateFields?.length
          ? { updateMask: { fieldPaths: write.updateFields } }
          : {}),
      })),
    }),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 800);
    throw new Error(
      `Firestore işlemi tamamlanamadı (${response.status}): ${detail}`,
    );
  }
}

export async function getFirestoreDocument(collection: string, id: string) {
  const response = await firebaseFetch(
    `/${collection}/${encodeURIComponent(id)}`,
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Firestore belgesi alınamadı (${response.status}).`);
  }
  const document = (await response.json()) as FirestoreDocument;
  return { id, data: decodeFields(document.fields ?? {}) };
}

export async function createFirestoreDocument(
  collection: string,
  id: string,
  data: Record<string, unknown>,
) {
  const query = new URLSearchParams({ documentId: id });
  const response = await firebaseFetch(`/${collection}?${query.toString()}`, {
    method: 'POST',
    body: JSON.stringify({ fields: encodeFields(data) }),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 800);
    throw new Error(
      `Firestore belgesi oluşturulamadı (${response.status}): ${detail}`,
    );
  }
}

export async function replaceFirestoreDocument(
  collection: string,
  id: string,
  data: Record<string, unknown>,
) {
  const response = await firebaseFetch(
    `/${collection}/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ fields: encodeFields(data) }),
    },
  );
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 800);
    throw new Error(
      `Firestore belgesi güncellenemedi (${response.status}): ${detail}`,
    );
  }
}

export async function deleteFirestoreDocument(collection: string, id: string) {
  const response = await firebaseFetch(
    `/${collection}/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );
  if (!response.ok) {
    throw new Error(`Firestore belgesi silinemedi (${response.status}).`);
  }
}

export async function deleteFirebaseStorageObject(path: string) {
  const bucket = getFirebaseStorageBucket();
  const response = await fetch(
    `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(path)}`,
    {
      method: 'DELETE',
      headers: { authorization: `Bearer ${await getFirebaseAccessToken()}` },
      cache: 'no-store',
    },
  );
  if (!response.ok && response.status !== 404) {
    throw new Error(`Storage nesnesi silinemedi (${response.status}).`);
  }
}

export async function fetchFirebaseStorageObject(path: string) {
  const bucket = getFirebaseStorageBucket();
  return fetch(
    `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(path)}?alt=media`,
    {
      headers: { authorization: `Bearer ${await getFirebaseAccessToken()}` },
      cache: 'no-store',
    },
  );
}
