import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  LayoutDashboard, Calendar as CalendarIcon, Users, DollarSign, Settings,
  TrendingUp, ClipboardCheck, Bell, Menu, X, Plus, Download,
  CheckCircle2, XCircle, FileText, ChevronLeft, ChevronRight, Clock,
  UserPlus, AlertTriangle, Trash2, SlidersHorizontal,
  CheckCircle, MinusCircle, Phone, Mail, LogOut, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, fmtShiftDt, diffHours } from './lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Employee {
  id: string; name: string; last_name: string | null; email: string;
  phone: string | null; job_title: string | null; role: string;
  hourly_rate: number; employee_color: string | null; status: string;
  business_id: string;
}
interface Shift {
  id: string; employee_id: string; business_id: string; date: string;
  start_time: string; end_time: string; status: string; break_minutes: number;
  employee?: Employee;
}
interface ClockEntry {
  id: string; employee_id: string; business_id: string; shift_id: string | null;
  clock_in: string; clock_out: string | null; status: string;
  break_minutes: number; rejection_note: string | null;
  employee?: Employee;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const DAY_ES = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];
const MONTH_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function isoDate(d: Date) { return d.toISOString().split('T')[0]; }

function weekDays(anchor: Date) {
  const mon = new Date(anchor);
  const dow = mon.getDay();
  mon.setDate(mon.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
}

function empName(e?: Employee | null) {
  if (!e) return 'Empleado';
  return `${e.name}${e.last_name ? ' ' + e.last_name : ''}`;
}
function empInitials(e?: Employee | null) {
  if (!e) return '?';
  return `${e.name[0] ?? ''}${e.last_name?.[0] ?? ''}`.toUpperCase();
}

function fmtShiftRange(s: Shift) {
  return `${fmtShiftDt(s.start_time)} – ${fmtShiftDt(s.end_time)}`;
}

// ─── Nav Item ─────────────────────────────────────────────────────────────────
const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-[#0f2167] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
    <Icon size={20} className={active ? 'text-white' : 'text-slate-500'} />
    <span className="font-bold text-sm">{label}</span>
  </button>
);

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Dashboard({ session }: { session: Session }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [bizId, setBizId] = useState<string | null>(null);
  const uid = session.user.id;

  useEffect(() => {
    supabase.from('businesses').select('id').eq('owner_id', uid).single()
      .then(({ data }) => setBizId(data?.id ?? null));
  }, [uid]);

  const handleLogout = () => supabase.auth.signOut();

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col lg:hidden border-r border-slate-200">
              <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} email={session.user.email ?? ''} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex flex-col w-72 fixed inset-y-0 left-0 bg-white border-r border-slate-200 shadow-sm z-30">
        <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} email={session.user.email ?? ''} />
      </aside>

      <main className="flex-1 flex flex-col lg:ml-72 min-h-screen w-full overflow-hidden">
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl"><Menu size={22} /></button>
          <div className="flex-1" />
          <button className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 shadow-xs"><Bell size={20} /></button>
        </header>

        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-slate-50">
          {bizId === null ? (
            <div className="flex items-center justify-center h-64">
              <span className="size-8 border-2 border-slate-300 border-t-[#0f2167] rounded-full animate-spin" />
            </div>
          ) : (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[1600px] mx-auto">
              {activeTab === 'dashboard' && <DashboardView bizId={bizId} setActiveTab={setActiveTab} />}
              {activeTab === 'team'      && <TeamView bizId={bizId} />}
              {activeTab === 'calendar'  && <TurnosView bizId={bizId} />}
              {activeTab === 'approvals' && <ApprovalsView bizId={bizId} />}
              {activeTab === 'payroll'   && <PayrollView bizId={bizId} />}
              {activeTab === 'reports'   && <ReportsView />}
              {activeTab === 'settings'  && (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm mt-8">
                  <Settings size={48} className="mx-auto text-slate-300 mb-4" />
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Configuración</h2>
                  <p className="text-slate-500 font-medium">Esta sección estará disponible pronto.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function SidebarContent({ activeTab, setActiveTab, onClose, onLogout, email }: any) {
  const go = (tab: string) => { setActiveTab(tab); onClose?.(); };
  return (
    <>
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-[#0f2167] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">T</div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">Turnos Móvil</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Business Portal</p>
          </div>
        </div>
        {onClose && <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={20} /></button>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
        <div className="mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">General</span>
          <NavItem icon={LayoutDashboard} label="Dashboard"   active={activeTab==='dashboard'} onClick={() => go('dashboard')} />
          <NavItem icon={CalendarIcon}   label="Turnos"      active={activeTab==='calendar'}  onClick={() => go('calendar')} />
          <NavItem icon={Users}          label="Equipo"      active={activeTab==='team'}      onClick={() => go('team')} />
        </div>
        <div className="mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Administración</span>
          <NavItem icon={ClipboardCheck} label="Aprobaciones" active={activeTab==='approvals'} onClick={() => go('approvals')} />
          <NavItem icon={DollarSign}    label="Nómina"       active={activeTab==='payroll'}   onClick={() => go('payroll')} />
          <NavItem icon={TrendingUp}    label="Reportes"     active={activeTab==='reports'}   onClick={() => go('reports')} />
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 space-y-1">
        <NavItem icon={Settings} label="Configuración" active={activeTab==='settings'} onClick={() => go('settings')} />
        <div className="px-4 py-2 text-[11px] text-slate-400 font-medium truncate">{email}</div>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-all">
          <LogOut size={18} /><span className="font-bold text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardView({ bizId, setActiveTab }: { bizId: string; setActiveTab: (t: string) => void }) {
  const [stats, setStats] = useState({ employees: 0, todayShifts: 0, activeNow: 0, pending: 0 });
  const [activity, setActivity] = useState<ClockEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = isoDate(new Date());
      const [empRes, shiftsRes, activeRes, pendingRes, actRes] = await Promise.all([
        supabase.from('profiles').select('id').eq('business_id', bizId).eq('role', 'employee'),
        supabase.from('shifts').select('id').eq('business_id', bizId).eq('date', today),
        supabase.from('clock_entries').select('id').eq('business_id', bizId).is('clock_out', null).neq('status', 'rejected'),
        supabase.from('clock_entries').select('id').eq('business_id', bizId).eq('status', 'pending'),
        supabase.from('clock_entries').select('*, profiles(*)').eq('business_id', bizId).order('clock_in', { ascending: false }).limit(6),
      ]);
      setStats({
        employees: empRes.data?.length ?? 0,
        todayShifts: shiftsRes.data?.length ?? 0,
        activeNow: activeRes.data?.length ?? 0,
        pending: pendingRes.data?.length ?? 0,
      });
      setActivity(((actRes.data ?? []) as any[]).map(e => ({ ...e, employee: e.profiles })));
      setLoading(false);
    })();
  }, [bizId]);

  const todayLabel = new Date().toLocaleDateString('es-PR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm font-medium text-slate-500 mt-1 capitalize">{todayLabel}</p>
        </div>
        <button onClick={() => setActiveTab('calendar')} className="h-11 px-6 bg-[#0f2167] hover:bg-[#0f2167]/90 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-2">
          <Plus size={16} /> Crear Turno
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Empleados',    value: stats.employees,   icon: Users,         color: 'bg-blue-50 text-blue-600 border-blue-100' },
          { label: 'Turnos Hoy',  value: stats.todayShifts, icon: CalendarIcon,  color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
          { label: 'Activos Ahora', value: stats.activeNow,  icon: Clock,         color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
          { label: 'Pendientes',  value: stats.pending,     icon: AlertTriangle, color: 'bg-rose-50 text-rose-600 border-rose-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-2xl border w-fit ${color}`}><Icon size={22} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                {loading ? <span className="text-slate-200">–</span> : value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-lg font-black text-slate-900 px-1">Actividad Reciente</h3>
          <div className="bg-white rounded-3xl border border-slate-200 p-2 shadow-sm space-y-1 min-h-[200px]">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)
            ) : activity.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-slate-400 text-sm font-medium">No hay actividad reciente</div>
            ) : activity.map(e => {
              const hrs = diffHours(e.clock_in, e.clock_out);
              return (
                <div key={e.id} className="flex items-center gap-4 hover:bg-slate-50 transition-colors p-4 rounded-2xl">
                  <div className="size-11 rounded-xl bg-[#0f2167]/10 flex items-center justify-center font-black text-[#0f2167] text-sm border border-[#0f2167]/20 shrink-0">
                    {empInitials(e.employee)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{empName(e.employee)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(e.clock_in).toLocaleString('es-PR', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                      {e.clock_out && ` · ${hrs.toFixed(1)}h`}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-lg shrink-0 ${
                    e.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    e.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {e.status === 'approved' ? 'Aprobado' : e.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-slate-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            {[
              { label: 'Crear Turno',     tab: 'calendar',  icon: CalendarIcon,   color: 'bg-[#0f2167]' },
              { label: 'Añadir Empleado', tab: 'team',      icon: UserPlus,       color: 'bg-emerald-600' },
              { label: 'Aprobar Horas',   tab: 'approvals', icon: ClipboardCheck, color: 'bg-amber-500' },
              { label: 'Ver Nómina',      tab: 'payroll',   icon: DollarSign,     color: 'bg-indigo-600' },
            ].map(({ label, tab, icon: Icon, color }) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`w-full h-11 rounded-xl ${color} text-white text-sm font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TEAM ─────────────────────────────────────────────────────────────────────
function TeamView({ bizId }: { bizId: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', last_name: '', email: '', phone: '', job_title: '', hourly_rate: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('business_id', bizId).eq('role', 'employee').order('name');
    setEmployees((data ?? []) as Employee[]);
    setLoading(false);
  }, [bizId]);

  useEffect(() => { load(); }, [load]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch('https://ctdxqijdmpigqgktlwxb.supabase.co/functions/v1/invite-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ ...newEmp, hourly_rate: parseFloat(newEmp.hourly_rate) }),
      });
      setShowModal(false);
      setNewEmp({ name: '', last_name: '', email: '', phone: '', job_title: '', hourly_rate: '' });
      await load();
    } finally { setInviting(false); }
  };

  const handleToggle = async (emp: Employee) => {
    const ns = emp.status === 'active' ? 'inactive' : 'active';
    await supabase.from('profiles').update({ status: ns }).eq('id', emp.id);
    setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: ns } : e));
  };

  const handleDelete = async (id: string) => {
    await supabase.from('profiles').delete().eq('id', id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    setConfirmDeleteId(null);
  };

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    return empName(e).toLowerCase().includes(q) || e.job_title?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Equipo</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Gestiona los perfiles de tus empleados.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-xs"><RefreshCw size={18} /></button>
          <button onClick={() => setShowModal(true)} className="h-11 px-6 bg-[#0f2167] hover:bg-[#0f2167]/90 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-2">
            <UserPlus size={16} strokeWidth={3} /> Invitar Empleado
          </button>
        </div>
      </div>

      <section className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',      value: employees.length,                              color: 'from-indigo-600 to-purple-700 shadow-indigo-500/20' },
          { label: 'Activos',    value: employees.filter(e => e.status==='active').length, color: 'from-emerald-500 to-teal-700 shadow-emerald-500/20' },
          { label: 'Pendientes', value: employees.filter(e => e.status==='pending').length,color: 'from-amber-400 to-rose-500 shadow-orange-500/20' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} text-white p-5 rounded-3xl flex flex-col justify-between h-28 shadow-lg`}>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{label}</span>
            <span className="text-4xl font-black leading-none">{loading ? '–' : value}</span>
          </div>
        ))}
      </section>

      <div className="relative">
        <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input type="text" placeholder="Buscar por nombre, puesto o correo..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full h-14 pl-12 pr-4 bg-white border-2 border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 font-bold focus:border-[#0f2167] focus:ring-4 focus:ring-[#0f2167]/10 focus:outline-none transition-all" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-52 bg-white rounded-3xl animate-pulse border border-slate-200" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(emp => {
              const isInactive = emp.status === 'inactive';
              const isPending  = emp.status === 'pending';
              return (
                <motion.div key={emp.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col ${isInactive ? 'opacity-60' : ''}`}>
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-xl text-slate-500 border border-slate-200">{empInitials(emp)}</div>
                      <div>
                        <h4 className="font-black text-base text-slate-900 leading-tight">{empName(emp)}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{emp.job_title || 'Sin puesto'}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0 ${
                      !isInactive && !isPending ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      isInactive ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${!isInactive && !isPending ? 'bg-emerald-500' : isInactive ? 'bg-slate-400' : 'bg-amber-500'}`} />
                      {!isInactive && !isPending ? 'Activo' : isInactive ? 'Inactivo' : 'Pendiente'}
                    </span>
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-1">
                      {emp.email && <a href={`mailto:${emp.email}`} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-600"><Mail size={14} /></a>}
                      {emp.phone && <a href={`tel:${emp.phone}`} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-600"><Phone size={14} /></a>}
                    </div>
                    <span className="text-xs font-black font-mono text-[#0f2167] bg-[#0f2167]/10 px-2 py-1 rounded-md border border-[#0f2167]/20">
                      ${Number(emp.hourly_rate ?? 0).toFixed(2)}/hr
                    </span>
                  </div>

                  <div className="px-5 pb-5 pt-3 flex gap-2">
                    <button onClick={() => handleToggle(emp)}
                      className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all border active:scale-95 ${
                        isInactive ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}>
                      {isInactive ? <><CheckCircle size={14} /> Activar</> : <><MinusCircle size={14} /> Desactivar</>}
                    </button>
                    <button onClick={() => setConfirmDeleteId(emp.id)}
                      className="flex-1 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider active:scale-95">
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && !loading && (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-sm text-slate-400 font-black uppercase tracking-wider">
                {employees.length === 0 ? 'Aún no tienes empleados. ¡Invita al primero!' : 'No se encontraron empleados'}
              </p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
              <h2 className="text-xl font-black mb-1 text-[#0f2167]">Invitar Empleado</h2>
              <p className="text-sm text-slate-500 mb-5">Se enviará un email con el enlace para activar la cuenta.</p>
              <form onSubmit={handleInvite} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nombre</label>
                    <input required type="text" placeholder="Juan" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})}
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#0f2167] outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Apellido</label>
                    <input required type="text" placeholder="Pérez" value={newEmp.last_name} onChange={e => setNewEmp({...newEmp, last_name: e.target.value})}
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#0f2167] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Correo Electrónico</label>
                  <input required type="email" placeholder="empleado@correo.com" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#0f2167] outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Puesto</label>
                    <input required type="text" placeholder="Cajero" value={newEmp.job_title} onChange={e => setNewEmp({...newEmp, job_title: e.target.value})}
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#0f2167] outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Pago/hr ($)</label>
                    <input required type="number" step="0.01" placeholder="12.00" value={newEmp.hourly_rate} onChange={e => setNewEmp({...newEmp, hourly_rate: e.target.value})}
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#0f2167] outline-none" />
                  </div>
                </div>
                <button type="submit" disabled={inviting}
                  className="w-full h-12 bg-[#0f2167] text-white rounded-xl text-sm font-black uppercase tracking-wider mt-2 hover:opacity-90 shadow-md flex items-center justify-center gap-2 disabled:opacity-60">
                  {inviting ? <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Mail size={16} /> Enviar Invitación</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={() => setConfirmDeleteId(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="size-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4"><Trash2 size={28} /></div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Eliminar Empleado</h3>
              <p className="text-sm text-slate-500 mb-6">¿Estás seguro? Esta acción no se puede deshacer.</p>
              <div className="flex flex-col gap-2">
                <button onClick={() => handleDelete(confirmDeleteId!)} className="w-full h-12 rounded-xl bg-rose-600 text-white text-xs font-black uppercase tracking-wider active:scale-95">Sí, Eliminar</button>
                <button onClick={() => setConfirmDeleteId(null)} className="w-full h-12 rounded-xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider active:scale-95">Cancelar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TURNOS ───────────────────────────────────────────────────────────────────
function TurnosView({ bizId }: { bizId: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(isoDate(new Date()));
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('weekly');
  const [showModal, setShowModal] = useState(false);
  const [editShift, setEditShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ employee_id: '', date: isoDate(new Date()), start_time: '09:00', end_time: '17:00', status: 'draft', break_minutes: 0 });

  const days = weekDays(weekAnchor);

  const load = useCallback(async () => {
    setLoading(true);
    const start = isoDate(days[0]), end = isoDate(days[6]);
    const [empRes, shiftRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('business_id', bizId).eq('role', 'employee').eq('status', 'active'),
      supabase.from('shifts').select('*, profiles(*)').eq('business_id', bizId).gte('date', start).lte('date', end).order('start_time'),
    ]);
    setEmployees((empRes.data ?? []) as Employee[]);
    setShifts(((shiftRes.data ?? []) as any[]).map(s => ({ ...s, employee: s.profiles })));
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bizId, isoDate(days[0])]);

  useEffect(() => { load(); }, [load]);

  const openAdd = (date: string) => {
    setEditShift(null);
    setForm({ employee_id: '', date, start_time: '09:00', end_time: '17:00', status: 'draft', break_minutes: 0 });
    setShowModal(true);
  };
  const openEdit = (s: Shift) => {
    setEditShift(s);
    // start_time is full timestamptz like "2026-06-12 08:00:00+00" — extract HH:MM
    const extractTime = (dt: string) => {
      const clean = dt.replace(/\+00(:\d{2})?$/, '').replace(' ', 'T');
      const d = new Date(clean);
      return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    };
    setForm({ employee_id: s.employee_id, date: s.date, start_time: extractTime(s.start_time), end_time: extractTime(s.end_time), status: s.status, break_minutes: s.break_minutes ?? 0 });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      business_id: bizId,
      employee_id: form.employee_id,
      date: form.date,
      start_time: `${form.date}T${form.start_time}:00`,
      end_time: `${form.date}T${form.end_time}:00`,
      status: form.status,
      break_minutes: form.break_minutes,
    };
    if (editShift) {
      await supabase.from('shifts').update(payload).eq('id', editShift.id);
    } else {
      await supabase.from('shifts').insert(payload);
    }
    setShowModal(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este turno?')) return;
    await supabase.from('shifts').delete().eq('id', id);
    setShowModal(false);
    await load();
  };

  const handlePublishAll = async () => {
    const drafts = shifts.filter(s => s.status === 'draft').map(s => s.id);
    if (!drafts.length) return;
    await supabase.from('shifts').update({ status: 'published' }).in('id', drafts);
    await load();
  };

  const dayShifts = (d: Date) => shifts.filter(s => s.date === isoDate(d));
  const selectedShifts = shifts.filter(s => s.date === selectedDate);
  const draftsCount = shifts.filter(s => s.status === 'draft').length;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { published: 'bg-emerald-50 text-emerald-700 border-emerald-200', accepted: 'bg-blue-50 text-blue-700 border-blue-200', rejected: 'bg-rose-50 text-rose-700 border-rose-200', draft: 'bg-amber-50 text-amber-700 border-amber-200' };
    const label: Record<string, string> = { published: 'Publicado', accepted: 'Aceptado', rejected: 'Rechazado', draft: 'Borrador' };
    return <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${map[status] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>{label[status] ?? status}</span>;
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Turnos</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Organiza los turnos de tu equipo.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['daily','weekly'] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode===m ? 'bg-[#0f2167] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {m==='daily' ? 'Día' : 'Semana'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
            <button onClick={() => setWeekAnchor(d => { const n=new Date(d); n.setDate(n.getDate()-7); return n; })} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronLeft size={18} /></button>
            <span className="text-sm font-bold text-slate-700 px-2 w-36 text-center">
              {MONTH_ES[days[0].getMonth()]} {days[0].getDate()} – {MONTH_ES[days[6].getMonth()]} {days[6].getDate()}
            </span>
            <button onClick={() => setWeekAnchor(d => { const n=new Date(d); n.setDate(n.getDate()+7); return n; })} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronRight size={18} /></button>
          </div>
          <button onClick={() => openAdd(selectedDate)} className="h-11 px-5 bg-[#0f2167] hover:bg-[#0f2167]/90 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-2">
            <Plus size={16} strokeWidth={3} /> Crear
          </button>
        </div>
      </div>

      {/* Week strip */}
      <section className="grid grid-cols-7 gap-2">
        {days.map(d => {
          const iso = isoDate(d); const sel = iso===selectedDate; const has = dayShifts(d).length>0; const isToday = iso===isoDate(new Date());
          return (
            <button key={iso} onClick={() => setSelectedDate(iso)}
              className={`h-[88px] flex flex-col items-center justify-center rounded-2xl border transition-all ${sel ? 'bg-[#0f2167] border-[#0f2167] text-white ring-4 ring-[#0f2167]/20 scale-[1.03] z-10' : isToday ? 'bg-[#0f2167]/10 border-[#0f2167]/30 text-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              <span className={`text-[9px] font-black tracking-widest uppercase ${sel ? 'text-white/80' : 'text-slate-400'}`}>{DAY_ES[d.getDay()]}</span>
              <span className="text-2xl font-black leading-none mt-1">{d.getDate()}</span>
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${has ? (sel ? 'bg-white' : 'bg-emerald-500') : (sel ? 'bg-white/30' : 'bg-slate-200')}`} />
            </button>
          );
        })}
      </section>

      {/* Publish */}
      <div className="flex justify-end">
        <button onClick={handlePublishAll} disabled={draftsCount===0}
          className={`px-6 py-2.5 rounded-xl flex items-center gap-2 font-black text-[11px] uppercase tracking-widest shadow-md transition-all ${draftsCount>0 ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-emerald-600 text-white opacity-60 cursor-not-allowed'}`}>
          <CheckCircle2 size={16} />
          {draftsCount>0 ? `Publicar ${draftsCount} Turno${draftsCount>1?'s':''}` : 'Todo Publicado'}
        </button>
      </div>

      {viewMode==='daily' ? (
        <div className="space-y-3">
          {loading ? Array.from({length:2}).map((_,i)=><div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-slate-200" />) :
          selectedShifts.length===0 ? (
            <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No hay turnos para este día</p>
              <button onClick={() => openAdd(selectedDate)} className="mt-3 px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase text-slate-600 hover:bg-slate-100">Crear Turno</button>
            </div>
          ) : selectedShifts.map(s => (
            <motion.div key={s.id} layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-[#0f2167]/10 flex items-center justify-center font-black text-sm text-[#0f2167] border border-[#0f2167]/20">{empInitials(s.employee)}</div>
                <div>
                  <h4 className="font-black text-slate-900">{empName(s.employee)}</h4>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">{s.employee?.job_title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                <Clock size={14} className="text-[#0f2167]" />
                <span className="text-sm font-black text-[#0f2167]">{fmtShiftRange(s)}</span>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(s.status)}
                <button onClick={() => openEdit(s)} className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 shadow-xs">Editar</button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[900px] grid grid-cols-7 gap-3">
            {days.map(d => {
              const iso = isoDate(d); const isToday = iso===isoDate(new Date()); const ds = dayShifts(d);
              return (
                <div key={iso} className="flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className={`p-3 text-center border-b border-slate-100 ${isToday ? 'bg-[#0f2167] text-white' : 'bg-slate-50'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-white/70' : 'text-slate-400'}`}>{DAY_ES[d.getDay()]}</p>
                    <p className="text-xl font-black mt-0.5 leading-none">{d.getDate()}</p>
                  </div>
                  <div className="p-2 flex-1 min-h-[280px] flex flex-col gap-2">
                    {ds.map(s => (
                      <div key={s.id} onClick={() => openEdit(s)} className="p-3 rounded-xl bg-[#0f2167]/5 border border-[#0f2167]/15 cursor-pointer hover:bg-[#0f2167]/10 transition-colors">
                        <p className="text-[12px] font-black text-slate-800 leading-tight">{empName(s.employee)}</p>
                        <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-slate-500">
                          <Clock size={10} /> {fmtShiftDt(s.start_time)}
                        </div>
                        {s.status==='draft' && <span className="mt-1 flex size-1.5 bg-amber-400 rounded-full" />}
                      </div>
                    ))}
                    <button onClick={() => openAdd(iso)} className="mt-auto py-2 rounded-xl border border-dashed border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 flex items-center justify-center gap-1">
                      <Plus size={12} /> Añadir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
              <h2 className="text-xl font-black mb-5 text-[#0f2167]">{editShift ? 'Editar Turno' : 'Crear Turno'}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Empleado</label>
                  <select required value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#0f2167] outline-none">
                    <option value="">Selecciona un empleado...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{empName(e)} – {e.job_title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Fecha</label>
                  <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#0f2167] outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(['start_time','end_time'] as const).map(field => (
                    <div key={field}>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{field==='start_time' ? 'Entrada' : 'Salida'}</label>
                      <input required type="time" value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})}
                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-bold focus:ring-2 focus:ring-[#0f2167] outline-none" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Break (minutos)</label>
                  <select value={form.break_minutes} onChange={e => setForm({...form, break_minutes: Number(e.target.value)})}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#0f2167] outline-none">
                    <option value={0}>Sin break</option>
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={60}>1 hora</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  {editShift && (
                    <button type="button" onClick={() => handleDelete(editShift.id)} className="size-12 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 border border-rose-200"><Trash2 size={18} /></button>
                  )}
                  <button type="submit" className="flex-1 h-12 bg-[#0f2167] text-white rounded-xl text-sm font-black uppercase tracking-wider hover:opacity-90 shadow-md">
                    {editShift ? 'Guardar Cambios' : 'Crear Turno'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── APROBACIONES ─────────────────────────────────────────────────────────────
function ApprovalsView({ bizId }: { bizId: string }) {
  const [entries, setEntries] = useState<ClockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending'|'history'>('pending');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('clock_entries')
      .select('*, profiles(*)')
      .eq('business_id', bizId)
      .order('clock_in', { ascending: false })
      .limit(100);
    setEntries(((data ?? []) as any[]).map(e => ({ ...e, employee: e.profiles })));
    setLoading(false);
  }, [bizId]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: string, status: 'approved'|'rejected') => {
    await supabase.from('clock_entries').update({ status }).eq('id', id);
    setEntries(prev => prev.map(e => e.id===id ? {...e, status} : e));
  };

  const pending = entries.filter(e => e.status==='pending');
  const history = entries.filter(e => e.status!=='pending');
  const display = activeTab==='pending' ? pending : history;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Aprobación de Horas</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Verifica y aprueba los registros de tiempo.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-xs"><RefreshCw size={18} /></button>
          {pending.length>0 && <div className="bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-2xl shadow-lg animate-pulse">{pending.length} Pendientes</div>}
        </div>
      </div>

      <div className="bg-slate-100 p-1 rounded-2xl flex max-w-xs border border-slate-200">
        {(['pending','history'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab===t ? 'bg-[#0f2167] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t==='pending' ? `Pendientes (${pending.length})` : `Historial (${history.length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Sin revisar</span>
          <span className="text-3xl font-black text-slate-900">{loading ? '–' : pending.length}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Aprobados</span>
          <span className="text-3xl font-black text-emerald-600">{loading ? '–' : history.filter(e=>e.status==='approved').length}</span>
        </div>
      </div>

      {loading ? Array.from({length:3}).map((_,i)=><div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-200" />) :
      display.length===0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {activeTab==='pending' ? 'Todo al día. No hay pendientes.' : 'No hay historial.'}
          </p>
        </div>
      ) : (
        <AnimatePresence>
          {display.map(entry => {
            const hrs = diffHours(entry.clock_in, entry.clock_out);
            const isPending = entry.status==='pending';
            return (
              <motion.div key={entry.id} layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.95}}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${isPending ? 'bg-amber-400' : entry.status==='approved' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <div className="flex gap-4 items-start pl-2">
                  <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-sm border border-slate-200 shrink-0">{empInitials(entry.employee)}</div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{empName(entry.employee)}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{entry.employee?.job_title}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs font-black font-mono bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg flex items-center gap-1">
                        <Clock size={12} className="text-[#0f2167]" />
                        {new Date(entry.clock_in).toLocaleString('es-PR', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit', hour12:true })}
                        {entry.clock_out && ` – ${new Date(entry.clock_out).toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', hour12:true })}`}
                      </span>
                      {hrs>0 && <span className="text-xs font-black text-[#0f2167] bg-[#0f2167]/10 border border-[#0f2167]/20 px-2 py-1 rounded-lg">{hrs.toFixed(1)}h</span>}
                    </div>
                    {entry.rejection_note && <p className="text-xs text-rose-600 mt-2 bg-rose-50 p-2 rounded-lg border border-rose-200">{entry.rejection_note}</p>}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto pl-2 md:pl-0">
                  {isPending ? (
                    <>
                      <button onClick={() => handleAction(entry.id, 'rejected')} className="w-full sm:w-auto h-10 px-4 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2">
                        <XCircle size={16} /> Rechazar
                      </button>
                      <button onClick={() => handleAction(entry.id, 'approved')} className="w-full sm:w-auto h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 shadow-md">
                        <CheckCircle2 size={16} /> Aprobar
                      </button>
                    </>
                  ) : (
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${entry.status==='approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {entry.status==='approved' ? '✓ Aprobado' : '✕ Rechazado'}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── NÓMINA ───────────────────────────────────────────────────────────────────
function PayrollView({ bizId }: { bizId: string }) {
  const [data, setData] = useState<{ emp: Employee; hours: number; overtime: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week'|'month'>('week');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const now = new Date();
      let startDate: string;
      if (period==='week') {
        startDate = isoDate(weekDays(now)[0]);
      } else {
        startDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
      }

      const [empRes, entryRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('business_id', bizId).eq('role','employee').eq('status','active'),
        supabase.from('clock_entries').select('employee_id, clock_in, clock_out, approved_hours')
          .eq('business_id', bizId).eq('status','approved').not('clock_out','is',null).gte('clock_in', `${startDate}T00:00:00`),
      ]);

      const emps = (empRes.data ?? []) as Employee[];
      const hrMap: Record<string, number> = {};
      for (const e of (entryRes.data ?? [])) {
        const hrs = e.approved_hours != null ? Number(e.approved_hours) : diffHours(e.clock_in, e.clock_out);
        hrMap[e.employee_id] = (hrMap[e.employee_id] ?? 0) + hrs;
      }

      setData(emps.map(emp => {
        const total = hrMap[emp.id] ?? 0;
        return { emp, hours: Math.min(total, 40), overtime: Math.max(0, total-40) };
      }));
      setLoading(false);
    })();
  }, [bizId, period]);

  const totalGross = data.reduce((s,{emp,hours,overtime}) => s + hours*emp.hourly_rate + overtime*emp.hourly_rate*1.5, 0);
  const totalDed   = totalGross * 0.1465;
  const totalNet   = totalGross - totalDed;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Centro de Nómina</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Basado en horas aprobadas.</p>
        </div>
        <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200">
          {(['week','month'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${period===p ? 'bg-[#0f2167] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {p==='week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label:'Bruto',        value: totalGross, color:'text-slate-900', bg:'bg-white border-slate-200' },
          { label:'Deducciones',  value: totalDed,   color:'text-rose-600',  bg:'bg-white border-slate-200' },
          { label:'Neto a Pagar', value: totalNet,   color:'text-white',     bg:'bg-[#0f2167] border-[#0f2167]' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} p-5 rounded-3xl border shadow-sm flex flex-col justify-between h-36`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${color==='text-white' ? 'text-white/70' : 'text-slate-400'}`}>{label}</p>
            <p className={`text-2xl font-black font-mono ${color} tracking-tight`}>
              {loading ? '—' : `$${value.toFixed(2)}`}
            </p>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-black text-slate-900 px-1">Desglose por Empleado</h3>
      {loading ? Array.from({length:2}).map((_,i)=><div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-200" />) :
      data.filter(d=>d.hours+d.overtime>0).length===0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No hay horas aprobadas en este período</p>
        </div>
      ) : data.filter(d=>d.hours+d.overtime>0).map(({ emp, hours, overtime }) => {
        const gross = hours*emp.hourly_rate + overtime*emp.hourly_rate*1.5;
        const net   = gross*(1-0.1465);
        return (
          <div key={emp.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-sm border border-slate-200">{empInitials(emp)}</div>
                <div>
                  <h4 className="font-black text-slate-900">{empName(emp)}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${emp.hourly_rate}/hr</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Neto</p>
                <p className="text-xl font-black text-[#0f2167] font-mono">${net.toFixed(2)}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Horas Reg.</p>
                <p className="text-sm font-black font-mono mt-1">{hours.toFixed(1)}h</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                <p className="text-[9px] font-black uppercase tracking-widest text-orange-600">Horas Extra</p>
                <p className="text-sm font-black font-mono mt-1 text-orange-600">{overtime.toFixed(1)}h</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                <p className="text-[9px] font-black uppercase tracking-widest text-rose-600">Deducciones</p>
                <p className="text-sm font-black font-mono mt-1 text-rose-600">-${(gross*0.1465).toFixed(2)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── REPORTES ─────────────────────────────────────────────────────────────────
function ReportsView() {
  const reports = [
    { id:1, title:'Reporte Trimestral SURI',  period:'Q1 2026 (Ene – Mar)', date:'Abr 10, 2026' },
    { id:2, title:'Reporte Trimestral DTRH',  period:'Q1 2026 (Ene – Mar)', date:'Abr 10, 2026' },
    { id:3, title:'Reporte Trimestral SINOT', period:'Q1 2026 (Ene – Mar)', date:'Abr 11, 2026' },
  ];
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Reportes y CPA</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Documentos oficiales para agencias gubernamentales de PR.</p>
        </div>
        <button className="h-11 px-6 bg-[#0f2167] hover:bg-[#0f2167]/90 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-2 w-fit">
          <FileText size={16} /> Generar Reporte
        </button>
      </div>
      <div className="bg-gradient-to-r from-blue-900 to-[#0f2167] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none"><TrendingUp size={180} /></div>
        <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-full w-max inline-block">Resumen Actual</span>
        <h3 className="text-xl font-black mt-3">Todo en Orden</h3>
        <p className="text-sm text-white/80 leading-relaxed mt-2 max-w-md font-medium">
          Todas las radicaciones del primer trimestre completadas. El próximo cierre se habilitará el 1 de Julio de 2026.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map(rep => (
          <div key={rep.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-48">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100"><FileText size={20} /></div>
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200">Completado</span>
              </div>
              <h3 className="font-black text-base text-slate-900">{rep.title}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{rep.period}</p>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
              <span className="text-[10px] text-slate-400">Generado: {rep.date}</span>
              <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"><Download size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
