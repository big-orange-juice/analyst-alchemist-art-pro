'use client';

import React from 'react';
import {
  X,
  Bell,
  Trash2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Info
} from 'lucide-react';
import type { AppNotification } from '@/types';
import { useLanguage } from '@/lib/useLanguage';

interface NotificationHistoryModalProps {
  notifications: AppNotification[];
  onClose: () => void;
  onClear: () => void;
}

export default function NotificationHistoryModal({
  notifications,
  onClose,
  onClear
}: NotificationHistoryModalProps) {
  const { dictionary } = useLanguage();
  const copy = dictionary.notification_history;
  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm bg-black/80 p-4 modal-animate'>
      <div className='w-full max-w-md bg-[#15171E] border border-[#3A404D] flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)] h-[600px] relative'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-[#3A404D] bg-[#1B1E23] shrink-0'>
          <div className='flex items-center gap-2'>
            <Bell className='text-[#D4AF37]' size={18} />
            <span className='font-bold font-oxanium text-[#EAEAEA] uppercase'>
              {copy.title}
            </span>
            <span className='bg-[#3A404D] text-xs px-1.5 py-0.5 rounded text-white'>
              {notifications.length}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={onClear}
              className='p-2 text-gray-500 hover:text-red-400 transition-colors'
              title={copy.clear}>
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className='p-2 text-gray-500 hover:text-[#EAEAEA] transition-colors'>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className='flex-1 overflow-y-auto custom-scrollbar p-2 bg-[#121418]'>
          {notifications.length === 0 ? (
            <div className='h-full flex flex-col items-center justify-center text-gray-600 gap-3'>
              <Bell size={40} className='opacity-20' />
              <p className='text-sm font-mono'>{copy.empty}</p>
            </div>
          ) : (
            <div className='space-y-2'>
              {notifications.map((note) => (
                <div
                  key={note.id}
                  className='bg-[#1B1E23] border border-[#2C313C] p-3 hover:border-[#3A404D] transition-colors flex gap-3 group hover-card'>
                  <div className='mt-1 shrink-0'>
                    {note.type === 'success' && (
                      <CheckCircle size={16} className='text-[#D4AF37]' />
                    )}
                    {note.type === 'error' && (
                      <AlertTriangle size={16} className='text-[#CD5C5C]' />
                    )}
                    {note.type === 'warning' && (
                      <AlertTriangle size={16} className='text-orange-500' />
                    )}
                    {note.type === 'market' && (
                      <TrendingUp size={16} className='text-[#5F9EA0]' />
                    )}
                    {note.type === 'info' && (
                      <Info size={16} className='text-gray-400' />
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex justify-between items-start mb-0.5'>
                      <h5 className='text-sm font-bold text-[#EAEAEA] font-oxanium leading-tight'>
                        {note.title}
                      </h5>
                      <span className='text-[10px] text-gray-600 font-mono whitespace-nowrap ml-2'>
                        {new Date(note.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className='text-xs text-gray-400 font-mono leading-relaxed break-words'>
                      {note.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
