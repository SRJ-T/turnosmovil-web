import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import Dashboard from './Dashboard';
import Landing from './Landing';
import SuccessPage from './Success';
import Activar from './Activar';
import Login from './Login';

function AuthGuard({ session, children }: { session: Session | null; children: React.ReactNode }) {
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <span className="size-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/activar" element={<Activar />} />
        <Route path="/login" element={session ? <Navigate to="/app" replace /> : <Login />} />
        <Route path="/app/*" element={
          <AuthGuard session={session}>
            <Dashboard session={session!} />
          </AuthGuard>
        } />
      </Routes>
    </Router>
  );
}
