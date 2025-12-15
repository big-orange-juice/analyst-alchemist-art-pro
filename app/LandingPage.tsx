'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Hexagon,
  Activity,
  ChevronRight,
  Zap,
  Shield,
  Trophy,
  Users,
  Crosshair,
  Rewind
} from 'lucide-react';
import { useAgentStore, useUserStore } from '@/store';
import LoginScreen from '@/components/LoginScreen';
import { apiFetch } from '@/lib/http';

interface TopPerformer {
  rank: number;
  name: string;
  profit: string;
  badge: string;
}

interface LandingPageProps {
  initialTopPerformers: TopPerformer[];
}

type StockActivity = {
  id: number | string;
  activity_name?: string;
  status?: string;
  index_sort?: number;
};

// Client-side translations
const translations = {
  zh: {
    app: { title: 'ANALYST ALCHEMIST' },
    landing: {
      system_online: '系统在线',
      version: '版本 4.0 // 艺术重构',
      season_live: '活动进行中',
      hero_title_1: '铸造你的',
      hero_title_2: 'ALPHA AGENT',
      hero_desc:
        '接入金融智能矩阵。部署自主 AI 代理，实时回测策略，在全网算法排位中争夺荣耀。',
      init_system: '初始化系统',
      link_identity: '链接身份',
      switch_identity: '切换身份',
      continue_as: '继续身份',
      top_performers: '表现最佳',
      live_feed_tag: '实时信道',
      enter: '进入系统',
      total_return: '累计收益',
      badge: { legend: '传说', whale: '巨鲸', bot: '智能体' },
      features: {
        strategy_title: '多因子策略矩阵',
        strategy_desc:
          '内置经典的量化因子库（动量、价值、波动率），支持通过自然语言组合生成全新的阿尔法策略。',
        backtest_title: '机构级回测引擎',
        backtest_desc:
          '基于 Tick 级历史数据，毫秒级仿真撮合，提供夏普比率、最大回撤等专业的绩效归因分析。',
        community_title: '去中心化智库',
        community_desc:
          '加入全球排位赛，与顶尖的 Quant Agent 对抗。共享策略逻辑，获取活动奖励。',
        security_title: '零信任安全架构',
        security_desc:
          '所有策略代码均在沙箱环境中运行。用户的私有数据与核心算法享有最高级别的加密保护。'
      },
      footer: {
        rights: '© 2024 Analyst Alchemist. All systems nominal.',
        privacy: '隐私协议',
        terms: '服务条款'
      }
    }
  }
};

