import type { Lang } from './i18n';

export type Precision = 'year' | 'month' | 'day';

export interface ArchiveDate {
  year: number;
  month?: number;
  day?: number;
  precision: Precision;
  /** Sortable "YYYY-MM-DD"; unknown parts sort to the start of their range. */
  key: string;
  /** For <time datetime>. */
  iso: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Accepts how dates are written in content: 1994, "2016-06", 2026-10-21 (which
 * YAML may already have turned into a Date). Precision follows what is written,
 * unless `date_precision` narrows it ("2016-06-01" + month -> June 2016).
 */
export function parseDate(value: unknown, precision?: Precision): ArchiveDate | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  let parts: number[];
  if (value instanceof Date) {
    parts = [value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate()];
  } else {
    const m = String(value).match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/);
    if (!m) throw new Error(`Unrecognised date "${value}" — use YYYY, YYYY-MM or YYYY-MM-DD`);
    parts = m.slice(1).filter(Boolean).map(Number);
  }
  const written: Precision = parts.length === 3 ? 'day' : parts.length === 2 ? 'month' : 'year';
  const order: Precision[] = ['year', 'month', 'day'];
  const p = precision && order.indexOf(precision) < order.indexOf(written) ? precision : written;
  const [year, month, day] = parts;
  const d: ArchiveDate = { year, precision: p, key: '', iso: '' };
  if (p !== 'year') d.month = month;
  if (p === 'day') d.day = day;
  d.key = `${year}-${pad(d.month ?? 0)}-${pad(d.day ?? 0)}`;
  d.iso = [year, d.month && pad(d.month), d.day && pad(d.day)].filter(Boolean).join('-');
  return d;
}

const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Prints only what is known: "1994", "Jun 2016", "Oct 21, 2026" / "2016년 6월". */
export function formatDate(d: ArchiveDate, lang: Lang): string {
  if (lang === 'ko') {
    return [`${d.year}년`, d.month && `${d.month}월`, d.day && `${d.day}일`].filter(Boolean).join(' ');
  }
  if (!d.month) return String(d.year);
  const month = EN_MONTHS[d.month - 1];
  return d.day ? `${month} ${d.day}, ${d.year}` : `${month} ${d.year}`;
}
