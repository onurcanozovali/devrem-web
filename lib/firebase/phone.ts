export function extractTurkishMobileDigits(value: string) {
  let digits = value.replace(/\D/g, '');
  const trimmed = value.trimStart();
  if (trimmed.startsWith('+90')) digits = digits.slice(2);
  else if (digits.startsWith('0090')) digits = digits.slice(4);
  else if (digits.startsWith('90') && digits.length > 10)
    digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, 10);
}

export function formatTurkishMobileNational(value: string) {
  const digits = extractTurkishMobileDigits(value);
  return [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 8),
    digits.slice(8, 10),
  ]
    .filter(Boolean)
    .join(' ');
}

export function formatTurkishMobile(value: string) {
  const national = formatTurkishMobileNational(value);
  return `+90${national ? ` ${national}` : ''}`;
}

export function toTurkishE164(value: string) {
  const digits = extractTurkishMobileDigits(value);
  return /^5\d{9}$/.test(digits) ? `+90${digits}` : null;
}
