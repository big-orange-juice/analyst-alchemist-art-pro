export type RunHistoryItem = {
  id: string;
  ts: number;
  ok: boolean;
  summary: string;
  input?: unknown;
  output?: string;
};

const STORAGE_PREFIX = 'capability_run_history:';
const MAX_ITEMS = 50;

const safeParseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const normalizeArray = (value: unknown): RunHistoryItem[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((x): RunHistoryItem | null => {
      if (!x || typeof x !== 'object') return null;
      const item = x as Partial<RunHistoryItem> & Record<string, unknown>;

      const ts = typeof item.ts === 'number' ? item.ts : Date.now();
      const ok = typeof item.ok === 'boolean' ? item.ok : false;
      const summary = typeof item.summary === 'string' ? item.summary : '';
      const id =
        typeof item.id === 'string' ? item.id : `${ts}-${Math.random()}`;

      const next: RunHistoryItem = {
        id,
        ts,
        ok,
        summary
      };

      if (item.input !== undefined) next.input = item.input;
      if (typeof item.output === 'string') next.output = item.output;

      return next;
    })
    .filter((x): x is RunHistoryItem => x !== null && Boolean(x.summary));
};

export const getRunHistory = (key: string): RunHistoryItem[] => {
  if (typeof window === 'undefined') return [];

  const storageKey = `${STORAGE_PREFIX}${key}`;
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return [];

  return normalizeArray(safeParseJson(raw)).sort((a, b) => b.ts - a.ts);
};

export const addRunHistory = (
  key: string,
  item: Omit<RunHistoryItem, 'id' | 'ts'> & { ts?: number }
): RunHistoryItem[] => {
  if (typeof window === 'undefined') return [];

  const storageKey = `${STORAGE_PREFIX}${key}`;
  const existing = getRunHistory(key);

  const ts = typeof item.ts === 'number' ? item.ts : Date.now();
  const next: RunHistoryItem = {
    id: `${ts}-${Math.random().toString(16).slice(2)}`,
    ts,
    ok: item.ok,
    summary: item.summary,
    input: item.input,
    output: item.output
  };

  const merged = [next, ...existing].slice(0, MAX_ITEMS);
  window.localStorage.setItem(storageKey, JSON.stringify(merged));
  return merged;
};
