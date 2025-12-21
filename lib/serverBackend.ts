export const getApiPrefix = () => {
  const base = process.env.API_PREFIX;
  if (!base) {
    throw new Error('缺少环境变量 API_PREFIX');
  }
  return base;
};

export const backendURL = (path: string) => {
  const base = getApiPrefix();
  // Ensure we don't accidentally drop base path segments like `/api/v2`.
  // `new URL('/x', 'http://host/api/v2')` becomes `http://host/x`.
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const normalizedPath = String(path || '').replace(/^\/+/, '');
  return new URL(normalizedPath, normalizedBase);
};

export const backendUrl = (path: string) => backendURL(path).toString();
