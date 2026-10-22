import site from '../site.config.mjs';

/** Content stores media as paths like "journal/2026/<id>/1.jpg"; this decides where they're served from. */
export function media(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${site.mediaBase.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