export default function LandingPage({
  initialTopPerformers
}: LandingPageProps) {
  const router = useRouter();
  const { currentUser, setCurrentUser } = useUserStore();
  const { clearAgent } = useAgentStore();
  const [isClient, setIsClient] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<StockActivity | null>(
    null
  );

  const t = translations.zh;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    apiFetch<StockActivity[]>('/api/stock-activities', {
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

  const handleEnter = () => {
    router.push('/dashboard');
  };

  const handleLogin = () => {
    setIsLoginOpen(true);
  };

  const isLoggedIn = isClient && currentUser !== null;
  const username = currentUser?.username;
  const activityLabel = currentActivity?.activity_name || t.landing.season_live;

  return (
    <div className='relative w-full min-h-screen bg-cp-black text-cp-text overflow-y-auto custom-scrollbar flex flex-col font-sans tracking-[0.01em]'>
      {/* Background Ambience */}
      <div className='fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cp-dim via-cp-black to-cp-black opacity-80 pointer-events-none'></div>

      {/* Grid Overlay */}
      <div
        className='fixed inset-0 z-0 opacity-[0.03] pointer-events-none'
        style={{
          backgroundImage: `linear-gradient(var(--cp-border) 1px, transparent 1px), linear-gradient(90deg, var(--cp-border) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>

      {/* Header */}
      <header className='z-10 w-full px-8 py-6 flex justify-between items-center border-b border-white/[0.02] bg-black/70 backdrop-blur-md sticky top-0'>
        <div className='flex items-center gap-3'>
          <div className='text-cp-yellow animate-pulse drop-shadow-[0_0_15px_rgba(209,180,106,0.4)]'>
            <Hexagon size={28} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className='text-2xl md:text-3xl font-serif font-semibold tracking-[0.45em] text-cp-text uppercase'>
              {t.app.title}
            </h1>
            <div className='flex items-center gap-2 text-[11px] text-cp-text-muted font-mono tracking-[0.3em]'>
              <span className='w-2 h-2 rounded-full bg-green-500'></span>
              {t.landing.system_online}
            </div>
          </div>
        </div>

        <div className='hidden md:flex items-center gap-8'>
          <div className='flex flex-col items-end text-right'>
            <span className='text-[11px] text-cp-text-muted uppercase tracking-[0.4em]'>
              {t.landing.version}
            </span>
            <span className='text-sm font-semibold text-cp-yellow animate-pulse tracking-[0.35em] uppercase'>
              {activityLabel}
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='relative z-10 flex flex-col items-center justify-center pt-24 pb-20 px-6 text-center'>
        <div className='mb-6 inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-cp-yellow/40 bg-cp-yellow/10 text-cp-yellow text-[11px] font-semibold uppercase tracking-[0.5em] animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-[0_0_25px_rgba(209,180,106,0.25)]'>
          <Trophy size={14} /> {activityLabel}
        </div>

        <h2 className='text-5xl md:text-8xl font-serif font-semibold tracking-tight text-cp-text mb-2 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000'>
          {t.landing.hero_title_1} <br />
          <span className='text-transparent bg-clip-text bg-gradient-to-r from-cp-yellow via-white to-cp-yellow animate-pulse-fast'>
            {t.landing.hero_title_2}
          </span>
        </h2>

        <p className='max-w-2xl text-cp-text-muted text-lg md:text-xl font-light leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200'>
          {t.landing.hero_desc}
        </p>

        <div className='flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300'>
          {!isLoggedIn ? (
            <>
              <button
                onClick={handleEnter}
                className='px-10 py-4 btn-outline text-sm font-semibold tracking-[0.45em] flex items-center gap-2'>
                <Activity size={18} /> {t.landing.init_system}
              </button>
              <button
                onClick={handleLogin}
                className='px-12 py-4 btn-gold text-base font-semibold tracking-[0.45em] flex items-center gap-2 shadow-[0_0_30px_rgba(197,160,89,0.35)] hover:shadow-[0_0_55px_rgba(197,160,89,0.55)] transition-shadow'>
                {t.landing.link_identity} <ChevronRight size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEnter}
                className='px-16 py-5 btn-gold text-lg font-semibold tracking-[0.45em] flex items-center gap-3 shadow-[0_0_30px_rgba(197,160,89,0.35)] hover:shadow-[0_0_55px_rgba(197,160,89,0.55)] transition-shadow'>
                <Zap size={20} fill='black' /> {t.landing.continue_as}{' '}
                {username}
              </button>
              <button
                onClick={handleLogin}
                className='px-10 py-4 btn-outline text-sm font-semibold tracking-[0.45em] flex items-center gap-2'>
                {t.landing.switch_identity} <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      </section>

      {/* Feature Grid */}
      <section className='relative z-10 py-20 px-6 bg-gradient-to-b from-white/[0.02] via-black to-black border-y border-white/[0.02]'>
        <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {[
            {
              icon: Crosshair,
              title: t.landing.features.strategy_title,
              desc: t.landing.features.strategy_desc
            },
            {
              icon: Rewind,
              title: t.landing.features.backtest_title,
              desc: t.landing.features.backtest_desc
            },
            {
              icon: Users,
              title: t.landing.features.community_title,
              desc: t.landing.features.community_desc
            },
            {
              icon: Shield,
              title: t.landing.features.security_title,
              desc: t.landing.features.security_desc
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className='group p-8 border border-white/[0.02] bg-white/[0.02] hover:border-cp-yellow transition-colors hover:-translate-y-1 duration-200 rounded-xl'>
              <div className='w-12 h-12 mb-6 border border-white/[0.05] group-hover:border-cp-yellow flex items-center justify-center bg-white/[0.02] text-cp-text-muted group-hover:text-cp-yellow transition-colors rounded-full'>
                <feature.icon size={24} strokeWidth={1.5} />
              </div>
              <h3 className='text-lg font-serif font-semibold text-cp-text mb-3 group-hover:text-cp-yellow transition-colors tracking-wide'>
                {feature.title}
              </h3>
              <p className='text-[15px] text-cp-text-muted leading-relaxed font-sans opacity-90'>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Ranking Preview */}
      <section className='relative z-10 py-24 px-6 overflow-hidden'>
        <div className='max-w-5xl mx-auto'>
          <div className='flex justify-between items-end mb-10'>
            <div>
              <h3 className='text-3xl font-serif font-semibold text-cp-text mb-2 tracking-tight'>
                {t.landing.top_performers}
              </h3>
              <p className='text-cp-text-muted text-sm font-sans tracking-[0.3em] uppercase'>
                {t.landing.live_feed_tag}
              </p>
            </div>
            <button
              onClick={handleEnter}
              className='text-cp-yellow text-[11px] font-semibold uppercase tracking-[0.45em] flex items-center gap-2 hover:text-white transition-colors'>
              {t.landing.enter} <ChevronRight size={14} />
            </button>
          </div>

          <div className='border border-white/[0.02] glass-panel rounded-2xl overflow-hidden'>
            {initialTopPerformers.map((item) => (
              <div
                key={item.rank}
                className='flex items-center p-6 border-b border-white/[0.02] last:border-0 hover:bg-white/[0.05] transition-colors group cursor-default'>
                <div className='w-16 font-serif font-semibold text-2xl text-cp-text-muted group-hover:text-cp-yellow transition-colors tracking-[0.2em]'>
                  0{item.rank}
                </div>
                <div className='flex-1'>
                  <div className='flex items-center gap-3'>
                    <span className='font-semibold text-lg text-cp-text'>
                      {item.name}
                    </span>
                    <span className='px-2 py-0.5 text-[11px] font-semibold border border-white/[0.1] text-cp-text-muted uppercase rounded-full tracking-[0.35em]'>
                      {t.landing.badge[
                        item.badge.toLowerCase() as keyof typeof t.landing.badge
                      ] || item.badge}
                    </span>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-mono font-semibold text-xl text-cp-yellow'>
                    {item.profit}
                  </div>
                  <div className='text-[11px] text-cp-text-muted uppercase tracking-[0.35em]'>
                    {t.landing.total_return}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='relative z-10 border-t border-white/[0.02] bg-black/80 backdrop-blur py-12 px-6'>
        <div className='max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6'>
          <div className='flex items-center gap-2 text-cp-text-muted'>
            <Hexagon size={16} />
            <span className='text-[11px] font-mono tracking-[0.3em] uppercase'>
              {t.landing.footer.rights}
            </span>
          </div>
          <div className='flex gap-8'>
            <a
              href='#'
              className='text-[11px] font-semibold text-cp-text-muted hover:text-cp-yellow transition-colors uppercase tracking-[0.4em]'>
              {t.landing.footer.privacy}
            </a>
            <a
              href='#'
              className='text-[11px] font-semibold text-cp-text-muted hover:text-cp-yellow transition-colors uppercase tracking-[0.4em]'>
              {t.landing.footer.terms}
            </a>
          </div>
        </div>
      </footer>

      {isLoginOpen && (
        <LoginScreen
          onClose={() => setIsLoginOpen(false)}
          onLogin={(incoming) => {
            const nextUserId = incoming.id || incoming.username;
            if (currentUser && currentUser.id !== nextUserId) {
              clearAgent();
            }

            setCurrentUser({
              id: nextUserId,
              username: incoming.username,
              email: incoming.email,
              level: 1,
              achievements: [],
              avatarFrame: 'default'
            });

            setIsLoginOpen(false);
          }}
        />
      )}
    </div>
  );
}
