import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  LayoutDashboard, Calendar as CalendarIcon, Users, DollarSign, Settings,
  ClipboardCheck, Bell, Menu, X, Plus, Download,
  CheckCircle2, XCircle, ChevronLeft, ChevronRight, Clock,
  UserPlus, AlertTriangle, Trash2, Search, BarChart3,
  MinusCircle, LogOut, RefreshCw,
  Send, Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, diffHours } from './lib/supabase';

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg: '#F5F5F7', white: '#FFFFFF', black: '#111111',
  blue: '#2563EB', blueLt: '#DBEAFE', blueDim: '#EFF6FF',
  gray: '#888888', grayMid: '#9CA3AF', grayLt: '#F3F4F6',
  border: '#E8E8E8',
  green: '#16A34A', greenLt: '#DCFCE7',
  amber: '#D97706', amberLt: '#FEF3C7',
  red: '#DC2626', redLt: '#FEE2E2',
  indigo: '#4F46E5', indigoLt: '#EEF2FF',
  violet: '#7C3AED', violetLt: '#F5F3FF',
  orange: '#FF6B00',
};

const CARD = { background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };
const EMP_COLORS = ['#6366F1','#2563EB','#0D9488','#16A34A','#D97706','#DC2626','#DB2777','#7C3AED','#0891B2','#059669','#CA8A04','#9333EA'];
const JOB_TITLES = ['Cajero/a','Mesero/a','Cocinero/a','Chef','Bartender','Host / Hostess','Gerente','Supervisor/a','Limpieza','Seguridad','Recepcionista','Vendedor/a','Almacenista','Repartidor/a','Técnico/a','Contador/a','Asistente Administrativo/a','Instructor/a','Mecánico/a','Electricista','Chofer','Otro'];
const NAV = { dashboard: T.indigo, team: T.green, calendar: T.blue, approvals: T.amber, payroll: T.violet, reports: T.green, settings: T.gray };
const DAY_ES = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Employee { id:string; name:string; last_name:string|null; email:string; phone:string|null; job_title:string|null; role:string; hourly_rate:number; employee_color:string|null; status:string; business_id:string; }
interface Shift { id:string; employee_id:string; business_id:string; date:string; start_time:string; end_time:string; status:string; break_minutes:number; employee?:Employee; }
interface ClockEntry { id:string; employee_id:string; business_id:string; shift_id:string|null; clock_in:string; clock_out:string|null; status:string; break_minutes:number; rejection_note:string|null; approved_hours?:number|null; employee?:Employee; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isoDate(d:Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function weekDays(anchor:Date) {
  const base=new Date(anchor.getFullYear(),anchor.getMonth(),anchor.getDate()); const dow=base.getDay();
  base.setDate(base.getDate()-dow);
  return Array.from({length:7},(_,i)=>new Date(base.getFullYear(),base.getMonth(),base.getDate()+i));
}
function empName(e?:Employee|null) { if(!e)return'Empleado'; return `${e.name}${e.last_name?' '+e.last_name:''}`; }
function empInitials(e?:Employee|null) { if(!e)return'?'; return `${e.name?.[0]??''}${e.last_name?.[0]??''}`.toUpperCase()||e.name[0].toUpperCase(); }
function empColor(e?:Employee|null,idx?:number):string { if(e?.employee_color){try{return e.employee_color;}catch{}} return EMP_COLORS[(idx??0)%EMP_COLORS.length]; }
function fmtHours(h:number) { const hr=Math.floor(h); const min=Math.round((h-hr)*60); return min>0?`${hr}h ${min}m`:`${hr}h`; }

// ─── Nav Item ─────────────────────────────────────────────────────────────────
function NavItem({icon:Icon,label,active,onClick,color}:{icon:any;label:string;active:boolean;onClick:()=>void;color:string}) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
      style={{background:active?`${color}20`:'transparent'}}>
      <div className="size-8 rounded-xl flex items-center justify-center shrink-0 transition-all" style={{background:active?color:`${T.white}15`}}>
        <Icon size={16} color={active?T.white:`${T.white}65`}/>
      </div>
      <span className="text-sm font-semibold leading-none" style={{color:active?T.white:`${T.white}75`}}>{label}</span>
    </button>
  );
}

