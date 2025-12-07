const DEFAULT_API_BASE = 'http://localhost:8000';

const normalize = (base: string, path: string) => {
  const trimmedBase = base.replace(/\/$/, '');
  const trimmedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${trimmedPath}`;
};

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE || DEFAULT_API_BASE;

export const apiUrl = (path: string) => normalize(apiBase, path);
