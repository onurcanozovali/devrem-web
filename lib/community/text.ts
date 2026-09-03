import {
  NICKNAME_MAX,
  NICKNAME_MIN,
  REPLY_BODY_MAX,
  REPLY_BODY_MIN,
  TOPIC_BODY_MAX,
  TOPIC_BODY_MIN,
  TOPIC_TITLE_MAX,
  TOPIC_TITLE_MIN,
} from './constants';

export function normalizePlainText(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.replace(/\r\n/g, '\n').replaceAll('\0', '').trim();
}

export function previewText(value: string, max = 140) {
  const compact = value.replace(/\s+/g, ' ').trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max - 1).trimEnd()}…`;
}

export function seoDescriptionFromBody(body: string) {
  const text = previewText(body, 158);
  return text || 'Devrem topluluğunda askerlik soruları ve deneyimleri.';
}

export function anonymousDisplayName(uid: string) {
  let hash = 2166136261;
  for (let index = 0; index < uid.length; index += 1) {
    hash ^= uid.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const suffix = 1000 + (Math.abs(hash) % 9000);
  return `Anonim Devre ${suffix}`;
}

export function slugifyTitle(title: string, suffix: string) {
  const base = title
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  const token = suffix.replace(/[^a-z0-9]/gi, '').slice(0, 8).toLowerCase();
  return `${base || 'konu'}-${token || 'devre'}`;
}

export function validateTopicTitle(value: string) {
  if (value.length < TOPIC_TITLE_MIN) {
    return `Başlık en az ${TOPIC_TITLE_MIN} karakter olmalı.`;
  }
  if (value.length > TOPIC_TITLE_MAX) {
    return `Başlık en fazla ${TOPIC_TITLE_MAX} karakter olabilir.`;
  }
  return null;
}

export function validateTopicBody(value: string) {
  if (value.length < TOPIC_BODY_MIN) {
    return `İçerik en az ${TOPIC_BODY_MIN} karakter olmalı.`;
  }
  if (value.length > TOPIC_BODY_MAX) {
    return `İçerik en fazla ${TOPIC_BODY_MAX} karakter olabilir.`;
  }
  return null;
}

export function validateReplyBody(value: string) {
  if (value.length < REPLY_BODY_MIN) {
    return `Yanıt en az ${REPLY_BODY_MIN} karakter olmalı.`;
  }
  if (value.length > REPLY_BODY_MAX) {
    return `Yanıt en fazla ${REPLY_BODY_MAX} karakter olabilir.`;
  }
  return null;
}

export function validateNickname(value: string) {
  if (!value) return null;
  if (value.length < NICKNAME_MIN) {
    return `Takma ad en az ${NICKNAME_MIN} karakter olmalı.`;
  }
  if (value.length > NICKNAME_MAX) {
    return `Takma ad en fazla ${NICKNAME_MAX} karakter olabilir.`;
  }
  if (!/^[\p{L}\p{N} .'-]+$/u.test(value)) {
    return 'Takma ad yalnızca harf, rakam ve boşluk içerebilir.';
  }
  return null;
}

export function contentFingerprint(title: string, body: string) {
  return `${title}\n${body}`.slice(0, 800);
}

export function formatCommunityDate(iso: string | null) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(date);
}

export function formatRelativeCommunityDate(
  iso: string | null,
  now = Date.now(),
) {
  if (!iso) return '';
  const timestamp = Date.parse(iso);
  if (Number.isNaN(timestamp)) return '';
  const elapsed = Math.max(0, now - timestamp);
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return 'şimdi';
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;
  return formatCommunityDate(iso);
}
