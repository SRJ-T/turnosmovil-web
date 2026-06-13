import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  LayoutDashboard, Calendar as CalendarIcon, Users, DollarSign, Settings,
  TrendingUp, ClipboardCheck, Bell, Menu, X, Plus, Download,
  CheckCircle2, XCircle, FileText, ChevronLeft, ChevronRight, Clock,
  UserPlus, AlertTriangle, Trash2, Search, BarChart3, HelpCircle,
  MinusCircle, LogOut, RefreshCw, ChevronDown, ChevronUp,
  RadioTower, TimerOff, Send, Pencil, Undo2, LayoutGrid, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, fmtShiftDt, diffHours } from './lib/supabase';

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
const MONTH_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Employee { id:string; name:string; last_name:string|null; email:string; phone:string|null; job_title:string|null; role:string; hourly_rate:number; employee_color:string|null; status:string; business_id:string; }
interface Shift { id:string; employee_id:string; business_id:string; date:string; start_time:string; end_time:string; status:string; break_minutes:number; employee?:Employee; }
interface ClockEntry { id:string; employee_id:string; business_id:string; shift_id:string|null; clock_in:string; clock_out:string|null; status:string; break_minutes:number; rejection_note:string|null; approved_hours?:number|null; employee?:Employee; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isoDate(d:Date) { return d.toISOString().split('T')[0]; }
function weekDays(anchor:Date) {
  const mon = new Date(anchor); const dow = mon.getDay();
  mon.setDate(mon.getDate()-(dow===0?6:dow-1));
  return Array.from({length:7},(_,i)=>{ const d=new Date(mon); d.setDate(mon.getDate()+i); return d; });
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
  const [activeTab,setActiveTab] = useState('dashboard');
  const [sidebarOpen,setSidebarOpen] = useState(false);
  const [bizId,setBizId] = useState<string|null>(null);
  const [ownerName,setOwnerName] = useState('');
  const uid = session.user.id;

  useEffect(()=>{
    supabase.from('businesses').select('id').eq('owner_id',uid).single().then(({data})=>setBizId(data?.id??null));
    supabase.from('profiles').select('name,last_name').eq('id',uid).single().then(({data})=>{if(data)setOwnerName(`${data.name}${data.last_name?' '+data.last_name:''}`)});
  },[uid]);

  const sidebar = (
    <div className="flex flex-col h-full" style={{background:T.black}}>
      <div className="p-5 flex items-center justify-between" style={{borderBottom:`1px solid ${T.white}10`}}>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl flex items-center justify-center text-lg font-black" style={{background:T.blue,color:T.white}}>T</div>
          <div><p className="font-bold text-white text-[15px] leading-tight">Turnos Móvil</p><p className="text-[9px] font-semibold uppercase tracking-widest mt-0.5" style={{color:`${T.white}45`}}>Business Portal</p></div>
        </div>
        <button onClick={()=>setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg" style={{color:`${T.white}45`}}><X size={18}/></button>
      </div>
      <div className="mx-3 mt-4 mb-2 p-3 rounded-2xl flex items-center gap-3" style={{background:`${T.white}08`}}>
        <div className="size-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{background:T.blueLt,color:T.blue}}>{ownerName?ownerName[0].toUpperCase():'?'}</div>
        <div className="min-w-0"><p className="text-[13px] font-semibold text-white truncate leading-tight">{ownerName||'Dueño'}</p><p className="text-[10px] truncate" style={{color:`${T.white}45`}}>Administrador</p></div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <NavItem icon={LayoutDashboard} label="Inicio"        active={activeTab==='dashboard'} onClick={()=>{setActiveTab('dashboard');setSidebarOpen(false)}} color={NAV.dashboard}/>
        <NavItem icon={Users}          label="Personal"      active={activeTab==='team'}      onClick={()=>{setActiveTab('team');setSidebarOpen(false)}} color={NAV.team}/>
        <NavItem icon={CalendarIcon}   label="Turnos"        active={activeTab==='calendar'}  onClick={()=>{setActiveTab('calendar');setSidebarOpen(false)}} color={NAV.calendar}/>
        <NavItem icon={ClipboardCheck} label="Horas"         active={activeTab==='approvals'} onClick={()=>{setActiveTab('approvals');setSidebarOpen(false)}} color={NAV.approvals}/>
        <NavItem icon={DollarSign}     label="Nómina"        active={activeTab==='payroll'}   onClick={()=>{setActiveTab('payroll');setSidebarOpen(false)}} color={NAV.payroll}/>
        <div className="pt-3 pb-1 px-3"><p className="text-[9px] font-bold uppercase tracking-widest" style={{color:`${T.white}35`}}>Gestión</p></div>
        <NavItem icon={BarChart3}      label="Reportes"      active={activeTab==='reports'}   onClick={()=>{setActiveTab('reports');setSidebarOpen(false)}} color={NAV.reports}/>
        <NavItem icon={Settings}       label="Configuración" active={activeTab==='settings'}  onClick={()=>{setActiveTab('settings');setSidebarOpen(false)}} color={NAV.settings}/>
        <NavItem icon={HelpCircle}     label="Ayuda"         active={false} onClick={()=>{}} color={T.indigo}/>
      </div>
      <div className="p-3" style={{borderTop:`1px solid ${T.white}10`}}>
        <div className="px-3 py-1 text-[10px] truncate mb-1" style={{color:`${T.white}35`}}>{session.user.email}</div>
        <button onClick={()=>supabase.auth.signOut()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:opacity-80">
          <div className="size-8 rounded-xl flex items-center justify-center shrink-0" style={{background:`${T.red}22`}}><LogOut size={15} color={T.red}/></div>
          <span className="text-[13px] font-semibold" style={{color:T.red}}>Cerrar Sesión</span>
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
              {activeTab==='reports'   && <ReportsView/>}
              {activeTab==='settings'  && <div className="p-6"><div className="rounded-2xl p-16 text-center" style={CARD}><Settings size={44} color={T.grayMid} className="mx-auto mb-4"/><p className="text-lg font-bold" style={{color:T.black}}>Configuración</p><p className="text-sm mt-1" style={{color:T.gray}}>Disponible próximamente.</p></div></div>}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── MINI CHART ───────────────────────────────────────────────────────────────
function MiniBarChart({data,color}:{data:number[];color:string}) {
  const max = Math.max(...data,1);
  return (
    <div className="flex items-end gap-1 h-10">
      {data.map((v,i)=>(
        <div key={i} className="flex-1 rounded-sm transition-all" style={{height:`${Math.max((v/max)*100,8)}%`,background:i===data.length-1?color:`${color}50`}}/>
      ))}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardView({bizId,setActiveTab}:{bizId:string;setActiveTab:(t:string)=>void}) {
  const [stats,setStats] = useState({activeNow:0,notClockedIn:0,todayShifts:0,pending:0});
  const [todayShifts,setTodayShifts] = useState<Shift[]>([]);
  const [activity,setActivity] = useState<ClockEntry[]>([]);
  const [monthApproved,setMonthApproved] = useState(0);
  const [monthTotal,setMonthTotal] = useState(0);
  const [weekData,setWeekData] = useState<number[]>([0,0,0,0,0,0,0]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    (async()=>{
      const today=isoDate(new Date()); const now=new Date();
      const monthStart=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
      const days=weekDays(now); const weekStart=isoDate(days[0]);

      const [shiftsRes,pendingRes,actRes,mShiftsRes,weekEntriesRes]=await Promise.all([
        supabase.from('shifts').select('*,profiles(*)').eq('business_id',bizId).eq('date',today).order('start_time'),
        supabase.from('clock_entries').select('id').eq('business_id',bizId).eq('status','pending'),
        supabase.from('clock_entries').select('*,profiles(*)').eq('business_id',bizId).order('clock_in',{ascending:false}).limit(8),
        supabase.from('shifts').select('id,start_time,end_time,break_minutes,date').eq('business_id',bizId).gte('date',monthStart),
        supabase.from('clock_entries').select('clock_in,clock_out,break_minutes').eq('business_id',bizId).eq('status','approved').not('clock_out','is',null).gte('clock_in',`${weekStart}T00:00:00`),
      ]);

      const shifts:Shift[]=((shiftsRes.data??[]) as any[]).map(s=>({...s,employee:s.profiles}));
      setTodayShifts(shifts);

      const shiftIds=shifts.map(s=>s.id);
      let entries:ClockEntry[]=[];
      if(shiftIds.length>0){const{data}=await supabase.from('clock_entries').select('*').in('shift_id',shiftIds).neq('status','rejected');entries=(data??[]) as ClockEntry[];}

      const activeNow=shifts.filter(s=>entries.find(e=>e.shift_id===s.id&&e.clock_in&&!e.clock_out)).length;
      const notClockedIn=shifts.filter(s=>!entries.find(e=>e.shift_id===s.id)).length;

      // Monthly total
      let totalMins=0;
      for(const s of(mShiftsRes.data??[])){
        const clean=(dt:string)=>dt.replace(/\+00(:\d{2})?$/,'').replace(' ','T');
        const dtS=new Date(clean(s.start_time||`${s.date}T00:00:00`)); const dtE=new Date(clean(s.end_time||`${s.date}T00:00:00`));
        if(!isNaN(dtS.getTime())&&!isNaN(dtE.getTime()))totalMins+=Math.max(0,(dtE.getTime()-dtS.getTime())/60000-(s.break_minutes??0));
      }
      let approvedMins=0;
      const mIds=(mShiftsRes.data??[]).map((s:any)=>s.id).filter(Boolean);
      if(mIds.length>0){const{data:appr}=await supabase.from('clock_entries').select('clock_in,clock_out,break_minutes').in('shift_id',mIds).eq('status','approved');
        for(const e of(appr??[])){if(e.clock_out)approvedMins+=Math.max(0,(new Date(e.clock_out).getTime()-new Date(e.clock_in).getTime())/60000-((e.break_minutes??0) as number));}}

      // Weekly bar chart
      const wd=Array(7).fill(0);
      for(const e of(weekEntriesRes.data??[])){
        const d=new Date(e.clock_in); const idx=(d.getDay()+6)%7;
        wd[idx]+=diffHours(e.clock_in,e.clock_out);
      }
      setWeekData(wd);
      setStats({activeNow,notClockedIn,todayShifts:shifts.length,pending:pendingRes.data?.length??0});
      setActivity(((actRes.data??[]) as any[]).map(e=>({...e,employee:e.profiles})));
      setMonthApproved(approvedMins); setMonthTotal(totalMins);
      setLoading(false);
    })();
  },[bizId]);

  const progress=monthTotal>0?Math.min(monthApproved/monthTotal,1):0;
  const todayLabel=new Date().toLocaleDateString('es-PR',{weekday:'long',day:'numeric',month:'long'});

  return (
    <div>
      <div style={{background:'linear-gradient(135deg,#064E3B,#1D4ED8)'}} className="px-5 pt-6 pb-6">
        <div className="flex items-center justify-between mb-5">
          <div><p className="text-sm capitalize" style={{color:'rgba(255,255,255,0.65)'}}>{todayLabel}</p><h1 className="text-2xl font-bold text-white mt-0.5">Dashboard</h1></div>
          <button onClick={()=>setActiveTab('calendar')} className="size-11 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform" style={{background:T.orange}}><Plus size={22} color="white" strokeWidth={2.5}/></button>
        </div>
        {loading?(
          <div className="grid grid-cols-2 gap-3">{[0,1,2,3].map(i=><div key={i} className="h-20 rounded-2xl animate-pulse" style={{background:'rgba(255,255,255,0.1)'}}/>)}</div>
        ):(
          <div className="grid grid-cols-2 gap-3">
            {[
              {label:'En turno ahora',value:stats.activeNow, color:'#1D9E75',icon:RadioTower},
              {label:'Sin ponchar',   value:stats.notClockedIn,color:T.amber,icon:TimerOff},
              {label:'Turnos hoy',   value:stats.todayShifts,color:T.blue, icon:Users},
              {label:'Por aprobar',  value:stats.pending,   color:T.red,  icon:AlertTriangle,tab:'approvals'},
            ].map(({label,value,color,icon:Icon,tab})=>(
              <div key={label} onClick={tab?()=>setActiveTab(tab):undefined} className={`flex items-center gap-3 p-4 rounded-2xl ${tab?'cursor-pointer':''}`} style={{background:'#F2F2F4'}}>
                <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{background:`${color}30`}}><Icon size={20} color={color}/></div>
                <div><p className="text-2xl font-bold leading-none" style={{color}}>{value}</p><p className="text-[10px] mt-0.5 leading-tight" style={{color:`${color}99`}}>{label}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left column */}
          <div className="space-y-4">
            {/* Monthly progress */}
            <div className="rounded-2xl p-5" style={CARD}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-semibold" style={{color:T.black}}>Horas aprobadas este mes</span>
                <span className="text-[13px] font-bold" style={{color:T.blue}}>{Math.round(progress*100)}%</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{background:T.blueLt}}>
                <div className="h-full rounded-full transition-all duration-700" style={{width:`${progress*100}%`,background:T.blue}}/>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-semibold" style={{color:T.black}}>{fmtHours(monthApproved/60)}</span>
                <span className="text-xs" style={{color:T.gray}}>de {fmtHours(monthTotal/60)}</span>
              </div>
            </div>

            {/* Weekly hours bar */}
            <div className="rounded-2xl p-5" style={CARD}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-semibold" style={{color:T.black}}>Horas esta semana</span>
                <span className="text-[13px] font-bold" style={{color:T.indigo}}>{fmtHours(weekData.reduce((a,b)=>a+b,0))}</span>
              </div>
              <MiniBarChart data={weekData} color={T.indigo}/>
              <div className="flex mt-1.5">
                {['L','M','M','J','V','S','D'].map((d,i)=>(
                  <div key={i} className="flex-1 text-center text-[9px] font-semibold" style={{color:i===new Date().getDay()-1?T.indigo:T.grayMid}}>{d}</div>
                ))}
              </div>
            </div>

            {/* Today employees */}
            {!loading&&(todayShifts.length>0?(
              <div className="rounded-2xl overflow-hidden" style={CARD}>
                <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:`1px solid ${T.border}`}}>
                  <span className="text-[13px] font-bold" style={{color:T.black}}>Empleados hoy</span>
                  <span className="text-[11px] font-semibold" style={{color:T.blue}}>{todayShifts.length} turnos</span>
                </div>
                {todayShifts.map((s,i)=>{
                  const color=empColor(s.employee,i);
                  return(
                    <div key={s.id} className="flex items-center gap-3 px-4 py-3" style={{borderBottom:i<todayShifts.length-1?`1px solid #F5F5F5`:'none'}}>
                      <div className="size-9 rounded-[10px] flex items-center justify-center text-xs font-bold text-white shrink-0" style={{background:color}}>{empInitials(s.employee)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold truncate" style={{color:T.black}}>{empName(s.employee)}</p>
                        <p className="text-xs flex items-center gap-1" style={{color:T.gray}}><Clock size={10}/>{fmtShiftDt(s.start_time)} – {fmtShiftDt(s.end_time)}</p>
                      </div>
                      <StatusChip status={s.status}/>
                    </div>
                  );
                })}
              </div>
            ):(
              <div onClick={()=>setActiveTab('calendar')} className="rounded-2xl py-10 flex flex-col items-center cursor-pointer" style={CARD}>
                <div className="size-14 rounded-full flex items-center justify-center mb-4" style={{background:T.blueLt}}><CalendarIcon size={28} color={T.blue}/></div>
                <p className="text-[15px] font-bold" style={{color:T.black}}>Sin turnos para hoy</p>
                <p className="text-sm mt-1" style={{color:T.gray}}>Toca para crear turnos</p>
              </div>
            ))}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {label:'Crear Turno',  icon:Plus,         color:T.blue,   bg:T.blueLt,  tab:'calendar'},
                {label:'Ver Personal', icon:Users,         color:T.green,  bg:T.greenLt, tab:'team'},
                {label:'Aprobar Horas',icon:ClipboardCheck,color:T.amber,  bg:T.amberLt, tab:'approvals'},
                {label:'Ver Nómina',   icon:DollarSign,    color:T.violet, bg:T.violetLt,tab:'payroll'},
              ].map(({label,icon:Icon,color,bg,tab})=>(
                <button key={label} onClick={()=>setActiveTab(tab)} className="flex items-center gap-2.5 p-3.5 rounded-xl text-left transition-all hover:opacity-80 active:scale-95" style={{background:bg}}>
                  <Icon size={16} style={{color,flexShrink:0}}/>
                  <span className="text-[12px] font-bold" style={{color}}>{label}</span>
                </button>
              ))}
            </div>

            {/* Recent activity */}
            {!loading&&activity.length>0&&(
              <div className="rounded-2xl overflow-hidden" style={CARD}>
                <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:`1px solid ${T.border}`}}>
                  <span className="text-[13px] font-bold" style={{color:T.black}}>Actividad reciente</span>
                </div>
                {activity.map((e,i)=>{
                  const hrs=diffHours(e.clock_in,e.clock_out);
                  const s=e.status==='approved'?{bg:T.greenLt,fg:T.green,label:'Aprobado'}:e.status==='rejected'?{bg:T.redLt,fg:T.red,label:'Rechazado'}:{bg:T.amberLt,fg:T.amber,label:'Pendiente'};
                  return(
                    <div key={e.id} className="flex items-center gap-3 px-4 py-3" style={{borderBottom:i<activity.length-1?`1px solid #F5F5F5`:'none'}}>
                      <div className="size-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{background:T.blueLt,color:T.blue}}>{empInitials(e.employee)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold truncate" style={{color:T.black}}>{empName(e.employee)}</p>
                        <p className="text-xs" style={{color:T.gray}}>{new Date(e.clock_in).toLocaleString('es-PR',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',hour12:true})}{hrs>0&&` · ${fmtHours(hrs)}`}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0" style={{background:s.bg,color:s.fg}}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
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
      <div className="px-5 pt-6 pb-5" style={{background:T.white,borderBottom:`1px solid ${T.border}`}}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold" style={{color:T.black}}>Personal</h1>
          <div className="flex gap-2">
            <button onClick={load} className="size-10 rounded-xl flex items-center justify-center" style={{background:T.bg,border:`1px solid ${T.border}`}}><RefreshCw size={16} color={T.gray}/></button>
            <button onClick={openAdd} className="h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-bold text-white" style={{background:T.green}}><UserPlus size={15}/> Invitar empleado</button>
          </div>
        </div>
        <div className="flex gap-2">
          {(['all','active','pending','inactive'] as const).map(f=>{
            const labels={all:'Todos',active:'Activos',pending:'Pendientes',inactive:'Inactivos'};
            const colors={all:{bg:T.blueLt,fg:T.blue},active:{bg:T.greenLt,fg:T.green},pending:{bg:T.amberLt,fg:T.amber},inactive:{bg:T.grayLt,fg:T.grayMid}};
            const c=colors[f]; const sel=filter===f;
            return(
              <button key={f} onClick={()=>setFilter(f)} className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold transition-all" style={{background:sel?c.bg:'transparent',color:sel?c.fg:T.gray,border:`1px solid ${sel?c.fg+'44':T.border}`}}>
                {labels[f]} <span className="font-bold">({counts[f]})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={16} color={T.gray}/>
          <input type="text" placeholder="Buscar por nombre o puesto…" value={search} onChange={e=>setSearch(e.target.value)} className="w-full h-11 pl-11 pr-4 rounded-2xl text-[14px]" style={{background:T.white,border:`1.5px solid ${T.border}`,color:T.black,outline:'none'}}/>
        </div>

        {loading?Array.from({length:3}).map((_,i)=><div key={i} className="h-24 rounded-2xl animate-pulse" style={{background:T.white}}/>):
        filtered.length===0?(
          <div className="rounded-2xl py-16 flex flex-col items-center" style={CARD}>
            <div className="size-16 rounded-2xl flex items-center justify-center mb-4" style={{background:T.blueLt}}><Users size={32} color={T.blue}/></div>
            <p className="text-[15px] font-bold" style={{color:T.black}}>Sin empleados</p>
            <p className="text-sm mt-1" style={{color:T.gray}}>{search?'Intenta otra búsqueda':'Invita a tu primer empleado'}</p>
          </div>
        ):filtered.map((emp,i)=>{
          const color=empColor(emp,i);
          return(
            <motion.div key={emp.id} layout initial={{opacity:0,y:8}} animate={{opacity:emp.status==='inactive'?0.55:1,y:0}} className="rounded-2xl overflow-hidden" style={CARD}>
              <div className="flex items-center gap-3 px-4 py-4">
                <div className="size-12 rounded-[14px] flex items-center justify-center text-lg font-bold text-white shrink-0" style={{background:color}}>{empInitials(emp)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold leading-tight" style={{color:T.black}}>{empName(emp)}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {emp.job_title&&<span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{background:`${color}20`,color}}>{emp.job_title}</span>}
                    <span className="text-[11px]" style={{color:T.gray}}>${emp.hourly_rate}/hr</span>
                    {emp.phone&&<span className="text-[11px]" style={{color:T.gray}}>· {emp.phone}</span>}
                  </div>
                </div>
                <StatusChip status={emp.status}/>
              </div>
              <div className="flex items-center gap-2 px-4 pb-3 pt-1 flex-wrap" style={{borderTop:`1px solid ${T.border}`}}>
                {emp.status==='pending'&&<button onClick={async()=>{const{data:{session}}=await supabase.auth.getSession();await fetch('https://ctdxqijdmpigqgktlwxb.supabase.co/functions/v1/invite-employee',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session?.access_token}`},body:JSON.stringify({employee_id:emp.id})});}} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{background:T.blueLt,color:T.blue}}><Send size={13}/> Reenviar</button>}
                {emp.status==='active'&&<button onClick={()=>handleToggle(emp)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{background:T.amberLt,color:T.amber}}><MinusCircle size={13}/> Desactivar</button>}
                {emp.status==='inactive'&&<button onClick={()=>handleToggle(emp)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{background:T.greenLt,color:T.green}}><CheckCircle2 size={13}/> Activar</button>}
                <div className="flex-1"/>
                <button onClick={()=>openEdit(emp)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{background:T.indigoLt,color:T.indigo}}><Pencil size={13}/> Editar</button>
                <button onClick={()=>setConfirmDeleteId(emp.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{background:T.redLt,color:T.red}}><Trash2 size={13}/> Eliminar</button>
              </div>
            </motion.div>
          );
        })}
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

// ─── TURNOS ───────────────────────────────────────────────────────────────────
function TurnosView({bizId}:{bizId:string}) {
  const [employees,setEmployees] = useState<Employee[]>([]);
  const [shifts,setShifts] = useState<Shift[]>([]);
  const [weekAnchor,setWeekAnchor] = useState(new Date());
  const [selectedDate,setSelectedDate] = useState(isoDate(new Date()));
  const [viewMode,setViewMode] = useState<'grid'|'list'>('grid');
  const [showModal,setShowModal] = useState(false);
  const [editShift,setEditShift] = useState<Shift|null>(null);
  const [loading,setLoading] = useState(true);
  const [form,setForm] = useState({employee_id:'',date:isoDate(new Date()),start_time:'09:00',end_time:'17:00',status:'draft',break_minutes:0});

  const days=weekDays(weekAnchor);

  const load=useCallback(async()=>{
    setLoading(true);
    const[empRes,shiftRes]=await Promise.all([
      supabase.from('profiles').select('*').eq('business_id',bizId).eq('role','employee').eq('status','active'),
      supabase.from('shifts').select('*,profiles(*)').eq('business_id',bizId).gte('date',isoDate(days[0])).lte('date',isoDate(days[6])).order('start_time'),
    ]);
    setEmployees((empRes.data??[]) as Employee[]);
    setShifts(((shiftRes.data??[]) as any[]).map(s=>({...s,employee:s.profiles})));
    setLoading(false);
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

  const getShift=(empId:string,date:string)=>shifts.filter(s=>s.employee_id===empId&&s.date===date);
  const selectedShifts=shifts.filter(s=>s.date===selectedDate);
  const draftsCount=shifts.filter(s=>s.status==='draft').length;

  const statusColor=(status:string)=>({published:{bg:T.greenLt,fg:T.green},accepted:{bg:T.greenLt,fg:T.green},rejected:{bg:T.redLt,fg:T.red},draft:{bg:T.amberLt,fg:T.amber}}[status]??{bg:T.grayLt,fg:T.gray});

  return (
    <div>
      <div className="px-5 pt-6 pb-5" style={{background:T.white,borderBottom:`1px solid ${T.border}`}}>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold" style={{color:T.black}}>Turnos</h1>
          <div className="flex items-center gap-2">
            <div className="flex p-1 rounded-xl gap-1" style={{background:T.bg,border:`1px solid ${T.border}`}}>
              <button onClick={()=>setViewMode('grid')} className="size-8 rounded-lg flex items-center justify-center" style={{background:viewMode==='grid'?T.white:'transparent',boxShadow:viewMode==='grid'?'0 1px 3px rgba(0,0,0,0.1)':'none'}}><LayoutGrid size={15} color={viewMode==='grid'?T.black:T.grayMid}/></button>
              <button onClick={()=>setViewMode('list')} className="size-8 rounded-lg flex items-center justify-center" style={{background:viewMode==='list'?T.white:'transparent',boxShadow:viewMode==='list'?'0 1px 3px rgba(0,0,0,0.1)':'none'}}><List size={15} color={viewMode==='list'?T.black:T.grayMid}/></button>
            </div>
            <button onClick={()=>openAdd(selectedDate)} className="h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-bold text-white" style={{background:T.blue}}><Plus size={15} strokeWidth={2.5}/> Crear turno</button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button onClick={()=>setWeekAnchor(d=>{const n=new Date(d);n.setDate(n.getDate()-7);return n;})} className="size-8 rounded-xl flex items-center justify-center" style={{background:T.bg,border:`1px solid ${T.border}`}}><ChevronLeft size={16} color={T.gray}/></button>
          <span className="text-[13px] font-semibold" style={{color:T.black}}>{MONTH_ES[days[0].getMonth()]} {days[0].getDate()} – {MONTH_ES[days[6].getMonth()]} {days[6].getDate()}, {days[0].getFullYear()}</span>
          <button onClick={()=>setWeekAnchor(d=>{const n=new Date(d);n.setDate(n.getDate()+7);return n;})} className="size-8 rounded-xl flex items-center justify-center" style={{background:T.bg,border:`1px solid ${T.border}`}}><ChevronRight size={16} color={T.gray}/></button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-xs" style={{color:T.gray}}>{shifts.length} turno{shifts.length!==1?'s':''} esta semana</p>
          <button onClick={handlePublishAll} disabled={draftsCount===0} className="h-9 px-4 rounded-xl flex items-center gap-2 text-xs font-bold text-white transition-all" style={{background:draftsCount>0?T.amber:T.green,opacity:draftsCount===0?0.7:1}}>
            <CheckCircle2 size={14}/>{draftsCount>0?`Publicar ${draftsCount} turno${draftsCount>1?'s':''}`:'Todo publicado'}
          </button>
        </div>

        {loading?<div className="h-64 rounded-2xl animate-pulse" style={{background:T.white}}/>:

        viewMode==='grid'?(
          <div className="rounded-2xl overflow-hidden" style={CARD}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr style={{background:T.bg,borderBottom:`1px solid ${T.border}`}}>
                    <th className="text-left px-4 py-3 text-xs font-bold w-36" style={{color:T.gray}}>Empleado</th>
                    {days.map(d=>{
                      const iso=isoDate(d); const isToday=iso===isoDate(new Date());
                      return(
                        <th key={iso} onClick={()=>setSelectedDate(iso)} className="text-center px-2 py-3 text-xs font-bold cursor-pointer min-w-[90px]" style={{color:isToday?T.blue:T.gray,background:selectedDate===iso?T.blueDim:'transparent'}}>
                          <div>{DAY_ES[d.getDay()]}</div>
                          <div className="text-base font-black mt-0.5" style={{color:isToday?T.blue:T.black}}>{d.getDate()}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {employees.length===0?(
                    <tr><td colSpan={8} className="text-center py-12 text-sm" style={{color:T.gray}}>No hay empleados activos</td></tr>
                  ):employees.map((emp,ei)=>(
                    <tr key={emp.id} style={{borderBottom:`1px solid #F5F5F5`}}>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-[9px] flex items-center justify-center text-xs font-bold text-white shrink-0" style={{background:empColor(emp,ei)}}>{empInitials(emp)}</div>
                          <div className="min-w-0"><p className="text-xs font-semibold truncate" style={{color:T.black}}>{emp.name}</p><p className="text-[10px] truncate" style={{color:T.gray}}>{emp.job_title??'—'}</p></div>
                        </div>
                      </td>
                      {days.map(d=>{
                        const iso=isoDate(d); const dayShifts=getShift(emp.id,iso);
                        const isSel=selectedDate===iso;
                        return(
                          <td key={iso} className="px-1.5 py-2 align-top" style={{background:isSel?T.blueDim:'transparent',cursor:'pointer'}} onClick={()=>setSelectedDate(iso)}>
                            {dayShifts.length>0?dayShifts.map(s=>{const sc=statusColor(s.status);return(
                              <div key={s.id} onClick={(e)=>{e.stopPropagation();openEdit(s);}} className="rounded-lg px-2 py-1 mb-1 text-[10px] font-semibold leading-tight cursor-pointer hover:opacity-80" style={{background:sc.bg,color:sc.fg,border:`1px solid ${sc.fg}33`}}>
                                {fmtShiftDt(s.start_time)}–{fmtShiftDt(s.end_time)}
                              </div>
                            );}):(
                              <div onClick={(e)=>{e.stopPropagation();openAdd(iso,emp.id);}} className="h-7 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" style={{border:`1.5px dashed ${T.border}`}}>
                                <Plus size={12} color={T.grayMid}/>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ):(
          <>
            <div className="grid grid-cols-7 gap-1.5">
              {days.map(d=>{const iso=isoDate(d);const sel=iso===selectedDate;const has=shifts.some(s=>s.date===iso);const isToday=iso===isoDate(new Date());
                return(<button key={iso} onClick={()=>setSelectedDate(iso)} className="flex flex-col items-center py-2.5 rounded-2xl transition-all active:scale-95" style={{background:sel?T.blue:isToday?T.blueLt:T.white,border:`1px solid ${sel?T.blue:T.border}`}}>
                  <span className="text-[9px] font-bold uppercase" style={{color:sel?'rgba(255,255,255,0.7)':T.grayMid}}>{DAY_ES[d.getDay()]}</span>
                  <span className="text-lg font-bold leading-none mt-0.5" style={{color:sel?T.white:T.black}}>{d.getDate()}</span>
                  <div className="w-2 h-2 rounded-full mt-1.5" style={{background:has?(sel?'white':T.green):'transparent'}}/>
                </button>);
              })}
            </div>
            {selectedShifts.length===0?(
              <div className="rounded-2xl py-14 flex flex-col items-center" style={CARD}>
                <p className="text-sm font-semibold mb-3" style={{color:T.gray}}>No hay turnos para este día</p>
                <button onClick={()=>openAdd(selectedDate)} className="h-10 px-5 rounded-xl text-xs font-bold text-white" style={{background:T.blue}}>Crear Turno</button>
              </div>
            ):(
              <div className="rounded-2xl overflow-hidden" style={CARD}>
                {selectedShifts.map((s,i)=>{const sc=statusColor(s.status);const color=empColor(s.employee);
                  return(<div key={s.id} className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50" onClick={()=>openEdit(s)} style={{borderBottom:i<selectedShifts.length-1?`1px solid #F5F5F5`:'none'}}>
                    <div className="size-10 rounded-[12px] flex items-center justify-center text-sm font-bold text-white shrink-0" style={{background:color}}>{empInitials(s.employee)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold" style={{color:T.black}}>{empName(s.employee)}</p>
                      <div className="flex items-center gap-1 mt-0.5"><Clock size={11} color={T.gray}/><p className="text-xs" style={{color:T.gray}}>{fmtShiftDt(s.start_time)} – {fmtShiftDt(s.end_time)}{s.break_minutes>0&&` · ${s.break_minutes}min break`}</p></div>
                    </div>
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0" style={{background:sc.bg,color:sc.fg}}>{s.status==='published'?'Publicado':s.status==='accepted'?'Aceptado':s.status==='rejected'?'Rechazado':'Borrador'}</span>
                  </div>);
                })}
              </div>
            )}
          </>
        )}
      </div>

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
    </div>
  );
}

// ─── APROBACIONES ─────────────────────────────────────────────────────────────
function ApprovalsView({bizId}:{bizId:string}) {
  const [entries,setEntries] = useState<ClockEntry[]>([]);
  const [loading,setLoading] = useState(true);
  const [tab,setTab] = useState<'pending'|'history'>('pending');
  const [expandedGroups,setExpandedGroups] = useState<Set<string>>(new Set());
  const [historyFilter,setHistoryFilter] = useState('');

  const load=useCallback(async()=>{
    setLoading(true);
    const{data}=await supabase.from('clock_entries').select('*,profiles(*)').eq('business_id',bizId).not('clock_out','is',null).order('clock_in',{ascending:false}).limit(200);
    const all:ClockEntry[]=((data??[]) as any[]).map(e=>({...e,employee:e.profiles}));
    setEntries(all);
    const pendingEmpIds=new Set(all.filter(e=>e.status==='pending').map(e=>e.employee_id));
    setExpandedGroups(pendingEmpIds);
    setLoading(false);
  },[bizId]);
  useEffect(()=>{load();},[load]);

  const handleAction=async(id:string,status:'approved'|'rejected')=>{ await supabase.from('clock_entries').update({status}).eq('id',id); setEntries(prev=>prev.map(e=>e.id===id?{...e,status}:e)); };
  const handleApproveAll=async(ids:string[])=>{ await supabase.from('clock_entries').update({status:'approved'}).in('id',ids); setEntries(prev=>prev.map(e=>ids.includes(e.id)?{...e,status:'approved'}:e)); };

  const pending=entries.filter(e=>e.status==='pending');
  const history=entries.filter(e=>e.status!=='pending');
  const byEmp:Record<string,ClockEntry[]>={};
  for(const e of pending)byEmp[e.employee_id]=[...(byEmp[e.employee_id]??[]),e];

  const filteredHistory=historyFilter?history.filter(e=>empName(e.employee).toLowerCase().includes(historyFilter.toLowerCase())):history;
  const totalPendingHrs=pending.reduce((s,e)=>s+diffHours(e.clock_in,e.clock_out),0);

  return (
    <div>
      <div className="px-5 pt-6 pb-5" style={{background:T.white,borderBottom:`1px solid ${T.border}`}}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold" style={{color:T.black}}>Horas Aprobadas</h1>
          <button onClick={load} className="size-10 rounded-xl flex items-center justify-center" style={{background:T.bg,border:`1px solid ${T.border}`}}><RefreshCw size={16} color={T.gray}/></button>
        </div>
        {pending.length>0&&(
          <div className="flex items-center gap-3 p-3 rounded-2xl mb-4" style={{background:T.amberLt,border:`1px solid ${T.amber}33`}}>
            <AlertTriangle size={18} color={T.amber}/>
            <div className="flex-1"><p className="text-sm font-bold" style={{color:T.amber}}>{pending.length} marcación{pending.length!==1?'es':''} por aprobar</p><p className="text-xs" style={{color:`${T.amber}BB`}}>{fmtHours(totalPendingHrs)} de horas totales pendientes</p></div>
            <button onClick={()=>handleApproveAll(pending.map(e=>e.id))} className="px-3 py-1.5 rounded-xl text-xs font-bold text-white" style={{background:T.green}}>Aprobar todo</button>
          </div>
        )}
        <div className="flex p-1 rounded-full" style={{background:T.white,border:`1px solid ${T.border}`}}>
          {([['pending',`Esperando (${pending.length})`],['history',`Historial (${history.length})`]] as const).map(([t,label],i)=>{
            const sel=tab===t; const color=i===0?T.blue:T.green;
            return(<button key={t} onClick={()=>setTab(t)} className="flex-1 py-2 rounded-full text-xs font-semibold transition-all" style={{background:sel?color:'transparent',color:sel?T.white:T.gray,boxShadow:sel?`0 2px 6px ${color}55`:''}}>{label}</button>);
          })}
        </div>
      </div>

      <div className="p-5 space-y-3">
        {loading?Array.from({length:2}).map((_,i)=><div key={i} className="h-32 rounded-2xl animate-pulse" style={{background:T.white}}/>):

        tab==='pending'?(
          Object.keys(byEmp).length===0?(
            <div className="rounded-2xl py-16 flex flex-col items-center" style={CARD}><CheckCircle2 size={48} color={T.green} className="mb-3"/><p className="text-[15px] font-bold" style={{color:T.black}}>¡Todo al día!</p><p className="text-sm mt-1" style={{color:T.gray}}>No hay planillas pendientes</p></div>
          ):Object.entries(byEmp).map(([empId,empEntries])=>{
            const emp=empEntries[0].employee; const color=empColor(emp);
            const totalH=empEntries.reduce((s,e)=>s+diffHours(e.clock_in,e.clock_out),0);
            const expanded=expandedGroups.has(empId);
            const toggle=()=>setExpandedGroups(prev=>{const n=new Set(prev);expanded?n.delete(empId):n.add(empId);return n;});
            return(
              <div key={empId} className="rounded-2xl overflow-hidden" style={CARD}>
                <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer" onClick={toggle}>
                  <div className="size-11 rounded-[12px] flex items-center justify-center text-base font-bold text-white shrink-0" style={{background:color}}>{empInitials(emp)}</div>
                  <div className="flex-1 min-w-0"><p className="text-[15px] font-bold leading-tight" style={{color:T.black}}>{empName(emp)}</p><p className="text-xs" style={{color:T.gray}}>{empEntries.length} marcac. · {emp?.job_title??'—'}</p></div>
                  <div className="px-3.5 py-2 rounded-xl text-[15px] font-black mr-2" style={{background:'#F0FDF4',border:`1px solid ${T.greenLt}`,color:T.green}}>{fmtHours(totalH)}</div>
                  {expanded?<ChevronUp size={18} color={T.gray}/>:<ChevronDown size={18} color={T.gray}/>}
                </div>
                <AnimatePresence>
                  {expanded&&(
                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} style={{overflow:'hidden'}}>
                      {empEntries.map(entry=>{
                        const hrs=diffHours(entry.clock_in,entry.clock_out);
                        const ci=new Date(entry.clock_in); const co=entry.clock_out?new Date(entry.clock_out):null;
                        return(
                          <div key={entry.id} className="mx-3 mb-2 p-3 rounded-xl" style={{background:T.bg}}>
                            <div className="flex items-start justify-between mb-3">
                              <div><p className="text-[13px] font-semibold" style={{color:T.black}}>{ci.toLocaleDateString('es-PR',{weekday:'short',day:'numeric',month:'short'})}</p>
                              <p className="text-xs" style={{color:T.gray}}>{ci.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true})}{co&&` – ${co.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true})}`}</p></div>
                              <div className="text-right"><p className="text-sm font-bold" style={{color:T.black}}>{fmtHours(hrs)}</p>{hrs>8&&<p className="text-[10px] font-bold" style={{color:T.amber}}>+{fmtHours(hrs-8)} OT</p>}</div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={()=>handleAction(entry.id,'rejected')} className="flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold" style={{background:T.white,border:`1px solid ${T.red}66`,color:T.red}}><XCircle size={14}/> Rechazar</button>
                              <button onClick={()=>handleAction(entry.id,'approved')} className="flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-white" style={{background:T.green}}><CheckCircle2 size={14}/> Aprobar</button>
                            </div>
                          </div>
                        );
                      })}
                      <div className="px-3 pb-3"><button onClick={()=>handleApproveAll(empEntries.map(e=>e.id))} className="w-full h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white" style={{background:T.green,boxShadow:`0 3px 8px ${T.green}44`}}><CheckCircle2 size={16}/> Aprobar Todo</button></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ):(
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} color={T.gray}/>
              <input type="text" placeholder="Filtrar por empleado…" value={historyFilter} onChange={e=>setHistoryFilter(e.target.value)} className="w-full h-10 pl-9 pr-3 rounded-xl text-xs" style={{background:T.white,border:`1px solid ${T.border}`,color:T.black,outline:'none'}}/>
            </div>
            {filteredHistory.length===0?<div className="rounded-2xl py-14 flex flex-col items-center" style={CARD}><p className="text-sm" style={{color:T.gray}}>Sin resultados</p></div>:
            filteredHistory.map((entry,i)=>{
              const hrs=diffHours(entry.clock_in,entry.clock_out);
              const ci=new Date(entry.clock_in); const co=entry.clock_out?new Date(entry.clock_out):null;
              const ss=entry.status==='approved'?{bg:T.greenLt,fg:T.green,label:'Aprobado'}:entry.status==='paid'?{bg:T.blueLt,fg:T.blue,label:'Procesado'}:{bg:T.amberLt,fg:T.amber,label:'Ajustado'};
              const color=empColor(entry.employee);
              return(
                <div key={entry.id} className="rounded-2xl overflow-hidden" style={{...CARD,borderLeft:`3px solid ${ss.fg}`}}>
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="size-10 rounded-[12px] flex items-center justify-center text-sm font-bold text-white shrink-0" style={{background:color}}>{empInitials(entry.employee)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold" style={{color:T.black}}>{empName(entry.employee)}</p>
                      <p className="text-xs" style={{color:T.gray}}>{ci.toLocaleDateString('es-PR',{weekday:'short',day:'numeric',month:'short'})} · {ci.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true})}{co&&` – ${co.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true})}`}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full block mb-1" style={{background:ss.bg,color:ss.fg}}>{ss.label}</span>
                      <span className="text-[13px] font-bold" style={{color:T.black}}>{fmtHours(hrs)}</span>
                    </div>
                  </div>
                  <div className="mx-3 mb-3 px-3 py-2 rounded-xl flex items-center gap-2 flex-wrap" style={{background:T.bg}}>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md" style={{background:`${T.green}15`,color:T.green}}>Reg {fmtHours(Math.min(hrs,8))}</span>
                    {hrs>8&&<span className="text-[10px] font-bold px-2 py-1 rounded-md" style={{background:`${T.amber}15`,color:T.amber}}>OT {fmtHours(hrs-8)}</span>}
                    {entry.rejection_note&&<span className="text-[10px] flex-1 ml-1" style={{color:T.gray}}>✗ {entry.rejection_note}</span>}
                    <div className="flex-1"/>
                    {entry.status==='approved'&&<button onClick={async()=>{await supabase.from('clock_entries').update({status:'pending'}).eq('id',entry.id);await load();}} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold" style={{border:`1px solid ${T.border}`,color:T.gray}}><Undo2 size={11}/> Reabrir</button>}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
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
function ReportsView() {
  const reports=[{id:1,title:'Reporte SURI',period:'Q1 2026 (Ene – Mar)',date:'Abr 10, 2026'},{id:2,title:'Reporte DTRH',period:'Q1 2026 (Ene – Mar)',date:'Abr 10, 2026'},{id:3,title:'Reporte SINOT',period:'Q1 2026 (Ene – Mar)',date:'Abr 11, 2026'}];
  return(
    <div>
      <div className="px-5 pt-6 pb-5" style={{background:T.white,borderBottom:`1px solid ${T.border}`}}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{color:T.black}}>Reportes y CPA</h1>
          <button className="h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-bold text-white" style={{background:T.green}}><FileText size={15}/>Generar</button>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{background:'linear-gradient(135deg,#064E3B,#1D4ED8)'}}>
          <div className="absolute right-0 top-0 opacity-10"><TrendingUp size={120} color="white"/></div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:'rgba(255,255,255,0.6)'}}>Estado Actual</p>
          <h3 className="text-lg font-bold text-white">Todo en Orden</h3>
          <p className="text-sm mt-1" style={{color:'rgba(255,255,255,0.7)'}}>Radicaciones del Q1 completadas. Próximo cierre: 1 Jul 2026.</p>
        </div>
        <div className="rounded-2xl overflow-hidden" style={CARD}>
          {reports.map((rep,i)=>(
            <div key={rep.id} className="flex items-center gap-4 px-4 py-4" style={{borderBottom:i<reports.length-1?`1px solid #F5F5F5`:'none'}}>
              <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{background:T.blueLt}}><FileText size={20} color={T.blue}/></div>
              <div className="flex-1 min-w-0"><p className="text-[13px] font-semibold" style={{color:T.black}}>{rep.title}</p><p className="text-xs" style={{color:T.gray}}>{rep.period} · {rep.date}</p></div>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full mr-2" style={{background:T.greenLt,color:T.green}}>Completado</span>
              <button className="size-9 rounded-xl flex items-center justify-center" style={{background:T.bg,border:`1px solid ${T.border}`}}><Download size={16} color={T.blue}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
