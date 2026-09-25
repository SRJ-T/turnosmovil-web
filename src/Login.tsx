import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Rate limiting — blocks after 5 failed attempts
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const [lockSecsLeft, setLockSecsLeft] = useState(0);
  const lockSchedule = [0, 0, 0, 0, 30, 60, 120, 300];

  const isLocked = lockedUntil !== null && new Date() < lockedUntil;

  const startLock = (secs: number) => {
    const until = new Date(Date.now() + secs * 1000);
    setLockedUntil(until);
    setLockSecsLeft(secs);
    const t = setInterval(() => {
      const left = Math.ceil((until.getTime() - Date.now()) / 1000);
      if (left <= 0) { clearInterval(t); setLockedUntil(null); setLockSecsLeft(0); setError(''); }
      else setLockSecsLeft(left);
    }, 1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) { setError(`Demasiados intentos. Espera ${lockSecsLeft} segundos.`); return; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !password) { setError('Completa todos los campos'); return; }
    if (!emailRegex.test(email.trim())) { setError('Ingresa un correo válido'); return; }

    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      const secs = newAttempts < lockSchedule.length ? lockSchedule[newAttempts] : 300;
      if (secs > 0) startLock(secs);
      // Generic message — never reveal if email exists or not
      setError('Correo o contraseña incorrectos');
      return;
    }
    setFailedAttempts(0);
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a1540] to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="size-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-black/30">
            <span className="text-3xl font-black text-[#0f2167]">T</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Turnos Móvil</h1>
          <p className="text-sm text-white/50 font-medium mt-1">Portal de Administración</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-black/30 border border-white/10">
          <h2 className="text-xl font-black text-slate-900 mb-1">Bienvenido</h2>
          <p className="text-sm text-slate-500 font-medium mb-6">Inicia sesión con tu cuenta de dueño</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[13px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0f2167] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="text-[13px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Contraseña</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0f2167] focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full h-12 bg-[#0f2167] hover:bg-[#0f2167]/90 disabled:opacity-50 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-[#0f2167]/20 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isLocked ? (
                `Espera ${lockSecsLeft}s`
              ) : (
                <><LogIn size={18} /> Iniciar Sesión</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs font-medium mt-6">
          © {new Date().getFullYear()} Turnos Móvil · turnosmovil.com
        </p>
      </div>
    </div>
  );
}
