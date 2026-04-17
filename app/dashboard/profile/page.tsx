"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { User, Mail, Camera, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profile, setProfile] = useState({ full_name: '', avatar_url: '', email: '' });

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    
    setProfile({
      full_name: data?.full_name || '',
      avatar_url: data?.avatar_url || '',
      email: user.email || ''
    });
    setLoading(false);
  };

  useEffect(() => { loadProfile(); }, []);

  const handleUpdate = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('profiles').upsert({
      id: user?.id,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      updated_at: new Date()
    });

    if (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar dados no banco.' });
    } else {
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
    setLoading(false);
  };

  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      // Criar um nome de arquivo único para evitar cache do navegador
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Tenta o upload
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          cacheControl: '3600',
          upsert: true 
        });

      if (uploadError) {
        console.error("ERRO DETALHADO DO SUPABASE:", uploadError);
        throw new Error(uploadError.message);
      }

      // Se chegou aqui, o upload funcionou. Agora pegamos a URL pública.
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      
      // Atualiza o estado e o banco
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      await supabase.from('profiles').upsert({ id: user.id, avatar_url: publicUrl });

      setMessage({ type: 'success', text: 'Foto carregada!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);

    } catch (error: any) {
      console.error("Erro na função uploadAvatar:", error);
      alert(`Erro no upload: ${error.message}. Verifique o console (F12) para detalhes.`);
    } finally {
      setUploading(false);
    }
  };

  if (loading && !profile.email) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Meu Perfil</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover rounded-full border-4 border-white shadow-md" alt="Avatar" />
            ) : (
              <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-md text-slate-400">
                <User size={48} />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full border-4 border-white cursor-pointer hover:scale-110 transition-all shadow-lg">
              {uploading ? <Loader2 className="animate-spin w-4 h-4" /> : <Camera size={16} />}
              <input type="file" className="hidden" onChange={uploadAvatar} disabled={uploading} accept="image/*" />
            </label>
          </div>
          <p className="font-black text-slate-900 truncate">{profile.full_name || 'Usuário Finsys'}</p>
        </div>

        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {message.text && (
            <div className={`p-4 rounded-xl font-bold text-sm border flex items-center gap-2 ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome de Exibição</label>
              <input 
                type="text" 
                value={profile.full_name} 
                onChange={e => setProfile({...profile, full_name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black font-bold outline-none focus:ring-2 focus:ring-blue-600" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">E-mail</label>
              <input type="text" disabled value={profile.email} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 font-bold cursor-not-allowed" />
            </div>
          </div>

          <button 
            onClick={handleUpdate}
            disabled={loading || uploading}
            className="flex items-center gap-2 bg-slate-900 text-white font-black px-8 py-3.5 rounded-2xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}