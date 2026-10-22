#!/usr/bin/env node
// Prepares images for the archive (PRD §7.4): auto-rotates, resizes to at most
// 2000px on the long edge, re-encodes, and strips all metadata — including GPS
// location — keeping only the colour profile.
//
//   npm run ingest -- journal/2026/2026-10-21-first-rain ~/Desktop/IMG_1234.HEIC ~/Desktop/IMG_1235.jpg
//   npm run ingest -- books/the-overstory cover.jpg --name cover
//
// Files land in media/<dest>/ as 1.jpg, 2.jpg, … (continuing after existing
// ones) or <name>.<ext>, and the script prints the paths to paste into front
// matter. Photos become JPEG; images with transparency stay PNG; GIFs are
// copied as-is so animation survives.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const MAX_EDGE = 2000;
const JPEG_QUALITY = 82;

const args = process.argv.slice(2);
const nameAt = args.indexOf('--name');
const name = nameAt >= 0 ? args.splice(nameAt, 2)[1] : undefined;
const [dest, ...inputs] = args;

if (!dest || inputs.length === 0 || (name && inputs.length > 1)) {
  console.error('usage: npm run ingest -- <media/subfolder> <image> [image…] [--name <basename>]');
  console.error('       --name works with a single image only');
  process.exit(1);
}

const outDir = path.join('media', dest.replace(/^media\//, ''));
mkdirSync(outDir, { recursive: true });

let next = 1 + Math.max(0, ...readdirSync(outDir).map((f) => parseInt(f, 10)).filter(Number.isFinite));
const tmp = mkdtempSync(path.join(tmpdir(), 'ingest-'));
const written = [];

try {
  for (const input of inputs) {
    const base = name ?? String(next++);
    const ext = path.extname(input).toLowerCase();

    if (ext === '.gif') {
      const out = path.join(outDir, `${base}.gif`);
      copyFileSync(input, out);
      written.push(out);
      continue;
    }

    let source = input;
    if (ext === '.heic' || ext === '.heif') {
      // sharp's prebuilt binaries can't decode iPhone HEIC; macOS can.
      source = path.join(tmp, `${path.basename(input, ext)}.jpg`);
      execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '100', input, '--out', source], { stdio: 'ignore' });
    }

    const meta = await sharp(source).metadata();
    const image = sharp(source)
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .keepIccProfile();
    const out = path.join(outDir, `${base}.${meta.hasAlpha ? 'png' : 'jpg'}`);
    await (meta.hasAlpha ? image.png({ compressionLevel: 9 }) : image.jpeg({ quality: JPEG_QUALITY, mozjpeg: true })).toFile(out);
    written.push(out);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log('\nPaste into front matter:\n');
for (const file of written) console.log(`  - ${path.relative('media', file)}`);
console.log();