// ─── Status Chip ──────────────────────────────────────────────────────────────
function StatusChip({status}:{status:string}) {
  const map:Record<string,{bg:string;fg:string;label:string}> = {
    active:{bg:T.greenLt,fg:T.green,label:'Activo'}, pending:{bg:T.amberLt,fg:T.amber,label:'Pendiente'},
    inactive:{bg:T.grayLt,fg:T.grayMid,label:'Inactivo'}, published:{bg:T.greenLt,fg:T.green,label:'Publicado'},
    accepted:{bg:T.blueLt,fg:T.blue,label:'Aceptado'}, rejected:{bg:T.amberLt,fg:T.amber,label:'Ajustado'},
    approved:{bg:T.greenLt,fg:T.green,label:'Aprobado'}, paid:{bg:T.blueLt,fg:T.blue,label:'Procesado'},
    draft:{bg:T.amberLt,fg:T.amber,label:'Borrador'},
  };
  const s=map[status]??{bg:T.grayLt,fg:T.gray,label:status};
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0" style={{background:s.bg,color:s.fg}}>
      <span className={`w-1.5 h-1.5 rounded-full ${(status==='active'||status==='pending')?'animate-pulse':''}`} style={{background:s.fg}}/>
      {s.label}
    </span>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Dashboard({session}:{session:Session}) {
  const TAB_SLUG:Record<string,string>={dashboard:'',calendar:'horario',approvals:'horas',team:'personal',payroll:'nomina',reports:'reportes',settings:'configuracion'};
  const SLUG_TAB:Record<string,string>={'':'dashboard',horario:'calendar',horas:'approvals',personal:'team',nomina:'payroll',reportes:'reports',configuracion:'settings'};
  const TAB_LABEL:Record<string,string>={dashboard:'Dashboard',calendar:'Turnos',approvals:'Horas',team:'Personal',payroll:'Nómina',reports:'Reportes',settings:'Configuración'};
  const initTab=(()=>{const parts=window.location.pathname.split('/');const slug=parts[2]??'';return SLUG_TAB[slug]??'dashboard';})();
  const [activeTab,setActiveTab] = useState(initTab);
  const [sidebarOpen,setSidebarOpen] = useState(false);
  const navigate=(tab:string)=>{const slug=TAB_SLUG[tab]??'';setActiveTab(tab);window.history.pushState(null,'',`/panel${slug?'/'+slug:''}`);document.title=`${TAB_LABEL[tab]??'Turnos Móvil'} · Turnos Móvil`;};
  useEffect(()=>{document.title=`${TAB_LABEL[activeTab]??'Turnos Móvil'} · Turnos Móvil`;},[activeTab]);
  const [bizId,setBizId] = useState<string|null>(null);
  const [ownerName,setOwnerName] = useState('');
  const uid = session.user.id;

  useEffect(()=>{
    supabase.from('businesses').select('id').eq('owner_id',uid).single().then(({data})=>setBizId(data?.id??null));
    supabase.from('profiles').select('name,last_name').eq('id',uid).single().then(({data})=>{if(data)setOwnerName(`${data.name}${data.last_name?' '+data.last_name:''}`)});
  },[uid]);

  const SB = '#0f1f5c';
  const sidebar = (
    <div className="flex flex-col h-full" style={{background:SB}}>
      <div className="px-4 pt-5 pb-4 flex items-center justify-between" style={{borderBottom:`1px solid rgba(255,255,255,0.08)`}}>
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg flex items-center justify-center text-sm font-black" style={{background:T.white,color:SB}}>T</div>
          <div><p className="font-semibold text-white text-[13px] leading-tight">Turnos Móvil</p><p className="text-[9px] font-medium mt-0.5" style={{color:`rgba(255,255,255,0.35)`}}>Business Portal</p></div>
        </div>
        <button onClick={()=>setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg" style={{color:`rgba(255,255,255,0.4)`}}><X size={18}/></button>
      </div>
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
        <NavItem icon={LayoutDashboard} label="Dashboard"    active={activeTab==='dashboard'} onClick={()=>{navigate('dashboard');setSidebarOpen(false)}} color={NAV.dashboard}/>
        <NavItem icon={CalendarIcon}   label="Turnos"        active={activeTab==='calendar'}  onClick={()=>{navigate('calendar');setSidebarOpen(false)}} color={NAV.calendar}/>
        <NavItem icon={ClipboardCheck} label="Horas"         active={activeTab==='approvals'} onClick={()=>{navigate('approvals');setSidebarOpen(false)}} color={NAV.approvals}/>
        <NavItem icon={Users}          label="Personal"      active={activeTab==='team'}      onClick={()=>{navigate('team');setSidebarOpen(false)}} color={NAV.team}/>
        <div className="pt-3 pb-1 px-2"><p className="text-[9px] font-semibold uppercase tracking-widest" style={{color:`rgba(255,255,255,0.25)`}}>Gestión</p></div>
        <NavItem icon={DollarSign}     label="Nómina"        active={activeTab==='payroll'}   onClick={()=>{navigate('payroll');setSidebarOpen(false)}} color={NAV.payroll}/>
        <NavItem icon={BarChart3}      label="Reportes"      active={activeTab==='reports'}   onClick={()=>{navigate('reports');setSidebarOpen(false)}} color={NAV.reports}/>
        <NavItem icon={Settings}       label="Configuración" active={activeTab==='settings'}  onClick={()=>{navigate('settings');setSidebarOpen(false)}} color={NAV.settings}/>
      </div>
      <div className="p-3" style={{borderTop:`1px solid rgba(255,255,255,0.08)`}}>
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl mb-1" style={{background:`rgba(255,255,255,0.06)`}}>
          <div className="size-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0" style={{background:T.indigo,color:T.white}}>{ownerName?ownerName[0].toUpperCase():'?'}</div>
          <div className="flex-1 min-w-0"><p className="text-[12px] font-medium text-white truncate">{ownerName||'Dueño'}</p><p className="text-[9px] truncate" style={{color:`rgba(255,255,255,0.35)`}}>Administrador</p></div>
        </div>
        <button onClick={()=>supabase.auth.signOut()} className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:opacity-80">
          <div className="size-7 rounded-lg flex items-center justify-center shrink-0" style={{background:`${T.red}22`}}><LogOut size={13} color={T.red}/></div>
          <span className="text-[12px] font-medium" style={{color:T.red}}>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{background:T.bg,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <AnimatePresence>
        {sidebarOpen&&(<>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSidebarOpen(false)} className="fixed inset-0 z-40 lg:hidden" style={{background:'#00000066'}}/>
          <motion.div initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}} transition={{type:'spring',damping:25,stiffness:200}} className="fixed top-0 left-0 bottom-0 w-64 z-50 lg:hidden">{sidebar}</motion.div>
        </>)}
      </AnimatePresence>
      <aside className="hidden lg:block w-60 fixed inset-y-0 left-0 z-30">{sidebar}</aside>
      <main className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <header className="h-14 flex items-center justify-between px-5 sticky top-0 z-20" style={{background:T.white,borderBottom:`1px solid ${T.border}`}}>
          <button onClick={()=>setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl" style={{color:T.gray}}><Menu size={22}/></button>
          <div className="flex-1"/>
          <button className="p-2 rounded-xl" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.gray}}><Bell size={18}/></button>
        </header>
        <div className="flex-1 overflow-y-auto" style={{background:T.bg}}>
          {bizId===null?(
            <div className="flex items-center justify-center h-64">
              <span className="size-8 border-2 rounded-full animate-spin" style={{borderColor:`${T.blue}30`,borderTopColor:T.blue}}/>
            </div>
          ):(
            <motion.div key={activeTab} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="pb-20">
              {activeTab==='dashboard' && <DashboardView bizId={bizId} setActiveTab={setActiveTab}/>}
              {activeTab==='team'      && <TeamView bizId={bizId}/>}
              {activeTab==='calendar'  && <TurnosView bizId={bizId}/>}
              {activeTab==='approvals' && <ApprovalsView bizId={bizId}/>}
              {activeTab==='payroll'   && <PayrollView bizId={bizId}/>}
              {activeTab==='reports'   && <ReportsView bizId={bizId}/>}
              {activeTab==='settings'  && <SettingsView bizId={bizId}/>}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardView({bizId,setActiveTab}:{bizId:string;setActiveTab:(t:string)=>void}) {
  const [loading,setLoading] = useState(true);
  const [weekPayroll,setWeekPayroll] = useState(0);
  const [pendingCount,setPendingCount] = useState(0);
  const [activeStaff,setActiveStaff] = useState(0);
  const [totalStaff,setTotalStaff] = useState(0);
  const [recentActivity,setRecentActivity] = useState<{name:string;initials:string;color:string;event:string;time:string;status:string}[]>([]);

  useEffect(()=>{
    (async()=>{
      const now=new Date(); const today=isoDate(now);
      const days=weekDays(now);
      const weekStart=isoDate(days[0]); const weekEnd=isoDate(days[6]);

      const [weekClockRes,pendingRes,empRes,todayShiftsRes]=await Promise.all([
        supabase.from('clock_entries').select('*,profiles(*)').eq('business_id',bizId)
          .gte('clock_in',`${weekStart}T00:00:00`).lte('clock_in',`${weekEnd}T23:59:59`),
        supabase.from('clock_entries').select('id').eq('business_id',bizId).eq('status','pending'),
        supabase.from('profiles').select('*').eq('business_id',bizId).eq('role','employee'),
        supabase.from('shifts').select('*,profiles(*)').eq('business_id',bizId).eq('date',today),
      ]);

      const weekClocks:ClockEntry[]=((weekClockRes.data??[]) as any[]).map(e=>({...e,employee:e.profiles}));
      const employees=(empRes.data??[]) as Employee[];
      const todayShifts=((todayShiftsRes.data??[]) as any[]).map(s=>({...s,employee:s.profiles}));

      // Weekly payroll
      const payroll=weekClocks.reduce((s,e)=>{
        if(!e.clock_out) return s;
        const h=diffHours(e.clock_in,e.clock_out);
        return s+h*((e.employee as Employee)?.hourly_rate??0);
      },0);
      setWeekPayroll(payroll);

      // Pending approvals
      setPendingCount(pendingRes.data?.length??0);

      // Staff
      const active=employees.filter(e=>e.status==='active');
      setActiveStaff(active.length);
      setTotalStaff(employees.length);

      // Recent activity — last 5 clock events today + shifts
      const todayClocks=weekClocks.filter(e=>isoDate(new Date(e.clock_in))===today);
      const activityRows:{name:string;initials:string;color:string;event:string;time:string;status:string}[]=[];

      for(const e of todayClocks.slice(0,5)){
        const emp=e.employee as Employee|undefined;
        const t=new Date(e.clock_in);
        const timeStr=t.toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'});
        const hasShift=todayShifts.find(s=>s.shift_id===e.id||s.employee_id===e.employee_id);
        let status='Pendiente';
        if(e.status==='approved'){status='Aprobado';}
        else if(e.status==='paid'){status='Procesado';}
        else if(!e.clock_out){
          const shiftStart=hasShift?new Date(hasShift.start_time):null;
          const diff=shiftStart?Math.round((t.getTime()-shiftStart.getTime())/60000):0;
          if(diff>10){status=`Tarde ${diff}m`;}
          else{status='A tiempo';}
        }
        const idx=employees.findIndex(x=>x.id===emp?.id);
        activityRows.push({
          name:empName(emp),
          initials:empInitials(emp),
          color:empColor(emp,idx>=0?idx:0),
          event:e.clock_out?'Salida · Turno':'Entrada · Turno',
          time:timeStr,
          status,
        });
      }
      setRecentActivity(activityRows);
      setLoading(false);
    })();
  },[bizId]);

  const statusStyle=(s:string)=>{
    if(s.startsWith('Tarde')) return {bg:T.redLt,fg:T.red};
    if(s==='A tiempo'||s==='Aprobado') return {bg:T.greenLt,fg:T.green};
    if(s==='Procesado') return {bg:T.blueLt,fg:T.blue};
    return {bg:T.amberLt,fg:T.amber};
  };

  const SB='#0f1f5c';

  return (
    <div className="p-5 lg:p-6 space-y-5 max-w-screen-xl">

      {/* Stat cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Payroll */}
        <div className="rounded-2xl p-5" style={CARD}>
          <div className="flex items-start justify-between mb-3">
            <p className="text-[11px] font-bold tracking-widest uppercase" style={{color:T.gray}}>Nómina Semanal</p>
            <div className="size-8 rounded-lg flex items-center justify-center" style={{background:'#EEF2FF'}}>
              <DollarSign size={15} color={T.indigo}/>
            </div>
          </div>
          {loading?<div className="h-8 rounded-lg animate-pulse mb-2" style={{background:T.grayLt}}/>:(
            <p className="text-3xl font-black mb-1" style={{color:T.black}}>${weekPayroll.toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
          )}
          <p className="text-[11px]" style={{color:T.grayMid}}>Total acumulado esta semana</p>
        </div>

        {/* Pending Approvals */}
        <div className="rounded-2xl p-5" style={{...CARD,border:`1px solid ${T.amber}40`}}>
          <div className="flex items-start justify-between mb-3">
            <p className="text-[11px] font-bold tracking-widest uppercase" style={{color:T.gray}}>Aprobaciones Pendientes</p>
            <div className="size-8 rounded-lg flex items-center justify-center" style={{background:T.amberLt}}>
              <ClipboardCheck size={15} color={T.amber}/>
            </div>
          </div>
          {loading?<div className="h-8 rounded-lg animate-pulse mb-2" style={{background:T.grayLt}}/>:(
            <p className="text-3xl font-black mb-1" style={{color:T.black}}>{pendingCount}</p>
          )}
          <button onClick={()=>setActiveTab('approvals')} className="text-[11px] font-semibold flex items-center gap-1" style={{color:T.amber,background:'none',border:'none',cursor:'pointer',padding:0}}>
            Requiere acción →
          </button>
        </div>

        {/* Active Staff */}
        <div className="rounded-2xl p-5" style={CARD}>
          <div className="flex items-start justify-between mb-3">
            <p className="text-[11px] font-bold tracking-widest uppercase" style={{color:T.gray}}>Personal Activo</p>
            <div className="size-8 rounded-lg flex items-center justify-center" style={{background:T.greenLt}}>
              <Users size={15} color={T.green}/>
            </div>
          </div>
          {loading?<div className="h-8 rounded-lg animate-pulse mb-2" style={{background:T.grayLt}}/>:(
            <p className="text-3xl font-black mb-2" style={{color:T.black}}>{activeStaff}<span className="text-base font-semibold" style={{color:T.grayMid}}>/{totalStaff}</span></p>
          )}
          <div className="h-2 rounded-full overflow-hidden" style={{background:T.grayLt}}>
            <div className="h-full rounded-full transition-all duration-700" style={{width:`${totalStaff>0?activeStaff/totalStaff*100:0}%`,background:T.green}}/>
          </div>
          <p className="text-[11px] mt-1.5" style={{color:T.grayMid}}>{totalStaff>0&&activeStaff===totalStaff?'Cobertura óptima':'Empleados activos'}</p>
        </div>
      </div>

      {/* Main row: Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={CARD}>
          <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:`1px solid ${T.border}`}}>
            <span className="text-[14px] font-bold" style={{color:T.black}}>Actividad Reciente</span>
            <button onClick={()=>setActiveTab('approvals')} className="text-[12px] font-semibold flex items-center gap-1" style={{color:T.blue,background:'none',border:'none',cursor:'pointer'}}>
              Ver historial →
            </button>
          </div>
          {loading?(
            <div className="p-5 space-y-3">{[0,1,2,3,4].map(i=><div key={i} className="h-12 rounded-xl animate-pulse" style={{background:T.grayLt}}/>)}</div>
          ):recentActivity.length===0?(
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <Clock size={32} color={T.grayMid}/>
              <p className="text-[13px]" style={{color:T.gray}}>Sin actividad hoy</p>
            </div>
          ):(
            <div>
              <div className="grid px-5 py-2.5" style={{gridTemplateColumns:'2fr 2fr 1fr 1fr',borderBottom:`1px solid ${T.border}`}}>
                {['Empleado','Evento','Hora','Estado'].map(h=>(
                  <span key={h} className="text-[11px] font-bold uppercase tracking-wide" style={{color:T.grayMid}}>{h}</span>
                ))}
              </div>
              {recentActivity.map((row,i)=>{
                const {bg,fg}=statusStyle(row.status);
                return(
                  <div key={i} className="grid items-center px-5 py-3" style={{gridTemplateColumns:'2fr 2fr 1fr 1fr',borderBottom:i<recentActivity.length-1?`1px solid ${T.bg}`:'none'}}>
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{background:row.color}}>{row.initials}</div>
                      <span className="text-[13px] font-semibold truncate" style={{color:T.black}}>{row.name}</span>
                    </div>
                    <span className="text-[12px]" style={{color:T.gray}}>{row.event}</span>
                    <span className="text-[12px] font-semibold" style={{color:T.black}}>{row.time}</span>
                    <span className="inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full w-fit" style={{background:bg,color:fg}}>{row.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="rounded-2xl p-5" style={{...CARD,background:SB}}>
            <p className="text-[13px] font-bold text-white mb-4">Acciones Rápidas</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {icon:Send,    label:'Publicar\nTurno',    tab:'calendar'},
                {icon:UserPlus,label:'Nuevo\nEmpleado',    tab:'team'},
                {icon:BarChart3,label:'Generar\nReporte',  tab:'reports'},
                {icon:RefreshCw,label:'Ver\nNómina',       tab:'payroll'},
              ].map(({icon:Icon,label,tab})=>(
                <button key={tab} onClick={()=>setActiveTab(tab)}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl py-4 transition-all hover:opacity-80"
                  style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.12)',cursor:'pointer'}}>
                  <div className="size-9 rounded-xl flex items-center justify-center" style={{background:'rgba(255,255,255,0.15)'}}>
                    <Icon size={16} color="white"/>
                  </div>
                  <span className="text-[11px] font-semibold text-white text-center leading-tight whitespace-pre-line">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Insight del Día */}
          <div className="rounded-2xl p-5" style={CARD}>
            <div className="flex items-center gap-2 mb-3">
              <div className="size-6 rounded-full flex items-center justify-center" style={{background:T.amberLt}}>
                <AlertTriangle size={12} color={T.amber}/>
              </div>
              <span className="text-[13px] font-bold" style={{color:T.black}}>Insight del Día</span>
            </div>
            <p className="text-[12px] leading-relaxed mb-4" style={{color:T.gray}}>
              {pendingCount>0
                ? <>Tienes <strong style={{color:T.black}}>{pendingCount} horas pendientes</strong> de aprobación. Revísalas para mantener la nómina al día.</>
                : activeStaff===0
                  ? <>No hay empleados activos hoy. Verifica tu personal en la sección <strong style={{color:T.black}}>Personal</strong>.</>
                  : <><strong style={{color:T.black}}>{activeStaff} empleado{activeStaff!==1?'s':''}</strong> activo{activeStaff!==1?'s':''} esta semana. Todo en orden.</>
              }
            </p>
            <button onClick={()=>setActiveTab(pendingCount>0?'approvals':'team')}
              className="w-full py-2.5 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80"
              style={{background:T.grayLt,color:T.black,border:`1px solid ${T.border}`,cursor:'pointer'}}>
              {pendingCount>0?'Revisar ahora':'Ver personal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TEAM ─────────────────────────────────────────────────────────────────────
function TeamView({bizId}:{bizId:string}) {
  const [employees,setEmployees] = useState<Employee[]>([]);
  const [search,setSearch] = useState('');
  const [filter,setFilter] = useState<'all'|'active'|'pending'|'inactive'>('all');
  const [loading,setLoading] = useState(true);
  const [showModal,setShowModal] = useState(false);
  const [editEmp,setEditEmp] = useState<Employee|null>(null);
  const [confirmDeleteId,setConfirmDeleteId] = useState<string|null>(null);
  const [inviting,setInviting] = useState(false);
  const [form,setForm] = useState({name:'',last_name:'',email:'',phone:'',job_title:'',hourly_rate:'',employee_color:EMP_COLORS[0]});

  const load=useCallback(async()=>{
    setLoading(true);
    const{data}=await supabase.from('profiles').select('*').eq('business_id',bizId).eq('role','employee').order('name');
    setEmployees((data??[]) as Employee[]);
    setLoading(false);
  },[bizId]);
  useEffect(()=>{load();},[load]);

  const openAdd=()=>{ setEditEmp(null); setForm({name:'',last_name:'',email:'',phone:'',job_title:'',hourly_rate:'',employee_color:EMP_COLORS[0]}); setShowModal(true); };
  const openEdit=(emp:Employee)=>{ setEditEmp(emp); setForm({name:emp.name,last_name:emp.last_name??'',email:emp.email??'',phone:emp.phone??'',job_title:emp.job_title??'',hourly_rate:String(emp.hourly_rate??''),employee_color:emp.employee_color||EMP_COLORS[0]}); setShowModal(true); };

  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault(); setInviting(true);
    try {
      if(editEmp){await supabase.from('profiles').update({name:form.name,last_name:form.last_name,phone:form.phone,job_title:form.job_title,hourly_rate:parseFloat(form.hourly_rate),employee_color:form.employee_color}).eq('id',editEmp.id);}
      else{const{data:{session}}=await supabase.auth.getSession();await fetch('https://ctdxqijdmpigqgktlwxb.supabase.co/functions/v1/invite-employee',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session?.access_token}`},body:JSON.stringify({name:form.name,last_name:form.last_name,email:form.email,phone:form.phone,job_title:form.job_title,hourly_rate:parseFloat(form.hourly_rate),employee_color:form.employee_color})});}
      setShowModal(false); await load();
    } finally{setInviting(false);}
  };

  const handleToggle=async(emp:Employee)=>{
    const ns=emp.status==='active'?'inactive':'active';
    await supabase.from('profiles').update({status:ns}).eq('id',emp.id);
    setEmployees(prev=>prev.map(e=>e.id===emp.id?{...e,status:ns}:e));
  };
  const handleDelete=async(id:string)=>{
    await supabase.from('profiles').delete().eq('id',id);
    setEmployees(prev=>prev.filter(e=>e.id!==id));
    setConfirmDeleteId(null);
  };

  const counts={all:employees.length,active:employees.filter(e=>e.status==='active').length,pending:employees.filter(e=>e.status==='pending').length,inactive:employees.filter(e=>e.status!=='active'&&e.status!=='pending').length};
  const filtered=employees.filter(e=>{
    if(filter!=='all'&&e.status!==filter)return false;
    const q=search.toLowerCase();
    return empName(e).toLowerCase().includes(q)||(e.job_title?.toLowerCase()??'').includes(q);
  });

  return (
    <div>
      {/* Header */}
      <div className="px-6 pt-6 pb-4" style={{background:T.white,borderBottom:`1px solid ${T.border}`}}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold" style={{color:T.black}}>Personal</h1>
            <p className="text-xs mt-0.5" style={{color:T.gray}}>{employees.length} miembro{employees.length!==1?'s':''} en el equipo</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="size-10 rounded-xl flex items-center justify-center" style={{background:T.bg,border:`1px solid ${T.border}`}}><RefreshCw size={16} color={T.gray}/></button>
            <button onClick={openAdd} className="h-10 px-4 rounded-xl flex items-center gap-2 text-[13px] font-bold text-white" style={{background:T.green}}><UserPlus size={15}/> Invitar empleado</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} color={T.grayMid}/>
            <input type="text" placeholder="Buscar miembro…" value={search} onChange={e=>setSearch(e.target.value)} className="w-full h-9 pl-9 pr-3 rounded-xl text-[13px]" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}/>
          </div>
          <div className="flex gap-1">
            {(['all','active','pending','inactive'] as const).map(f=>{
              const labels={all:'Todos',active:'Activos',pending:'Pendientes',inactive:'Inactivos'};
              const fgMap={all:T.blue,active:T.green,pending:T.amber,inactive:T.grayMid};
              const sel=filter===f;
              return(
                <button key={f} onClick={()=>setFilter(f)} className="h-9 px-3 rounded-xl text-[12px] font-semibold transition-all" style={{background:sel?T.black:'transparent',color:sel?T.white:T.gray,border:`1px solid ${sel?T.black:T.border}`}}>
                  {labels[f]} <span style={{color:sel?'rgba(255,255,255,0.55)':fgMap[f]}}>({counts[f]})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        {loading?(
          <div className="rounded-2xl overflow-hidden" style={CARD}>
            {Array.from({length:4}).map((_,i)=>(
              <div key={i} className="flex items-center gap-4 px-5 py-4" style={{borderBottom:`1px solid ${T.border}`}}>
                <div className="size-10 rounded-full animate-pulse" style={{background:T.grayLt}}/>
                <div className="flex-1 space-y-2"><div className="h-3 w-36 rounded animate-pulse" style={{background:T.grayLt}}/><div className="h-2.5 w-24 rounded animate-pulse" style={{background:T.grayLt}}/></div>
                <div className="h-3 w-20 rounded animate-pulse" style={{background:T.grayLt}}/>
                <div className="h-3 w-14 rounded animate-pulse" style={{background:T.grayLt}}/>
                <div className="h-6 w-20 rounded-full animate-pulse" style={{background:T.grayLt}}/>
              </div>
            ))}
          </div>
        ):filtered.length===0?(
          <div className="rounded-2xl py-16 flex flex-col items-center" style={CARD}>
            <div className="size-14 rounded-2xl flex items-center justify-center mb-3" style={{background:T.blueLt}}><Users size={28} color={T.blue}/></div>
            <p className="text-[14px] font-bold" style={{color:T.black}}>Sin empleados</p>
            <p className="text-xs mt-1" style={{color:T.gray}}>{search?'Intenta otra búsqueda':'Invita a tu primer empleado'}</p>
          </div>
        ):(
          <div className="rounded-2xl overflow-hidden" style={CARD}>
            {/* Table header */}
            <div className="grid px-5 py-3" style={{gridTemplateColumns:'2.5fr 1.5fr 1.2fr 1fr 1fr auto',background:T.bg,borderBottom:`1px solid ${T.border}`}}>
              {['Empleado','Puesto','Contacto','Salario/hr','Estado',''].map((h,i)=>(
                <span key={i} className="text-[11px] font-bold uppercase tracking-wide" style={{color:T.grayMid}}>{h}</span>
              ))}
            </div>
            {/* Rows */}
            {filtered.map((emp,i)=>{
              const color=empColor(emp,i);
              return(
                <motion.div key={emp.id} layout initial={{opacity:0}} animate={{opacity:emp.status==='inactive'?0.5:1}} className="group grid px-5 py-3.5 items-center transition-colors hover:bg-[#FAFAFA]" style={{gridTemplateColumns:'2.5fr 1.5fr 1.2fr 1fr 1fr auto',borderBottom:i<filtered.length-1?`1px solid ${T.border}`:'none'}}>
                  {/* Employee */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0" style={{background:color}}>{empInitials(emp)}</div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate leading-tight" style={{color:T.black}}>{empName(emp)}</p>
                      <p className="text-[11px] truncate" style={{color:T.grayMid}}>{emp.email}</p>
                    </div>
                  </div>
                  {/* Puesto */}
                  <div>{emp.job_title?<span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{background:`${color}18`,color}}>{emp.job_title}</span>:<span className="text-[11px]" style={{color:T.grayMid}}>—</span>}</div>
                  {/* Contacto */}
                  <p className="text-[12px] truncate" style={{color:T.gray}}>{emp.phone||'—'}</p>
                  {/* Salario */}
                  <p className="text-[13px] font-semibold" style={{color:T.black}}>{emp.hourly_rate?`$${Number(emp.hourly_rate).toFixed(2)}/hr`:'—'}</p>
                  {/* Estado */}
                  <div><StatusChip status={emp.status}/></div>
                  {/* Acciones — visibles en hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {emp.status==='pending'&&<button onClick={async()=>{const{data:{session}}=await supabase.auth.getSession();await fetch('https://ctdxqijdmpigqgktlwxb.supabase.co/functions/v1/invite-employee',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session?.access_token}`},body:JSON.stringify({employee_id:emp.id})});}} title="Reenviar invitación" className="size-8 rounded-xl flex items-center justify-center" style={{background:T.blueLt,color:T.blue}}><Send size={13}/></button>}
                    {emp.status==='active'&&<button onClick={()=>handleToggle(emp)} title="Desactivar" className="size-8 rounded-xl flex items-center justify-center" style={{background:T.amberLt,color:T.amber}}><MinusCircle size={13}/></button>}
                    {emp.status==='inactive'&&<button onClick={()=>handleToggle(emp)} title="Activar" className="size-8 rounded-xl flex items-center justify-center" style={{background:T.greenLt,color:T.green}}><CheckCircle2 size={13}/></button>}
                    <button onClick={()=>openEdit(emp)} title="Editar" className="size-8 rounded-xl flex items-center justify-center" style={{background:T.indigoLt,color:T.indigo}}><Pencil size={13}/></button>
                    <button onClick={()=>setConfirmDeleteId(emp.id)} title="Eliminar" className="size-8 rounded-xl flex items-center justify-center" style={{background:T.redLt,color:T.red}}><Trash2 size={13}/></button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal&&(
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{background:'#00000066'}}>
            <motion.div initial={{y:80,opacity:0}} animate={{y:0,opacity:1}} exit={{y:80,opacity:0}} transition={{type:'spring',damping:28,stiffness:300}} className="w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden" style={{background:T.white}}>
              <div className="p-6 overflow-y-auto max-h-[90vh]">
                <div className="w-10 h-1 rounded-full mx-auto mb-4 sm:hidden" style={{background:T.border}}/>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-black" style={{color:T.black}}>{editEmp?'Editar Empleado':'Añadir Empleado'}</h2>
                  <button onClick={()=>setShowModal(false)} className="p-2 rounded-xl" style={{color:T.gray}}><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {([['name','Nombre'],['last_name','Apellido']] as const).map(([f,label])=>(
                      <div key={f}><label className="text-xs font-bold block mb-1" style={{color:T.black}}>{label}</label>
                      <input required type="text" value={form[f as keyof typeof form] as string} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} className="w-full h-11 rounded-xl px-3 text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}/></div>
                    ))}
                  </div>
                  {!editEmp&&<div><label className="text-xs font-bold block mb-1" style={{color:T.black}}>Correo electrónico</label><input required type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} className="w-full h-11 rounded-xl px-3 text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}/></div>}
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold block mb-1" style={{color:T.black}}>Teléfono</label><input type="tel" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="787-000-0000" className="w-full h-11 rounded-xl px-3 text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}/></div>
                    <div><label className="text-xs font-bold block mb-1" style={{color:T.black}}>Pago/hr ($)</label><input required type="number" step="0.01" value={form.hourly_rate} onChange={e=>setForm(p=>({...p,hourly_rate:e.target.value}))} className="w-full h-11 rounded-xl px-3 text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}/></div>
                  </div>
                  <div><label className="text-xs font-bold block mb-1" style={{color:T.black}}>Puesto</label>
                  <select value={form.job_title} onChange={e=>setForm(p=>({...p,job_title:e.target.value}))} className="w-full h-11 rounded-xl px-3 text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}>
                    <option value="">Selecciona un puesto</option>{JOB_TITLES.map(j=><option key={j} value={j}>{j}</option>)}
                  </select></div>
                  <div><label className="text-xs font-bold block mb-2" style={{color:T.black}}>Color del empleado</label>
                  <div className="flex flex-wrap gap-2">{EMP_COLORS.map(c=><button key={c} type="button" onClick={()=>setForm(p=>({...p,employee_color:c}))} className="size-9 rounded-full flex items-center justify-center transition-transform active:scale-90" style={{background:c,border:form.employee_color===c?`3px solid ${T.black}`:'3px solid transparent',boxShadow:form.employee_color===c?`0 0 0 2px white,0 0 0 4px ${c}40`:'none'}}>{form.employee_color===c&&<span className="text-white text-xs font-bold">✓</span>}</button>)}</div></div>
                  <button type="submit" disabled={inviting} className="w-full h-12 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2" style={{background:T.black,opacity:inviting?0.6:1}}>
                    {inviting?<span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:editEmp?<><Pencil size={16}/>Guardar cambios</>:<><Send size={16}/>Enviar invitación</>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDeleteId&&(()=>{const emp=employees.find(e=>e.id===confirmDeleteId);return(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" style={{background:'#00000066'}} onClick={()=>setConfirmDeleteId(null)}>
            <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}} className="w-full max-w-sm rounded-3xl overflow-hidden" style={{background:T.white}} onClick={e=>e.stopPropagation()}>
              <div className="px-5 py-4 flex items-center gap-3" style={{background:T.red}}><Trash2 size={20} color="white"/><span className="text-white font-bold text-[15px]">{empName(emp)}</span></div>
              <div className="p-5 space-y-3">
                <div className="p-3 rounded-xl flex items-start gap-2" style={{background:T.greenLt}}><CheckCircle2 size={16} color={T.green} className="shrink-0 mt-0.5"/><p className="text-xs" style={{color:T.green}}>El historial de nómina se conserva.</p></div>
                <div className="p-3 rounded-xl flex items-start gap-2" style={{background:T.redLt}}><AlertTriangle size={16} color={T.red} className="shrink-0 mt-0.5"/><p className="text-xs" style={{color:T.red}}>Este empleado perderá acceso de inmediato.</p></div>
                <div className="flex gap-3 pt-2">
                  <button onClick={()=>setConfirmDeleteId(null)} className="flex-1 h-12 rounded-2xl text-sm font-semibold" style={{background:T.grayLt,color:T.black}}>Cancelar</button>
                  <button onClick={()=>handleDelete(confirmDeleteId!)} className="flex-1 h-12 rounded-2xl text-sm font-bold text-white" style={{background:T.red}}>Eliminar</button>
                </div>
              </div>
            </motion.div>
          </div>
        );})()}
      </AnimatePresence>
    </div>
  );
}

