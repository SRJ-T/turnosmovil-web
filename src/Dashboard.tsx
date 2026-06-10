import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Users, 
  DollarSign, 
  Settings, 
  TrendingUp,
  ClipboardCheck,
  Search,
  Bell,
  Menu,
  X,
  Plus,
  Download,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Clock,
  UserPlus,
  CalendarDays,
  AlertTriangle,
  Briefcase,
  Trash2,
  SlidersHorizontal,
  CheckCircle,
  MinusCircle,
  Phone,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Navigation Item Component
const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-[#0f2167] text-white shadow-md' 
        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
    }`}
  >
    <Icon size={20} className={active ? 'text-white' : 'text-on-surface-variant'} />
    <span className="font-bold text-sm">{label}</span>
  </button>
);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex text-on-surface font-sans">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col lg:hidden border-r border-outline-variant"
            >
              <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 fixed inset-y-0 left-0 bg-white border-r border-outline-variant shadow-sm z-30">
        <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:ml-72 min-h-screen relative w-full overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-outline-variant px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
              <input 
                type="text" 
                placeholder="Buscar empleados, turnos, reportes..."
                className="pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm font-medium w-80 focus:outline-none focus:ring-2 focus:ring-[#0f2167] transition-all shadow-xs"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2.5 bg-surface-container-lowest border border-outline-variant text-on-surface-variant rounded-xl hover:bg-surface-container transition-colors shadow-xs">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>
            
            <div className="h-10 w-10 rounded-xl bg-surface-container-highest border-2 border-[#0f2167]/20 overflow-hidden cursor-pointer shadow-sm">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="User profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-surface">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[1600px] mx-auto"
          >
            {activeTab === 'dashboard' && <DashboardPlaceholder setActiveTab={setActiveTab} />}
            {activeTab === 'team' && <TeamView />}
            {activeTab === 'payroll' && <PayrollView />}
            {activeTab === 'calendar' && <TurnosView />}
            {activeTab === 'approvals' && <ApprovalsView />}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-3xl p-12 text-center border border-outline-variant shadow-sm mt-8">
                <Settings size={48} className="mx-auto text-outline opacity-50 mb-4" />
                <h2 className="text-2xl font-black text-on-surface mb-2 capitalize">Configuración</h2>
                <p className="text-on-surface-variant font-medium">Esta sección estará disponible pronto.</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

// Sidebar Content Component
function SidebarContent({ activeTab, setActiveTab, onClose }: any) {
  return (
    <>
      <div className="p-6 border-b border-outline-variant flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-[#0f2167] rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-[#0f2167]/20 uppercase text-lg">T</div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-on-surface leading-none">Turnos Móvil</h1>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">Business Portal</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1.5 no-scrollbar">
        <div className="mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-outline ml-4 mb-2 block">General</span>
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); onClose && onClose(); }} />
          <NavItem icon={CalendarIcon} label="Turnos" active={activeTab === 'calendar'} onClick={() => { setActiveTab('calendar'); onClose && onClose(); }} />
          <NavItem icon={Users} label="Equipo" active={activeTab === 'team'} onClick={() => { setActiveTab('team'); onClose && onClose(); }} />
        </div>

        <div className="mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-outline ml-4 mb-2 block">Administración</span>
          <NavItem icon={ClipboardCheck} label="Aprobaciones" active={activeTab === 'approvals'} onClick={() => { setActiveTab('approvals'); onClose && onClose(); }} />
          <NavItem icon={DollarSign} label="Nómina" active={activeTab === 'payroll'} onClick={() => { setActiveTab('payroll'); onClose && onClose(); }} />
          <NavItem icon={TrendingUp} label="Reportes" active={activeTab === 'reports'} onClick={() => { setActiveTab('reports'); onClose && onClose(); }} />
        </div>
      </div>

      <div className="p-4 border-t border-outline-variant">
        <NavItem icon={Settings} label="Configuración" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); onClose && onClose(); }} />
      </div>
    </>
  );
}

// -----------------------------------------------------------------------------
// DASHBOARD VIEW
// -----------------------------------------------------------------------------
function DashboardPlaceholder({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const [stats, setStats] = useState({ employees: 0, shifts: 0 });

  useEffect(() => {
    fetch('http://localhost:4000/employees').then(r => r.json()).then(d => setStats(s => ({ ...s, employees: d.length })));
    fetch('http://localhost:4000/shifts').then(r => r.json()).then(d => setStats(s => ({ ...s, shifts: d.length })));
  }, []);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface">Bienvenido, Marcus 👋</h1>
          <p className="text-sm font-medium text-on-surface-variant mt-1">Aquí tienes un resumen de tu negocio el día de hoy.</p>
        </div>
        <button onClick={() => setActiveTab('calendar')} className="h-11 px-6 bg-[#0f2167] hover:bg-[#0f2167]/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#0f2167]/20 flex items-center gap-2">
          <Plus size={16} /> Crear Turno
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-outline-variant shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50/80 rounded-2xl text-blue-600 border border-blue-100/50">
              <Users size={24} />
            </div>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest bg-surface-container px-2 py-1 rounded-lg">Total</span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Empleados</p>
            <p className="text-3xl font-black text-on-surface tracking-tight leading-none">{stats.employees}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-outline-variant shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50/80 rounded-2xl text-emerald-600 border border-emerald-100/50">
              <CalendarDays size={24} />
            </div>
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-100/50 px-2 py-1 rounded-lg">Semana</span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Turnos</p>
            <p className="text-3xl font-black text-on-surface tracking-tight leading-none">{stats.shifts}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-outline-variant shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-50/80 rounded-2xl text-indigo-600 border border-indigo-100/50">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Nómina Est.</p>
            <p className="text-3xl font-black text-on-surface tracking-tight leading-none font-mono tracking-tighter">${(stats.shifts * 8 * 15).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-error-container/40 p-5 rounded-3xl border border-error/20 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/80 rounded-2xl text-error shadow-xs border border-error/10">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-error mb-1">Horas Extras</p>
            <p className="text-3xl font-black text-error tracking-tight leading-none">2</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-blue-950 via-[#0f2167] to-indigo-900 text-white p-6 md:p-8 rounded-[2rem] border border-blue-900/50 shadow-xl shadow-[#0f2167]/10 flex flex-col justify-between relative overflow-hidden h-56 md:h-48 group cursor-pointer" onClick={() => setActiveTab('reports')}>
            <div className="absolute -right-8 -top-12 opacity-[0.07] text-white transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12 pointer-events-none">
              <FileText size={240} />
            </div>
            <div className="space-y-2 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 w-max inline-block shadow-sm">
                📅 Cierre de Trimestral
              </span>
              <h3 className="text-2xl font-black mt-4 tracking-tight">2do Trimestre (Abril - Junio)</h3>
              <p className="text-sm text-white/80 leading-relaxed mt-2 max-w-md font-medium">
                Tu nómina acumuló <strong className="text-white bg-white/10 px-1.5 py-0.5 rounded-md">$14,250.00</strong> en salarios. Revisa y genera los documentos oficiales de SURI, DTRH y SINOT a tiempo.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-black text-on-surface px-2">Actividad Reciente</h3>
            <div className="bg-white rounded-3xl border border-outline-variant p-2 shadow-sm space-y-1">
              <div className="flex items-center gap-4 bg-surface-container-lowest hover:bg-surface-container-low transition-colors p-4 rounded-2xl cursor-pointer">
                <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                  <UserPlus size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">Añadiste a Carlos Rivera al equipo.</p>
                  <p className="text-xs font-medium text-on-surface-variant mt-0.5">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-surface-container-lowest hover:bg-surface-container-low transition-colors p-4 rounded-2xl cursor-pointer">
                <div className="size-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                  <Clock size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">Publicaste el horario semanal.</p>
                  <p className="text-xs font-medium text-on-surface-variant mt-0.5">Hace 5 horas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-outline-variant p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
             <h3 className="text-lg font-black text-on-surface">Aprobaciones</h3>
             <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-1 rounded-lg tracking-widest uppercase">3 Pendientes</span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pr-1 -mr-2">
             <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100/60 shadow-sm flex flex-col gap-3">
               <div className="flex items-start gap-3">
                 <div className="size-8 rounded-xl bg-white flex items-center justify-center text-rose-600 shadow-xs shrink-0"><AlertTriangle size={16} /></div>
                 <div>
                   <p className="text-[13px] font-black text-rose-950">Llegada Tarde - Carlos S.</p>
                   <p className="text-[11px] font-bold text-rose-800/80 mt-0.5 uppercase tracking-wider">Seguridad, 8:00 AM</p>
                 </div>
               </div>
             </div>
             
             <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100/60 shadow-sm flex flex-col gap-3">
               <div className="flex items-start gap-3">
                 <div className="size-8 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-xs shrink-0"><Briefcase size={16} /></div>
                 <div>
                   <p className="text-[13px] font-black text-amber-950">Cambio de Turno</p>
                   <p className="text-[11px] font-bold text-amber-800/80 mt-0.5 uppercase tracking-wider">Alex solicita cubrir a Luis</p>
                 </div>
               </div>
             </div>
             
             <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100/60 shadow-sm flex flex-col gap-3">
               <div className="flex items-start gap-3">
                 <div className="size-8 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-xs shrink-0"><CalendarIcon size={16} /></div>
                 <div>
                   <p className="text-[13px] font-black text-blue-950">Día Libre - Ana M.</p>
                   <p className="text-[11px] font-bold text-blue-800/80 mt-0.5 uppercase tracking-wider">Cita Médica, 22 May</p>
                 </div>
               </div>
             </div>
          </div>
          <button onClick={() => setActiveTab('approvals')} className="mt-4 w-full py-3 rounded-xl bg-surface-container-lowest border border-outline-variant text-[11px] font-black text-on-surface hover:bg-surface-container-low transition-colors uppercase tracking-widest">
            Ver Todas
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// TURNOS VIEW (Mirror of Mobile CalendarScreen)
// -----------------------------------------------------------------------------
function TurnosView() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('weekly');
  const [newShift, setNewShift] = useState({ 
    day: 0, 
    employeeId: '', 
    startTime: '09:00', 
    endTime: '17:00', 
    role: '', 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    status: 'draft',
    breaks: [] as { duration: number, time: string }[]
  });
  const [breaksCollapsed, setBreaksCollapsed] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);

  const baseDate = new Date(2026, 4, 11);
  baseDate.setDate(baseDate.getDate() + (weekOffset * 7));
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const currentMonthName = monthNames[baseDate.getMonth()];
  const currentYear = baseDate.getFullYear();

  const dayNames = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    return { name: dayNames[i], date: d.getDate(), index: i };
  });

  useEffect(() => {
    fetch('http://localhost:4000/shifts').then(res => res.json()).then(setShifts);
    fetch('http://localhost:4000/employees').then(res => res.json()).then(setEmployees);
  }, []);

  const parseTimeStr = (t: string) => {
     if(!t) return '09:00';
     const parts = t.split(' ');
     if(parts.length < 2) return '09:00';
     let [h, m] = parts[0].split(':');
     let hr = parseInt(h, 10);
     if (parts[1].toUpperCase() === 'PM' && hr !== 12) hr += 12;
     if (parts[1].toUpperCase() === 'AM' && hr === 12) hr = 0;
     return `${hr.toString().padStart(2,'0')}:${m}`;
  };

  const formatTimeStr = (t: string) => {
     if(!t) return '9:00 AM';
     let [h, m] = t.split(':');
     let hr = parseInt(h, 10);
     const ampm = hr >= 12 ? 'PM' : 'AM';
     if(hr > 12) hr -= 12;
     if(hr === 0) hr = 12;
     return `${hr}:${m} ${ampm}`;
  };

  const handleOpenEdit = (shift: any) => {
    setEditingShiftId(shift.id);
    const emp = employees.find(e => e.name === shift.empName);
    const [start, end] = shift.time ? shift.time.split(' - ') : ['9:00 AM', '5:00 PM'];

    setNewShift({
      day: shift.day,
      employeeId: emp ? emp.id.toString() : '',
      startTime: parseTimeStr(start),
      endTime: parseTimeStr(end),
      role: shift.role || 'Staff',
      color: shift.color,
      status: shift.status || 'draft',
      breaks: shift.breaks || []
    });
    setBreaksCollapsed(false);
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setEditingShiftId(null);
    const dayObj = days[selectedDayIdx];
    setNewShift({ 
      day: dayObj ? dayObj.index : 0, 
      employeeId: '', 
      startTime: '09:00', 
      endTime: '17:00', 
      role: '', 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      status: 'draft',
      breaks: []
    });
    setBreaksCollapsed(false);
    setShowModal(true);
  };

  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id.toString() === newShift.employeeId);
    if (!emp) return;
    
    const finalTime = `${formatTimeStr(newShift.startTime)} - ${formatTimeStr(newShift.endTime)}`;

    const shiftData = {
      ...newShift,
      time: finalTime,
      empName: emp.name,
      role: emp.role || emp.role,
      day: Number(newShift.day)
    };

    if (editingShiftId) {
      const res = await fetch(`http://localhost:4000/shifts/${editingShiftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shiftData)
      });
      const updated = await res.json();
      setShifts(shifts.map(s => s.id === editingShiftId ? updated : s));
    } else {
      const res = await fetch('http://localhost:4000/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shiftData)
      });
      const added = await res.json();
      setShifts([...shifts, added]);
    }
    setShowModal(false);
  };

  const handleDeleteShift = async (id: string) => {
    if(!confirm("¿Eliminar turno?")) return;
    await fetch(`http://localhost:4000/shifts/${id}`, { method: 'DELETE' });
    setShifts(shifts.filter(s => s.id !== id));
    setShowModal(false);
  };

  const handlePublishAll = async () => {
    const drafts = shifts.filter(s => s.status !== 'published');
    const promises = drafts.map(d => 
      fetch(`http://localhost:4000/shifts/${d.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' })
      })
    );
    await Promise.all(promises);
    fetch('http://localhost:4000/shifts').then(res => res.json()).then(setShifts);
  };

  const activeShifts = shifts.filter(s => s.day === selectedDayIdx);
  const draftsCount = shifts.filter(s => s.status !== 'published').length;

  return (
    <div className="space-y-6 w-full mx-auto pb-24">
      {/* Mesh Blobs (CSS only) */}
      <div className="fixed top-32 -left-40 size-96 rounded-full bg-blue-600/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 -right-40 size-96 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface">Turnos</h1>
          <p className="text-sm font-medium text-on-surface-variant mt-1">Organiza los turnos de tu equipo.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/60 shadow-xs hidden sm:flex">
            <button onClick={() => setViewMode('daily')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'daily' ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>Día</button>
            <button onClick={() => setViewMode('weekly')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'weekly' ? 'bg-[#0f2167] shadow-sm text-white' : 'text-on-surface-variant hover:text-on-surface'}`}>Semana</button>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-outline-variant/60 rounded-xl p-1 shadow-sm">
            <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"><ChevronLeft size={18} /></button>
            <span className="text-sm font-bold text-on-surface px-2 w-28 text-center">{currentMonthName} {currentYear}</span>
            <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"><ChevronRight size={18} /></button>
          </div>
          <button onClick={handleOpenAdd} className="h-11 px-5 bg-[#0f2167] hover:bg-[#0f2167]/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 w-fit">
            <Plus size={16} strokeWidth={3} /> Crear Turno
          </button>
        </div>
      </div>

      {viewMode === 'daily' ? (
      <>
      {/* 7-Day Selector (Mirror mobile) */}
      <section className="grid grid-cols-7 gap-2 py-2 relative z-10">
        {days.map((d) => {
          const isSelected = d.index === selectedDayIdx;
          const hasShift = shifts.some(s => s.day === d.index);
          return (
            <button
              key={d.index}
              onClick={() => setSelectedDayIdx(d.index)}
              className={`h-[90px] flex flex-col items-center justify-center rounded-2xl border transition-all duration-200 shadow-sm relative ${
                isSelected 
                  ? 'bg-[#0f2167] border-[#0f2167] text-white ring-4 ring-[#0f2167]/20 scale-[1.03] z-10' 
                  : 'bg-white/90 backdrop-blur-sm border-outline-variant/60 text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className={`text-[10px] font-black tracking-widest uppercase ${isSelected ? 'text-white/80' : 'text-on-surface-variant'}`}>
                {d.name}
              </span>
              <span className="text-2xl font-black tracking-tight mt-1 leading-none font-sans">
                {d.date}
              </span>
              {hasShift ? (
                <div className={`w-3 h-3 rounded-full mt-2 ${isSelected ? 'bg-white shadow-[0_0_10px_3px_rgba(255,255,255,0.8)] animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_3px_rgba(16,185,129,0.6)] animate-pulse'}`} style={{ animationDuration: '1.8s' }} />
              ) : (
                <div className={`w-2 h-2 rounded-full mt-2 ${isSelected ? 'bg-white/30' : 'bg-on-surface-variant/15'}`} />
              )}
            </button>
          );
        })}
      </section>

      {/* Metrics Floater */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-outline-variant/60 shadow-sm flex items-center justify-between relative z-10"
      >
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[#0f2167] tracking-widest uppercase flex items-center gap-1.5">
            <span className="size-2 bg-[#0f2167] rounded-full animate-pulse shadow-[0_0_6px_rgba(15,33,103,0.5)]" /> ROSTER ACTIVO
          </p>
          <h3 className="text-xl font-black text-on-surface tracking-tight leading-none mt-1">
            {activeShifts.length} {activeShifts.length === 1 ? 'Turno hoy' : 'Turnos hoy'}
          </h3>
        </div>
        <div className="flex gap-3 text-right">
          <div className="bg-surface-container-lowest/80 px-4 py-2 rounded-xl border border-outline-variant/70 shadow-xs min-w-[80px]">
            <p className="text-[9px] font-black text-on-surface-variant tracking-widest uppercase">Horas</p>
            <p className="text-lg font-black text-on-surface font-mono leading-none mt-1 tracking-tight">{activeShifts.length * 8}h</p>
          </div>
          <div className="bg-blue-50/80 border border-blue-200/60 px-4 py-2 rounded-xl shadow-xs min-w-[90px]">
            <p className="text-[9px] font-black text-blue-800 tracking-widest uppercase">Costo Est.</p>
            <p className="text-lg font-black text-blue-800 font-mono leading-none mt-1 flex items-center justify-end gap-0.5 tracking-tighter">
              <DollarSign size={14} className="stroke-[3]" />{activeShifts.length * 8 * 12}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Publish Button */}
      <div className="relative z-10 flex justify-end">
        <button
          onClick={handlePublishAll}
          disabled={draftsCount === 0}
          className={`px-6 rounded-xl flex items-center justify-center gap-2 py-2.5 font-black text-[11px] uppercase tracking-widest shadow-md transition-all duration-200 relative overflow-hidden w-full sm:w-auto ${
            draftsCount > 0
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-emerald-600 text-white shadow-emerald-600/30 opacity-70 cursor-not-allowed'
          }`}
        >
          {draftsCount > 0 && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]" style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
          )}
          <CheckCircle2 size={16} strokeWidth={2.5} />
          <span>
            {draftsCount > 0
              ? `Publicar Turnos`
              : 'Publicados'}
          </span>
          {draftsCount > 0 && (
             <span className="bg-white/25 text-white text-[10px] font-black px-2 py-0.5 rounded-lg ml-1">
               {draftsCount}
             </span>
          )}
        </button>
      </div>

      {/* Shifts Feed (Glass Cards) */}
      <div className="space-y-4 relative z-10">
        <AnimatePresence>
          {activeShifts.length > 0 ? (
            activeShifts.map((shift) => {
              const isDraft = shift.status !== 'published';
              const colorClass = shift.color || 'bg-blue-100 text-blue-800 border-blue-200';
              const bgColor = colorClass.split(' ')[0] || 'bg-blue-100';
              
              return (
                <motion.div
                  key={shift.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/95 backdrop-blur-md border border-outline-variant/60 rounded-[1.25rem] pl-5 pr-4 py-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  {/* Left Color Indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${bgColor.replace('100', '400')}`} />
                  
                  <div className="flex items-center gap-4 sm:w-[40%]">
                     <div className={`size-12 rounded-[1rem] flex items-center justify-center font-black text-sm shrink-0 border shadow-xs ${colorClass}`}>
                       {shift.empName ? shift.empName.split(' ').map((n: string) => n[0]).join('') : ''}
                     </div>
                     <div>
                       <h4 className="font-black text-[15px] text-on-surface tracking-tight leading-none">{shift.empName}</h4>
                       <div className="flex items-center gap-2 mt-1.5">
                         <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest bg-surface-container-low px-2 py-0.5 rounded-md border border-outline-variant/40">{shift.role}</span>
                         <span className="text-[10px] font-bold text-outline uppercase tracking-widest flex items-center gap-1"><Briefcase size={10} /> Turno Regular</span>
                       </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3 font-mono sm:w-[30%] sm:justify-center bg-surface-container-lowest/50 px-4 py-2 rounded-xl border border-outline-variant/30">
                    <Clock size={16} className="text-[#0f2167] flex-shrink-0" />
                    <span className="text-[14px] font-black tracking-tight leading-none text-[#0f2167]">{shift.time} <span className="text-[10px] text-on-surface-variant font-sans tracking-wide ml-1">(8h)</span></span>
                  </div>

                  <div className="flex items-center gap-3 sm:w-[30%] sm:justify-end">
                    {isDraft ? (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg tracking-wider shadow-xs animate-pulse flex items-center gap-1.5">
                         <AlertTriangle size={12} /> Borrador
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg tracking-wider shadow-xs flex items-center gap-1.5">
                         <CheckCircle2 size={12} /> Publicado
                      </span>
                    )}
                    <button onClick={() => handleOpenEdit(shift)} className="px-4 py-1.5 rounded-xl bg-white border border-outline-variant text-[10px] font-black uppercase tracking-widest text-on-surface hover:bg-surface-container transition-colors shadow-xs active:scale-95">
                      Editar
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-[1.25rem] border border-dashed border-outline-variant/60">
               <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">No hay turnos para este día.</p>
               <button onClick={handleOpenAdd} className="mt-3 px-5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-black uppercase tracking-wider text-on-surface hover:bg-surface-container transition-all shadow-xs">
                 Crear Primer Turno
               </button>
            </div>
          )}
        </AnimatePresence>
      </div>
      </>
      ) : (
        <div className="relative z-10 w-full overflow-x-auto pb-4">
          <div className="min-w-[1200px] grid grid-cols-7 gap-4">
            {days.map(d => {
              const dayShifts = shifts.filter(s => s.day === d.index);
              const isToday = d.index === selectedDayIdx;
              return (
                <div key={d.index} className="flex flex-col bg-white/60 backdrop-blur-md rounded-2xl border border-outline-variant/50 overflow-hidden shadow-sm">
                   <div className={`p-4 text-center border-b border-outline-variant/40 ${isToday ? 'bg-[#0f2167] text-white' : 'bg-surface-container-lowest'}`}>
                     <p className="text-[11px] font-black uppercase tracking-widest opacity-80">{d.name}</p>
                     <p className="text-2xl font-black mt-0.5 leading-none">{d.date}</p>
                   </div>
                   <div className="p-3 flex-1 min-h-[400px] flex flex-col gap-3">
                     {dayShifts.map(shift => {
                        const colorClass = shift.color || 'bg-blue-100 text-blue-800 border-blue-200';
                        const bgColor = colorClass.split(' ')[0] || 'bg-blue-100';
                        const borderColor = colorClass.split(' ')[2] || 'border-blue-200';
                        const textColor = colorClass.split(' ')[1] || 'text-blue-800';
                        const isDraft = shift.status !== 'published';

                        return (
                          <div key={shift.id} onClick={() => handleOpenEdit(shift)} className={`p-4 rounded-xl border cursor-pointer hover:scale-[1.02] transition-transform ${bgColor} ${borderColor} ${textColor} relative overflow-hidden shadow-xs flex flex-col gap-1.5`}>
                            {isDraft && <div className="absolute top-1 right-1"><span className="flex size-2 bg-amber-500 rounded-full animate-pulse" /></div>}
                            <p className="text-[13px] font-black leading-tight pr-3">{shift.empName}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{shift.role}</p>
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold bg-white/50 px-2 py-1 rounded-md w-fit">
                              <Clock size={12} /> {shift.time.split(' - ')[0]}
                            </div>
                          </div>
                        );
                     })}
                     <button onClick={() => { setSelectedDayIdx(d.index); handleOpenAdd(); }} className="mt-2 py-2.5 rounded-xl border border-dashed border-outline-variant/80 text-[11px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100">
                       <Plus size={14} /> Añadir
                     </button>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl relative border border-white/20 my-8">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-xl font-black mb-5 text-[#0f2167]">{editingShiftId ? 'Editar Turno' : 'Crear Nuevo Turno'}</h2>
            <form onSubmit={handleSaveShift} className="space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#0f2167]">
                  <CalendarIcon size={20} />
                  <h3 className="text-lg font-bold tracking-tight">Programación</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 block">Día</label>
                    <select required className="w-full h-12 bg-surface-container-lowest border border-outline-variant rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#0f2167] outline-none transition-all shadow-xs" value={newShift.day} onChange={e => setNewShift({...newShift, day: Number(e.target.value)})}>
                      {days.map((d) => <option key={d.index} value={d.index}>{d.name} {d.date}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 block">Color Visual</label>
                    <select required className="w-full h-12 bg-surface-container-lowest border border-outline-variant rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#0f2167] outline-none transition-all shadow-xs" value={newShift.color} onChange={e => setNewShift({...newShift, color: e.target.value})}>
                      <option value="bg-blue-100 text-blue-800 border-blue-200">Azul</option>
                      <option value="bg-emerald-100 text-emerald-800 border-emerald-200">Verde</option>
                      <option value="bg-purple-100 text-purple-800 border-purple-200">Morado</option>
                      <option value="bg-amber-100 text-amber-800 border-amber-200">Amarillo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#0f2167]">
                  <Users size={20} />
                  <h3 className="text-lg font-bold tracking-tight">Asignación</h3>
                </div>
                
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 block">Empleado</label>
                    <select required className="w-full h-12 bg-white border border-outline-variant rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#0f2167] outline-none transition-all shadow-xs" value={newShift.employeeId} onChange={e => setNewShift({...newShift, employeeId: e.target.value})}>
                      <option value="">Selecciona un empleado...</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Entrada</span>
                      <input required type="time" className="w-full h-12 px-3 rounded-xl border border-outline-variant bg-white font-black text-sm text-on-surface shadow-xs focus:border-[#0f2167] focus:ring-1 focus:ring-[#0f2167] outline-none transition-all" value={newShift.startTime} onChange={e => setNewShift({...newShift, startTime: e.target.value})} />
                    </div>
                    <div className="self-end pb-3 text-on-surface-variant font-bold text-lg">-</div>
                    <div className="flex-1 space-y-1">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Salida</span>
                      <input required type="time" className="w-full h-12 px-3 rounded-xl border border-outline-variant bg-white font-black text-sm text-on-surface shadow-xs focus:border-[#0f2167] focus:ring-1 focus:ring-[#0f2167] outline-none transition-all" value={newShift.endTime} onChange={e => setNewShift({...newShift, endTime: e.target.value})} />
                    </div>
                  </div>

                  <div className="border-t border-outline-variant/60 pt-4 space-y-4">
                    <button type="button" onClick={() => setBreaksCollapsed(!breaksCollapsed)} className="w-full flex items-center justify-between text-[#0f2167] hover:opacity-80 transition-opacity">
                      <div className="flex items-center gap-2 font-black text-sm">
                        ☕ Descansos ({newShift.breaks.length})
                      </div>
                      <ChevronRight size={18} className={`transition-transform duration-200 ${!breaksCollapsed ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {!breaksCollapsed && (
                      <div className="space-y-3">
                        {newShift.breaks.map((b, idx) => (
                          <div key={idx} className="bg-surface-container rounded-xl border border-outline-variant p-3 space-y-2 relative">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-[#0f2167] uppercase tracking-widest">Descanso {idx + 1}</span>
                              <button type="button" onClick={() => setNewShift({...newShift, breaks: newShift.breaks.filter((_, i) => i !== idx)})} className="text-rose-600 hover:text-rose-700 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                               <div className="space-y-1">
                                 <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest block">Duración</span>
                                 <select className="w-full h-9 px-2 bg-white border border-outline-variant rounded-lg text-xs font-bold focus:ring-1 focus:ring-[#0f2167] outline-none" value={b.duration} onChange={e => {
                                   const newBreaks = [...newShift.breaks];
                                   newBreaks[idx].duration = Number(e.target.value);
                                   setNewShift({...newShift, breaks: newBreaks});
                                 }}>
                                    <option value={15}>15 Min</option>
                                    <option value={30}>30 Min</option>
                                    <option value={60}>1 Hora</option>
                                 </select>
                               </div>
                               <div className="space-y-1">
                                 <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest block">Hora</span>
                                 <input type="time" className="w-full h-9 px-2 bg-white border border-outline-variant rounded-lg text-xs font-bold focus:ring-1 focus:ring-[#0f2167] outline-none" value={b.time} onChange={e => {
                                   const newBreaks = [...newShift.breaks];
                                   newBreaks[idx].time = e.target.value;
                                   setNewShift({...newShift, breaks: newBreaks});
                                 }} />
                               </div>
                            </div>
                          </div>
                        ))}
                        
                        {newShift.breaks.length < 3 && (
                          <button type="button" onClick={() => setNewShift({...newShift, breaks: [...newShift.breaks, {duration: 30, time: '12:00'}]})} className="w-full border border-[#0f2167] text-[#0f2167] font-black py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#0f2167]/5 transition-colors text-xs">
                            <Plus size={14} /> Añadir descanso
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-outline-variant/60">
                {editingShiftId && (
                  <button type="button" onClick={() => handleDeleteShift(editingShiftId)} className="w-14 h-12 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors border border-rose-200">
                    <Trash2 size={20} />
                  </button>
                )}
                <button type="submit" className="flex-1 h-12 bg-[#0f2167] text-white rounded-xl text-sm font-black tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all shadow-md">
                  {editingShiftId ? 'Guardar Cambios' : 'Crear Turno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// TEAM VIEW
// -----------------------------------------------------------------------------
function TeamView() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', role: '', phone: '', wage: '', status: 'Activo' });
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<any | null>(null);

  useEffect(() => {
    fetch('http://localhost:4000/employees').then(res => res.json()).then(setEmployees);
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:4000/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newEmp, id: Date.now().toString() }) // json-server might auto-generate id, but just in case
    });
    const added = await res.json();
    setEmployees([...employees, added]);
    setShowModal(false);
    setNewEmp({ name: '', role: '', phone: '', wage: '', status: 'Activo' });
  };

  const handleDelete = async (id: any) => {
    await fetch(`http://localhost:4000/employees/${id}`, { method: 'DELETE' });
    setEmployees(employees.filter(e => e.id !== id));
    setConfirmDeleteId(null);
  };

  const handleToggleStatus = async (emp: any) => {
    const newStatus = emp.status === 'Activo' ? 'Inactivo' : 'Activo';
    const res = await fetch(`http://localhost:4000/employees/${emp.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const updated = await res.json();
    setEmployees(employees.map(e => e.id === updated.id ? updated : e));
  };

  const filteredEmployees = employees.filter(e => {
    const q = search.toLowerCase();
    return (
      e.name?.toLowerCase().includes(q) ||
      e.role?.toLowerCase().includes(q)
    );
  });

  const totalCount = employees.length;
  const activeCount = employees.filter(e => e.status === 'Activo').length;
  const pendingCount = employees.filter(e => e.status !== 'Activo' && e.status !== 'Inactivo').length;
  
  const employeeToDelete = employees.find(e => e.id === confirmDeleteId);

  const getRoleStyles = (role: string) => {
    const r = role?.toLowerCase() || '';
    if (r.includes('gerente') || r.includes('manager')) return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    if (r.includes('supervisor') || r.includes('dueño') || r.includes('owner')) return 'bg-amber-50 text-amber-800 border-amber-100';
    return 'bg-teal-50 text-teal-700 border-teal-100';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface">Equipo</h1>
          <p className="text-sm font-medium text-on-surface-variant mt-1">Gestiona los perfiles y permisos de tus empleados.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="h-11 px-6 bg-[#0f2167] hover:bg-[#0f2167]/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#0f2167]/20 flex items-center gap-2 w-fit">
          <UserPlus size={16} strokeWidth={3} /> Añadir Empleado
        </button>
      </div>

      {/* Bento Stat Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 border-0 p-5 rounded-3xl flex flex-col justify-between h-28 shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden group">
          <div className="absolute -right-2 -bottom-2 size-16 bg-white/10 rounded-full blur-lg transition-all group-hover:scale-150" />
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100 relative z-10">Total Empleados</span>
          <span className="text-4xl leading-none font-black text-white tracking-tight relative z-10">{totalCount}</span>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border-0 p-5 rounded-3xl flex flex-col justify-between h-28 shadow-lg shadow-emerald-500/20 text-white relative overflow-hidden group">
          <div className="absolute -right-2 -bottom-2 size-16 bg-white/10 rounded-full blur-lg transition-all group-hover:scale-150" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100 flex items-center gap-1 relative z-10">
            Activos
          </span>
          <span className="text-4xl leading-none font-black text-white tracking-tight relative z-10">{activeCount}</span>
        </div>
        <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 border-0 p-5 rounded-3xl flex flex-col justify-between h-28 shadow-lg shadow-orange-500/20 text-white relative overflow-hidden group">
          <div className="absolute -right-2 -bottom-2 size-16 bg-white/10 rounded-full blur-lg transition-all group-hover:scale-150" />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-100 flex items-center gap-1 relative z-10">
            Pendientes / Inv
          </span>
          <span className="text-4xl leading-none font-black text-white tracking-tight relative z-10">{pendingCount}</span>
        </div>
      </section>

      {/* Search & Filter */}
      <div className="relative flex items-center mt-6">
        <Search className="absolute left-4 text-outline-variant" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre, rol o estado..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-14 pl-12 pr-14 bg-white border-2 border-outline-variant/60 rounded-2xl text-sm placeholder:text-outline-variant text-on-surface font-bold focus:border-[#0f2167] focus:ring-4 focus:ring-[#0f2167]/10 focus:outline-none transition-all shadow-xs"
        />
        <button className="absolute right-3 p-2 text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors">
          <SlidersHorizontal size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <AnimatePresence mode="popLayout">
          {filteredEmployees.map(emp => {
            const isInactive = emp.status === 'Inactivo';
            const isPending = emp.status !== 'Activo' && emp.status !== 'Inactivo';

            return (
              <motion.div 
                key={emp.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`bg-white rounded-3xl border border-outline-variant shadow-sm hover:shadow-md transition-all flex flex-col relative group ${isInactive ? 'opacity-75 saturate-[0.8]' : ''}`}
              >
                {/* Card Body */}
                <div className="p-5 flex items-center justify-between cursor-pointer">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-2xl bg-surface-container-highest flex items-center justify-center font-black text-xl text-on-surface-variant shrink-0 border border-outline-variant shadow-inner transition-transform group-hover:scale-105">
                        {emp.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-black text-base text-on-surface tracking-tight leading-tight">{emp.name}</h4>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">EMP-{emp.id.toString().slice(-4)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex flex-col items-end gap-1.5">
                      {/* Status Badge */}
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs ${
                        !isInactive && !isPending
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : isInactive 
                            ? 'bg-surface-container-high text-on-surface-variant border border-outline-variant' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          !isInactive && !isPending ? 'bg-emerald-500 animate-pulse' : isInactive ? 'bg-outline' : 'bg-amber-500 animate-pulse'
                        }`}></span>
                        {!isInactive && !isPending ? 'En Vivo' : isInactive ? 'Apagado' : 'Pendiente'}
                      </span>
                      
                      {/* Role Pill */}
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border shadow-xs ${getRoleStyles(emp.role)}`}>
                        {emp.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-surface-container-lowest border-t border-outline-variant/40 flex items-center justify-between">
                   <div className="flex gap-2 items-center text-on-surface-variant">
                      <button className="p-1.5 hover:bg-surface-container rounded-lg transition-colors"><Mail size={14} /></button>
                      <button className="p-1.5 hover:bg-surface-container rounded-lg transition-colors"><Phone size={14} /></button>
                   </div>
                   <div className="text-right">
                     <span className="text-xs font-black font-mono text-[#0f2167] bg-[#0f2167]/10 px-2 py-1 rounded-md border border-[#0f2167]/20 shadow-xs">${emp.wage}/hr</span>
                   </div>
                </div>

                {/* Action Footer */}
                <div className="px-5 pb-5 pt-3 flex gap-2 mt-auto">
                  <button
                    onClick={() => handleToggleStatus(emp)}
                    className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all border shadow-xs active:scale-95 ${
                      isInactive 
                        ? 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700 shadow-emerald-500/20' 
                        : 'bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {isInactive ? <CheckCircle size={14} /> : <MinusCircle size={14} />}
                    {isInactive ? 'Activar' : 'Apagar'}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(emp.id)}
                    className="flex-1 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all shadow-xs active:scale-95"
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredEmployees.length === 0 && (
          <div className="col-span-full py-16 text-center bg-surface-container-low rounded-[2rem] border-2 border-dashed border-outline-variant">
            <p className="text-sm text-on-surface-variant font-black uppercase tracking-wider">No se encontraron empleados</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl relative border border-white/20">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-xl font-black mb-5 tracking-tight text-[#0f2167]">Añadir Nuevo Empleado</h2>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 block">Nombre Completo</label>
                <input required type="text" className="w-full h-12 bg-surface-container-lowest border border-outline-variant rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#0f2167] outline-none transition-all shadow-xs" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} placeholder="Ej. Juan Pérez" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 block">Rol</label>
                  <input required type="text" className="w-full h-12 bg-surface-container-lowest border border-outline-variant rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#0f2167] outline-none transition-all shadow-xs" value={newEmp.role} onChange={e => setNewEmp({...newEmp, role: e.target.value})} placeholder="Ej. Cajero" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 block">Salario/hr ($)</label>
                  <input required type="number" step="0.01" className="w-full h-12 bg-surface-container-lowest border border-outline-variant rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#0f2167] outline-none transition-all shadow-xs" value={newEmp.wage} onChange={e => setNewEmp({...newEmp, wage: e.target.value})} placeholder="Ej. 12.50" />
                </div>
              </div>
              <button type="submit" className="w-full h-12 bg-emerald-600 text-white rounded-xl text-sm font-black tracking-widest uppercase mt-6 hover:bg-emerald-700 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
                 <CheckCircle size={18} /> Guardar Empleado
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {confirmDeleteId !== null && employeeToDelete && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2rem] p-6 border border-outline-variant shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-black text-on-surface mb-2 tracking-tight">Eliminar Empleado</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6 font-medium">
                ¿Estás seguro que deseas eliminar permanentemente a <strong className="text-on-surface">{employeeToDelete.name}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => handleDelete(confirmDeleteId)}
                  className="w-full h-12 rounded-xl bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                >
                  Sí, Eliminar
                </button>
                <button 
                  onClick={() => setConfirmDeleteId(null)}
                  className="w-full h-12 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-black uppercase tracking-wider active:scale-95 transition-all"
                >
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

// -----------------------------------------------------------------------------
// PAYROLL VIEW
// -----------------------------------------------------------------------------
function PayrollView() {
  const [activeTab, setActiveTab] = useState<'nomina'|'historial'>('nomina');
  const [selectedMonth, setSelectedMonth] = useState('all');

  const payrollData = [
    { id: 1, name: "Carlos Rivera", hours: "38.5", overtime: "2.0", grossPay: "$486.00", taxes: "$45.20", netPay: "$440.80", status: "Pendiente" },
    { id: 2, name: "Ana Martínez", hours: "40.0", overtime: "0.0", grossPay: "$720.00", taxes: "$78.50", netPay: "$641.50", status: "Pendiente" },
    { id: 4, name: "Carmen Sánchez", hours: "32.0", overtime: "0.0", grossPay: "$352.00", taxes: "$31.68", netPay: "$320.32", status: "Pendiente" },
  ];

  const payHistory = [
    { id: 101, month: "Abril 2026", date: "30 Abr, 2026", employees: 3, totalPaid: 1402.62, status: "PAGADO" },
    { id: 102, month: "Marzo 2026", date: "31 Mar, 2026", employees: 3, totalPaid: 1350.50, status: "PAGADO" },
    { id: 103, month: "Febrero 2026", date: "28 Feb, 2026", employees: 2, totalPaid: 950.00, status: "PAGADO" },
  ];

  const filteredHistory = payHistory.filter(h => selectedMonth === 'all' || h.month.startsWith(selectedMonth));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface">Centro de Nómina</h1>
          <p className="text-sm font-medium text-on-surface-variant mt-1">Gestión de pagos y retenciones para empleados.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2">
            <CheckCircle2 size={16} /> Ejecutar Nómina
          </button>
        </div>
      </div>
      
      {/* Segmented Tab */}
      <div className="bg-surface-container-low p-1 rounded-2xl flex max-w-xs border border-outline-variant/60 shadow-xs">
        <button onClick={() => setActiveTab('nomina')} className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'nomina' ? 'bg-[#0f2167] text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
          Nómina Activa
        </button>
        <button onClick={() => setActiveTab('historial')} className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'historial' ? 'bg-[#0f2167] text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
          Historial
        </button>
      </div>

      {activeTab === 'nomina' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-outline-variant shadow-sm flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100 shadow-xs">
                  <Users size={20} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Total a Pagar (Bruto)</p>
                <p className="text-2xl font-black text-on-surface tracking-tight font-mono">$1,558.00</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-outline-variant shadow-sm flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 border border-rose-100 shadow-xs">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-700 mb-1">Total Impuestos</p>
                <p className="text-2xl font-black text-rose-600 tracking-tight font-mono">-$155.38</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#0f2167] to-indigo-900 text-white p-5 rounded-3xl border border-blue-900 shadow-lg flex flex-col justify-between h-36 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 opacity-[0.08] pointer-events-none">
                <DollarSign size={140} />
              </div>
              <div className="relative z-10 flex justify-between items-start">
                <div className="p-3 bg-white/10 rounded-2xl text-white border border-white/20 shadow-xs">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-1">Nómina Neta (A Pagar)</p>
                <p className="text-3xl font-black text-white tracking-tight font-mono">$1,402.62</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-on-surface px-1">Desglose por Empleado</h3>
            {payrollData.map((row) => (
              <div key={row.id} className="bg-white border border-outline-variant/60 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-shadow relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="size-10 rounded-xl bg-surface-container-highest flex items-center justify-center font-black text-sm text-on-surface-variant shrink-0 border border-outline-variant shadow-inner">
                       {row.name.split(' ').map((n: string) => n[0]).join('')}
                     </div>
                     <div>
                       <h4 className="font-black text-base text-on-surface tracking-tight">{row.name}</h4>
                       <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">Pendiente de Pago</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5">Neto</p>
                     <p className="text-xl font-black text-[#0f2167] tracking-tight font-mono leading-none">{row.netPay}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 border-t border-outline-variant/40 pt-4">
                  <div className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant/50 shadow-xs">
                    <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">Horas Reg.</p>
                    <p className="text-sm font-black font-mono mt-1">{row.hours}h</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3 border border-orange-100 shadow-xs">
                    <p className="text-[9px] font-black uppercase tracking-widest text-orange-700">Horas Extra</p>
                    <p className="text-sm font-black font-mono mt-1 text-orange-700">{row.overtime}h</p>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-3 border border-rose-100 shadow-xs">
                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-700">Deducciones</p>
                    <p className="text-sm font-black font-mono mt-1 text-rose-700">-{row.taxes}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
           <div className="p-4 bg-surface-container-low rounded-[2rem] border border-outline-variant/60 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  🔍 Filtrar Historial
               </span>
               {(selectedMonth !== 'all') && (
                  <button 
                     onClick={() => setSelectedMonth('all')}
                     className="text-[9px] font-black uppercase tracking-widest text-[#0f2167] hover:opacity-80 transition-all cursor-pointer"
                  >
                     Limpiar filtros
                  </button>
               )}
            </div>
            <div className="grid grid-cols-1 gap-4">
               <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/70 pl-1">Lote / Mes</label>
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full h-11 bg-white border border-outline-variant/60 rounded-xl px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0f2167]/20 shadow-xs cursor-pointer">
                     <option value="all">Todos los meses</option>
                     <option value="Abril">Abril</option>
                     <option value="Marzo">Marzo</option>
                     <option value="Febrero">Febrero</option>
                  </select>
               </div>
            </div>
            <div className="border-t border-outline-variant/40 pt-4 mt-2 flex justify-between items-center">
               <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/80 pl-1">Exportar ({filteredHistory.length})</span>
               <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm transition-all hover:brightness-105 cursor-pointer">
                     📥 Excel
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0f6244] to-emerald-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm transition-all hover:brightness-105 cursor-pointer">
                     📄 PDF
                  </button>
               </div>
            </div>
          </div>
          
          <div className="space-y-4">
             {filteredHistory.map(h => (
               <div key={h.id} className="bg-white border border-outline-variant/60 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-shadow relative">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-[#0f2167]/10 flex items-center justify-center font-black text-sm text-[#0f2167] shrink-0 border border-[#0f2167]/20 shadow-xs">
                          {h.month.substring(0,3)}
                        </div>
                        <div>
                          <h4 className="font-black text-base text-on-surface tracking-tight">Nómina - {h.month}</h4>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">{h.date}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5">Total Emitido</p>
                        <p className="text-xl font-black text-emerald-600 tracking-tight font-mono leading-none">${h.totalPaid.toFixed(2)}</p>
                     </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-outline-variant/40 pt-4 mt-2">
                     <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{h.employees} Empleados</span>
                     <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {h.status}
                     </span>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// APPROVALS VIEW
// -----------------------------------------------------------------------------
function ApprovalsView() {
  const [timesheets, setTimesheets] = useState([
    { id: 1, name: "Carlos Rivera", role: "Seguridad", date: "May 12", clockIn: "08:55 AM", clockOut: "05:05 PM", hrs: "8.1h", status: "Pending" },
    { id: 2, name: "Ana Martínez", role: "Ventas", date: "May 12", clockIn: "08:02 AM", clockOut: "04:30 PM", hrs: "8.5h", status: "Pending", disputed: true, msg: "Trabajó en el almuerzo" },
    { id: 3, name: "Carmen Sánchez", role: "Gerente", date: "May 12", clockIn: "11:58 AM", clockOut: "08:05 PM", hrs: "8.1h", status: "Pending" },
    { id: 4, name: "Carlos Rivera", role: "Seguridad", date: "May 11", clockIn: "09:00 AM", clockOut: "05:00 PM", hrs: "8.0h", status: "Approved" },
    { id: 5, name: "Luis Pérez", role: "Ventas", date: "May 11", clockIn: "09:15 AM", clockOut: "05:00 PM", hrs: "7.7h", status: "Rejected", rejectionNote: "Llegada tarde no justificada" }
  ]);

  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');

  const pending = timesheets.filter(t => t.status === "Pending");
  const historySheets = timesheets.filter(t => t.status !== "Pending");

  const employeesList = Array.from(new Set(historySheets.map(t => t.name)));
  const monthsList = Array.from(new Set(historySheets.map(t => t.date.split(' ')[0] || 'Other')));

  const displaySheets = timesheets.filter(t => {
     if (activeTab === 'pending') {
       return t.status === "Pending";
     } else {
       if (t.status === "Pending") return false;
       if (selectedEmployee !== 'all' && t.name !== selectedEmployee) return false;
       const month = t.date.split(' ')[0] || 'Other';
       if (selectedMonth !== 'all' && month !== selectedMonth) return false;
       return true;
     }
  });

  const historyGroups = displaySheets.reduce((acc: any, t: any) => {
    const month = t.date.split(' ')[0] || 'Other';
    if (!acc[month]) acc[month] = [];
    acc[month].push(t);
    return acc;
  }, {} as Record<string, typeof timesheets>);

  const handleAction = (id: number | string, newStatus: "Approved" | "Rejected") => {
    setTimesheets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const parseHrsToFloat = (hrsStr: string | number): number => {
    if (typeof hrsStr === 'number') return hrsStr;
    if (!hrsStr) return 0;
    const clean = hrsStr.trim().toLowerCase();
    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface">Aprobación de Horas</h1>
          <p className="text-sm font-medium text-on-surface-variant mt-1">Verifica y aprueba los registros de tiempo para la nómina.</p>
        </div>
        {pending.length > 0 && (
          <div className="bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-2xl shadow-lg shadow-rose-500/25 animate-pulse shrink-0 w-fit">
            {pending.length} Pendientes
          </div>
        )}
      </div>

      <div className="bg-surface-container-low p-1 rounded-2xl flex max-w-xs border border-outline-variant/60 shadow-xs">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
            activeTab === 'pending' ? 'bg-[#0f2167] text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Pendientes ({pending.length})
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
            activeTab === 'history' ? 'bg-[#0f2167] text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Historial ({historySheets.length})
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
         <div className="bg-white border border-outline-variant rounded-2xl p-4 shadow-sm flex flex-col">
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 block">Registros sin revisar</span>
            <div className="flex items-baseline gap-1 mt-auto">
               <span className="text-3xl leading-none font-black text-on-surface tracking-tighter">{pending.length}</span>
               <span className="text-xs font-black text-on-surface tracking-tighter">Turnos</span>
            </div>
         </div>
         <div className="bg-white border border-outline-variant rounded-2xl p-4 shadow-sm border-l-4 border-l-orange-500 flex flex-col">
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 block">Disputas</span>
            <p className="text-3xl leading-none font-black text-orange-600 tracking-tighter mt-auto">
               {timesheets.filter(t => t.disputed && t.status === "Pending").length}
            </p>
         </div>
      </div>

      {activeTab === 'history' && (
        <div className="p-4 bg-surface-container-low rounded-[2rem] border border-outline-variant/60 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
             <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                🔍 Filtrar Historial
             </span>
             {(selectedEmployee !== 'all' || selectedMonth !== 'all') && (
                <button 
                   onClick={() => { setSelectedEmployee('all'); setSelectedMonth('all'); }}
                   className="text-[9px] font-black uppercase tracking-widest text-[#0f2167] hover:opacity-80 transition-all cursor-pointer"
                >
                   Limpiar filtros
                </button>
             )}
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/70 pl-1">Empleado</label>
                <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="w-full h-11 bg-white border border-outline-variant/60 rounded-xl px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0f2167]/20 shadow-xs cursor-pointer">
                   <option value="all">Todos los empleados</option>
                   {employeesList.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                </select>
             </div>
             <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/70 pl-1">Mes</label>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full h-11 bg-white border border-outline-variant/60 rounded-xl px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0f2167]/20 shadow-xs cursor-pointer">
                   <option value="all">Todos los meses</option>
                   {monthsList.map(month => <option key={month} value={month}>{month}</option>)}
                </select>
             </div>
          </div>
          <div className="border-t border-outline-variant/40 pt-4 mt-2 flex justify-between items-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/80 pl-1">Exportar ({displaySheets.length})</span>
             <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm transition-all hover:brightness-105 cursor-pointer">
                   📥 Excel
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0f6244] to-emerald-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm transition-all hover:brightness-105 cursor-pointer">
                   📄 PDF
                </button>
             </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {displaySheets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-outline-variant">
             <div className="size-16 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4 shadow-sm text-emerald-500">
                <CheckCircle2 size={32} />
             </div>
             <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
               {activeTab === 'pending' ? 'Todo al día. No hay pendientes.' : 'No hay historial para los filtros seleccionados.'}
             </p>
          </div>
        ) : (
          <>
            {activeTab === 'history' ? (
              <div className="space-y-6">
                 {(Object.entries(historyGroups) as [string, any[]][]).map(([month, items]) => (
                    <div key={month} className="space-y-3">
                        <div className="flex items-center justify-between">
                           <h4 className="text-[12px] font-black uppercase tracking-wider text-[#0f2167] bg-[#0f2167]/10 px-3.5 py-1 rounded-full">{month} 2026</h4>
                           <span className="text-[10px] font-black text-on-surface-variant uppercase">{items.length} registros</span>
                        </div>
                        <div className="bg-white border border-outline-variant rounded-[2rem] overflow-hidden shadow-sm">
                           {items.map((item, idx) => {
                              const hFloat = parseHrsToFloat(item.hrs || '0');
                              return (
                                <div key={item.id} className={`flex flex-col md:flex-row md:items-center justify-between p-5 gap-5 ${idx > 0 ? 'border-t border-outline-variant/40' : ''}`}>
                                   <div>
                                      <h5 className="font-black text-base tracking-tight">{item.name}</h5>
                                      <div className="flex items-center gap-2 mt-1">
                                         <span className="text-sm font-black text-on-surface-variant uppercase tracking-wider">{item.date}</span>
                                         <span className="text-xs font-black text-[#0f2167] bg-[#0f2167]/10 px-2 py-0.5 rounded-md border border-[#0f2167]/20 shadow-xs">⏱️ {hFloat.toFixed(1)}h</span>
                                         {item.status === 'Rejected' && <span className="text-[10px] font-black text-rose-700 bg-rose-100 border border-rose-200 px-2 py-1 rounded-md shadow-xs">❌ Rechazado</span>}
                                      </div>
                                      {item.status === 'Rejected' && item.rejectionNote && <p className="text-xs text-rose-700 mt-2 font-bold">Razón: {item.rejectionNote}</p>}
                                   </div>
                                   <div className="flex items-center gap-4">
                                      <div className="text-right">
                                         <span className="text-sm font-black font-mono bg-surface-container-low px-2 py-1 rounded-md border border-outline-variant/50">{item.clockIn} - {item.clockOut}</span>
                                         <div className="mt-2">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-xs ${item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                               {item.status === 'Approved' ? 'APROBADO' : 'RECHAZADO'}
                                            </span>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                              );
                           })}
                        </div>
                    </div>
                 ))}
              </div>
            ) : (
              <AnimatePresence>
                {displaySheets.map(req => (
                  <motion.div 
                    key={req.id} 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-outline-variant rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between gap-5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0f2167]" />
                    <div className="flex gap-4 items-start pl-2">
                      <div className="size-12 rounded-2xl bg-surface-container-highest flex items-center justify-center font-black text-xl text-on-surface-variant shrink-0 border border-outline-variant shadow-inner">
                        {req.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100 shadow-xs">Turno de Trabajo</span>
                          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">{req.date}</span>
                          {req.disputed && <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-orange-100 text-orange-700 border border-orange-200 animate-pulse shadow-xs">⚠️ Disputa</span>}
                        </div>
                        <h3 className="text-base font-black text-on-surface tracking-tight">{req.name}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                           <div className="flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded-md text-xs font-black font-mono text-on-surface-variant border border-outline-variant/60 shadow-xs">
                             <Clock size={14} /> {req.clockIn} - {req.clockOut}
                           </div>
                           <div className="text-xs font-black text-[#0f2167] bg-[#0f2167]/10 px-2 py-1 rounded-md border border-[#0f2167]/20 shadow-xs">
                             Total: {req.hrs}
                           </div>
                        </div>
                        {req.disputed && <p className="text-xs text-orange-700 mt-3 font-bold bg-orange-50 p-2 rounded-lg border border-orange-200">Motivo: {req.msg}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto pl-2 md:pl-0">
                      <button onClick={() => handleAction(req.id, "Rejected")} className="w-full sm:w-auto h-11 px-5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs">
                        <XCircle size={18} /> Rechazar
                      </button>
                      <button onClick={() => handleAction(req.id, "Approved")} className="w-full sm:w-auto h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2">
                        <CheckCircle2 size={18} /> Aprobar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// REPORTS VIEW
// -----------------------------------------------------------------------------
function ReportsView() {
  const reports = [
    { id: 1, title: "Reporte Trimestral SURI", period: "Q1 2026 (Ene - Mar)", status: "Completado", date: "Abr 10, 2026" },
    { id: 2, title: "Reporte Trimestral DTRH", period: "Q1 2026 (Ene - Mar)", status: "Completado", date: "Abr 10, 2026" },
    { id: 3, title: "Reporte Trimestral SINOT", period: "Q1 2026 (Ene - Mar)", status: "Completado", date: "Abr 11, 2026" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface">Reportes y CPA</h1>
          <p className="text-sm font-medium text-on-surface-variant mt-1">Documentos oficiales para agencias gubernamentales de PR.</p>
        </div>
        <button className="h-11 px-6 bg-[#0f2167] hover:bg-[#0f2167]/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 w-fit">
          <FileText size={16} /> Generar Reporte
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-900 to-[#0f2167] text-white p-6 rounded-3xl border border-outline-variant shadow-lg flex flex-col justify-between relative overflow-hidden mb-8">
         <div className="absolute right-[-20px] top-[-20px] opacity-10 text-white pointer-events-none">
           <TrendingUp size={180} />
         </div>
         <div className="space-y-2 relative z-10">
           <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-full w-max inline-block shadow-sm">
             Resumen Actual
           </span>
           <h3 className="text-xl font-black mt-3">Todo en Orden</h3>
           <p className="text-sm text-white/80 leading-relaxed mt-2 max-w-md font-medium">
             Has completado todas las radicaciones para el primer trimestre. El próximo cierre se habilitará el 1 de Julio de 2026.
           </p>
         </div>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((rep) => (
          <div key={rep.id} className="bg-white border border-outline-variant/60 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-48">
             <div>
                <div className="flex items-start justify-between mb-3">
                   <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs border border-blue-100">
                     <FileText size={20} />
                   </div>
                   <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200">
                     {rep.status}
                   </span>
                </div>
                <h3 className="font-black text-base text-on-surface tracking-tight">{rep.title}</h3>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">{rep.period}</p>
             </div>
             <div className="flex items-center justify-between border-t border-outline-variant/40 pt-3 mt-4">
               <span className="text-[10px] font-medium text-outline">Generado: {rep.date}</span>
               <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                 <Download size={18} />
               </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
