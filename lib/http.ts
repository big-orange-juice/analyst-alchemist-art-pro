export class ApiError<T = unknown> extends Error {
  status: number;
  data?: T;
  text?: string;

  constructor(
    message: string,
    opts: { status: number; data?: T; text?: string }
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = opts.status;
    this.data = opts.data;
    this.text = opts.text;
  }
}

type UnauthorizedHandling = 'notify' | 'ignore';

type ApiFetchOptions<TBody = unknown> = Omit<
  RequestInit,
  'body' | 'headers'
> & {
  headers?: HeadersInit;
  body?: TBody;
  parseAs?: 'json' | 'text';
  unauthorizedHandling?: UnauthorizedHandling;
};

const tryParseJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const extractMessage = (data: any, fallback: string) => {
  const detailMsg = data?.detail?.[0]?.msg;
  const msg = data?.message;
  if (typeof detailMsg === 'string' && detailMsg.trim()) return detailMsg;
  if (typeof msg === 'string' && msg.trim()) return msg;
  return fallback;
};

declare global {
  interface Window {
    __aaUnauthorizedLastAt?: number;
  }
}

const handleUnauthorized = async () => {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  const last = window.__aaUnauthorizedLastAt ?? 0;
  if (now - last < 1000) return;
  window.__aaUnauthorizedLastAt = now;

  try {
    const { useUserStore, useAgentStore, useModalStore, useNotificationStore } =
      await import('@/store');

    try {
      useUserStore.getState().clearUser();
      useAgentStore.getState().clearAgent();
    } catch {
      // ignore
    }

    try {
      useNotificationStore
        .getState()
        .addNotification('登录已过期', '请重新登录', 'warning');
    } catch {
      // ignore
    }

    const path = window.location.pathname || '';
    const search = window.location.search || '';
    const hasLoginFlag = search.includes('login=true');

    if (path.startsWith('/dashboard')) {
      try {
        useModalStore.getState().setIsLoginModalOpen(true);
      } catch {
        // ignore
      }

      if (!hasLoginFlag) {
        const url = new URL(window.location.href);
        url.searchParams.set('login', 'true');
        window.history.replaceState({}, '', url.toString());
      }
      return;
    }

    if (!hasLoginFlag) {
      window.location.href = '/dashboard?login=true';
    }
  } catch {
    // ignore
  }
};

export async function apiFetch<T = unknown, TBody = unknown>(
  url: string,
  options: ApiFetchOptions<TBody> = {}
): Promise<T> {
  const {
    body,
    headers,
    parseAs = 'json',
    unauthorizedHandling = 'notify',
    ...init
  } = options;

  const nextHeaders: Record<string, string> = {};
  if (headers) {
    const h = new Headers(headers);
    h.forEach((value, key) => {
      nextHeaders[key] = value;
    });
  }

  let nextBody: BodyInit | undefined = undefined;
  if (body !== undefined) {
    if (
      typeof body === 'string' ||
      body instanceof FormData ||
      body instanceof URLSearchParams ||
      body instanceof Blob ||
      body instanceof ArrayBuffer
    ) {
      nextBody = body as any;
    } else {
      nextHeaders['Content-Type'] =
        nextHeaders['Content-Type'] || 'application/json';
      nextBody = JSON.stringify(body);
    }
  }

  const res = await fetch(url, {
    ...init,
    headers: Object.keys(nextHeaders).length ? nextHeaders : undefined,
    body: nextBody,
    credentials: init.credentials ?? 'include'
  });

  const text = await res.text();
  const maybeJson = tryParseJson(text);

  if (res.status === 401 && unauthorizedHandling !== 'ignore') {
    void handleUnauthorized();
  }

  if (!res.ok) {
    const message = extractMessage(maybeJson, text || '请求失败');
    throw new ApiError(message, {
      status: res.status,
      data: maybeJson ?? undefined,
      text
    });
  }

  if (parseAs === 'text') return text as any;

  if (maybeJson != null) return maybeJson as T;
  // Some endpoints might respond with empty body
  return text as any as T;
}