// ─── TURNOS (Timeline) ────────────────────────────────────────────────────────
function TurnosView({bizId}:{bizId:string}) {
  const [employees,setEmployees] = useState<Employee[]>([]);
  const [shifts,setShifts] = useState<Shift[]>([]);
  const [weekAnchor,setWeekAnchor] = useState(new Date());
  const [selectedDate,setSelectedDate] = useState(isoDate(new Date()));
  const [showModal,setShowModal] = useState(false);
  const [editShift,setEditShift] = useState<Shift|null>(null);
  const [form,setForm] = useState({employee_id:'',date:isoDate(new Date()),start_time:'09:00',end_time:'17:00',status:'draft',break_minutes:0});
  const [showBulkModal,setShowBulkModal] = useState(false);
  const [bulkEmps,setBulkEmps] = useState<string[]>([]);
  const [bulkDays,setBulkDays] = useState<number[]>([0,1,2,3,4]);
  const [bulkTime,setBulkTime] = useState({start:'09:00',end:'17:00',break_minutes:0});
  const [bulkSaving,setBulkSaving] = useState(false);
  const [nowTick,setNowTick] = useState(new Date());
  const [liveEntries,setLiveEntries] = useState<any[]>([]);
  const [queueEntries,setQueueEntries] = useState<any[]>([]);
  const [calTab,setCalTab] = useState<'turnos'|'envivo'>('turnos');
  const [queueTab,setQueueTab] = useState<'active'|'rejected'>('active');
  useEffect(()=>{const t=setInterval(()=>setNowTick(new Date()),60000);return()=>clearInterval(t);},[]);

  const days=weekDays(weekAnchor);

  const load=useCallback(async()=>{
    const[empRes,shiftRes,liveRes,queueRes]=await Promise.all([
      supabase.from('profiles').select('*').eq('business_id',bizId).eq('role','employee').eq('status','active'),
      supabase.from('shifts').select('*,profiles(*)').eq('business_id',bizId).gte('date',isoDate(days[0])).lte('date',isoDate(days[6])).order('start_time'),
      supabase.from('clock_entries').select('*,profiles(*)').eq('business_id',bizId).is('clock_out',null),
      supabase.from('clock_entries').select('*,profiles(*)').eq('business_id',bizId).not('clock_out','is',null).order('clock_in',{ascending:false}).limit(50),
    ]);
    setEmployees((empRes.data??[]) as Employee[]);
    setShifts(((shiftRes.data??[]) as any[]).map(s=>({...s,employee:s.profiles})));
    setLiveEntries(((liveRes.data??[]) as any[]).map(e=>({...e,employee:e.profiles})));
    setQueueEntries(((queueRes.data??[]) as any[]).map(e=>({...e,employee:e.profiles})));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[bizId,isoDate(days[0])]);
  useEffect(()=>{load();},[load]);

  const openAdd=(date:string,empId?:string)=>{ setEditShift(null); setForm({employee_id:empId??'',date,start_time:'09:00',end_time:'17:00',status:'draft',break_minutes:0}); setShowModal(true); };
  const openEdit=(s:Shift)=>{
    setEditShift(s);
    const et=(dt:string)=>{const d=new Date(dt.replace(/\+00(:\d{2})?$/,'').replace(' ','T'));return`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;};
    setForm({employee_id:s.employee_id,date:s.date,start_time:et(s.start_time),end_time:et(s.end_time),status:s.status,break_minutes:s.break_minutes??0});
    setShowModal(true);
  };
  const handleSave=async(e:React.FormEvent)=>{
    e.preventDefault();
    const p={business_id:bizId,employee_id:form.employee_id,date:form.date,start_time:`${form.date}T${form.start_time}:00`,end_time:`${form.date}T${form.end_time}:00`,status:form.status,break_minutes:form.break_minutes};
    if(editShift)await supabase.from('shifts').update(p).eq('id',editShift.id);
    else await supabase.from('shifts').insert(p);
    setShowModal(false);await load();
  };
  const handleDelete=async(id:string)=>{ if(!confirm('¿Eliminar turno?'))return; await supabase.from('shifts').delete().eq('id',id); setShowModal(false);await load(); };
  const handlePublishAll=async()=>{ const drafts=shifts.filter(s=>s.status==='draft').map(s=>s.id); if(!drafts.length)return; await supabase.from('shifts').update({status:'published'}).in('id',drafts);await load(); };


  const handleBulkCreate=async()=>{
    if(!bulkEmps.length||!bulkDays.length)return;
    setBulkSaving(true);
    const rows=bulkEmps.flatMap(empId=>bulkDays.map(di=>{
      const dateStr=isoDate(days[di]);
      return{business_id:bizId,employee_id:empId,date:dateStr,
        start_time:`${dateStr}T${bulkTime.start}:00`,end_time:`${dateStr}T${bulkTime.end}:00`,
        status:'draft' as const,break_minutes:bulkTime.break_minutes};
    }));
    await supabase.from('shifts').insert(rows);
    setBulkSaving(false);setShowBulkModal(false);setBulkEmps([]);setBulkDays([0,1,2,3,4]);await load();
  };

  const draftsCount=shifts.filter(s=>s.status==='draft').length;

  const SB2='#0f1f5c';
  const shiftStatus=(s:Shift)=>{
    const live=liveEntries.some(e=>e.shift_id===s.id);
    if(live) return{label:'En Curso',bg:'#FFF3E0',fg:'#E65100',dot:'#FF6D00'};
    if(s.status==='draft') return{label:'Pendiente',bg:T.amberLt,fg:T.amber,dot:T.amber};
    return{label:'Publicado',bg:T.greenLt,fg:T.green,dot:T.green};
  };

  return (
    <div className="space-y-5 max-w-screen-xl">

      {/* Sticky sub-header */}
      <div className="sticky top-14 z-10 px-5 lg:px-6 py-3" style={{background:T.white,borderBottom:`1px solid ${T.border}`}}>
        {/* Row 1: title + tabs + crear turno */}
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <h1 className="text-[17px] font-black leading-tight" style={{color:T.black}}>Turnos</h1>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex rounded-2xl overflow-hidden" style={{border:`1px solid ${T.border}`,background:T.bg}}>
              <button onClick={()=>setCalTab('turnos')} className="h-9 px-8 text-[13px] font-bold flex items-center gap-2 transition-all" style={{background:calTab==='turnos'?'#2563EB':'transparent',color:calTab==='turnos'?'#fff':T.gray}}>
                <CalendarIcon size={14}/> Turnos
              </button>
              <button onClick={()=>setCalTab('envivo')} className="h-9 px-8 text-[13px] font-bold flex items-center gap-2 transition-all" style={{background:calTab==='envivo'?'#DC2626':'transparent',color:calTab==='envivo'?'#fff':T.gray}}>
                {liveEntries.length>0&&<span className="relative flex size-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"/><span className="relative inline-flex rounded-full size-2 bg-red-500"/></span>}
                En Vivo{liveEntries.length>0?` (${liveEntries.length})`:''}
              </button>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {draftsCount>0&&(
              <button onClick={handlePublishAll} className="h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-white" style={{background:T.amber}}>
                <CheckCircle2 size={13}/> Publicar {draftsCount}
              </button>
            )}
            <button onClick={()=>openAdd(selectedDate)} className="h-9 px-4 rounded-xl flex items-center gap-1.5 text-sm font-semibold text-white" style={{background:SB2}}>
              <Plus size={14}/> Crear turno
            </button>
          </div>
        </div>
        {/* Row 2: date nav */}
        <div className="flex items-center gap-2 mt-2.5">
          <div className="px-4 py-1.5 rounded-xl text-[14px] font-bold" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black}}>
            {days[0].toLocaleDateString('es-PR',{day:'numeric',month:'short'})} – {days[6].toLocaleDateString('es-PR',{day:'numeric',month:'short',year:'numeric'})}
          </div>
          <button onClick={()=>setWeekAnchor(d=>{const n=new Date(d);n.setDate(n.getDate()-7);return n;})} className="size-8 rounded-xl flex items-center justify-center" style={{background:SB2}}><ChevronLeft size={14} color="#fff"/></button>
          <button onClick={()=>setWeekAnchor(d=>{const n=new Date(d);n.setDate(n.getDate()+7);return n;})} className="size-8 rounded-xl flex items-center justify-center" style={{background:SB2}}><ChevronRight size={14} color="#fff"/></button>
        </div>
      </div>

      <div className="px-5 lg:px-6 space-y-5">

      {/* En Vivo tab content */}
      {calTab==='envivo'&&(
        <div className="rounded-2xl p-5" style={{background:'#FFF5F5',border:'1px solid #FECACA',minHeight:200}}>
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex size-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"/><span className="relative inline-flex rounded-full size-3 bg-red-500"/></span>
            <span className="text-[15px] font-bold" style={{color:'#DC2626'}}>Trabajando Ahora — {liveEntries.length} activo{liveEntries.length!==1?'s':''}</span>
          </div>
          {liveEntries.length===0?(
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <CheckCircle2 size={36} color="#FCA5A5"/>
              <p className="text-[13px] font-semibold" style={{color:'#EF4444'}}>Ningún empleado está trabajando ahora</p>
            </div>
          ):(
            <div className="grid gap-3" style={{gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))'}}>
              {liveEntries.map(e=>{
                const ci=new Date(e.clock_in.replace(/\+00(:\d{2})?$/,'').replace(' ','T'));
                const elMin=Math.floor((nowTick.getTime()-ci.getTime())/60000);
                const emp=e.employee; const color=emp?empColor(emp,0):'#6B7280';
                return(
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{background:'#fff',border:'1px solid #FECACA'}}>
                    <div className="size-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{background:color}}>{empInitials(emp)}</div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold truncate" style={{color:'#111'}}>{empName(emp)}</p>
                      <p className="text-[11px]" style={{color:T.grayMid}}>Entró {ci.toLocaleTimeString('es-PR',{hour:'numeric',minute:'2-digit',hour12:true})}</p>
                      <p className="text-[11px] font-bold" style={{color:'#16A34A'}}>{Math.floor(elMin/60)>0?`${Math.floor(elMin/60)}h `:''}${elMin%60}m trabajando</p>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-1 rounded-full ml-auto shrink-0" style={{background:'#DC2626',color:'#fff'}}>LIVE</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Turnos tab content */}
      {calTab==='turnos'&&<>

      {/* Weekly columns grid */}
      <div className="rounded-2xl overflow-hidden" style={{...CARD,padding:0}}>
        {/* Day headers */}
        <div className="grid" style={{gridTemplateColumns:`repeat(7,1fr)`,borderBottom:`1px solid ${T.border}`}}>
          {days.map(d=>{
            const iso=isoDate(d);
            const isSel=iso===selectedDate;
            const isToday=iso===isoDate(new Date());
            const count=shifts.filter(s=>s.date===iso).length;
            return(
              <div key={iso} className="flex flex-col items-center py-3 gap-0.5 cursor-pointer transition-all"
                style={{borderRight:`1px solid ${T.border}`,background:isSel?T.black:'transparent',borderRadius:isSel?'12px':'0'}}
                onClick={()=>setSelectedDate(iso)}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{color:isSel?'rgba(255,255,255,0.55)':T.grayMid}}>{DAY_ES[d.getDay()]}</span>
                <div className="size-8 rounded-full flex items-center justify-center" style={{background:isSel?'rgba(255,255,255,0.18)':isToday?SB2:'transparent'}}>
                  <span className="text-[15px] font-black" style={{color:isSel?'#fff':isToday?'#fff':T.black}}>{d.getDate()}</span>
                </div>
                {count>0&&<span className="text-[10px] font-semibold" style={{color:isSel?'rgba(255,255,255,0.7)':T.green}}>{count} turno{count!==1?'s':''}</span>}
              </div>
            );
          })}
        </div>

      </div>

      {/* Resumen horas asignadas */}
      {(()=>{
        const dayShifts=shifts.filter(s=>s.date===selectedDate);
        if(dayShifts.length===0) return null;
        let totalMins=0,totalBreak=0;
        dayShifts.forEach(s=>{
          if(s.start_time&&s.end_time){
            const st=new Date(s.start_time.replace(/\+00(:\d{2})?$/,'').replace(' ','T'));
            const et=new Date(s.end_time.replace(/\+00(:\d{2})?$/,'').replace(' ','T'));
            let diff=et.getTime()-st.getTime();
            if(diff<0) diff+=24*3600*1000;
            totalMins+=Math.round(diff/60000);
            totalBreak+=(s.break_minutes??0);
          }
        });
        const netMins=totalMins-totalBreak;
        const fmt=(m:number)=>`${Math.floor(m/60)}h${m%60>0?' '+m%60+'m':''}`;
        return(
          <div className="flex items-center gap-4 px-4 py-3 rounded-2xl" style={{background:T.greenLt,border:`1px solid ${T.green}30`}}>
            <div className="flex items-center gap-1.5">
              <Clock size={14} color={T.green}/>
              <span className="text-[12px] font-bold" style={{color:T.green}}>Total asignado: {fmt(netMins)}</span>
            </div>
            {totalBreak>0&&(
              <span className="text-[12px]" style={{color:T.green}}>· Break: {fmt(totalBreak)}</span>
            )}
            <span className="text-[12px]" style={{color:T.green}}>· {dayShifts.length} turno{dayShifts.length!==1?'s':''}</span>
          </div>
        );
      })()}

      {/* Timeline diario por empleado */}
      {(()=>{
        const dayShifts=shifts.filter(s=>s.date===selectedDate);
        const EMP_COL=200; const HOUR_W=80; // px per hour
        const parseH=(dt:string)=>{const d=new Date(dt.replace(/\+00(:\d{2})?$/,'').replace(' ','T'));return d.getHours()+d.getMinutes()/60;};
        const fmtTime=(dt:string)=>{const d=new Date(dt.replace(/\+00(:\d{2})?$/,'').replace(' ','T'));const h=d.getHours();const m=d.getMinutes();const hh=h===0?12:h>12?h-12:h;const ap=h<12?'am':'pm';return m>0?`${hh}:${String(m).padStart(2,'0')}${ap}`:`${hh}${ap}`;};
        const fmtHLabel=(h:number)=>{const hh=h%24;const ap=hh<12?'am':'pm';const d=hh===0?12:hh>12?hh-12:hh;return`${d}${ap}`;};
        // Fixed range: 8am–midnight (or expand if needed)
        let minH=8,maxH=24;
        dayShifts.forEach(s=>{
          if(s.start_time){const h=Math.floor(parseH(s.start_time));minH=Math.min(minH,h);}
          if(s.end_time){const h=parseH(s.end_time);maxH=Math.max(maxH,h<=4?h+24:h);}
        });
        minH=Math.max(0,minH-1); maxH=Math.min(32,Math.ceil(maxH)+1);
        const hours=Array.from({length:maxH-minH},(_,i)=>minH+i);
        const totalW=hours.length*HOUR_W;
        // Group by employee
        const byEmp:Record<string,typeof dayShifts>={};
        dayShifts.forEach(s=>{(byEmp[s.employee_id]||(byEmp[s.employee_id]=[])).push(s);});
        // All employees (including those with no shift today)
        const allEmps=employees;
        return(
          <div className="rounded-2xl overflow-hidden" style={CARD}>
            {/* Title */}
            <div className="px-5 py-4 flex items-center justify-between" style={{borderBottom:`1px solid ${T.border}`}}>
              <p className="text-[14px] font-bold" style={{color:T.black}}>Vista de Turnos</p>
              <span className="text-[12px]" style={{color:T.grayMid}}>Miembros del equipo ({allEmps.length})</span>
            </div>
            {/* Scrollable area */}
            <div style={{overflowX:'auto'}}>
              <div style={{minWidth:EMP_COL+totalW}}>
                {/* Hour header */}
                <div className="flex sticky top-0 z-10" style={{background:T.bg,borderBottom:`1px solid ${T.border}`}}>
                  <div style={{width:EMP_COL,minWidth:EMP_COL,borderRight:`1px solid ${T.border}`,height:36}}/>
                  <div className="relative" style={{width:totalW,height:36}}>
                    {hours.map(h=>(
                      <div key={h} className="absolute top-0 bottom-0 flex items-center justify-center" style={{left:((h-minH)*HOUR_W),width:HOUR_W,borderRight:`1px solid ${T.border}`}}>
                        <span className="text-[11px] font-semibold" style={{color:T.grayMid}}>{fmtHLabel(h)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Employee rows */}
                {allEmps.map((emp,ei)=>{
                  const empShifts=byEmp[emp.id]??[];
                  const color=empColor(emp,ei);
                  let totalM=0;
                  empShifts.forEach(s=>{
                    if(s.start_time&&s.end_time){
                      const sh=parseH(s.start_time),eh=parseH(s.end_time);
                      const diff=((eh<=sh?eh+24:eh)-sh)*60-(s.break_minutes??0);
                      if(diff>0) totalM+=diff;
                    }
                  });
                  const hrsStr=totalM>0?`${Math.floor(totalM/60)}h${totalM%60>0?' '+totalM%60+'m':''}  hrs`:'0 hrs';
                  return(
                    <div key={emp.id} className="flex" style={{borderBottom:`1px solid ${T.border}`,minHeight:64}}>
                      {/* Employee info */}
                      <div className="flex items-center gap-2.5 px-4 shrink-0" style={{width:EMP_COL,minWidth:EMP_COL,borderRight:`1px solid ${T.border}`}}>
                        <div className="size-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{background:color}}>{empInitials(emp)}</div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-bold truncate" style={{color:T.black}}>{empName(emp)}</p>
                          <p className="text-[10px]" style={{color:T.grayMid}}>{hrsStr}</p>
                        </div>
                      </div>
                      {/* Grid + shift bars */}
                      <div className="relative" style={{width:totalW,minHeight:64}}>
                        {/* Hour grid lines */}
                        {hours.map(h=>(
                          <div key={h} className="absolute top-0 bottom-0" style={{left:(h-minH)*HOUR_W,width:HOUR_W,borderRight:`1px solid ${T.border}`,background:h%2===0?'transparent':'rgba(0,0,0,0.01)'}}/>
                        ))}
                        {/* Shift bars */}
                        {empShifts.map(s=>{
                          if(!s.start_time||!s.end_time) return null;
                          const sh=parseH(s.start_time);
                          let eh=parseH(s.end_time); if(eh<=sh) eh+=24;
                          const left=(sh-minH)*HOUR_W; const width=(eh-sh)*HOUR_W;
                          const st=shiftStatus(s);
                          const role=emp.job_title??'';
                          return(
                            <div key={s.id} onClick={()=>openEdit(s)} className="absolute rounded-xl cursor-pointer overflow-hidden flex flex-col justify-center px-3"
                              style={{left,width:width-4,top:8,bottom:8,background:st.dot}}>
                              <p className="text-[11px] font-bold text-white truncate">{fmtTime(s.start_time)}–{fmtTime(s.end_time)}</p>
                              <p className="text-[10px] text-white truncate" style={{opacity:0.85}}>{role||'Sin puesto'}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Cola de Aprobaciones */}
      <div className="rounded-2xl overflow-hidden" style={CARD}>
        <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:`1px solid ${T.border}`}}>
          <p className="text-[14px] font-bold" style={{color:T.black}}>Cola de Aprobaciones</p>
          <div className="flex gap-1 p-1 rounded-xl" style={{background:T.bg,border:`1px solid ${T.border}`}}>
            <button onClick={()=>setQueueTab('active')} className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all" style={{background:queueTab==='active'?T.green:'transparent',color:queueTab==='active'?'#fff':T.gray}}>
              Activos/Pendientes
            </button>
            <button onClick={()=>setQueueTab('rejected')} className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all" style={{background:queueTab==='rejected'?T.red:'transparent',color:queueTab==='rejected'?'#fff':T.gray}}>
              Rechazados
            </button>
          </div>
        </div>
        <div>
          <div className="grid px-5 py-2.5" style={{gridTemplateColumns:'2fr 2fr 1.5fr 1.2fr 1fr',borderBottom:`1px solid ${T.border}`,background:T.bg}}>
            {['Empleado','Fecha y Hora','Posición','Estado','Acciones'].map(h=>(
              <span key={h} className="text-[11px] font-bold uppercase tracking-wide" style={{color:T.grayMid}}>{h}</span>
            ))}
          </div>
          {(()=>{
            const forDay=(e:any)=>{
              try{
                // Parse clock_in as UTC, then get local calendar date
                const raw=(e.clock_in??'').replace(/\+00(:\d{2})?$/,'+00:00').replace(' ','T');
                const d=new Date(raw);
                const localDate=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                return localDate===selectedDate;
              }catch{return false;}
            };
            const activeList=[
              ...liveEntries.filter(forDay).map((e:any)=>({...e,_live:true})),
              ...queueEntries.filter(e=>forDay(e)&&(e.status==='pending'||e.status==='approved'||e.status==='paid')),
            ];
            const rejectedList=queueEntries.filter(e=>forDay(e)&&e.status==='rejected');
            const list=queueTab==='active'?activeList:rejectedList;
            if(list.length===0) return(
              <div className="py-12 flex flex-col items-center gap-2">
                <CheckCircle2 size={32} color={T.green}/>
                <p className="text-[13px] font-semibold" style={{color:T.gray}}>{queueTab==='active'?'Sin marcaciones activas o pendientes':'Sin marcaciones rechazadas'}</p>
              </div>
            );
            return list.map((e,i)=>{
              const isLive=(e as any)._live===true;
              const emp=e.employee;
              const color=emp?empColor(emp,i):'#6B7280';
              const ci=new Date(e.clock_in.replace(/\+00(:\d{2})?$/,'').replace(' ','T'));
              const co=e.clock_out?new Date(e.clock_out.replace(/\+00(:\d{2})?$/,'').replace(' ','T')):null;
              const statusInfo=isLive
                ?{bg:'#FEF3C7',fg:'#D97706',label:'ACTIVO'}
                :e.status==='approved'||e.status==='paid'
                  ?{bg:T.greenLt,fg:T.green,label:'PUBLICADO'}
                  :e.status==='rejected'
                    ?{bg:T.redLt,fg:T.red,label:'RECHAZADO'}
                    :{bg:'#FFF3E0',fg:'#E65100',label:'APROBACIÓN REQ.'};
              return(
                <div key={e.id} className="grid items-center px-5 py-3" style={{gridTemplateColumns:'2fr 2fr 1.5fr 1.2fr 1fr',borderBottom:`1px solid ${T.bg}`}}>
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{background:color}}>{empInitials(emp)}</div>
                    <div>
                      <p className="text-[13px] font-semibold" style={{color:T.black}}>{empName(emp)}</p>
                      <p className="text-[10px]" style={{color:T.grayMid}}>{emp?.job_title??'—'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium" style={{color:T.black}}>{ci.toLocaleDateString('es-PR',{day:'numeric',month:'short',year:'numeric'})}</p>
                    <p className="text-[10px]" style={{color:T.grayMid}}>
                      {ci.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true})}
                      {co&&` – ${co.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true})}`}
                    </p>
                  </div>
                  <span className="text-[12px]" style={{color:T.gray}}>{emp?.job_title??'—'}</span>
                  <span className="inline-flex text-[10px] font-bold px-2 py-1 rounded-full w-fit" style={{background:statusInfo.bg,color:statusInfo.fg}}>{statusInfo.label}</span>
                  <div className="flex items-center gap-1.5">
                    {(isLive||e.status==='pending')&&(
                      <>
                        <div className="size-7 rounded-full flex items-center justify-center" style={{background:T.greenLt}}><CheckCircle2 size={14} color={T.green}/></div>
                        <div className="size-7 rounded-full flex items-center justify-center" style={{background:T.redLt}}><XCircle size={14} color={T.red}/></div>
                      </>
                    )}
                    {(e.status==='approved'||e.status==='paid')&&(
                      <div className="size-7 rounded-full flex items-center justify-center" style={{background:T.grayLt}}><Pencil size={13} color={T.gray}/></div>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      </>}

      <AnimatePresence>
        {showModal&&(
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{background:'#00000066'}}>
            <motion.div initial={{y:80,opacity:0}} animate={{y:0,opacity:1}} exit={{y:80,opacity:0}} transition={{type:'spring',damping:28,stiffness:300}} className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6" style={{background:T.white}}>
              <div className="w-10 h-1 rounded-full mx-auto mb-4 sm:hidden" style={{background:T.border}}/>
              <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-bold" style={{color:T.black}}>{editShift?'Editar Turno':'Crear Turno'}</h2><button onClick={()=>setShowModal(false)} className="p-2 rounded-xl" style={{color:T.gray}}><X size={20}/></button></div>
              <form onSubmit={handleSave} className="space-y-4">
                <div><label className="text-xs font-bold block mb-1" style={{color:T.black}}>Empleado</label>
                <select required value={form.employee_id} onChange={e=>setForm(p=>({...p,employee_id:e.target.value}))} className="w-full h-11 rounded-xl px-3 text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}>
                  <option value="">Selecciona...</option>{employees.map(e=><option key={e.id} value={e.id}>{empName(e)}{e.job_title?' – '+e.job_title:''}</option>)}
                </select></div>
                <div><label className="text-xs font-bold block mb-1" style={{color:T.black}}>Fecha</label><input required type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} className="w-full h-11 rounded-xl px-3 text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}/></div>
                <div className="grid grid-cols-2 gap-3">
                  {(['start_time','end_time'] as const).map(f=><div key={f}><label className="text-xs font-bold block mb-1" style={{color:T.black}}>{f==='start_time'?'Entrada':'Salida'}</label><input required type="time" value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} className="w-full h-11 rounded-xl px-3 text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}/></div>)}
                </div>
                <div><label className="text-xs font-bold block mb-1" style={{color:T.black}}>Break</label>
                <select value={form.break_minutes} onChange={e=>setForm(p=>({...p,break_minutes:Number(e.target.value)}))} className="w-full h-11 rounded-xl px-3 text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}>
                  <option value={0}>Sin break</option><option value={15}>15 min</option><option value={30}>30 min</option><option value={60}>1 hora</option>
                </select></div>
                <div className="flex gap-3 pt-2" style={{borderTop:`1px solid ${T.border}`}}>
                  {editShift&&<button type="button" onClick={()=>handleDelete(editShift.id)} className="size-12 rounded-xl flex items-center justify-center" style={{background:T.redLt}}><Trash2 size={18} color={T.red}/></button>}
                  <button type="submit" className="flex-1 h-12 rounded-2xl text-white text-sm font-bold" style={{background:T.black}}>{editShift?'Guardar cambios':'Crear Turno'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBulkModal&&(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'#00000066'}} onClick={()=>setShowBulkModal(false)}>
            <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}} transition={{type:'spring',damping:28,stiffness:300}} className="w-full max-w-lg rounded-3xl overflow-hidden" style={{background:T.white}} onClick={e=>e.stopPropagation()}>
              <div className="px-6 py-5 flex items-center justify-between" style={{borderBottom:`1px solid ${T.border}`}}>
                <div><p className="text-lg font-bold" style={{color:T.black}}>Turno en masa</p><p className="text-xs mt-0.5" style={{color:T.gray}}>Crea turnos para múltiples empleados a la vez</p></div>
                <button onClick={()=>setShowBulkModal(false)} className="p-2 rounded-xl" style={{color:T.gray}}><X size={20}/></button>
              </div>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Employees */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold" style={{color:T.black}}>Empleados</label>
                    <button type="button" onClick={()=>setBulkEmps(bulkEmps.length===employees.length?[]:employees.map(e=>e.id))} className="text-[11px] font-semibold" style={{color:T.blue}}>{bulkEmps.length===employees.length?'Deseleccionar todos':'Seleccionar todos'}</button>
                  </div>
                  <div className="space-y-1.5">
                    {employees.map((emp,i)=>{
                      const sel=bulkEmps.includes(emp.id); const color=empColor(emp,i);
                      return(
                        <button key={emp.id} type="button" onClick={()=>setBulkEmps(prev=>sel?prev.filter(id=>id!==emp.id):[...prev,emp.id])} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left" style={{background:sel?`${color}15`:T.bg,border:`1.5px solid ${sel?color:T.border}`}}>
                          <div className="size-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{background:color}}>{empInitials(emp)}</div>
                          <div className="flex-1 min-w-0"><p className="text-[13px] font-semibold truncate" style={{color:T.black}}>{empName(emp)}</p><p className="text-[11px]" style={{color:T.gray}}>{emp.job_title??'—'}</p></div>
                          <div className="size-5 rounded-md border-2 flex items-center justify-center shrink-0" style={{background:sel?color:'transparent',borderColor:sel?color:T.border}}>{sel&&<span className="text-white text-[10px] font-bold">✓</span>}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Days */}
                <div>
                  <label className="text-xs font-bold block mb-2" style={{color:T.black}}>Días de la semana</label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {days.map((d,i)=>{
                      const sel=bulkDays.includes(i);
                      return(
                        <button key={i} type="button" onClick={()=>setBulkDays(prev=>sel?prev.filter(x=>x!==i):[...prev,i].sort())} className="flex flex-col items-center py-2.5 rounded-xl transition-all" style={{background:sel?T.blue:T.bg,border:`1px solid ${sel?T.blue:T.border}`}}>
                          <span className="text-[9px] font-bold" style={{color:sel?'rgba(255,255,255,0.7)':T.gray}}>{DAY_ES[d.getDay()]}</span>
                          <span className="text-sm font-bold mt-0.5" style={{color:sel?T.white:T.black}}>{d.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Time */}
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-xs font-bold block mb-1" style={{color:T.black}}>Entrada</label><input type="time" value={bulkTime.start} onChange={e=>setBulkTime(p=>({...p,start:e.target.value}))} className="w-full h-11 rounded-xl px-3 text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}/></div>
                  <div><label className="text-xs font-bold block mb-1" style={{color:T.black}}>Salida</label><input type="time" value={bulkTime.end} onChange={e=>setBulkTime(p=>({...p,end:e.target.value}))} className="w-full h-11 rounded-xl px-3 text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}/></div>
                  <div><label className="text-xs font-bold block mb-1" style={{color:T.black}}>Break</label><select value={bulkTime.break_minutes} onChange={e=>setBulkTime(p=>({...p,break_minutes:Number(e.target.value)}))} className="w-full h-11 rounded-xl px-3 text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}><option value={0}>Sin break</option><option value={15}>15 min</option><option value={30}>30 min</option><option value={60}>1 hora</option></select></div>
                </div>
                {/* Preview count */}
                {bulkEmps.length>0&&bulkDays.length>0&&(
                  <div className="p-3 rounded-xl flex items-center gap-2" style={{background:T.blueLt}}>
                    <span className="text-sm font-bold" style={{color:T.blue}}>Se crearán {bulkEmps.length * bulkDays.length} turnos</span>
                    <span className="text-xs" style={{color:`${T.blue}99`}}>({bulkEmps.length} empleado{bulkEmps.length>1?'s':''} × {bulkDays.length} día{bulkDays.length>1?'s':''})</span>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 flex gap-3" style={{borderTop:`1px solid ${T.border}`}}>
                <button onClick={()=>setShowBulkModal(false)} className="flex-1 h-12 rounded-2xl text-sm font-semibold" style={{background:T.grayLt,color:T.black}}>Cancelar</button>
                <button onClick={handleBulkCreate} disabled={bulkSaving||!bulkEmps.length||!bulkDays.length} className="flex-1 h-12 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2" style={{background:T.black,opacity:(!bulkEmps.length||!bulkDays.length)?0.4:1}}>
                  {bulkSaving?<span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<><Plus size={16}/>Crear turnos</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>{/* end px-5 space-y-5 */}
    </div>
  );
}

// ─── APROBACIONES ─────────────────────────────────────────────────────────────
function ApprovalsView({bizId}:{bizId:string}) {
  const [entries,setEntries] = useState<ClockEntry[]>([]);
  const [active,setActive]   = useState<ClockEntry[]>([]);
  const [loading,setLoading] = useState(true);
  const [tab,setTab]         = useState<'pending'|'rejected'|'history'>('pending');
  const [search,setSearch]   = useState('');
  const [editEntry,setEditEntry] = useState<ClockEntry|null>(null);
  const [editForm,setEditForm]   = useState({clock_in:'',clock_out:'',status:'pending',rejection_note:''});
  const [showEdit,setShowEdit]           = useState(false);
  const [showApproveAll,setShowApproveAll] = useState(false);
  const [nowTick2,setNowTick2]           = useState(new Date());
  useEffect(()=>{const t=setInterval(()=>setNowTick2(new Date()),30000);return()=>clearInterval(t);},[]);

  const load=useCallback(async()=>{
    setLoading(true);
    const[closedRes,activeRes]=await Promise.all([
      supabase.from('clock_entries').select('*,profiles(*)').eq('business_id',bizId).not('clock_out','is',null).order('clock_in',{ascending:false}).limit(300),
      supabase.from('clock_entries').select('*,profiles(*)').eq('business_id',bizId).is('clock_out',null).order('clock_in',{ascending:false}),
    ]);
    setEntries(((closedRes.data??[]) as any[]).map(e=>({...e,employee:e.profiles})));
    setActive(((activeRes.data??[]) as any[]).map(e=>({...e,employee:e.profiles})));
    setLoading(false);
  },[bizId]);
  useEffect(()=>{load();},[load]);

  const handleApprove=async(id:string)=>{await supabase.from('clock_entries').update({status:'approved'}).eq('id',id);setEntries(p=>p.map(e=>e.id===id?{...e,status:'approved'}:e));};
  const handleReject=async(id:string)=>{await supabase.from('clock_entries').update({status:'rejected'}).eq('id',id);setEntries(p=>p.map(e=>e.id===id?{...e,status:'rejected'}:e));};
  const handleDelete=async(id:string)=>{if(!confirm('¿Eliminar esta marcación?'))return;await supabase.from('clock_entries').delete().eq('id',id);setEntries(p=>p.filter(e=>e.id!==id));setActive(p=>p.filter(e=>e.id!==id));};
  const handleApproveAll=async(ids:string[])=>{await supabase.from('clock_entries').update({status:'approved'}).in('id',ids);setEntries(p=>p.map(e=>ids.includes(e.id)?{...e,status:'approved'}:e));};

  const openEdit=(e:ClockEntry)=>{
    setEditEntry(e);
    const fmt=(dt:string)=>{const d=new Date(dt.replace(/\+00(:\d{2})?$/,'').replace(' ','T'));return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;};
    setEditForm({clock_in:fmt(e.clock_in),clock_out:e.clock_out?fmt(e.clock_out):'',status:e.status,rejection_note:e.rejection_note??''});
    setShowEdit(true);
  };
  const handleSaveEdit=async()=>{
    if(!editEntry)return;
    const p:any={status:editForm.status,clock_in:editForm.clock_in,rejection_note:editForm.rejection_note||null};
    if(editForm.clock_out)p.clock_out=editForm.clock_out;
    await supabase.from('clock_entries').update(p).eq('id',editEntry.id);
    setShowEdit(false);await load();
  };

  const pending  = entries.filter(e=>e.status==='pending');
  const rejected = entries.filter(e=>e.status==='rejected');
  const history  = entries.filter(e=>e.status==='approved'||e.status==='paid');
  const approvedHrs=history.reduce((s,e)=>s+diffHours(e.clock_in,e.clock_out??''),0);

  const fmtDt=(dt:string)=>{const d=new Date(dt.replace(/\+00(:\d{2})?$/,'').replace(' ','T'));return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true});};
  const fmtDate=(dt:string)=>{const d=new Date(dt.replace(/\+00(:\d{2})?$/,'').replace(' ','T'));return d.toLocaleDateString('es-PR',{weekday:'short',day:'numeric',month:'short'});};
  const filtered=(list:ClockEntry[])=>search?list.filter(e=>empName(e.employee).toLowerCase().includes(search.toLowerCase())):list;

  const SB='#0f1f5c';
  const tabs=[
    {key:'pending' as const,  label:'Pendientes', count:pending.length,  color:T.amber},
    {key:'rejected' as const, label:'Rechazados',  count:rejected.length, color:T.red},
    {key:'history' as const,  label:'Historial',   count:history.length,  color:T.green},
  ];

  const statusInfo=(e:ClockEntry,isActive=false)=>
    isActive?{bg:'#FEE2E2',fg:T.red,label:'Activo'}:
    e.status==='approved'?{bg:T.greenLt,fg:T.green,label:'Aprobado'}:
    e.status==='paid'?{bg:T.blueLt,fg:T.blue,label:'Procesado'}:
    e.status==='rejected'?{bg:T.redLt,fg:T.red,label:'Rechazado'}:
    {bg:T.amberLt,fg:T.amber,label:'Pendiente'};

  const curList=tab==='pending'?[...active.map(e=>({...e,_live:true})),...pending]:
                tab==='rejected'?rejected:history;
  const visibleList=filtered(curList as ClockEntry[]);

  return (
    <div className="p-5 lg:p-6 space-y-5 max-w-screen-xl">

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{...CARD,border:`1px solid ${T.amber}40`}}>
          <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{background:T.amberLt}}><AlertTriangle size={14} color={T.amber}/></div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-widest uppercase truncate" style={{color:T.grayMid}}>Pendientes</p>
            {loading?<div className="h-5 w-8 rounded animate-pulse mt-0.5" style={{background:T.grayLt}}/>:(
              <p className="text-xl font-black leading-tight" style={{color:T.black}}>{pending.length}</p>
            )}
            <p className="text-[10px] truncate" style={{color:pending.length>0?T.amber:T.grayMid}}>{pending.length>0?'Requiere acción':'Al día'}</p>
          </div>
        </div>

        <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{...CARD,border:`1px solid ${T.red}30`}}>
          <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{background:T.redLt}}>
            <span className="size-2.5 rounded-full animate-pulse" style={{background:T.red}}/>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{color:T.grayMid}}>Activos ahora</p>
            {loading?<div className="h-5 w-8 rounded animate-pulse mt-0.5" style={{background:T.grayLt}}/>:(
              <p className="text-xl font-black leading-tight" style={{color:T.black}}>{active.length}</p>
            )}
            <p className="text-[10px]" style={{color:T.grayMid}}>{active.length>0?'En turno':'Nadie activo'}</p>
          </div>
        </div>

        <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={CARD}>
          <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{background:T.greenLt}}><CheckCircle2 size={14} color={T.green}/></div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{color:T.grayMid}}>Aprobadas</p>
            {loading?<div className="h-5 w-16 rounded animate-pulse mt-0.5" style={{background:T.grayLt}}/>:(
              <p className="text-xl font-black leading-tight" style={{color:T.black}}>{fmtHours(approvedHrs)}</p>
            )}
            <p className="text-[10px]" style={{color:T.grayMid}}>{history.length} marcaciones</p>
          </div>
        </div>
      </div>

      {/* Main row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Table */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={CARD}>
          <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:`1px solid ${T.border}`}}>
            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl" style={{background:T.bg,border:`1px solid ${T.border}`}}>
              {tabs.map(({key,label,count,color})=>{
                const sel=tab===key;
                return(
                  <button key={key} onClick={()=>setTab(key)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                    style={{background:sel?color:'transparent',color:sel?T.white:T.gray}}>
                    {label}
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{background:sel?'rgba(255,255,255,0.25)':T.border,color:sel?T.white:T.gray}}>{count}</span>
                  </button>
                );
              })}
            </div>
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={13} color={T.gray}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar…" className="h-9 pl-8 pr-3 rounded-xl text-xs w-40" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}/>
            </div>
          </div>

          {/* Approve all banner */}
          {tab==='pending'&&pending.length>0&&(
            <div className="flex items-center gap-3 mx-4 my-3 px-4 py-2.5 rounded-xl" style={{background:T.amberLt,border:`1px solid ${T.amber}33`}}>
              <AlertTriangle size={14} color={T.amber}/>
              <p className="text-[12px] font-semibold flex-1" style={{color:T.amber}}>{pending.length} marcación{pending.length!==1?'es':''} por aprobar</p>
              <button onClick={()=>setShowApproveAll(true)} className="px-3 py-1 rounded-lg text-[11px] font-bold text-white" style={{background:T.green}}>Aprobar todo</button>
            </div>
          )}

          {loading?(
            <div className="p-5 space-y-3">{[0,1,2,3].map(i=><div key={i} className="h-14 rounded-xl animate-pulse" style={{background:T.grayLt}}/>)}</div>
          ):visibleList.length===0?(
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <CheckCircle2 size={40} color={T.green}/>
              <p className="text-[14px] font-bold" style={{color:T.black}}>
                {tab==='pending'?'¡Todo al día!':tab==='rejected'?'Sin rechazados':'Sin historial'}
              </p>
            </div>
          ):(
            <div>
              <div className="grid px-5 py-2.5" style={{gridTemplateColumns:'2fr 1.5fr 1fr 1fr 1fr',borderBottom:`1px solid ${T.border}`}}>
                {['Empleado','Fecha','Horas','Estado','Acciones'].map(h=>(
                  <span key={h} className="text-[11px] font-bold uppercase tracking-wide" style={{color:T.grayMid}}>{h}</span>
                ))}
              </div>
              {visibleList.map((entry,i)=>{
                const isLive=(entry as any)._live===true;
                const hrs=isLive
                  ?(nowTick2.getTime()-new Date(entry.clock_in.replace(/\+00(:\d{2})?$/,'').replace(' ','T')).getTime())/3600000
                  :diffHours(entry.clock_in,entry.clock_out??new Date().toISOString());
                const si=statusInfo(entry,isLive);
                const color=empColor(entry.employee,i);
                return(
                  <div key={entry.id} className="grid items-center px-5 py-3" style={{gridTemplateColumns:'2fr 1.5fr 1fr 1fr 1fr',borderBottom:i<visibleList.length-1?`1px solid ${T.bg}`:'none'}}>
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{background:color}}>{empInitials(entry.employee)}</div>
                      <span className="text-[13px] font-semibold truncate" style={{color:T.black}}>{empName(entry.employee)}</span>
                    </div>
                    <div>
                      <p className="text-[12px] font-medium" style={{color:T.black}}>{fmtDate(entry.clock_in)}</p>
                      <p className="text-[10px]" style={{color:T.gray}}>{fmtDt(entry.clock_in)}{entry.clock_out&&` – ${fmtDt(entry.clock_out)}`}</p>
                    </div>
                    <span className="text-[13px] font-bold" style={{color:T.black}}>{fmtHours(hrs)}</span>
                    <span className="inline-flex text-[11px] font-semibold px-2 py-1 rounded-full w-fit" style={{background:si.bg,color:si.fg}}>{si.label}</span>
                    <div className="flex items-center gap-1.5">
                      {tab==='pending'&&!isLive&&(
                        <>
                          <button onClick={()=>handleApprove(entry.id)} className="size-7 rounded-lg flex items-center justify-center" style={{background:T.greenLt}} title="Aprobar"><CheckCircle2 size={14} color={T.green}/></button>
                          <button onClick={()=>handleReject(entry.id)} className="size-7 rounded-lg flex items-center justify-center" style={{background:T.redLt}} title="Rechazar"><XCircle size={14} color={T.red}/></button>
                        </>
                      )}
                      <button onClick={()=>openEdit(entry)} className="size-7 rounded-lg flex items-center justify-center" style={{background:T.grayLt}} title="Editar"><Pencil size={13} color={T.gray}/></button>
                      <button onClick={()=>handleDelete(entry.id)} className="size-7 rounded-lg flex items-center justify-center" style={{background:T.redLt}} title="Eliminar"><Trash2 size={13} color={T.red}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="rounded-2xl p-4" style={{...CARD,background:SB}}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{color:'rgba(255,255,255,0.45)'}}>Acciones Rápidas</p>
            <button onClick={load}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left active:scale-95 transition-transform"
              style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.18)'}}>
              <RefreshCw size={17} color="white" className="shrink-0"/>
              <div className="flex-1"><p className="text-[13px] font-bold text-white leading-tight">Actualizar</p><p className="text-[10px]" style={{color:'rgba(255,255,255,0.5)'}}>Recargar datos</p></div>
              <ChevronRight size={14} color="rgba(255,255,255,0.4)"/>
            </button>
          </div>

          {/* Bar chart — marcaciones por estado */}
          <div className="rounded-2xl p-5" style={CARD}>
            <p className="text-[13px] font-bold mb-1" style={{color:T.black}}>Marcaciones por Estado</p>
            <p className="text-[10px] mb-4" style={{color:T.grayMid}}>Total: {entries.length + active.length} registros</p>
            {(()=>{
              const bars=[
                {label:'Aprobadas',  value:history.length,  color:T.green},
                {label:'Pendientes', value:pending.length,  color:T.amber},
                {label:'Rechazados', value:rejected.length, color:T.red},
                {label:'Activos',    value:active.length,   color:'#DC2626'},
              ];
              const max=Math.max(...bars.map(b=>b.value),1);
              return(
                <div className="space-y-3">
                  {bars.map(({label,value,color})=>(
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold" style={{color:T.gray}}>{label}</span>
                        <span className="text-[11px] font-bold" style={{color}}>{value}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{background:T.grayLt}}>
                        <div className="h-full rounded-full transition-all duration-700" style={{width:`${(value/max)*100}%`,background:color}}/>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Approve-all confirm modal */}
      <AnimatePresence>
        {showApproveAll&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)'}}>
            <motion.div initial={{scale:0.92,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.92,opacity:0}} className="w-full max-w-sm rounded-3xl p-6 text-center" style={{background:'#fff'}}>
              <div className="size-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{background:T.greenLt}}>
                <CheckCircle2 size={28} color={T.green}/>
              </div>
              <p className="text-base font-bold mb-2" style={{color:'#0f1f5c'}}>Aprobar todas las marcaciones</p>
              <p className="text-[13px] mb-6" style={{color:T.gray}}>Se aprobarán <strong>{pending.length}</strong> marcación{pending.length!==1?'es':''} pendiente{pending.length!==1?'s':''}. Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button onClick={()=>setShowApproveAll(false)} className="flex-1 h-11 rounded-2xl text-sm font-semibold" style={{background:T.bg,color:T.gray}}>Cancelar</button>
                <button onClick={async()=>{setShowApproveAll(false);await handleApproveAll(pending.map(e=>e.id));}} className="flex-1 h-11 rounded-2xl text-sm font-bold text-white" style={{background:T.green}}>Aprobar todo</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {showEdit&&editEntry&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)'}}>
            <motion.div initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} exit={{y:40,opacity:0}} className="w-full max-w-md rounded-3xl p-5" style={{background:T.white}}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold" style={{color:T.black}}>Editar Marcación</h3>
                <button onClick={()=>setShowEdit(false)} className="size-8 rounded-full flex items-center justify-center" style={{background:T.bg}}><X size={16} color={T.gray}/></button>
              </div>
              <div className="space-y-3">
                <div><label className="text-xs font-semibold block mb-1" style={{color:T.gray}}>Entrada</label>
                  <input type="datetime-local" value={editForm.clock_in} onChange={e=>setEditForm(f=>({...f,clock_in:e.target.value}))} className="w-full h-11 px-3 rounded-xl text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}/></div>
                <div><label className="text-xs font-semibold block mb-1" style={{color:T.gray}}>Salida</label>
                  <input type="datetime-local" value={editForm.clock_out} onChange={e=>setEditForm(f=>({...f,clock_out:e.target.value}))} className="w-full h-11 px-3 rounded-xl text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}/></div>
                <div><label className="text-xs font-semibold block mb-1" style={{color:T.gray}}>Estado</label>
                  <select value={editForm.status} onChange={e=>setEditForm(f=>({...f,status:e.target.value}))} className="w-full h-11 px-3 rounded-xl text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}>
                    <option value="pending">Pendiente</option>
                    <option value="approved">Aprobado</option>
                    <option value="rejected">Rechazado</option>
                  </select></div>
                {editForm.status==='rejected'&&<div><label className="text-xs font-semibold block mb-1" style={{color:T.gray}}>Razón de rechazo</label>
                  <input type="text" value={editForm.rejection_note} onChange={e=>setEditForm(f=>({...f,rejection_note:e.target.value}))} placeholder="Opcional…" className="w-full h-11 px-3 rounded-xl text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}/></div>}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={()=>setShowEdit(false)} className="flex-1 h-11 rounded-2xl text-sm font-semibold" style={{background:T.bg,color:T.gray}}>Cancelar</button>
                <button onClick={handleSaveEdit} className="flex-1 h-11 rounded-2xl text-sm font-bold text-white" style={{background:SB}}>Guardar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── NÓMINA ───────────────────────────────────────────────────────────────────
function PayrollView({bizId}:{bizId:string}) {
  const [data,setData] = useState<{emp:Employee;hours:number;overtime:number;gross:number;deductions:number;net:number}[]>([]);
  const [loading,setLoading] = useState(true);
  const [period,setPeriod] = useState<'week'|'month'>('week');

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      const now=new Date();
      const startDate=period==='week'?isoDate(weekDays(now)[0]):`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
      const[empRes,entryRes]=await Promise.all([
        supabase.from('profiles').select('*').eq('business_id',bizId).eq('role','employee').eq('status','active'),
        supabase.from('clock_entries').select('employee_id,clock_in,clock_out').eq('business_id',bizId).eq('status','approved').not('clock_out','is',null).gte('clock_in',`${startDate}T00:00:00`),
      ]);
      const emps=(empRes.data??[]) as Employee[];
      const hrMap:Record<string,number>={};
      for(const e of(entryRes.data??[])){hrMap[e.employee_id]=(hrMap[e.employee_id]??0)+diffHours(e.clock_in,e.clock_out);}
      const rows=emps.map(emp=>{
        const total=hrMap[emp.id]??0;
        const hours=Math.min(total,40); const overtime=Math.max(0,total-40);
        const gross=hours*emp.hourly_rate+overtime*emp.hourly_rate*1.5;
        const deductions=gross*0.1465;
        return{emp,hours,overtime,gross,deductions,net:gross-deductions};
      }).filter(r=>r.hours+r.overtime>0);
      setData(rows);
      setLoading(false);
    })();
  },[bizId,period]);

  const totals=data.reduce((acc,r)=>({gross:acc.gross+r.gross,deductions:acc.deductions+r.deductions,net:acc.net+r.net}),{gross:0,deductions:0,net:0});

  return (
    <div>
      <div className="px-5 pt-6 pb-5" style={{background:T.white,borderBottom:`1px solid ${T.border}`}}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold" style={{color:T.black}}>Nómina</h1>
          <div className="flex p-1 rounded-xl gap-1" style={{background:T.bg,border:`1px solid ${T.border}`}}>
            {(['week','month'] as const).map(p=><button key={p} onClick={()=>setPeriod(p)} className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all" style={{background:period===p?T.violet:'transparent',color:period===p?T.white:T.gray}}>{p==='week'?'Esta Semana':'Este Mes'}</button>)}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[{label:'Total Bruto',value:totals.gross,color:T.blue,bg:T.blueLt},{label:'Deducciones',value:totals.deductions,color:T.red,bg:T.redLt},{label:'Total Neto',value:totals.net,color:T.violet,bg:T.violetLt}].map(({label,value,color,bg})=>(
            <div key={label} className="rounded-2xl p-4 text-center" style={{background:bg}}>
              <p className="text-[9px] font-bold uppercase tracking-widest" style={{color:`${color}99`}}>{label}</p>
              <p className="text-[22px] font-black mt-1 font-mono" style={{color}}>{loading?'—':`$${value.toFixed(2)}`}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-3">
        {loading?Array.from({length:2}).map((_,i)=><div key={i} className="h-28 rounded-2xl animate-pulse" style={{background:T.white}}/>):
        data.length===0?(
          <div className="rounded-2xl py-14 flex flex-col items-center" style={CARD}><DollarSign size={40} color={T.grayMid} className="mb-3"/><p className="text-sm font-semibold" style={{color:T.gray}}>No hay horas aprobadas en este período</p></div>
        ):(
          <>
            <div className="hidden md:grid grid-cols-6 gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest" style={{color:T.gray,background:T.bg}}>
              <div className="col-span-2">Empleado</div>
              <div className="text-center">Hrs Reg</div>
              <div className="text-center">Hrs OT</div>
              <div className="text-center">Bruto</div>
              <div className="text-right">Neto</div>
            </div>
            {data.map((row,i)=>{
              const color=empColor(row.emp,i);
              return(
                <div key={row.emp.id} className="rounded-2xl overflow-hidden" style={CARD}>
                  <div className="hidden md:grid grid-cols-6 gap-2 items-center px-4 py-4">
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="size-10 rounded-[12px] flex items-center justify-center text-sm font-bold text-white shrink-0" style={{background:color}}>{empInitials(row.emp)}</div>
                      <div><p className="text-[13px] font-bold" style={{color:T.black}}>{empName(row.emp)}</p><p className="text-xs" style={{color:T.gray}}>${row.emp.hourly_rate}/hr · {row.emp.job_title??'—'}</p></div>
                    </div>
                    <div className="text-center"><span className="text-[13px] font-bold" style={{color:T.black}}>{fmtHours(row.hours)}</span></div>
                    <div className="text-center"><span className="text-[13px] font-bold" style={{color:row.overtime>0?T.amber:T.grayMid}}>{fmtHours(row.overtime)}</span></div>
                    <div className="text-center"><span className="text-[13px] font-bold" style={{color:T.black}}>${row.gross.toFixed(2)}</span></div>
                    <div className="text-right"><span className="text-[18px] font-black font-mono" style={{color:T.violet}}>${row.net.toFixed(2)}</span></div>
                  </div>
                  <div className="md:hidden">
                    <div className="flex items-center gap-3 px-4 py-4">
                      <div className="size-12 rounded-[14px] flex items-center justify-center text-base font-bold text-white shrink-0" style={{background:color}}>{empInitials(row.emp)}</div>
                      <div className="flex-1 min-w-0"><p className="text-[14px] font-bold" style={{color:T.black}}>{empName(row.emp)}</p><p className="text-xs" style={{color:T.gray}}>${row.emp.hourly_rate}/hr</p></div>
                      <div className="text-right"><p className="text-[10px] font-semibold" style={{color:T.gray}}>Neto</p><p className="text-xl font-black font-mono" style={{color:T.violet}}>${row.net.toFixed(2)}</p></div>
                    </div>
                    <div className="mx-3 mb-3 px-3 py-2.5 rounded-xl flex items-center gap-2" style={{background:T.bg}}>
                      {[{label:`Reg ${fmtHours(row.hours)}`,color:T.green},{label:`OT ${fmtHours(row.overtime)}`,color:T.amber},{label:`Ded -$${row.deductions.toFixed(0)}`,color:T.red}].map(({label,color})=>(
                        <span key={label} className="text-[10px] font-bold px-2 py-1 rounded-md flex-1 text-center" style={{background:`${color}15`,color}}>{label}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="hidden md:grid grid-cols-6 gap-2 items-center px-4 py-3 rounded-2xl" style={{background:T.black}}>
              <div className="col-span-2 text-sm font-bold text-white">Total ({data.length} empleados)</div>
              <div className="text-center text-sm font-bold text-white">{fmtHours(data.reduce((s,r)=>s+r.hours,0))}</div>
              <div className="text-center text-sm font-bold" style={{color:T.amber}}>{fmtHours(data.reduce((s,r)=>s+r.overtime,0))}</div>
              <div className="text-center text-sm font-bold text-white">${totals.gross.toFixed(2)}</div>
              <div className="text-right text-lg font-black font-mono" style={{color:'#A78BFA'}}>${totals.net.toFixed(2)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── REPORTES ─────────────────────────────────────────────────────────────────
function ReportsView({bizId}:{bizId:string}) {
  type EmpReport = {emp:Employee;hours:number;cost:number;entries:number;overtime:number};
  const [period,setPeriod] = useState<'week'|'month'|'quarter'>('month');
  const [rows,setRows] = useState<EmpReport[]>([]);
  const [weeklyTrend,setWeeklyTrend] = useState<{label:string;hrs:number}[]>([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      const now=new Date();
      let startDate:string;
      if(period==='week'){startDate=isoDate(weekDays(now)[0]);}
      else if(period==='month'){startDate=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;}
      else{const q=Math.floor(now.getMonth()/3);startDate=`${now.getFullYear()}-${String(q*3+1).padStart(2,'0')}-01`;}

      const[empRes,entryRes]=await Promise.all([
        supabase.from('profiles').select('*').eq('business_id',bizId).eq('role','employee'),
        supabase.from('clock_entries').select('employee_id,clock_in,clock_out').eq('business_id',bizId).in('status',['approved','paid']).not('clock_out','is',null).gte('clock_in',`${startDate}T00:00:00`),
      ]);
      const emps=(empRes.data??[]) as Employee[];
      const entries=entryRes.data??[];
      const hrMap:Record<string,{hours:number;entries:number}>={};
      for(const e of entries){if(!hrMap[e.employee_id])hrMap[e.employee_id]={hours:0,entries:0};hrMap[e.employee_id].hours+=diffHours(e.clock_in,e.clock_out);hrMap[e.employee_id].entries++;}
      const reportRows:EmpReport[]=emps.filter(e=>hrMap[e.id]?.hours>0).map(emp=>{
        const{hours,entries}=hrMap[emp.id]??{hours:0,entries:0};
        const overtime=Math.max(0,hours-40);
        const cost=Math.min(hours,40)*(emp.hourly_rate??0)+overtime*(emp.hourly_rate??0)*1.5;
        return{emp,hours,cost,entries,overtime};
      }).sort((a,b)=>b.hours-a.hours);
      setRows(reportRows);

      // Weekly trend last 8 weeks
      const trend:{label:string;hrs:number}[]=[];
      for(let w=7;w>=0;w--){
        const anchor=new Date(now);anchor.setDate(now.getDate()-w*7);
        const wd=weekDays(anchor);
        const{data:we}=await supabase.from('clock_entries').select('clock_in,clock_out').eq('business_id',bizId).in('status',['approved','paid']).not('clock_out','is',null).gte('clock_in',`${isoDate(wd[0])}T00:00:00`).lte('clock_in',`${isoDate(wd[6])}T23:59:59`);
        trend.push({label:`${wd[0].getDate()}/${wd[0].getMonth()+1}`,hrs:(we??[]).reduce((s:number,e:any)=>s+diffHours(e.clock_in,e.clock_out),0)});
      }
      setWeeklyTrend(trend);
      setLoading(false);
    })();
  },[bizId,period]);

  const totalHours=rows.reduce((s,r)=>s+r.hours,0);
  const totalCost=rows.reduce((s,r)=>s+r.cost,0);
  const maxHours=Math.max(...rows.map(r=>r.hours),1);
  const trendMax=Math.max(...weeklyTrend.map(w=>w.hrs),1);

  const exportCSV=()=>{
    const header='Empleado,Puesto,Horas Reg,Horas OT,Costo Total';
    const lines=[header,...rows.map(r=>`"${empName(r.emp)}","${r.emp.job_title??''}",${Math.min(r.hours,40).toFixed(1)},${r.overtime.toFixed(1)},$${r.cost.toFixed(2)}`)];
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/csv'}));a.download=`reporte-${period}-${isoDate(new Date())}.csv`;a.click();
  };

  return(
    <div>
      <div className="px-6 pt-6 pb-4" style={{background:T.white,borderBottom:`1px solid ${T.border}`}}>
        <div className="flex items-center justify-between mb-4">
          <div><h1 className="text-xl font-bold" style={{color:T.black}}>Reportes</h1><p className="text-xs mt-0.5" style={{color:T.gray}}>Horas trabajadas y costo laboral</p></div>
          <button onClick={exportCSV} disabled={rows.length===0} className="h-10 px-4 rounded-xl flex items-center gap-2 text-[13px] font-bold text-white" style={{background:T.green,opacity:rows.length===0?0.5:1}}><Download size={15}/>Exportar CSV</button>
        </div>
        <div className="flex gap-1.5">
          {([['week','Esta semana'],['month','Este mes'],['quarter','Este trimestre']] as const).map(([p,l])=>(
            <button key={p} onClick={()=>setPeriod(p)} className="h-9 px-4 rounded-xl text-[12px] font-semibold transition-all" style={{background:period===p?T.black:'transparent',color:period===p?T.white:T.gray,border:`1px solid ${period===p?T.black:T.border}`}}>{l}</button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {loading?<>{Array.from({length:3}).map((_,i)=><div key={i} className="h-28 rounded-2xl animate-pulse" style={{background:T.white}}/>)}</>:(
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {([
                {label:'Total horas',value:fmtHours(totalHours),color:T.blue,bg:T.blueLt,Icon:Clock},
                {label:'Costo laboral',value:`$${totalCost.toFixed(0)}`,color:T.violet,bg:T.violetLt,Icon:DollarSign},
                {label:'Con horas',value:String(rows.length),color:T.green,bg:T.greenLt,Icon:Users},
                {label:'Promedio/persona',value:fmtHours(rows.length>0?totalHours/rows.length:0),color:T.indigo,bg:T.indigoLt,Icon:BarChart3},
              ] as const).map(({label,value,color,bg,Icon})=>(
                <div key={label} className="rounded-2xl p-4" style={{background:bg}}>
                  <div className="flex items-center gap-2 mb-2"><Icon size={14} style={{color}}/><span className="text-[10px] font-bold uppercase tracking-wide" style={{color:`${color}99`}}>{label}</span></div>
                  <p className="text-2xl font-black" style={{color}}>{value}</p>
                </div>
              ))}
            </div>

            {/* Employee bars */}
            {rows.length===0?(
              <div className="rounded-2xl py-14 flex flex-col items-center" style={CARD}><BarChart3 size={40} color={T.grayMid} className="mb-3"/><p className="text-sm font-semibold" style={{color:T.gray}}>Sin horas aprobadas en este período</p></div>
            ):(
              <div className="rounded-2xl overflow-hidden" style={CARD}>
                <div className="px-5 py-4 flex items-center justify-between" style={{borderBottom:`1px solid ${T.border}`}}>
                  <span className="text-[13px] font-bold" style={{color:T.black}}>Horas por empleado</span>
                  <span className="text-[11px]" style={{color:T.gray}}>{rows.length} empleado{rows.length!==1?'s':''}</span>
                </div>
                <div className="p-5 space-y-4">
                  {rows.map((r,i)=>{
                    const color=empColor(r.emp,i);
                    return(
                      <div key={r.emp.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="size-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{background:color}}>{empInitials(r.emp)}</div>
                            <span className="text-[13px] font-semibold" style={{color:T.black}}>{empName(r.emp)}</span>
                            {r.overtime>0&&<span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:T.amberLt,color:T.amber}}>OT +{fmtHours(r.overtime)}</span>}
                          </div>
                          <div className="text-right flex items-baseline gap-2">
                            <span className="text-[13px] font-bold" style={{color:T.black}}>{fmtHours(r.hours)}</span>
                            <span className="text-[11px]" style={{color:T.gray}}>${r.cost.toFixed(0)}</span>
                          </div>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{background:T.grayLt}}>
                          <div className="h-full rounded-full transition-all duration-700" style={{width:`${r.hours/maxHours*100}%`,background:color}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Weekly trend */}
            <div className="rounded-2xl p-5" style={CARD}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-bold" style={{color:T.black}}>Tendencia semanal (últimas 8 semanas)</span>
                <span className="text-[13px] font-bold" style={{color:T.indigo}}>{fmtHours(weeklyTrend[weeklyTrend.length-1]?.hrs??0)} esta semana</span>
              </div>
              <div className="flex items-end gap-1.5 h-24">
                {weeklyTrend.map((w,i)=>{
                  const isLast=i===weeklyTrend.length-1;
                  return(
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div className="w-full rounded-t-md transition-all" style={{height:`${Math.max(w.hrs/trendMax*100,4)}%`,background:isLast?T.indigo:`${T.indigo}55`}}/>
                      <span className="text-[9px] font-semibold" style={{color:isLast?T.indigo:T.grayMid}}>{w.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
function SettingsView({bizId}:{bizId:string}) {
  const [form,setForm] = useState({name:'',timezone:'America/Puerto_Rico',pay_period_type:'biweekly',overtime_weekly_hrs:40,geofence_radius_meters:100});
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [saved,setSaved] = useState(false);

  useEffect(()=>{
    supabase.from('businesses').select('name,timezone,pay_period_type,overtime_weekly_hrs,geofence_radius_meters').eq('id',bizId).single().then(({data})=>{
      if(data)setForm({name:data.name??'',timezone:data.timezone??'America/Puerto_Rico',pay_period_type:data.pay_period_type??'biweekly',overtime_weekly_hrs:data.overtime_weekly_hrs??40,geofence_radius_meters:data.geofence_radius_meters??100});
      setLoading(false);
    });
  },[bizId]);

  const handleSave=async(e:React.FormEvent)=>{
    e.preventDefault();setSaving(true);
    await supabase.from('businesses').update({name:form.name,timezone:form.timezone,pay_period_type:form.pay_period_type,overtime_weekly_hrs:form.overtime_weekly_hrs,geofence_radius_meters:form.geofence_radius_meters}).eq('id',bizId);
    setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2500);
  };

  const Field=({label,children}:{label:string;children:React.ReactNode})=>(
    <div><label className="text-xs font-bold block mb-1.5" style={{color:T.black}}>{label}</label>{children}</div>
  );

  return(
    <div>
      <div className="px-6 pt-6 pb-4" style={{background:T.white,borderBottom:`1px solid ${T.border}`}}>
        <h1 className="text-xl font-bold" style={{color:T.black}}>Configuración</h1>
        <p className="text-xs mt-0.5" style={{color:T.gray}}>Ajustes del negocio, nómina y geocerca</p>
      </div>

      <div className="p-6 max-w-2xl">
        {loading?<div className="h-64 rounded-2xl animate-pulse" style={{background:T.white}}/>:(
          <form onSubmit={handleSave} className="space-y-5">

            {/* Negocio */}
            <div className="rounded-2xl p-5 space-y-4" style={CARD}>
              <p className="text-[13px] font-bold pb-1" style={{color:T.black,borderBottom:`1px solid ${T.border}`}}>Información del negocio</p>
              <Field label="Nombre del negocio">
                <input type="text" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} className="w-full h-11 rounded-xl px-3 text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}/>
              </Field>
              <Field label="Zona horaria">
                <select value={form.timezone} onChange={e=>setForm(p=>({...p,timezone:e.target.value}))} className="w-full h-11 rounded-xl px-3 text-sm" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}>
                  {[['America/Puerto_Rico','Puerto Rico (AST)'],['America/New_York','New York (ET)'],['America/Chicago','Chicago (CT)'],['America/Denver','Denver (MT)'],['America/Los_Angeles','Los Angeles (PT)'],['America/Mexico_City','México (CT)'],['America/Bogota','Colombia (COT)'],['America/Lima','Perú (PET)'],['America/Santo_Domingo','Rep. Dominicana (AST)']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
            </div>

            {/* Nómina */}
            <div className="rounded-2xl p-5 space-y-4" style={CARD}>
              <p className="text-[13px] font-bold pb-1" style={{color:T.black,borderBottom:`1px solid ${T.border}`}}>Reglas de nómina</p>
              <Field label="Período de pago">
                <div className="grid grid-cols-4 gap-2">
                  {[{v:'weekly',l:'Semanal'},{v:'biweekly',l:'Quincenal'},{v:'semimonthly',l:'Semi-mensual'},{v:'monthly',l:'Mensual'}].map(({v,l})=>(
                    <button key={v} type="button" onClick={()=>setForm(p=>({...p,pay_period_type:v}))} className="py-2.5 rounded-xl text-xs font-semibold transition-all" style={{background:form.pay_period_type===v?T.black:'transparent',color:form.pay_period_type===v?T.white:T.gray,border:`1px solid ${form.pay_period_type===v?T.black:T.border}`}}>{l}</button>
                  ))}
                </div>
              </Field>
              <Field label="Overtime — después de cuántas horas semanales">
                <div className="flex items-center gap-3">
                  <input type="number" min={1} max={80} value={form.overtime_weekly_hrs} onChange={e=>setForm(p=>({...p,overtime_weekly_hrs:Number(e.target.value)}))} className="w-24 h-11 rounded-xl px-3 text-sm text-center font-bold" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}/>
                  <div><p className="text-sm font-semibold" style={{color:T.black}}>horas por semana</p><p className="text-[11px]" style={{color:T.grayMid}}>Las horas adicionales se pagan a 1.5×</p></div>
                </div>
              </Field>
            </div>

            {/* Geocerca */}
            <div className="rounded-2xl p-5 space-y-4" style={CARD}>
              <div className="flex items-center justify-between pb-1" style={{borderBottom:`1px solid ${T.border}`}}>
                <p className="text-[13px] font-bold" style={{color:T.black}}>Geocerca (Geofence)</p>
                <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={{background:T.indigoLt,color:T.indigo}}>App móvil</span>
              </div>
              <p className="text-xs" style={{color:T.gray}}>Radio desde la ubicación del negocio donde los empleados pueden ponchar.</p>
              <Field label="Radio permitido">
                <div className="flex items-center gap-3">
                  <input type="number" min={50} max={5000} step={50} value={form.geofence_radius_meters} onChange={e=>setForm(p=>({...p,geofence_radius_meters:Number(e.target.value)}))} className="w-24 h-11 rounded-xl px-3 text-sm text-center font-bold" style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}/>
                  <div><p className="text-sm font-semibold" style={{color:T.black}}>metros</p><p className="text-[11px]" style={{color:T.grayMid}}>Recomendado: 100–300m</p></div>
                </div>
                <div className="mt-3 h-2 rounded-full overflow-hidden" style={{background:T.grayLt}}>
                  <div className="h-full rounded-full transition-all" style={{width:`${Math.min(form.geofence_radius_meters/5000*100,100)}%`,background:T.indigo}}/>
                </div>
              </Field>
            </div>

            <button type="submit" disabled={saving} className="w-full h-12 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all" style={{background:saved?T.green:T.black,opacity:saving?0.7:1}}>
              {saving?<span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:saved?<><CheckCircle2 size={18}/>¡Guardado!</>:<>Guardar cambios</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
