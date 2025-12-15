'use client';

import React, { useEffect, useState } from 'react';
import { Hexagon, Fingerprint, Power, Globe, X } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { apiFetch } from '@/lib/http';

type StockActivity = {
  id: number | string;
  activity_name?: string;
  status?: string;
  index_sort?: number;
};

const parseMaybeJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const authRegister = async (payload: {
  username: string;
  email: string;
  password: string;
}) => {
  const text = await apiFetch<string, typeof payload>('/api/auth/register', {
    method: 'POST',
    body: payload,
    parseAs: 'text',
    unauthorizedHandling: 'ignore',
    errorHandling: 'ignore'
  });
  return parseMaybeJson(text);
};

const authLogin = async (payload: { username: string; password: string }) => {
  const text = await apiFetch<string, typeof payload>('/api/auth/login', {
    method: 'POST',
    body: payload,
    parseAs: 'text',
    unauthorizedHandling: 'ignore',
    errorHandling: 'ignore'
  });
  return parseMaybeJson(text);
};

interface LoginScreenProps {
  onLogin: (user: { id?: string; username: string; email?: string }) => void;
  onClose: () => void;
}

export default function LoginScreen({ onLogin, onClose }: LoginScreenProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<StockActivity | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    apiFetch<StockActivity[]>('/api/v2/stock-activities', {
      unauthorizedHandling: 'ignore'
    })
      .then((data) => {
        if (cancelled) return;
        const list: StockActivity[] = Array.isArray(data) ? data : [];
        const running = list
          .filter((a) => a?.status === 'running')
          .sort((a, b) => (b.index_sort ?? 0) - (a.index_sort ?? 0));
        setCurrentActivity(running[0] ?? list[0] ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setCurrentActivity(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    if (mode === 'register' && !email.trim()) return;

    setIsConnecting(true);

    try {
      if (mode === 'register') {
        await authRegister({ username, email, password });
        // 注册成功后自动登录：再走一次登录接口以获得 token（由 Next 代理写入 HttpOnly cookie）
        await authLogin({ username, password });

        // UI 层仍沿用现有 onLogin 流程写入本地用户态
        onLogin({ username, email });
        return;
      }

      const data = await authLogin({ username, password });

      const maybeId =
        data && typeof data === 'object'
          ? (data as any).id ?? (data as any).user_id ?? (data as any).user?.id
          : undefined;
      const maybeEmail =
        data && typeof data === 'object'
          ? (data as any).email ?? (data as any).user?.email
          : undefined;

      onLogin({ id: maybeId, username, email: maybeEmail ?? email });
    } catch (err) {
      // 不引入额外 UI，仅恢复按钮可用并在控制台输出
      console.error(err);
      setIsConnecting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 modal-animate'>
      <div className='relative w-full max-w-4xl flex flex-col md:flex-row shadow-2xl glass-panel border border-white/[0.02]'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-500 hover:text-cp-yellow z-50 transition-colors'>
          <X size={24} />
        </button>

        {/* Left Side - Artistic Branding */}
        <div className='w-full md:w-5/12 bg-white/[0.02] p-10 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-white/[0.02] hover-card m-1'>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

          <div className='relative z-10'>
            <div className='flex items-center gap-3 text-cp-yellow mb-8'>
              <Hexagon className='w-8 h-8' strokeWidth={1.5} />
              <span className='font-bold font-serif text-xl tracking-wider'>
                MATRIX
              </span>
            </div>
            <h1 className='text-4xl font-serif font-bold text-white leading-tight mb-6'>
              {t('login.welcome_title')}
            </h1>
            <p className='text-cp-text-muted text-sm font-sans font-light leading-relaxed'>
              {t('login.welcome_desc')}
            </p>
          </div>

          <div className='relative z-10 hidden md:block'>
            <div className='py-4 border-t border-white/[0.02]'>
              <div className='text-xs text-cp-yellow font-bold uppercase tracking-widest mb-2'>
                {t('login.season_name')}
              </div>
              <div className='text-xs text-gray-500 font-mono'>
                {currentActivity?.activity_name || '—'}
              </div>
              <div className='text-xs text-gray-500 font-mono mt-2'>
                STATUS:{' '}
                <span className='text-white'>
                  {(currentActivity?.status || '—').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className='w-full md:w-7/12 p-10 md:p-14 bg-transparent flex flex-col justify-center'>
          {/* Minimal Tabs */}
          <div className='flex gap-8 mb-10 border-b border-white/[0.02]'>
            <button
              onClick={() => setMode('login')}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors tab-item ${
                mode === 'login' ? 'active' : ''
              }`}>
              {t('login.tab_login')}
            </button>
            <button
              onClick={() => setMode('register')}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors tab-item ${
                mode === 'register' ? 'active' : ''
              }`}>
              {t('login.tab_register')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-6'>
              <div className='relative group hover-card p-2 border border-transparent'>
                <label className='text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1 block group-focus-within:text-cp-yellow transition-colors'>
                  {t('login.username')}
                </label>
                <input
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className='w-full bg-transparent border-b border-cp-border py-2 text-cp-text font-mono text-base focus:border-cp-yellow focus:outline-none transition-colors placeholder-gray-800'
                  placeholder={t('login.username_placeholder')}
                />
              </div>

              {mode === 'register' && (
                <div className='relative group animate-in slide-in-from-top-2 hover-card p-2 border border-transparent'>
                  <label className='text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1 block group-focus-within:text-cp-yellow transition-colors'>
                    {t('login.email')}
                  </label>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='w-full bg-transparent border-b border-cp-border py-2 text-cp-text font-mono text-base focus:border-cp-yellow focus:outline-none transition-colors placeholder-gray-800'
                    placeholder={t('login.email_placeholder')}
                  />
                </div>
              )}

              <div className='relative group hover-card p-2 border border-transparent'>
                <label className='text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1 block group-focus-within:text-cp-yellow transition-colors'>
                  {t('login.password')}
                </label>
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full bg-transparent border-b border-cp-border py-2 text-cp-text font-mono text-base focus:border-cp-yellow focus:outline-none transition-colors placeholder-gray-800'
                  placeholder={t('login.password_placeholder')}
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={isConnecting}
              className='w-full py-4 mt-8 btn-gold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed'>
              {isConnecting ? (
                <span className='animate-spin'>
                  <Power size={18} />
                </span>
              ) : (
                <Fingerprint size={18} />
              )}
              {isConnecting
                ? t('login.connecting')
                : mode === 'login'
                ? t('login.connect')
                : t('login.mint')}
            </button>
          </form>

          <div className='mt-8 text-center text-[10px] text-gray-600 font-mono flex items-center justify-center gap-2'>
            <Globe size={10} />
            {t('login.secure_msg')}
          </div>
        </div>
      </div>
    </div>
  );
}
