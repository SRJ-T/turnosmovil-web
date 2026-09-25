import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ctdxqijdmpigqgktlwxb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZHhxaWpkbXBpZ3Fna3Rsd3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDg3NTksImV4cCI6MjA5NjUyNDc1OX0.fztm3egC654RiC_dSKn1AuVT8fWH_zE463sfP9Fzpj8'
);

type Stage = 'loading' | 'form' | 'success' | 'error';

export default function Activar() {
  const [stage, setStage]         = useState<Stage>('loading');
  const [email, setEmail]         = useState('');
  const [name, setName]           = useState('');
  const [business, setBusiness]   = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    const init = async () => {
      // Supabase parses the hash token automatically
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Wait a moment for hash to be parsed
        await new Promise(r => setTimeout(r, 800));
        const { data: { session: s2 } } = await supabase.auth.getSession();
        if (!s2) { setStage('error'); return; }
      }

      const { data: { session: sess } } = await supabase.auth.getSession();
      if (!sess) { setStage('error'); return; }

      setEmail(sess.user.email ?? '');

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, businesses(name)')
          .eq('email', sess.user.email!)
          .maybeSingle();

        setName((profile?.name as string) ?? '');
        setBusiness((profile?.businesses as any)?.name ?? '');
      } catch (_) {}

      setStage('form');
    };
    init();
  }, []);

  const activate = async () => {
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return; }
    setError('');
    setLoading(true);
    try {
      const { error: e } = await supabase.auth.updateUser({ password });
      if (e) { setError(e.message); return; }

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (userId) {
        await supabase.from('profiles').update({ status: 'active' }).eq('id', userId);
      }
      setStage('success');
    } finally {
      setLoading(false);
    }
  };

  if (stage === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Verificando tu invitación...</p>
        </div>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Enlace inválido</h2>
          <p className="text-sm text-slate-500">Este enlace ya expiró o no es válido. Pídele al dueño del negocio que te envíe una nueva invitación.</p>
        </div>
      </div>
    );
  }

  if (stage === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-sm w-full text-center">
          <img
            src="https://ctdxqijdmpigqgktlwxb.supabase.co/storage/v1/object/public/assets/logo.png"
            alt="Turnos Móvil"
            className="w-16 h-16 rounded-2xl mx-auto mb-4"
          />
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">¡Cuenta activada!</h2>
          <p className="text-sm text-slate-500 mb-6">
            Tu contraseña fue creada. Ahora descarga la app e inicia sesión con tu correo y contraseña.
          </p>
          <a
            href="https://drive.google.com/uc?export=download&confirm=t&id=1BgN5A5o8Xu8B316FdCNRiTWD8D5-kYA3"
            className="block bg-blue-600 text-white font-bold text-base py-4 rounded-xl mb-3 hover:bg-blue-700 transition-colors"
          >
            📲 Descargar Turnos Móvil
          </a>
          <p className="text-xs text-slate-400">Android · Instala el archivo APK después de descargar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-sm w-full">

        {/* Header */}
        <div className="text-center mb-6">
          <img
            src="https://ctdxqijdmpigqgktlwxb.supabase.co/storage/v1/object/public/assets/logo.png"
            alt="Turnos Móvil"
            className="w-16 h-16 rounded-2xl mx-auto mb-4"
          />
          <h1 className="text-2xl font-extrabold text-slate-900">
            {name ? `Bienvenido, ${name}` : 'Bienvenido'}
          </h1>
          {business && (
            <div className="mt-2">
              <span className="inline-block bg-blue-50 text-blue-700 font-semibold text-sm px-4 py-1.5 rounded-full">
                🏢 {business}
              </span>
            </div>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">

          {/* Email locked */}
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tu correo</label>
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-3 mb-5 border border-slate-200">
            <span className="text-slate-400 text-base">✉️</span>
            <span className="flex-1 text-sm font-medium text-slate-800">{email}</span>
            <span className="text-slate-400 text-sm">🔒</span>
          </div>

          {/* Password */}
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Crea tu contraseña</label>
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 mb-4 border border-slate-200 focus-within:border-blue-500 transition-colors">
            <span className="text-slate-400">🔑</span>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="flex-1 text-sm text-slate-800 outline-none bg-transparent"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-400 text-xs">
              {showPass ? 'Ocultar' : 'Ver'}
            </button>
          </div>

          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirmar contraseña</label>
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 mb-2 border border-slate-200 focus-within:border-blue-500 transition-colors">
            <span className="text-slate-400">🔒</span>
            <input
              type={showConf ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="flex-1 text-sm text-slate-800 outline-none bg-transparent"
            />
            <button type="button" onClick={() => setShowConf(!showConf)} className="text-slate-400 text-xs">
              {showConf ? 'Ocultar' : 'Ver'}
            </button>
          </div>

          {/* Hint */}
          <div className="flex items-center gap-1.5 mb-4">
            <span className={password.length >= 8 ? 'text-green-600' : 'text-slate-400'} style={{fontSize:13}}>
              {password.length >= 8 ? '✅' : '⭕'}
            </span>
            <span className={`text-xs ${password.length >= 8 ? 'text-green-600' : 'text-slate-400'}`}>
              Mínimo 8 caracteres
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={activate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-base py-4 rounded-xl transition-colors"
          >
            {loading ? 'Activando...' : 'Activar mi cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
}
