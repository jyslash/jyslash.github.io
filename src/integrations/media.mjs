// Serves the repo-root `media/` folder at /media/ — in dev from disk, in builds by
// copying it into the output. Keeping media outside `public/` means the archive
// (content/ + media/) never lives inside the site code, and can move to object
// storage later by changing `mediaBase` in src/site.config.mjs.
import { createReadStream } from 'node:fs';
import { cp, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
};

export default function media({ dir = 'media', route = '/media/' } = {}) {
  let root;
  return {
    name: 'media',
    hooks: {
      'astro:config:done': ({ config }) => {
        root = fileURLToPath(new URL(`${dir}/`, config.root));
      },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(route, async (req, res, next) => {
          const file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
          if (!file.startsWith(root)) return next();
          try {
            if (!(await stat(file)).isFile()) return next();
          } catch {
            return next();
          }
          res.setHeader('Content-Type', TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream');
          createReadStream(file).pipe(res);
        });
      },
      'astro:build:done': async ({ dir: outDir }) => {
        await cp(root, fileURLToPath(new URL(route.slice(1), outDir)), { recursive: true });
      },
    },
  };
}
