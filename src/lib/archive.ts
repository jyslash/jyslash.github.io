// Reads the archive in content/ and pairs each `<id>.ko.md` with its `<id>.en.md`.
// The ko file is the source of truth for metadata; for text fields and the body,
// the requested language wins and the other language is the fallback (PRD §5).
import { getCollection, type CollectionEntry } from 'astro:content';
import { parseDate, type ArchiveDate } from './dates';
import type { Lang } from './i18n';

type Collection = 'journal' | 'projects' | 'books' | 'pages';
type Entry<C extends Collection> = CollectionEntry<C>;

export interface Item<C extends Collection = Collection> {
  /** Filename without language suffix — the permanent id. */
  id: string;
  lang: Lang;
  data: Entry<C>['data'];
  /** The file whose body to render (requested language, else the other one). */
  bodyEntry?: Entry<C>;
  /** False when the requested language has no text of its own yet. */
  translated: boolean;
  date?: ArchiveDate;
  url: string;
}

const TEXT_FIELDS = ['title', 'description', 'role', 'note'] as const;

const REQUIRED: Record<Collection, string[]> = {
  journal: ['title', 'date'],
  projects: ['title'],
  books: ['title', 'author', 'status'],
  pages: [],
};

// Fields the PRD requires that existing content doesn't have yet. These warn
// instead of failing the build until the content is filled in.
const REQUIRED_SOON: Partial<Record<Collection, string[]>> = {
  projects: ['date'],
};

const URL_SECTION: Record<Collection, string> = {
  journal: 'journal',
  projects: 'projects',
  books: 'books',
  pages: '',
};

const hasText = (e?: Entry<Collection>) =>
  !!e && (TEXT_FIELDS.some((f) => (e.data as Record<string, unknown>)[f]) || !!e.body?.trim());

const cache = new Map<string, Promise<Item[]>>();
const warned = new Set<string>();

export function getItems<C extends Collection>(collection: C, lang: Lang): Promise<Item<C>[]> {
  const key = `${collection}:${lang}`;
  if (!cache.has(key)) cache.set(key, load(collection, lang));
  return cache.get(key) as Promise<Item<C>[]>;
}

async function load<C extends Collection>(collection: C, lang: Lang): Promise<Item<C>[]> {
  const entries = (await getCollection(collection)) as Entry<C>[];

  const pairs = new Map<string, Partial<Record<Lang, Entry<C>>>>();
  for (const entry of entries) {
    const m = entry.id.match(/(?:^|\/)([^/]+)\.(ko|en)$/);
    if (!m) throw new Error(`content/${collection}/${entry.id}.md: filename must end in .ko.md or .en.md`);
    const [, id, fileLang] = m as [string, string, Lang];
    const pair = pairs.get(id) ?? {};
    if (pair[fileLang]) throw new Error(`content/${collection}: two files named ${id}.${fileLang}.md`);
    pair[fileLang] = entry;
    pairs.set(id, pair);
  }

  const items: Item<C>[] = [];
  for (const [id, pair] of pairs) {
    const own = pair[lang];
    const other = pair[lang === 'ko' ? 'en' : 'ko'];
    const base = pair.ko ?? pair.en!;
    const data = { ...base.data } as Record<string, unknown>;
    for (const f of TEXT_FIELDS) {
      const value = (own?.data as Record<string, unknown>)?.[f] ?? (other?.data as Record<string, unknown>)?.[f];
      if (value !== undefined) data[f] = value;
    }
    if (data.draft && !import.meta.env.DEV) continue;

    const where = `content/${collection}/${base.id}.md`;
    for (const f of REQUIRED[collection]) {
      if (data[f] === undefined || data[f] === '') throw new Error(`${where}: missing required field "${f}"`);
    }
    for (const f of REQUIRED_SOON[collection] ?? []) {
      if (data[f] === undefined && !warned.has(where + f)) {
        warned.add(where + f);
        console.warn(`[archive] ${where}: no "${f}" yet`);
      }
    }

    let date: ArchiveDate | undefined;
    try {
      date = parseDate(data.date, data.date_precision as ArchiveDate['precision']);
    } catch (e) {
      throw new Error(`${where}: ${(e as Error).message}`);
    }

    items.push({
      id,
      lang,
      data: data as Entry<C>['data'],
      bodyEntry: own?.body?.trim() ? own : other?.body?.trim() ? other : undefined,
      translated: hasText(own),
      date,
      url: URL_SECTION[collection] ? `/${lang}/${URL_SECTION[collection]}/${id}/` : '',
    });
  }
  return items;
}

/** Newest first; undated last. */
export const byDateDesc = (a: Item, b: Item) =>
  (b.date?.key ?? '').localeCompare(a.date?.key ?? '') || a.id.localeCompare(b.id);

export interface TimelineEvent {
  key: string;
  date: ArchiveDate;
  kind: 'journal' | 'project' | 'bookStarted' | 'bookFinished';
  title: string;
  url: string;
  translated: boolean;
}

/** Everything, oldest first — the feed behind About → Everything (PRD §3.1). */
export async function getTimeline(lang: Lang): Promise<TimelineEvent[]> {
  const [journal, projects, books] = await Promise.all([
    getItems('journal', lang),
    getItems('projects', lang),
    getItems('books', lang),
  ]);
  const events: TimelineEvent[] = [];
  const push = (item: Item, kind: TimelineEvent['kind'], date?: ArchiveDate) => {
    if (date) {
      events.push({ key: `${kind}-${item.id}`, date, kind, title: String(item.data.title), url: item.url, translated: item.translated });
    }
  };
  for (const j of journal) push(j, 'journal', j.date);
  for (const p of projects) push(p, 'project', p.date);
  for (const b of books) {
    push(b, 'bookStarted', parseDate(b.data.started));
    push(b, 'bookFinished', parseDate(b.data.finished));
  }
  return events.sort((a, b) => a.date.key.localeCompare(b.date.key) || a.key.localeCompare(b.key));
}

/** A page-level block such as content/library.ko.md, if it exists. */
export async function getPage(id: string, lang: Lang): Promise<Item<'pages'> | undefined> {
  return (await getItems('pages', lang)).find((p) => p.id === id);
}
