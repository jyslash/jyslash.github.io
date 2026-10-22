// Schemas for the archive in content/. Files are `<id>.ko.md` / `<id>.en.md`:
// the ko file carries the metadata, the en file only translated text (PRD §5).
// Objects are strict, so a typo'd field name fails the build instead of
// silently disappearing. Required fields are checked after the ko/en pair is
// merged, in src/lib/archive.ts.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const fileId = ({ entry }: { entry: string }) => entry.replace(/\.md$/, '');
const loader = (base: string, pattern = '**/*.md') => glob({ base, pattern, generateId: fileId });

// "1994", "2016-06", "2026-10-21" — YAML may hand these over as a number, string or Date.
const archiveDate = z.union([z.date(), z.string(), z.number()]);
const precision = z.enum(['year', 'month', 'day']);
const lang = z.enum(['ko', 'en']);

const journal = defineCollection({
  loader: loader('./content/journal'),
  schema: z.strictObject({
    title: z.string().optional(),
    date: archiveDate.optional(),
    date_precision: precision.optional(),
    photos: z.array(z.string()).max(6).optional(),
    highlight: z.boolean().optional(),
    draft: z.boolean().optional(),
  }),
});

const projects = defineCollection({
  loader: loader('./content/projects'),
  schema: z.strictObject({
    title: z.string().optional(),
    description: z.string().optional(),
    role: z.string().optional(),
    org: z.string().optional(),
    type: z.enum(['product', 'side', 'old', 'talk']).optional(),
    date: archiveDate.optional(), // launch / publish date
    date_precision: precision.optional(),
    cover: z.string().optional(),
    selected: z.boolean().optional(),
    highlight: z.boolean().optional(),
    order: z.number().optional(),
    spoken_in: lang.optional(),
    links: z.array(z.strictObject({ url: z.string(), label: z.string().optional() })).optional(),
    draft: z.boolean().optional(),
  }),
});

const books = defineCollection({
  loader: loader('./content/books'),
  schema: z.strictObject({
    title: z.string().optional(),
    author: z.string().optional(),
    note: z.string().optional(),
    cover: z.string().optional(),
    status: z.enum(['reading', 'finished']).optional(),
    started: archiveDate.optional(),
    finished: archiveDate.optional(),
    highlight: z.boolean().optional(),
    draft: z.boolean().optional(),
  }),
});

// Page-level blocks that live next to the collections, e.g. content/library.ko.md.
const pages = defineCollection({
  loader: loader('./content', '*.md'),
  schema: z.strictObject({
    title: z.string().optional(),
    photo: z.string().optional(),
    url: z.string().optional(),
  }),
});

export const collections = { journal, projects, books, pages };
