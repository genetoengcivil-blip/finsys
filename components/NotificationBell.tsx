"use client";

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function NotificationBell() {
  const supabase = createClient();
  const [unread, setUnread] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [list, setList] = useState<any[]>([]);

  const fetchNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) {
      setList(data);
      setUnread(data.filter(n => !n.read).length);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const toggleAndRead = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unread > 0) {
      await supabase.from('notifications').update({ read: true }).eq('read', false);
      setUnread(0);
    }
  };

  return (
    <div className="relative">
      <button onClick={toggleAndRead} className="p-2 text-slate-400 hover:text-blue-600 transition-colors relative">
        <Bell className="w-6 h-6" />
        {unread > 0 && <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs font-black text-slate-900 uppercase">Notificações</span>
            <button onClick={() => setIsOpen(false)}><X size={16} className="text-slate-400" /></button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {list.length > 0 ? list.map(n => (
              <div key={n.id} className={`p-4 border-b border-slate-50 ${!n.read ? 'bg-blue-50/20' : ''}`}>
                <p className="text-xs font-black text-slate-900">{n.title}</p>
                <p className="text-[11px] text-slate-500 mt-1">{n.message}</p>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase">Tudo limpo por aqui!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}