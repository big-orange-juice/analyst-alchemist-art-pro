'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, Info, TrendingUp, X } from 'lucide-react';
import type { AppNotification } from '@/types';
import { useLanguage } from '@/lib/useLanguage';

interface NotificationSystemProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onNotificationClick?: () => void;
}

export default function NotificationSystem({
  notifications,
  onDismiss,
  onNotificationClick
}: NotificationSystemProps) {
  const { t } = useLanguage();
  return (
    <div className='fixed top-24 right-8 z-[9999] flex flex-col gap-4 w-full max-w-[380px] pointer-events-none font-sans'>
      <style>
        {`
          @keyframes shrink-width {
            from { width: 100%; }
            to { width: 0%; }
          }
          .animate-shrink {
            animation: shrink-width 5s linear forwards;
          }
        `}
      </style>
      {notifications.map((note) => {
        let accentClass = 'bg-cp-text-muted';
        let textClass = 'text-cp-text-muted';
        let borderClass = 'border-cp-border';
        let Icon = Info;

        if (note.type === 'success') {
          accentClass = 'bg-cp-yellow';
          textClass = 'text-cp-yellow';
          borderClass = 'border-cp-yellow/30';
          Icon = CheckCircle;
        } else if (note.type === 'error') {
          accentClass = 'bg-cp-red';
          textClass = 'text-cp-red';
          borderClass = 'border-cp-red/30';
          Icon = AlertTriangle;
        } else if (note.type === 'warning') {
          accentClass = 'bg-orange-500';
          textClass = 'text-orange-500';
          borderClass = 'border-orange-500/30';
          Icon = AlertTriangle;
        } else if (note.type === 'market') {
          accentClass = 'bg-cp-cyan';
          textClass = 'text-cp-cyan';
          borderClass = 'border-cp-cyan/30';
          Icon = TrendingUp;
        }

        return (
          <div
            key={note.id}
            onClick={() => onNotificationClick && onNotificationClick()}
            className={`pointer-events-auto relative overflow-hidden glass-panel border ${borderClass} shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-500 animate-in slide-in-from-right-12 fade-in cursor-pointer group rounded-none`}>
            <div
              className='absolute inset-0 opacity-[0.03] pointer-events-none'
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E\")"
              }}></div>

            <div className='relative z-10 p-5 flex gap-4'>
              <div className={`mt-0.5 shrink-0 ${textClass}`}>
                <Icon size={20} strokeWidth={1.5} />
              </div>

              <div className='flex-1 min-w-0'>
                <div className='flex justify-between items-start mb-1'>
                  <h4
                    className={`font-serif font-bold text-sm tracking-wide ${textClass}`}>
                    {note.title}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(note.id);
                    }}
                    className='text-cp-text-muted hover:text-cp-text transition-colors p-1 -mt-1 -mr-2'>
                    <X size={16} />
                  </button>
                </div>
                <p className='text-xs font-sans text-cp-text leading-relaxed opacity-90 font-medium'>
                  {note.message}
                </p>

                <div className='mt-3 flex items-center justify-between border-t border-white/[0.05] pt-2'>
                  <span className='text-[10px] font-mono text-cp-text-muted opacity-60'>
                    {new Date(note.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                  <div className='flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity'>
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${accentClass} animate-pulse`}></div>
                    <span className='text-[9px] font-bold uppercase tracking-widest text-cp-text-muted'>
                      {t('notification_system.live')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className='absolute bottom-0 left-0 h-[2px] w-full bg-cp-dark/50'>
              <div className={`h-full animate-shrink ${accentClass}`}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
