import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, Clock, Calendar, DollarSign, Menu, X,
  ShieldCheck, Star, ChevronDown, Smartphone, MessageCircle,
  Coffee, ShoppingBag, Scissors, Store, Loader2, Users,
  ArrowRight, Zap, BarChart3, ClipboardCheck, ChevronRight,
  Globe, Play
} from 'lucide-react';

// ─── Brand tokens (matching Homebase-level professionalism) ──────────────────
const B = {
  navy:   '#0D225C',
  green:  '#16A34A',
  greenLt:'#DCFCE7',
  blue:   '#2563EB',
  blueLt: '#EFF6FF',
  slate:  '#0F172A',
  gray:   '#64748B',
  border: '#E2E8F0',
  bg:     '#F8FAFC',
};

// ─── Logo ────────────────────────────────────────────────────────────────────
function Logo({ size = 36, dark = true }: { size?: number; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="20" width="46" height="44" rx="8" fill={dark?'white':'#0D225C'} stroke={dark?'#0D225C':'white'} strokeWidth="5"/>
        <path d="M15 28C15 24.6863 17.6863 22 21 22H55C58.3137 22 61 24.6863 61 28V32H15V28Z" fill={dark?'#0D225C':'white'}/>
        <rect x="25" y="12" width="5" height="10" rx="2.5" fill={dark?'#0D225C':'white'}/>
        <rect x="46" y="12" width="5" height="10" rx="2.5" fill={dark?'#0D225C':'white'}/>
        <rect x="23" y="38" width="7" height="7" rx="1.5" fill={dark?'#E2E8F0':'#1e293b'}/>
        <rect x="34" y="38" width="7" height="7" rx="1.5" fill={dark?'#E2E8F0':'#1e293b'}/>
        <rect x="45" y="38" width="7" height="7" rx="1.5" fill={dark?'#E2E8F0':'#1e293b'}/>
        <rect x="23" y="49" width="7" height="7" rx="1.5" fill={dark?'#E2E8F0':'#1e293b'}/>
        <rect x="34" y="49" width="7" height="7" rx="1.5" fill="#22c55e"/>
        <path d="M36 52.5L37.5 54L40 51.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="52" y="28" width="28" height="46" rx="6" fill={dark?'white':'#0f172a'} stroke={dark?'#0D225C':'white'} strokeWidth="5"/>
        <circle cx="66" cy="42" r="5" stroke="#22c55e" strokeWidth="2"/>
        <circle cx="66" cy="42" r="1.5" fill="#22c55e"/>
        <rect x="59" y="52" width="10" height="2" rx="1" fill={dark?'#E2E8F0':'#334155'}/>
        <rect x="59" y="58" width="10" height="2" rx="1" fill={dark?'#E2E8F0':'#334155'}/>
        <rect x="59" y="64" width="10" height="2" rx="1" fill={dark?'#E2E8F0':'#334155'}/>
        <circle cx="72" cy="53" r="1" fill="#22c55e"/>
        <circle cx="72" cy="59" r="1" fill="#22c55e"/>
        <circle cx="72" cy="65" r="1" fill="#22c55e"/>
        <circle cx="45" cy="64" r="12" fill={dark?'white':'#0f172a'} stroke={dark?'#0D225C':'white'} strokeWidth="4"/>
        <path d="M45 58.5V64H49.5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div>
        <span className="font-black tracking-tight leading-none" style={{ fontSize: size*0.4, color: dark ? B.navy : 'white' }}>Turnos</span>
        <div className="flex items-center gap-1">
          <div className="flex flex-col gap-px" style={{ width: size*0.14 }}>
            <div className="h-px bg-green-500 rounded-full w-full" />
            <div className="h-px bg-green-500 rounded-full w-4/5" />
            <div className="h-px bg-green-500 rounded-full w-2/3" />
          </div>
          <span className="font-black tracking-tight leading-none text-green-500" style={{ fontSize: size*0.4 }}>Móvil</span>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Preview (web) ──────────────────────────────────────────────────
function WebDashPreview() {
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200" style={{ background: '#F5F5F7' }}>
      {/* Chrome bar */}
      <div className="h-10 flex items-center px-4 gap-2" style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div className="flex gap-1.5"><div className="size-3 rounded-full bg-red-400"/><div className="size-3 rounded-full bg-amber-400"/><div className="size-3 rounded-full bg-green-400"/></div>
        <div className="flex-1 mx-4 h-6 rounded-full flex items-center px-3 gap-1.5 text-[10px] text-slate-400" style={{ background: '#F1F5F9' }}>
          <Globe size={10}/> turnosmovil.com/app
        </div>
      </div>
      {/* App layout */}
      <div className="flex h-72">
        {/* Sidebar */}
        <div className="w-14 flex flex-col items-center py-3 gap-3" style={{ background: '#111111' }}>
          <div className="size-8 rounded-xl flex items-center justify-center text-xs font-black text-white" style={{ background: B.blue }}>T</div>
          {[
            { bg: '#4F46E540', icon: '⊞' },
            { bg: '#16A34A40', icon: '👥' },
            { bg: '#2563EB40', icon: '📅' },
            { bg: '#D9770640', icon: '✓' },
          ].map(({ bg, icon }, i) => (
            <div key={i} className="size-8 rounded-xl flex items-center justify-center text-xs" style={{ background: i===0?'#4F46E5':bg }}>{icon}</div>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 p-3 space-y-2 overflow-hidden">
          {/* Header gradient */}
          <div className="rounded-xl p-3" style={{ background: 'linear-gradient(135deg, #064E3B, #1D4ED8)' }}>
            <p className="text-[9px] text-green-300 font-bold uppercase tracking-widest mb-1">Dashboard</p>
            <div className="grid grid-cols-4 gap-1.5">
              {[['3','En turno','#1D9E75'],['2','Sin ponchar','#D97706'],['8','Turnos hoy','#2563EB'],['1','Pendientes','#DC2626']].map(([v,l,c])=>(
                <div key={l} className="rounded-xl p-2 flex items-center gap-1.5" style={{ background: '#F2F2F4' }}>
                  <span className="text-sm font-black leading-none" style={{ color: c }}>{v}</span>
                  <span className="text-[7px] leading-tight" style={{ color: `${c}99` }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Monthly bar */}
          <div className="rounded-xl p-2.5" style={{ background: '#FFFFFF', border: '1px solid #E8E8E8' }}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[8px] font-semibold text-slate-600">Horas aprobadas este mes</span>
              <span className="text-[8px] font-bold text-blue-600">68%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: '#DBEAFE' }}>
              <div className="h-full rounded-full w-2/3" style={{ background: '#2563EB' }} />
            </div>
          </div>
          {/* Employee list */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E8E8E8' }}>
            {[['JR','Juan Rivera','Cajero','#6366F1','active'],['MC','María Castro','Mesera','#0D9488','active'],['LP','Luis Pérez','Cocinero','#16A34A','inactive']].map(([init,name,pos,clr,st],i)=>(
              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5" style={{ borderBottom: i<2?'1px solid #F0EEE8':'none' }}>
                <div className="size-6 rounded-lg flex items-center justify-center text-[8px] font-bold text-white shrink-0" style={{ background: clr }}>{init}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-semibold text-slate-800">{name}</p>
                  <p className="text-[7px] text-slate-400">{pos}</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`size-1.5 rounded-full ${st==='active'?'bg-green-500 animate-pulse':'bg-slate-300'}`}/>
                  <span className="text-[7px] font-semibold" style={{ color: st==='active'?'#16A34A':'#9CA3AF' }}>{st==='active'?'Activo':'Inactivo'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phone Mockup ─────────────────────────────────────────────────────────────
function PhoneMockup() {
  return (
    <div className="relative shrink-0">
      <div className="w-36 h-72 rounded-3xl p-2 shadow-2xl border-4 border-slate-800" style={{ background: '#111' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 rounded-b-xl z-20" style={{ background: '#111' }}/>
        <div className="w-full h-full rounded-2xl overflow-hidden flex flex-col" style={{ background: '#F5F5F7' }}>
          <div className="h-5 shrink-0 bg-white"/>
          <div className="flex-1 p-1.5 space-y-1.5 overflow-hidden">
            <div className="rounded-xl p-2" style={{ background: 'linear-gradient(135deg, #064E3B, #1D4ED8)' }}>
              <p className="text-[6px] text-blue-200 font-bold mb-1">BUENOS DÍAS, CARLOS</p>
              <div className="grid grid-cols-2 gap-1">
                {[['4','Activos','#1D9E75'],['2','Pendientes','#D97706']].map(([v,l,c])=>(
                  <div key={l} className="rounded-lg p-1 flex items-center gap-1" style={{ background: '#F2F2F4' }}>
                    <span className="text-[10px] font-black" style={{ color: c }}>{v}</span>
                    <span className="text-[5px]" style={{ color: `${c}AA` }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[6px] font-bold text-slate-500 px-0.5">EMPLEADOS HOY</p>
            {[['JR','#6366F1','Juan R.','Activo'],['MC','#0D9488','María C.','Activo'],['LP','#16A34A','Luis P.','Pendiente']].map(([ini,clr,name,st],i)=>(
              <div key={i} className="flex items-center gap-1.5 px-1.5 py-1 rounded-xl bg-white">
                <div className="size-5 rounded-md flex items-center justify-center text-[5px] font-bold text-white shrink-0" style={{ background: clr }}>{ini}</div>
                <span className="text-[7px] font-semibold text-slate-700 flex-1">{name}</span>
                <span className="text-[5px] font-bold px-1 py-0.5 rounded-full" style={{ background: st==='Activo'?'#DCFCE7':'#FEF3C7', color: st==='Activo'?'#16A34A':'#D97706' }}>{st}</span>
              </div>
            ))}
          </div>
          {/* Bottom nav */}
          <div className="flex justify-around items-center py-1.5" style={{ background: '#111' }}>
            {['⊞','👥','📅','$'].map((ic,i)=>(
              <div key={i} className={`size-6 rounded-lg flex items-center justify-center text-[10px] ${i===0?'bg-indigo-500':''}`} style={{ color: i===0?'white':'rgba(255,255,255,0.4)' }}>{ic}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<'Starter'|'Pro'|'Premium'|null>(null);

  const handleSelectPlan = async (plan: 'Starter'|'Pro'|'Premium') => {
    setLoadingPlan(plan);
    try {
      const priceId = { Starter:'price_1TbiWe2Lx6mtbfcWEFr0DJuv', Pro:'price_1TbiXA2Lx6mtbfcWlb7aTxGm', Premium:'price_1TbiYl2Lx6mtbfcWnWXe5iCb' }[plan];
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method:'POST', headers:{'Content-Type':'application/json','apikey':import.meta.env.VITE_SUPABASE_ANON_KEY},
        body: JSON.stringify({ priceId, successUrl:`${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`, cancelUrl:`${window.location.origin}/#pricing` }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Error al iniciar el checkout.');
    } catch { alert('Error de conexión.'); } finally { setLoadingPlan(null); }
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: B.slate }}>

      {/* ── Announcement Bar ─────────────────────────────────────────────── */}
      <div className="text-center py-2.5 px-4 text-xs font-semibold text-white" style={{ background: B.navy }}>
        🇵🇷 Hecho en Puerto Rico · Cumple con SURI, DTRH y SINOT automáticamente &nbsp;
        <a href="#pricing" className="underline underline-offset-2 opacity-80 hover:opacity-100">Ver planes →</a>
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md" style={{ borderBottom: `1px solid ${B.border}` }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size={34} dark />
          <div className="hidden md:flex items-center gap-7">
            {[['#features','Funciones'],['#how-it-works','Cómo funciona'],['#pricing','Precios'],['#faq','FAQ']].map(([href,label])=>(
              <a key={href} href={href} className="text-sm font-semibold transition-colors hover:text-blue-600" style={{ color: B.gray }}>{label}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/app" className="text-sm font-semibold px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors" style={{ color: B.slate }}>Iniciar sesión</Link>
            <a href="#pricing" className="text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-90 shadow-md"
              style={{ background: B.green, boxShadow: `0 4px 14px ${B.green}44` }}>
              Prueba gratis 14 días
            </a>
          </div>
          <button className="md:hidden p-2 rounded-xl" style={{ color: B.slate, background: B.bg }} onClick={()=>setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
              className="md:hidden overflow-hidden border-t" style={{ borderColor: B.border, background: 'white' }}>
              <div className="px-6 py-4 space-y-1">
                {[['#features','Funciones'],['#pricing','Precios'],['#how-it-works','Cómo funciona'],['#faq','FAQ']].map(([href,label])=>(
                  <a key={href} href={href} onClick={()=>setMobileMenuOpen(false)} className="block py-3 text-base font-semibold border-b" style={{ color: B.slate, borderColor: B.border }}>{label}</a>
                ))}
                <div className="pt-3 flex flex-col gap-3">
                  <Link to="/app" className="text-center py-2.5 rounded-xl font-semibold text-sm border" style={{ color: B.slate, borderColor: B.border }}>Iniciar sesión</Link>
                  <a href="#pricing" className="text-center py-2.5 rounded-xl font-bold text-sm text-white" style={{ background: B.green }}>Prueba gratis 14 días</a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="px-6 pt-16 pb-20 md:pt-24 md:pb-28" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left copy */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
                style={{ background: B.greenLt, color: B.green }}>
                <span className="size-2 rounded-full bg-green-500 animate-pulse"/>
                Disponible ahora · 14 días gratis
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6" style={{ color: B.slate }}>
                Turnos, nómina y<br/>
                <span style={{ color: B.green }}>trimestrales</span> para<br/>
                tu negocio en PR.
              </h1>
              <p className="text-lg md:text-xl font-medium mb-8 max-w-xl mx-auto lg:mx-0" style={{ color: B.gray }}>
                El sistema todo-en-uno que usan los negocios en Puerto Rico para gestionar horarios, pagar a su equipo y cumplir con el gobierno — sin complicaciones.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a href="#pricing" className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90 shadow-lg"
                  style={{ background: B.green, boxShadow: `0 8px 24px ${B.green}44` }}>
                  Empezar gratis <ArrowRight size={18}/>
                </a>
                <a href="#features" className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-base font-bold border-2 transition-all hover:bg-slate-50"
                  style={{ color: B.slate, borderColor: B.border }}>
                  <Play size={16} fill="currentColor"/> Ver cómo funciona
                </a>
              </div>
              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-5 mt-8 justify-center lg:justify-start">
                <div className="flex items-center gap-1.5">
                  <div className="flex">{[1,2,3,4,5].map(i=><Star key={i} size={16} className="text-amber-400" fill="currentColor"/>)}</div>
                  <span className="text-sm font-bold" style={{ color: B.slate }}>4.9/5</span>
                </div>
                <span style={{ color: B.border }}>|</span>
                <span className="text-sm font-medium" style={{ color: B.gray }}>500+ negocios activos</span>
                <span style={{ color: B.border }}>|</span>
                <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: B.gray }}><ShieldCheck size={15} className="text-green-600"/> Cumple con PR</span>
              </div>
            </div>

            {/* Right mockups */}
            <div className="flex-1 w-full relative">
              <div className="relative">
                <div className="hidden sm:block"><WebDashPreview/></div>
                {/* Floating phone */}
                <div className="absolute -bottom-6 -left-6 z-10 hidden md:block">
                  <PhoneMockup/>
                </div>
                {/* Badge */}
                <div className="absolute -top-4 -right-4 hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl shadow-xl text-sm font-bold"
                  style={{ background: 'white', border: `1px solid ${B.border}` }}>
                  🇵🇷 Hecho en Puerto Rico
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof Bar ─────────────────────────────────────────────── */}
      <div style={{ background: B.slate }}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {[
              { label: '500+', sub: 'Negocios activos' },
              { label: '50K+', sub: 'Horas procesadas' },
              { label: '4.9★', sub: 'Calificación promedio' },
              { label: '100%', sub: 'Cumplimiento con PR' },
            ].map(({label,sub})=>(
              <div key={sub} className="text-center">
                <p className="text-xl md:text-2xl font-black text-white">{label}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Industry Sections ─────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: B.bg }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: B.green }}>Para tu tipo de negocio</p>
            <h2 className="text-3xl md:text-4xl font-black" style={{ color: B.slate }}>Diseñado para negocios que no pueden perder tiempo.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Coffee,   title: 'Restaurantes y Cafés',     desc: 'Turnos, propinas y personal en horas pico.', img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80' },
              { icon: ShoppingBag, title: 'Tiendas y Retail',      desc: 'Control de personal por sucursal.',         img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80' },
              { icon: Scissors, title: 'Barberías y Salones',      desc: 'Agenda y equipo de forma fácil.',           img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80' },
              { icon: Store,    title: 'Mini Markets y Colmados',  desc: 'Simplifica tu operación diaria.',           img: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=600&q=80' },
            ].map(({ icon: Icon, title, desc, img }) => (
              <div key={title} className="rounded-3xl overflow-hidden border transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer" style={{ background: 'white', borderColor: B.border }}>
                <div className="h-36 relative overflow-hidden">
                  <img src={img} alt={title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.6))' }} />
                  <div className="absolute bottom-3 left-3 size-9 rounded-xl flex items-center justify-center" style={{ background: B.green }}>
                    <Icon size={18} color="white"/>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold mb-1" style={{ color: B.slate }}>{title}</h3>
                  <p className="text-sm" style={{ color: B.gray }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: B.green }}>Todo lo que necesitas</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: B.slate }}>Herramientas poderosas, fáciles de usar.</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: B.gray }}>Un sistema completo que conecta tu teléfono con tu operación. Sin papeles, sin hojas de cálculo, sin errores.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Calendar,      color: B.blue,   bg: B.blueLt,  title: 'Horarios inteligentes', desc: 'Crea turnos en segundos. Publica con un toque. Tus empleados los reciben en su teléfono al instante.' },
              { icon: Smartphone,    color: B.green,  bg: B.greenLt, title: 'Marcado de asistencia móvil', desc: 'Clock In/Out desde el celular con GPS. Sin relojes de tarjeta, sin fraudes, sin problemas.' },
              { icon: DollarSign,    color: '#7C3AED', bg: '#EDE9FE',  title: 'Nómina automática', desc: 'El sistema calcula horas regulares, horas extras y deducciones. Listo para pagar en minutos.' },
              { icon: ShieldCheck,   color: '#D97706', bg: '#FEF3C7',  title: 'Trimestrales a un clic', desc: 'Genera reportes SURI, DTRH y SINOT automáticamente. Cumple con la ley sin contratar a nadie.' },
              { icon: ClipboardCheck,color: '#0891B2', bg: '#E0F2FE',  title: 'Aprobación de hojas de horas', desc: 'Revisa, ajusta y aprueba las horas de cada empleado. Historial completo y auditable.' },
              { icon: BarChart3,     color: '#059669', bg: '#D1FAE5',  title: 'Reportes y análisis', desc: 'Visualiza costos de personal, horas extras y productividad por semana, mes o trimestre.' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="flex gap-5 p-6 rounded-2xl border transition-all hover:shadow-md hover:border-blue-200 group" style={{ background: 'white', borderColor: B.border }}>
                <div className="size-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                  <Icon size={22} style={{ color }}/>
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1.5" style={{ color: B.slate }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: B.gray }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PR Compliance Banner ─────────────────────────────────────────── */}
      <div className="py-12 px-6" style={{ background: B.navy }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <span className="text-5xl">🇵🇷</span>
            <div>
              <h3 className="text-xl font-black text-white">Hecho en Puerto Rico, para Puerto Rico.</h3>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>Cumplimos con la ley local para que tú solo te enfoques en crecer.</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {['SURI','DTRH','SINOT'].map(label=>(
              <div key={label} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm font-black" style={{ color: B.navy }}>
                <ShieldCheck size={15} className="text-green-600"/> {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6" style={{ background: B.bg }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: B.green }}>Simplicidad ante todo</p>
            <h2 className="text-3xl md:text-4xl font-black" style={{ color: B.slate }}>Empieza en 3 simples pasos.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-[calc(33.3%+1.5rem)] right-[calc(33.3%+1.5rem)] h-px" style={{ background: `repeating-linear-gradient(90deg, ${B.border} 0, ${B.border} 8px, transparent 8px, transparent 16px)` }}/>
            {[
              { n:'1', title:'Configura tu negocio', desc:'Crea tu cuenta, añade tus empleados y define las reglas de pago. En menos de 10 minutos.' },
              { n:'2', title:'Tu equipo usa la app', desc:'Ellos ven sus horarios en el celular y marcan entradas y salidas con GPS automáticamente.' },
              { n:'3', title:'Nómina a un clic', desc:'Aprueba las horas al final de la semana y obtén la nómina y los trimestrales listos.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex flex-col items-center text-center p-8 rounded-2xl border bg-white" style={{ borderColor: B.border }}>
                <div className="size-14 rounded-full flex items-center justify-center text-xl font-black text-white mb-5 shadow-lg" style={{ background: B.green, boxShadow: `0 8px 20px ${B.green}40` }}>{n}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: B.slate }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: B.gray }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: B.green }}>Lo que dicen nuestros clientes</p>
            <h2 className="text-3xl md:text-4xl font-black" style={{ color: B.slate }}>Negocios en Puerto Rico ya confían en Turnos Móvil.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { name:'María González', biz:'Café Don Pepe',      img:'https://i.pravatar.cc/150?img=47', text:'Turnos Móvil nos ahorró horas cada semana. Ahora los horarios y la nómina son pan comido.' },
              { name:'Juan Pérez',     biz:'Panadería La Unión', img:'https://i.pravatar.cc/150?img=11', text:'Los trimestrales automáticos son lo mejor. Nunca había sido tan fácil cumplir con la ley.' },
              { name:'Laura Martínez', biz:'Barbería Fresh Cut', img:'https://i.pravatar.cc/150?img=32', text:'Mi equipo marca desde el celular y yo veo todo en tiempo real. Totalmente recomendado.' },
            ].map((t, i) => (
              <div key={i} className="flex flex-col p-7 rounded-2xl border" style={{ background: B.bg, borderColor: B.border }}>
                <div className="flex gap-1 text-amber-400 mb-5">{[1,2,3,4,5].map(j=><Star key={j} size={15} fill="currentColor"/>)}</div>
                <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: B.gray }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="size-11 rounded-full"/>
                  <div>
                    <p className="text-sm font-bold" style={{ color: B.slate }}>{t.name}</p>
                    <p className="text-xs" style={{ color: B.gray }}>{t.biz}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 rounded-2xl" style={{ background: B.slate }}>
            <div className="flex -space-x-3">
              {['47','11','32','68'].map(n=><img key={n} src={`https://i.pravatar.cc/150?img=${n}`} className="size-11 rounded-full border-2" style={{ borderColor: B.slate }} alt="User"/>)}
              <div className="size-11 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white" style={{ background: B.navy, borderColor: B.slate }}>+</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-0.5">
                <span className="text-2xl font-black text-white">4.9/5</span>
                <div className="flex text-amber-400">{[1,2,3,4,5].map(i=><Star key={i} size={18} fill="currentColor"/>)}</div>
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Calificación promedio de nuestros clientes</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6" style={{ background: B.bg }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: B.green }}>Precios simples y justos</p>
            <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: B.slate }}>Elige el plan que mejor se adapta.</h2>
            <p className="text-base" style={{ color: B.gray }}>14 días gratis en todos los planes. Sin tarjeta de crédito.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
            {[
              { id:'Starter',  name:'Básico',       price:'$29.99', period:'/mes', sub:'Hasta 10 empleados', popular:false, color: B.slate,
                features:['Asistencia digital (Clock In/Out)','Calendario semanal básico','Gestión de hasta 10 empleados','Revisión simple de Timesheets','App móvil incluida'] },
              { id:'Pro',      name:'Profesional',  price:'$49',    period:'/mes', sub:'Hasta 50 empleados', popular:true,  color: B.blue,
                features:['Todo lo del plan Básico','Cálculo de Nómina automatizado','Bolsa de Turnos (Shift Swap)','Historial de nómina y reportes','Duplicador de turnos (1 toque)'] },
              { id:'Premium',  name:'Avanzado',     price:'$69',    period:'/mes', sub:'Personal ilimitado',  popular:false, color: B.green,
                features:['Todo lo del plan Profesional','Geocercas de seguridad GPS','Alertas GPS sospechosas','Rastreador de Horas Extras (OT)','Soporte multi-administrador','Trimestrales completos automáticos'] },
            ].map(({ id, name, price, period, sub, popular, color, features }) => (
              <div key={id} className={`relative flex flex-col rounded-2xl overflow-hidden border transition-all ${popular ? 'shadow-2xl md:-translate-y-4 mt-4 md:mt-0' : 'shadow-sm'}`}
                style={{ background: 'white', borderColor: popular ? color : B.border, borderWidth: popular ? 2 : 1 }}>
                {popular && (
                  <div className="text-center py-2 text-xs font-black text-white uppercase tracking-widest" style={{ background: color }}>
                    Más popular
                  </div>
                )}
                <div className="p-7 flex-1 flex flex-col">
                  <h3 className="text-xl font-black mb-1" style={{ color: B.slate }}>{name}</h3>
                  <p className="text-xs font-medium mb-5" style={{ color: B.gray }}>{sub}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black" style={{ color: B.slate }}>{price}</span>
                    <span className="text-sm font-medium" style={{ color: B.gray }}>{period}</span>
                  </div>
                  <ul className="space-y-3 mb-7 flex-1">
                    {features.map(f=>(
                      <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: B.slate }}>
                        <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: B.green }}/>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={()=>handleSelectPlan(id as any)} disabled={loadingPlan!==null}
                    className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ background: popular ? color : 'white', color: popular ? 'white' : B.slate, border: popular ? 'none' : `1.5px solid ${B.border}` }}>
                    {loadingPlan===id ? <><Loader2 size={16} className="animate-spin"/> Cargando...</> : 'Empezar gratis 14 días'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button onClick={()=>setShowComparison(!showComparison)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border transition-all hover:bg-blue-50" style={{ color: B.blue, borderColor: `${B.blue}44` }}>
              {showComparison?'Ocultar':'Ver'} tabla comparativa completa
              <ChevronDown size={16} className={`transition-transform ${showComparison?'rotate-180':''}`}/>
            </button>
          </div>

          <AnimatePresence>
            {showComparison && (
              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:16}} className="mt-8 rounded-2xl overflow-hidden border shadow-lg" style={{ borderColor: B.border }}>
                <div className="overflow-x-auto bg-white">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${B.border}` }}>
                        <th className="p-5 text-left text-sm font-black" style={{ color: B.slate }}>Característica</th>
                        {['Básico','Profesional','Avanzado'].map(p=>(
                          <th key={p} className="p-5 text-center text-sm font-black" style={{ color: B.slate }}>{p}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Precio','$29.99/mes','$49/mes','$69/mes'],
                        ['Empleados','Hasta 10','Hasta 50','Ilimitados'],
                        ['Marcado móvil','✓','✓','✓'],
                        ['Nómina automática','—','✓','✓'],
                        ['Trimestrales PR','—','Básico','Completo'],
                        ['Horas extras (OT)','—','—','✓'],
                        ['Geocercas GPS','—','—','✓'],
                        ['Multi-administrador','—','—','✓'],
                      ].map(([feature,...vals],i)=>(
                        <tr key={feature} style={{ borderBottom: `1px solid ${B.border}`, background: i%2===0?'white':B.bg }}>
                          <td className="p-4 text-sm font-semibold" style={{ color: B.slate }}>{feature}</td>
                          {vals.map((v,j)=>(
                            <td key={j} className="p-4 text-center text-sm font-medium" style={{ color: v==='✓'?B.green:v==='—'?B.border:B.slate }}>
                              {v==='✓'?<CheckCircle2 size={18} className="mx-auto" style={{color:B.green}}/>:v==='—'?<span className="text-slate-200 text-lg">—</span>:v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-10 text-sm font-medium" style={{ color: B.gray }}>
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-600"/> Sin contrato, cancela cuando quieras</span>
            <span className="flex items-center gap-2"><Clock size={16} className="text-green-600"/> Actualizaciones incluidas</span>
            <span className="flex items-center gap-2"><Zap size={16} className="text-green-600"/> Soporte prioritario en planes Pro y Premium</span>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: B.green }}>Dudas frecuentes</p>
            <h2 className="text-3xl md:text-4xl font-black" style={{ color: B.slate }}>¿Tienes preguntas? Tenemos respuestas.</h2>
          </div>
          <div className="space-y-3">
            {[
              { q:'¿Puedo probar Turnos Móvil gratis?', a:'Sí, todos nuestros planes incluyen 14 días de prueba gratuita con acceso total. No requerimos tarjeta de crédito para empezar.' },
              { q:'¿Incluye cumplimiento con SURI, DTRH y SINOT?', a:'¡Por supuesto! Nuestro sistema está diseñado específicamente para Puerto Rico y genera los reportes necesarios automáticamente.' },
              { q:'¿Cuántos empleados puedo agregar?', a:'Depende del plan: Básico hasta 10 empleados, Profesional hasta 50, y Avanzado es ilimitado.' },
              { q:'¿Mis empleados necesitan descargar algo?', a:'Sí, los empleados usan nuestra app móvil gratuita para ver horarios, marcar asistencia y recibir notificaciones.' },
              { q:'¿Cómo funciona el cálculo de nómina?', a:'El sistema toma las horas marcadas, aplica automáticamente las reglas de horas extras de Puerto Rico y calcula deducciones. Listo para pagar.' },
              { q:'¿Puedo cancelar cuando quiera?', a:'Sí, sin contratos a largo plazo. Cancela o cambia de plan en cualquier momento desde tu configuración.' },
            ].map(({q,a},i)=>(
              <div key={i} className="rounded-2xl border overflow-hidden" style={{ borderColor: B.border }}>
                <button onClick={()=>setOpenFaq(openFaq===i?null:i)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-bold pr-4" style={{ color: B.slate }}>{q}</span>
                  <ChevronDown size={18} className={`shrink-0 transition-transform`} style={{ color: B.gray, transform: openFaq===i?'rotate(180deg)':'none' }}/>
                </button>
                <AnimatePresence>
                  {openFaq===i && (
                    <motion.div initial={{height:0}} animate={{height:'auto'}} exit={{height:0}} className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: B.gray }}>{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border" style={{ background: B.blueLt, borderColor: `${B.blue}33` }}>
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl flex items-center justify-center" style={{ background: B.blue }}>
                <MessageCircle size={22} color="white"/>
              </div>
              <div>
                <p className="font-bold" style={{ color: B.slate }}>¿No encuentras la respuesta?</p>
                <p className="text-sm" style={{ color: B.gray }}>Estamos aquí para ayudarte.</p>
              </div>
            </div>
            <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ background: B.blue }}>Hablar con soporte</button>
          </div>
        </div>
      </section>

      {/* ── Download ─────────────────────────────────────────────────────── */}
      <section id="descargar" className="py-24 px-6" style={{ background: B.bg }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: B.green }}>App para empleados</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: B.slate }}>Descarga Turnos Móvil gratis.</h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: B.gray }}>Tus empleados instalan la app y empiezan a marcar asistencia desde el primer día.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-5 mb-10">
                {[
                  { n:'1', title:'Descarga el APK', desc:'Toca el botón de abajo para descargar Turnos Móvil en tu Android.' },
                  { n:'2', title:'Permite instalar apps externas', desc:'En Ajustes → Seguridad → activa "Fuentes desconocidas".' },
                  { n:'3', title:'Abre e instala', desc:'Toca el APK descargado y sigue los pasos de instalación.' },
                  { n:'4', title:'¡Listo! Inicia sesión', desc:'Abre la app, entra con tu cuenta y comienza a usarla.' },
                ].map(s=>(
                  <div key={s.n} className="flex gap-4">
                    <div className="size-9 rounded-full text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md" style={{ background: B.green, boxShadow:`0 4px 12px ${B.green}44` }}>{s.n}</div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: B.slate }}>{s.title}</p>
                      <p className="text-sm mt-0.5" style={{ color: B.gray }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a href="https://github.com/SRJ-T/turnos-movil/releases/download/v1.0.0/turnos-movil.apk"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90 shadow-xl"
                style={{ background: B.slate, boxShadow:`0 8px 24px rgba(0,0,0,0.25)` }}>
                <Smartphone size={20}/> Descargar APK
              </a>
              <p className="text-xs mt-3" style={{ color: B.gray }}>Android · Gratis · v1.0.0</p>
            </div>
            <div className="flex justify-center">
              <div className="w-[220px] h-[440px] rounded-[2.5rem] p-2.5 shadow-2xl border-4 relative" style={{ background: '#111', borderColor: '#1e293b' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 rounded-b-xl z-20" style={{ background: '#111' }}/>
                <div className="w-full h-full rounded-[2rem] overflow-hidden flex flex-col" style={{ background: B.bg }}>
                  <div className="h-7 shrink-0 bg-white"/>
                  <div className="flex-1 p-3 space-y-2.5">
                    <div className="rounded-2xl p-3 text-white" style={{ background: 'linear-gradient(135deg, #064E3B, #1D4ED8)' }}>
                      <p className="text-[7px] font-bold opacity-60 mb-0.5">BIENVENIDO</p>
                      <p className="text-[10px] font-black">Cafetería El Buen Sabor</p>
                    </div>
                    <div className="rounded-2xl p-3 bg-white border" style={{ borderColor: B.border }}>
                      <p className="text-[7px] font-bold opacity-60 mb-1">PRÓXIMO TURNO</p>
                      <p className="text-[9px] font-black" style={{ color: B.slate }}>Hoy · 9:00 AM – 5:00 PM</p>
                    </div>
                    {[['Mañana','2:00 PM – 9:00 PM','Pendiente'],['Jueves','10:00 AM – 6:00 PM','Aceptado']].map(([d,h,s])=>(
                      <div key={d} className="rounded-2xl p-2.5 bg-white border flex justify-between items-center" style={{ borderColor: B.border }}>
                        <div><p className="text-[9px] font-bold" style={{ color: B.slate }}>{d}</p><p className="text-[7px]" style={{ color: B.gray }}>{h}</p></div>
                        <span className="text-[7px] font-bold px-2 py-0.5 rounded-full" style={{ background:s==='Aceptado'?B.greenLt:'#FEF3C7', color:s==='Aceptado'?B.green:'#D97706' }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Bottom ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: B.slate }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: `${B.green}` }}>Empieza hoy</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            Transforma tu negocio.<br/>Empieza gratis hoy.
          </h2>
          <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Únete a cientos de dueños que ya simplificaron su operación con Turnos Móvil.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#pricing" className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90 shadow-xl"
              style={{ background: B.green, boxShadow:`0 8px 24px ${B.green}55` }}>
              Prueba gratis 14 días <ArrowRight size={18}/>
            </a>
            <Link to="/app" className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold border transition-all hover:bg-white hover:text-slate-900"
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              Iniciar sesión <ChevronRight size={18}/>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-10 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> Sin contrato</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> Cancela cuando quieras</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> 14 días gratis</span>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ background: '#0A0F1C', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <Logo size={32} dark={false}/>
              <p className="text-xs mt-4 leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                El sistema de turnos y nómina diseñado para negocios en Puerto Rico.
              </p>
            </div>
            {[
              { label:'Producto', links:[['#features','Funciones'],['#pricing','Precios'],['#descargar','Descargar App']] },
              { label:'Empresa', links:[['#','Acerca de'],['#','Blog'],['#','Contacto']] },
              { label:'Legal', links:[['#','Privacidad'],['#','Términos de uso'],['#','Cookies']] },
            ].map(({ label, links }) => (
              <div key={label}>
                <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
                <ul className="space-y-2.5">
                  {links.map(([href, name]) => (
                    <li key={name}><a href={href} className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>{name}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} Turnos Móvil. Todos los derechos reservados.</p>
            <p className="text-xs flex items-center gap-1.5 mt-2 sm:mt-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
              🇵🇷 Hecho en Puerto Rico con <span className="text-red-400">♥</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
