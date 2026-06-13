import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  LayoutDashboard, Calendar as CalendarIcon, Users, DollarSign, Settings,
  TrendingUp, ClipboardCheck, Bell, Menu, X, Plus, Download,
  CheckCircle2, XCircle, FileText, ChevronLeft, ChevronRight, Clock,
  UserPlus, AlertTriangle, Trash2, SlidersHorizontal,
  CheckCircle, MinusCircle, Phone, Mail, LogOut, RefreshCw,
  RadioTower, TimerOff, HelpCircle, BarChart3, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, fmtShiftDt, diffHours } from './lib/supabase';

// ─── Theme tokens (matches AppTheme in Flutter) ───────────────────────────────
const T = {
  bg:      '#F5F5F7',
  white:   '#FFFFFF',
  black:   '#111111',
  blue:    '#2563EB',
  blueLt:  '#DBEAFE',
  gray:    '#888888',
  border:  '#E8E8E8',
  indigo:  '#6366F1',
  emerald: '#059669',
  amber:   '#D97706',
  violet:  '#7C3AED',
  orange:  '#FF6B00',
  red:     '#E53E3E',
};

// Nav section accent colors (matches OwnerShell._colors)
const NAV_COLORS = {
  dashboard: T.indigo,
  calendar:  T.blue,
  team:      T.emerald,
  approvals: T.amber,
  payroll:   T.violet,
  reports:   '#059669',
  settings:  T.gray,
};

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
function NavItem({ icon: Icon, label, active, onClick, color }: {
  icon: any; label: string; active: boolean; onClick: () => void; color: string
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
      style={{ background: active ? `${color}22` : 'transparent' }}>
      <div className="size-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: active ? color : `${T.white}15` }}>
        <Icon size={17} color={active ? T.white : `${T.white}70`} />
      </div>
      <span className="text-sm font-semibold" style={{ color: active ? T.white : `${T.white}80` }}>{label}</span>
    </button>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Dashboard({ session }: { session: Session }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [bizId, setBizId] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const uid = session.user.id;

  useEffect(() => {
    supabase.from('businesses').select('id').eq('owner_id', uid).single()
      .then(({ data }) => setBizId(data?.id ?? null));
    supabase.from('profiles').select('name, last_name').eq('id', uid).single()
      .then(({ data }) => {
        if (data) setOwnerName(`${data.name}${data.last_name ? ' ' + data.last_name : ''}`);
      });
  }, [uid]);

  const handleLogout = () => supabase.auth.signOut();

  return (
    <div className="min-h-screen flex" style={{ background: T.bg, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 lg:hidden" style={{ background: '#00000066' }} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 z-50 flex flex-col lg:hidden"
              style={{ background: T.black }}>
              <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab}
                onClose={() => setSidebarOpen(false)} onLogout={handleLogout}
                ownerName={ownerName} email={session.user.email ?? ''} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-30"
        style={{ background: T.black }}>
        <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab}
          onLogout={handleLogout} ownerName={ownerName} email={session.user.email ?? ''} />
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col lg:ml-64 min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-5 sticky top-0 z-20"
          style={{ background: T.white, borderBottom: `1px solid ${T.border}` }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl"
            style={{ color: T.gray }}>
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <button className="p-2 rounded-xl" style={{ color: T.gray, background: T.bg, border: `1px solid ${T.border}` }}>
            <Bell size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto" style={{ background: T.bg }}>
          {bizId === null ? (
            <div className="flex items-center justify-center h-64">
              <span className="size-8 border-2 border-blue-200 rounded-full animate-spin" style={{ borderTopColor: T.blue }} />
            </div>
          ) : (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pb-16">
              {activeTab === 'dashboard' && <DashboardView bizId={bizId} setActiveTab={setActiveTab} />}
              {activeTab === 'team'      && <TeamView bizId={bizId} />}
              {activeTab === 'calendar'  && <TurnosView bizId={bizId} />}
              {activeTab === 'approvals' && <ApprovalsView bizId={bizId} />}
              {activeTab === 'payroll'   && <PayrollView bizId={bizId} />}
              {activeTab === 'reports'   && <ReportsView />}
              {activeTab === 'settings'  && (
                <div className="p-6">
                  <div className="rounded-2xl p-12 text-center" style={{ background: T.white, border: `1px solid ${T.border}` }}>
                    <Settings size={44} color={T.gray} className="mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2" style={{ color: T.black }}>Configuración</h2>
                    <p style={{ color: T.gray }}>Esta sección estará disponible pronto.</p>
                  </div>
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
function SidebarContent({ activeTab, setActiveTab, onClose, onLogout, ownerName, email }: any) {
  const go = (tab: string) => { setActiveTab(tab); onClose?.(); };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.white}10` }}>
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl flex items-center justify-center font-black text-xl"
            style={{ background: T.blue, color: T.white }}>T</div>
          <div>
            <p className="font-bold text-white text-base leading-tight">Turnos Móvil</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `${T.white}50` }}>Business Portal</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: `${T.white}50` }}><X size={18} /></button>
        )}
      </div>

      {/* Owner profile */}
      <div className="mx-4 mt-4 mb-2 p-3 rounded-2xl flex items-center gap-3" style={{ background: `${T.white}08` }}>
        <div className="size-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
          style={{ background: T.blueLt, color: T.blue }}>
          {ownerName ? ownerName[0].toUpperCase() : '?'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate leading-tight">{ownerName || 'Dueño'}</p>
          <p className="text-[10px] truncate" style={{ color: `${T.white}50` }}>Ver Perfil</p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <NavItem icon={LayoutDashboard} label="Inicio"      active={activeTab==='dashboard'} onClick={() => go('dashboard')} color={NAV_COLORS.dashboard} />
        <NavItem icon={Users}          label="Personal"    active={activeTab==='team'}      onClick={() => go('team')}      color={NAV_COLORS.team} />
        <NavItem icon={CalendarIcon}   label="Turnos"      active={activeTab==='calendar'}  onClick={() => go('calendar')} color={NAV_COLORS.calendar} />
        <NavItem icon={ClipboardCheck} label="Horas"       active={activeTab==='approvals'} onClick={() => go('approvals')} color={NAV_COLORS.approvals} />
        <NavItem icon={DollarSign}     label="Nómina"      active={activeTab==='payroll'}   onClick={() => go('payroll')}  color={NAV_COLORS.payroll} />

        <div className="pt-2 pb-1 px-3">
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: `${T.white}40` }}>Gestión</p>
        </div>
        <NavItem icon={BarChart3}      label="Reportes"    active={activeTab==='reports'}   onClick={() => go('reports')}  color={NAV_COLORS.reports} />
        <NavItem icon={Settings}       label="Configuración" active={activeTab==='settings'} onClick={() => go('settings')} color={NAV_COLORS.settings} />
        <NavItem icon={HelpCircle}     label="Ayuda"       active={false} onClick={() => {}} color={T.indigo} />
      </div>

      {/* Footer */}
      <div className="p-3 space-y-1" style={{ borderTop: `1px solid ${T.white}10` }}>
        <div className="px-3 py-1 text-[10px] truncate" style={{ color: `${T.white}40` }}>{email}</div>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:opacity-80">
          <div className="size-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#E53E3E22' }}>
            <LogOut size={16} color={T.red} />
          </div>
          <span className="text-sm font-semibold" style={{ color: T.red }}>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}

// ─── Stat Card (matches _DarkStatCard in Flutter) ────────────────────────────
function StatCard({ value, label, color, icon: Icon, onClick }: {
  value: number | string; label: string; color: string; icon: any; onClick?: () => void
}) {
  return (
    <div onClick={onClick} className={`flex-1 rounded-2xl p-4 flex items-center gap-3 min-w-0 ${onClick ? 'cursor-pointer' : ''}`}
      style={{ background: '#F2F2F4' }}>
      <div className="size-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}33` }}>
        <Icon size={20} color={color} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none" style={{ color }}>{value}</p>
        <p className="text-[11px] mt-0.5 leading-tight" style={{ color: `${color}BB` }}>{label}</p>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardView({ bizId, setActiveTab }: { bizId: string; setActiveTab: (t: string) => void }) {
  const [stats, setStats] = useState({ activeNow: 0, notClockedIn: 0, todayShifts: 0, pending: 0 });
  const [activity, setActivity] = useState<ClockEntry[]>([]);
  const [monthApproved, setMonthApproved] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [todayShifts, setTodayShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = isoDate(new Date());
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;

      const [shiftsRes, pendingRes, actRes, monthShiftsRes] = await Promise.all([
        supabase.from('shifts').select('*, profiles(*)').eq('business_id', bizId).eq('date', today).order('start_time'),
        supabase.from('clock_entries').select('id').eq('business_id', bizId).eq('status', 'pending'),
        supabase.from('clock_entries').select('*, profiles(*)').eq('business_id', bizId).order('clock_in', { ascending: false }).limit(6),
        supabase.from('shifts').select('start_time, end_time, break_minutes, date').eq('business_id', bizId).gte('date', monthStart),
      ]);

      const shifts: Shift[] = ((shiftsRes.data ?? []) as any[]).map(s => ({ ...s, employee: s.profiles }));
      setTodayShifts(shifts);

      // Get today's clock entries for the shifts
      const shiftIds = shifts.map(s => s.id);
      let entries: ClockEntry[] = [];
      if (shiftIds.length > 0) {
        const { data } = await supabase.from('clock_entries').select('*').in('shift_id', shiftIds).neq('status', 'rejected');
        entries = (data ?? []) as ClockEntry[];
      }

      // Calc stats
      const activeNow = shifts.filter(s => {
        const e = entries.find(e => e.shift_id === s.id);
        return e && e.clock_in && !e.clock_out;
      }).length;
      const notClockedIn = shifts.filter(s => !entries.find(e => e.shift_id === s.id)).length;

      // Monthly totals
      let totalMins = 0;
      for (const s of (monthShiftsRes.data ?? [])) {
        const date = s.date as string;
        const st = (s.start_time as string).includes('T') ? s.start_time : `${date}T${s.start_time}`;
        const et = (s.end_time as string).includes('T') ? s.end_time : `${date}T${s.end_time}`;
        const dtS = new Date(st.replace(/\+00(:\d{2})?$/, ''));
        const dtE = new Date(et.replace(/\+00(:\d{2})?$/, ''));
        const brk = (s.break_minutes as number) ?? 0;
        if (!isNaN(dtS.getTime()) && !isNaN(dtE.getTime())) {
          totalMins += Math.max(0, (dtE.getTime() - dtS.getTime()) / 60000 - brk);
        }
      }

      // Approved month entries
      let approvedMins = 0;
      if ((monthShiftsRes.data ?? []).length > 0) {
        const monthShiftIds = (monthShiftsRes.data ?? []).map((s: any) => s.id).filter(Boolean);
        // monthShiftsRes doesn't have id — refetch
        const { data: mShifts } = await supabase.from('shifts').select('id').eq('business_id', bizId).gte('date', monthStart);
        const mIds = (mShifts ?? []).map(s => s.id);
        if (mIds.length > 0) {
          const { data: approved } = await supabase.from('clock_entries').select('clock_in, clock_out, break_minutes').in('shift_id', mIds).eq('status', 'approved');
          for (const e of (approved ?? [])) {
            const ci = new Date(e.clock_in); const co = e.clock_out ? new Date(e.clock_out) : null;
            if (co) approvedMins += Math.max(0, (co.getTime() - ci.getTime()) / 60000 - ((e.break_minutes as number) ?? 0));
          }
        }
      }

      setStats({ activeNow, notClockedIn, todayShifts: shifts.length, pending: pendingRes.data?.length ?? 0 });
      setActivity(((actRes.data ?? []) as any[]).map(e => ({ ...e, employee: e.profiles })));
      setMonthApproved(approvedMins);
      setMonthTotal(totalMins);
      setLoading(false);
    })();
  }, [bizId]);

  const progress = monthTotal > 0 ? Math.min(monthApproved / monthTotal, 1) : 0;
  const fmtMins = (m: number) => { const h = Math.floor(m/60); const min = Math.round(m%60); return min>0 ? `${h}h ${min}m` : `${h}h`; };
  const todayLabel = new Date().toLocaleDateString('es-PR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div>
      {/* Header gradient band — matches Flutter dashboard */}
      <div className="px-5 pt-6 pb-6" style={{ background: 'linear-gradient(135deg, #064E3B, #1D4ED8)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm text-white/70 capitalize">{todayLabel}</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">Dashboard</h1>
          </div>
          <button onClick={() => setActiveTab('calendar')}
            className="size-11 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: T.orange }}>
            <Plus size={22} color="white" />
          </button>
        </div>

        {/* Stat grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0,1,2,3].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: '#F2F2F4' }} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard value={stats.activeNow}    label="En turno ahora"  color="#1D9E75" icon={RadioTower} />
            <StatCard value={stats.notClockedIn} label="Sin ponchar"     color={T.amber}  icon={TimerOff} />
            <StatCard value={stats.todayShifts}  label="Turnos hoy"     color={T.blue}   icon={Users} />
            <StatCard value={stats.pending}      label="Por aprobar"    color={T.red}    icon={AlertTriangle}
              onClick={() => setActiveTab('approvals')} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Monthly hours bar */}
        <div className="rounded-2xl p-5" style={{ background: T.white, border: `1px solid ${T.border}` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold" style={{ color: T.black }}>Horas aprobadas este mes</span>
            <span className="text-sm font-bold" style={{ color: T.blue }}>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: T.blueLt }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: T.blue }} />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-semibold" style={{ color: T.black }}>{fmtMins(monthApproved)}</span>
            <span className="text-xs" style={{ color: T.gray }}>de {fmtMins(monthTotal)}</span>
          </div>
        </div>

        {/* Today's employees */}
        {!loading && (
          todayShifts.length > 0 ? (
            <div>
              <p className="text-sm font-bold mb-3" style={{ color: T.black }}>Empleados hoy</p>
              <div className="rounded-2xl overflow-hidden" style={{ background: T.white, border: `1px solid ${T.border}` }}>
                {todayShifts.map((s, i) => {
                  const emp = s.employee;
                  return (
                    <div key={s.id} className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: i < todayShifts.length-1 ? `1px solid #F0EEE8` : 'none' }}>
                      <div className="size-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: emp?.employee_color || T.blue }}>
                        {empInitials(emp)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: T.black }}>{empName(emp)}</p>
                        <p className="text-xs" style={{ color: T.gray }}>{fmtShiftDt(s.start_time)}</p>
                      </div>
                      <span className="text-[11px] font-semibold px-3 py-1 rounded-full"
                        style={{ background: '#DBEAFE', color: T.blue }}>
                        {s.status === 'published' ? 'Publicado' : s.status === 'accepted' ? 'Aceptado' : 'Borrador'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div onClick={() => setActiveTab('calendar')} className="rounded-2xl p-10 flex flex-col items-center cursor-pointer"
              style={{ background: T.white, border: `1px solid ${T.border}` }}>
              <div className="size-14 rounded-full flex items-center justify-center mb-4" style={{ background: T.blueLt }}>
                <CalendarIcon size={28} color={T.blue} />
              </div>
              <p className="text-base font-bold mb-1" style={{ color: T.black }}>Sin turnos para hoy</p>
              <p className="text-sm" style={{ color: T.gray }}>Toca para crear turnos</p>
            </div>
          )
        )}

        {/* Recent activity */}
        {!loading && activity.length > 0 && (
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: T.black }}>Actividad reciente</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: T.white, border: `1px solid ${T.border}` }}>
              {activity.map((e, i) => {
                const hrs = diffHours(e.clock_in, e.clock_out);
                const statusStyle = e.status === 'approved'
                  ? { bg: '#EAF3DE', fg: '#27500A', label: 'Aprobado' }
                  : e.status === 'rejected'
                  ? { bg: '#FEE2E2', fg: '#991B1B', label: 'Rechazado' }
                  : { bg: '#FAEEДА', fg: '#633806', label: 'Pendiente' };
                return (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: i < activity.length-1 ? '1px solid #F0EEE8' : 'none' }}>
                    <div className="size-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: T.blueLt, color: T.blue }}>{empInitials(e.employee)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: T.black }}>{empName(e.employee)}</p>
                      <p className="text-xs" style={{ color: T.gray }}>
                        {new Date(e.clock_in).toLocaleString('es-PR', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit', hour12:true })}
                        {hrs > 0 && ` · ${hrs.toFixed(1)}h`}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: statusStyle.bg, color: statusStyle.fg }}>
                      {statusStyle.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
    <div>
      {/* Header */}
      <div className="px-5 pt-6 pb-5" style={{ background: T.white, borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold" style={{ color: T.black }}>Personal</h1>
          <div className="flex gap-2">
            <button onClick={load} className="size-10 rounded-xl flex items-center justify-center" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
              <RefreshCw size={17} color={T.gray} />
            </button>
            <button onClick={() => setShowModal(true)} className="h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-bold text-white"
              style={{ background: T.emerald }}>
              <UserPlus size={15} /> Invitar
            </button>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total',      value: employees.length,                              color: T.blue },
            { label: 'Activos',    value: employees.filter(e=>e.status==='active').length, color: T.emerald },
            { label: 'Pendientes', value: employees.filter(e=>e.status==='pending').length, color: T.amber },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl p-3 text-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              <p className="text-2xl font-bold" style={{ color }}>{loading ? '—' : value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: `${color}AA` }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2" size={16} color={T.gray} />
          <input type="text" placeholder="Buscar empleado..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-2xl text-sm"
            style={{ background: T.white, border: `1.5px solid ${T.border}`, color: T.black, outline: 'none' }} />
        </div>

        {/* Employee list */}
        {loading ? (
          Array.from({length:3}).map((_,i) => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: T.white }} />)
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: T.white, border: `1px solid ${T.border}` }}>
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm font-semibold" style={{ color: T.gray }}>
                  {employees.length === 0 ? 'Aún no tienes empleados. ¡Invita al primero!' : 'No encontrado'}
                </p>
              </div>
            ) : filtered.map((emp, i) => {
              const isInactive = emp.status === 'inactive';
              const isPending  = emp.status === 'pending';
              const statusStyle = !isInactive && !isPending
                ? { bg: '#EAF3DE', fg: '#27500A', label: 'Activo' }
                : isPending ? { bg: '#FAEEДА', fg: '#633806', label: 'Pendiente' }
                : { bg: '#F3F4F6', fg: T.gray, label: 'Inactivo' };
              return (
                <div key={emp.id} className={`flex items-center gap-3 px-4 py-3.5 ${isInactive ? 'opacity-60' : ''}`}
                  style={{ borderBottom: i < filtered.length-1 ? `1px solid #F0EEE8` : 'none' }}>
                  <div className="size-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: emp.employee_color || T.blue }}>
                    {empInitials(emp)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: T.black }}>{empName(emp)}</p>
                    <p className="text-xs truncate" style={{ color: T.gray }}>{emp.job_title || 'Sin puesto'} · ${Number(emp.hourly_rate ?? 0).toFixed(2)}/hr</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: statusStyle.bg, color: statusStyle.fg }}>
                      {statusStyle.label}
                    </span>
                    <button onClick={() => handleToggle(emp)} className="size-8 rounded-xl flex items-center justify-center"
                      style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                      {isInactive ? <CheckCircle size={15} color={T.emerald} /> : <MinusCircle size={15} color={T.gray} />}
                    </button>
                    <button onClick={() => setConfirmDeleteId(emp.id)} className="size-8 rounded-xl flex items-center justify-center"
                      style={{ background: '#FEE2E2', border: '1px solid #FECACA' }}>
                      <Trash2 size={15} color={T.red} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: '#00000066' }}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl p-6 relative" style={{ background: T.white }}>
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 rounded-xl" style={{ color: T.gray }}>
                <X size={20} />
              </button>
              <h2 className="text-lg font-bold mb-1" style={{ color: T.black }}>Invitar Empleado</h2>
              <p className="text-xs mb-5" style={{ color: T.gray }}>Se enviará un email de activación.</p>
              <form onSubmit={handleInvite} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {(['name', 'last_name'] as const).map(f => (
                    <div key={f}>
                      <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: T.gray }}>
                        {f === 'name' ? 'Nombre' : 'Apellido'}
                      </label>
                      <input required type="text" value={newEmp[f]} onChange={e => setNewEmp({...newEmp, [f]: e.target.value})}
                        className="w-full h-11 rounded-xl px-3 text-sm" style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.black, outline: 'none' }} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: T.gray }}>Correo</label>
                  <input required type="email" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})}
                    className="w-full h-11 rounded-xl px-3 text-sm" style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.black, outline: 'none' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: T.gray }}>Puesto</label>
                    <input required type="text" value={newEmp.job_title} onChange={e => setNewEmp({...newEmp, job_title: e.target.value})}
                      className="w-full h-11 rounded-xl px-3 text-sm" style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.black, outline: 'none' }} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: T.gray }}>Pago/hr $</label>
                    <input required type="number" step="0.01" value={newEmp.hourly_rate} onChange={e => setNewEmp({...newEmp, hourly_rate: e.target.value})}
                      className="w-full h-11 rounded-xl px-3 text-sm" style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.black, outline: 'none' }} />
                  </div>
                </div>
                <button type="submit" disabled={inviting}
                  className="w-full h-12 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 mt-2"
                  style={{ background: T.blue, opacity: inviting ? 0.6 : 1 }}>
                  {inviting ? <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Mail size={16} /> Enviar Invitación</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" style={{ background: '#00000066' }}
            onClick={() => setConfirmDeleteId(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xs rounded-3xl p-6 text-center" style={{ background: T.white }}
              onClick={e => e.stopPropagation()}>
              <div className="size-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#FEE2E2' }}>
                <Trash2 size={26} color={T.red} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: T.black }}>Eliminar Empleado</h3>
              <p className="text-sm mb-6" style={{ color: T.gray }}>Esta acción no se puede deshacer.</p>
              <div className="flex flex-col gap-2">
                <button onClick={() => handleDelete(confirmDeleteId!)} className="w-full h-12 rounded-2xl text-white text-sm font-bold" style={{ background: T.red }}>
                  Sí, Eliminar
                </button>
                <button onClick={() => setConfirmDeleteId(null)} className="w-full h-12 rounded-2xl text-sm font-bold" style={{ background: T.bg, color: T.black }}>
                  Cancelar
                </button>
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
      business_id: bizId, employee_id: form.employee_id, date: form.date,
      start_time: `${form.date}T${form.start_time}:00`,
      end_time: `${form.date}T${form.end_time}:00`,
      status: form.status, break_minutes: form.break_minutes,
    };
    if (editShift) await supabase.from('shifts').update(payload).eq('id', editShift.id);
    else await supabase.from('shifts').insert(payload);
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

  return (
    <div>
      {/* Header */}
      <div className="px-5 pt-6 pb-5" style={{ background: T.white, borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold" style={{ color: T.black }}>Turnos</h1>
          <div className="flex gap-2">
            <button onClick={() => openAdd(selectedDate)} className="h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-bold text-white"
              style={{ background: T.blue }}>
              <Plus size={15} /> Crear
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Week nav */}
        <div className="flex items-center justify-between">
          <button onClick={() => setWeekAnchor(d => { const n=new Date(d); n.setDate(n.getDate()-7); return n; })}
            className="size-9 rounded-xl flex items-center justify-center" style={{ background: T.white, border: `1px solid ${T.border}` }}>
            <ChevronLeft size={18} color={T.gray} />
          </button>
          <span className="text-sm font-semibold" style={{ color: T.black }}>
            {MONTH_ES[days[0].getMonth()]} {days[0].getDate()} – {MONTH_ES[days[6].getMonth()]} {days[6].getDate()}
          </span>
          <button onClick={() => setWeekAnchor(d => { const n=new Date(d); n.setDate(n.getDate()+7); return n; })}
            className="size-9 rounded-xl flex items-center justify-center" style={{ background: T.white, border: `1px solid ${T.border}` }}>
            <ChevronRight size={18} color={T.gray} />
          </button>
        </div>

        {/* Day strip */}
        <div className="grid grid-cols-7 gap-1.5">
          {days.map(d => {
            const iso = isoDate(d); const sel = iso===selectedDate;
            const has = dayShifts(d).length > 0; const isToday = iso===isoDate(new Date());
            return (
              <button key={iso} onClick={() => setSelectedDate(iso)}
                className="flex flex-col items-center py-2 rounded-2xl transition-all"
                style={{ background: sel ? T.blue : isToday ? T.blueLt : T.white, border: `1px solid ${sel ? T.blue : T.border}` }}>
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: sel ? '#ffffff99' : T.gray }}>{DAY_ES[d.getDay()]}</span>
                <span className="text-lg font-bold leading-none mt-0.5" style={{ color: sel ? T.white : T.black }}>{d.getDate()}</span>
                <div className="w-2 h-2 rounded-full mt-1" style={{ background: has ? (sel ? 'white' : T.emerald) : 'transparent' }} />
              </button>
            );
          })}
        </div>

        {/* Publish button */}
        <div className="flex justify-end">
          <button onClick={handlePublishAll} disabled={draftsCount===0}
            className="h-10 px-5 rounded-xl flex items-center gap-2 text-xs font-bold text-white transition-all"
            style={{ background: draftsCount>0 ? T.amber : T.emerald, opacity: draftsCount===0 ? 0.7 : 1 }}>
            <CheckCircle2 size={15} />
            {draftsCount>0 ? `Publicar ${draftsCount} turno${draftsCount>1?'s':''}` : 'Todo publicado'}
          </button>
        </div>

        {/* Shift list for selected day */}
        {loading ? Array.from({length:2}).map((_,i)=><div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: T.white }} />) :
        selectedShifts.length === 0 ? (
          <div className="rounded-2xl py-14 flex flex-col items-center" style={{ background: T.white, border: `1px solid ${T.border}` }}>
            <p className="text-sm font-semibold mb-3" style={{ color: T.gray }}>No hay turnos para este día</p>
            <button onClick={() => openAdd(selectedDate)} className="h-10 px-5 rounded-xl text-xs font-bold text-white" style={{ background: T.blue }}>
              Crear Turno
            </button>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: T.white, border: `1px solid ${T.border}` }}>
            {selectedShifts.map((s, i) => {
              const statusStyle = s.status==='published' ? { bg: '#EAF3DE', fg: '#27500A', label: 'Publicado' }
                : s.status==='accepted' ? { bg: T.blueLt, fg: T.blue, label: 'Aceptado' }
                : s.status==='rejected' ? { bg: '#FEE2E2', fg: T.red, label: 'Rechazado' }
                : { bg: '#FEF3C7', fg: '#92400E', label: 'Borrador' };
              return (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => openEdit(s)}
                  style={{ borderBottom: i < selectedShifts.length-1 ? '1px solid #F0EEE8' : 'none' }}>
                  <div className="size-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: s.employee?.employee_color || T.blue }}>
                    {empInitials(s.employee)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: T.black }}>{empName(s.employee)}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={11} color={T.gray} />
                      <p className="text-xs" style={{ color: T.gray }}>{fmtShiftRange(s)}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                    style={{ background: statusStyle.bg, color: statusStyle.fg }}>{statusStyle.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: '#00000066' }}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl p-6 relative" style={{ background: T.white }}>
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 rounded-xl" style={{ color: T.gray }}><X size={20} /></button>
              <h2 className="text-lg font-bold mb-5" style={{ color: T.black }}>{editShift ? 'Editar Turno' : 'Crear Turno'}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: T.gray }}>Empleado</label>
                  <select required value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})}
                    className="w-full h-11 rounded-xl px-3 text-sm" style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.black, outline: 'none' }}>
                    <option value="">Selecciona...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{empName(e)} – {e.job_title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: T.gray }}>Fecha</label>
                  <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                    className="w-full h-11 rounded-xl px-3 text-sm" style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.black, outline: 'none' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(['start_time','end_time'] as const).map(field => (
                    <div key={field}>
                      <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: T.gray }}>{field==='start_time'?'Entrada':'Salida'}</label>
                      <input required type="time" value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})}
                        className="w-full h-11 rounded-xl px-3 text-sm" style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.black, outline: 'none' }} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: T.gray }}>Break</label>
                  <select value={form.break_minutes} onChange={e => setForm({...form, break_minutes: Number(e.target.value)})}
                    className="w-full h-11 rounded-xl px-3 text-sm" style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.black, outline: 'none' }}>
                    <option value={0}>Sin break</option>
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={60}>1 hora</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2" style={{ borderTop: `1px solid ${T.border}` }}>
                  {editShift && (
                    <button type="button" onClick={() => handleDelete(editShift.id)}
                      className="size-12 rounded-xl flex items-center justify-center" style={{ background: '#FEE2E2' }}>
                      <Trash2 size={18} color={T.red} />
                    </button>
                  )}
                  <button type="submit" className="flex-1 h-12 rounded-2xl text-white text-sm font-bold" style={{ background: T.blue }}>
                    {editShift ? 'Guardar' : 'Crear Turno'}
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
  const [tab, setTab] = useState<'pending'|'history'>('pending');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('clock_entries').select('*, profiles(*)')
      .eq('business_id', bizId).order('clock_in', { ascending: false }).limit(100);
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
  const display = tab==='pending' ? pending : history;

  return (
    <div>
      <div className="px-5 pt-6 pb-5" style={{ background: T.white, borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold" style={{ color: T.black }}>Aprobación de Horas</h1>
          <div className="flex gap-2">
            <button onClick={load} className="size-10 rounded-xl flex items-center justify-center" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
              <RefreshCw size={17} color={T.gray} />
            </button>
            {pending.length > 0 && (
              <div className="h-10 px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold text-white" style={{ background: T.red }}>
                <AlertTriangle size={14} /> {pending.length} pendientes
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-3 text-center" style={{ background: `${T.amber}15`, border: `1px solid ${T.amber}30` }}>
            <p className="text-2xl font-bold" style={{ color: T.amber }}>{loading ? '—' : pending.length}</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `${T.amber}AA` }}>Sin revisar</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: '#EAF3DE', border: '1px solid #BBF7D0' }}>
            <p className="text-2xl font-bold" style={{ color: T.emerald }}>{loading ? '—' : history.filter(e=>e.status==='approved').length}</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `${T.emerald}AA` }}>Aprobados</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Tab toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl" style={{ background: T.white, border: `1px solid ${T.border}` }}>
          {(['pending','history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: tab===t ? T.blue : 'transparent', color: tab===t ? T.white : T.gray }}>
              {t==='pending' ? `Pendientes (${pending.length})` : `Historial (${history.length})`}
            </button>
          ))}
        </div>

        {loading ? Array.from({length:3}).map((_,i)=><div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: T.white }} />) :
        display.length === 0 ? (
          <div className="rounded-2xl py-16 flex flex-col items-center" style={{ background: T.white, border: `1px solid ${T.border}` }}>
            <CheckCircle2 size={38} color={T.emerald} className="mb-3" />
            <p className="text-sm font-semibold" style={{ color: T.gray }}>
              {tab==='pending' ? 'Todo al día. No hay pendientes.' : 'No hay historial.'}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: T.white, border: `1px solid ${T.border}` }}>
            {display.map((entry, i) => {
              const hrs = diffHours(entry.clock_in, entry.clock_out);
              const isPending = entry.status==='pending';
              const color = isPending ? T.amber : entry.status==='approved' ? T.emerald : T.red;
              return (
                <div key={entry.id} className="px-4 py-4" style={{ borderBottom: i < display.length-1 ? '1px solid #F0EEE8' : 'none', borderLeft: `3px solid ${color}` }}>
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: T.blueLt, color: T.blue }}>{empInitials(entry.employee)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: T.black }}>{empName(entry.employee)}</p>
                      <p className="text-xs mt-0.5" style={{ color: T.gray }}>
                        {new Date(entry.clock_in).toLocaleString('es-PR', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit', hour12:true })}
                        {entry.clock_out && ` – ${new Date(entry.clock_out).toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', hour12:true })}`}
                        {hrs>0 && ` · ${hrs.toFixed(1)}h`}
                      </p>
                    </div>
                    {!isPending && (
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                        style={{ background: entry.status==='approved' ? '#EAF3DE' : '#FEE2E2', color: entry.status==='approved' ? '#27500A' : T.red }}>
                        {entry.status==='approved' ? 'Aprobado' : 'Rechazado'}
                      </span>
                    )}
                  </div>
                  {isPending && (
                    <div className="flex gap-2 mt-3 ml-13 pl-[52px]">
                      <button onClick={() => handleAction(entry.id, 'rejected')}
                        className="flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold"
                        style={{ background: '#FEE2E2', color: T.red }}>
                        <XCircle size={15} /> Rechazar
                      </button>
                      <button onClick={() => handleAction(entry.id, 'approved')}
                        className="flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-white"
                        style={{ background: T.emerald }}>
                        <CheckCircle2 size={15} /> Aprobar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
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
        supabase.from('clock_entries').select('employee_id, clock_in, clock_out')
          .eq('business_id', bizId).eq('status','approved').not('clock_out','is',null).gte('clock_in', `${startDate}T00:00:00`),
      ]);

      const emps = (empRes.data ?? []) as Employee[];
      const hrMap: Record<string, number> = {};
      for (const e of (entryRes.data ?? [])) {
        const hrs = diffHours(e.clock_in, e.clock_out);
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
    <div>
      <div className="px-5 pt-6 pb-5" style={{ background: T.white, borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold" style={{ color: T.black }}>Nómina</h1>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
            {(['week','month'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{ background: period===p ? T.violet : 'transparent', color: period===p ? T.white : T.gray }}>
                {p==='week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'Bruto',    value: totalGross, color: T.blue },
            { label:'Deduc.',   value: totalDed,   color: T.red },
            { label:'Neto',     value: totalNet,   color: T.violet },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl p-3 text-center" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: `${color}AA` }}>{label}</p>
              <p className="text-base font-bold font-mono" style={{ color }}>{loading ? '—' : `$${value.toFixed(0)}`}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-3">
        <p className="text-sm font-bold" style={{ color: T.black }}>Desglose por Empleado</p>
        {loading ? Array.from({length:2}).map((_,i)=><div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: T.white }} />) :
        data.filter(d=>d.hours+d.overtime>0).length===0 ? (
          <div className="rounded-2xl py-14 flex flex-col items-center" style={{ background: T.white, border: `1px solid ${T.border}` }}>
            <p className="text-sm font-semibold" style={{ color: T.gray }}>No hay horas aprobadas en este período</p>
          </div>
        ) : data.filter(d=>d.hours+d.overtime>0).map(({ emp, hours, overtime }) => {
          const gross = hours*emp.hourly_rate + overtime*emp.hourly_rate*1.5;
          const net   = gross*(1-0.1465);
          return (
            <div key={emp.id} className="rounded-2xl p-4" style={{ background: T.white, border: `1px solid ${T.border}` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: emp.employee_color || T.blue }}>{empInitials(emp)}</div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: T.black }}>{empName(emp)}</p>
                    <p className="text-xs" style={{ color: T.gray }}>${emp.hourly_rate}/hr</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold" style={{ color: T.gray }}>Neto</p>
                  <p className="text-xl font-bold font-mono" style={{ color: T.violet }}>${net.toFixed(2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3" style={{ borderTop: `1px solid ${T.border}` }}>
                {[
                  { label: 'Hrs Reg.', value: `${hours.toFixed(1)}h`, color: T.blue },
                  { label: 'Hrs Extra', value: `${overtime.toFixed(1)}h`, color: T.orange },
                  { label: 'Deduc.',  value: `-$${(gross*0.1465).toFixed(0)}`, color: T.red },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: `${color}10` }}>
                    <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: `${color}AA` }}>{label}</p>
                    <p className="text-sm font-bold mt-0.5 font-mono" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── REPORTES ─────────────────────────────────────────────────────────────────
function ReportsView() {
  const reports = [
    { id:1, title:'Reporte SURI',  period:'Q1 2026 (Ene – Mar)', date:'Abr 10, 2026' },
    { id:2, title:'Reporte DTRH',  period:'Q1 2026 (Ene – Mar)', date:'Abr 10, 2026' },
    { id:3, title:'Reporte SINOT', period:'Q1 2026 (Ene – Mar)', date:'Abr 11, 2026' },
  ];
  return (
    <div>
      <div className="px-5 pt-6 pb-5" style={{ background: T.white, borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ color: T.black }}>Reportes y CPA</h1>
          <button className="h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-bold text-white" style={{ background: T.emerald }}>
            <FileText size={15} /> Generar
          </button>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #064E3B, #1D4ED8)' }}>
          <div className="absolute right-0 top-0 opacity-10"><TrendingUp size={120} color="white" /></div>
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Estado Actual</p>
          <h3 className="text-lg font-bold text-white">Todo en Orden</h3>
          <p className="text-sm text-white/70 mt-1">Todas las radicaciones del primer trimestre completadas.</p>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: T.white, border: `1px solid ${T.border}` }}>
          {reports.map((rep, i) => (
            <div key={rep.id} className="flex items-center gap-4 px-4 py-4"
              style={{ borderBottom: i < reports.length-1 ? `1px solid #F0EEE8` : 'none' }}>
              <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: T.blueLt }}>
                <FileText size={20} color={T.blue} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: T.black }}>{rep.title}</p>
                <p className="text-xs" style={{ color: T.gray }}>{rep.period}</p>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full mr-2" style={{ background: '#EAF3DE', color: '#27500A' }}>Completado</span>
              <button className="size-9 rounded-xl flex items-center justify-center" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                <Download size={16} color={T.blue} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
