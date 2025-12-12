export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

const parseMaybeJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export async function register(payload: RegisterPayload) {
  const res = await fetch('/api/v1/api/v2/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || '请求失败');
  }

  return parseMaybeJson(text);
}

export async function login(payload: LoginPayload) {
  const res = await fetch('/api/v1/api/v2/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || '请求失败');
  }

  return parseMaybeJson(text);
}
