import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, Clock, Calendar, DollarSign, Menu, X, 
  ShieldCheck, Star, ChevronDown, Rocket, Smartphone, MessageCircle, 
  Coffee, ShoppingBag, Scissors, Store, Loader2
} from 'lucide-react';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const [loadingPlan, setLoadingPlan] = useState<'Starter' | 'Pro' | 'Premium' | null>(null);

  const handleSelectPlan = async (plan: 'Starter' | 'Pro' | 'Premium') => {
    setLoadingPlan(plan);
    try {
      const priceId = {
        Starter: 'price_1TbiWe2Lx6mtbfcWEFr0DJuv',
        Pro: 'price_1TbiXA2Lx6mtbfcWlb7aTxGm',
        Premium: 'price_1TbiYl2Lx6mtbfcWnWXe5iCb',
      }[plan];

      const successUrl = `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/#pricing`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          priceId,
          successUrl,
          cancelUrl,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Ocurrió un error al iniciar el checkout.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al servidor de Stripe.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] font-sans text-slate-900 selection:bg-blue-200">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="size-10 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="15" y="20" width="46" height="44" rx="8" fill="white" stroke="#0d225c" strokeWidth="5"/>
              <path d="M15 28C15 24.6863 17.6863 22 21 22H55C58.3137 22 61 24.6863 61 28V32H15V28Z" fill="#0d225c"/>
              <rect x="25" y="12" width="5" height="10" rx="2.5" fill="#0d225c"/>
              <rect x="46" y="12" width="5" height="10" rx="2.5" fill="#0d225c"/>
              
              <rect x="23" y="38" width="7" height="7" rx="1.5" fill="#e2e8f0"/>
              <rect x="34" y="38" width="7" height="7" rx="1.5" fill="#e2e8f0"/>
              <rect x="45" y="38" width="7" height="7" rx="1.5" fill="#e2e8f0"/>
              <rect x="23" y="49" width="7" height="7" rx="1.5" fill="#e2e8f0"/>
              <rect x="34" y="49" width="7" height="7" rx="1.5" fill="#22c55e"/>
              <path d="M36 52.5L37.5 54L40 51.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              
              <rect x="52" y="28" width="28" height="46" rx="6" fill="white" stroke="#0d225c" strokeWidth="5"/>
              <circle cx="66" cy="42" r="5" stroke="#22c55e" strokeWidth="2"/>
              <circle cx="66" cy="42" r="1.5" fill="#22c55e"/>
              <rect x="59" y="52" width="10" height="2" rx="1" fill="#e2e8f0"/>
              <rect x="59" y="58" width="10" height="2" rx="1" fill="#e2e8f0"/>
              <rect x="59" y="64" width="10" height="2" rx="1" fill="#e2e8f0"/>
              <circle cx="72" cy="53" r="1" fill="#22c55e"/>
              <circle cx="72" cy="59" r="1" fill="#22c55e"/>
              <circle cx="72" cy="65" r="1" fill="#22c55e"/>
              
              <circle cx="45" cy="64" r="12" fill="white" stroke="#0d225c" strokeWidth="4"/>
              <path d="M45 58.5V64H49.5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 leading-none">Turnos</span>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="flex flex-col gap-0.5 w-3.5 shrink-0">
                  <div className="h-[2px] bg-[#22c55e] rounded-full w-full"></div>
                  <div className="h-[2px] bg-[#22c55e] rounded-full w-4/5"></div>
                  <div className="h-[2px] bg-[#22c55e] rounded-full w-2/3"></div>
                </div>
                <span className="text-lg font-black tracking-tight text-[#22c55e] leading-none">Móvil</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Funciones</a>
            <a href="#integrations" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Integraciones</a>
            <a href="#pricing" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Precios</a>
            <a href="#faq" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/app" className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors px-4 py-2">
              Iniciar sesión
            </Link>
            <a href="#pricing" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-3 rounded-full transition-all shadow-md shadow-blue-600/20">
              Ver precios
            </a>
          </div>

          <button className="md:hidden text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4 shadow-xl overflow-hidden"
            >
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-700 py-2 border-b border-slate-100">Funciones</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-700 py-2 border-b border-slate-100">Precios</a>
              <Link to="/app" className="text-lg font-bold text-slate-700 py-2 border-b border-slate-100">Iniciar sesión</Link>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="bg-blue-600 text-white text-center text-lg font-bold px-6 py-3 rounded-xl mt-2">
                Ver precios
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Target Audience Section (Now acting as Hero) */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-24 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-900/50 text-blue-400 text-xs font-black uppercase tracking-widest mb-4">
              Hecho para negocios como el tuyo
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-tight">
              Diseñado para negocios<br className="hidden md:block"/> que no pueden perder tiempo.
            </h2>
            <p className="text-slate-400 font-medium text-lg">Horarios, nómina y trimestrales en un solo lugar.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700">
              <div className="h-40 bg-slate-700 relative">
                <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80" alt="Cafe" className="w-full h-full object-cover opacity-60" />
                <div className="absolute top-4 left-4 size-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Coffee size={20} />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Restaurantes y Cafés</h3>
                <p className="text-slate-400 text-sm">Maneja turnos, propinas y personal en horas pico.</p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700">
              <div className="h-40 bg-slate-700 relative">
                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80" alt="Retail" className="w-full h-full object-cover opacity-60" />
                <div className="absolute top-4 left-4 size-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Tiendas y Retail</h3>
                <p className="text-slate-400 text-sm">Controla inventario de personal y horarios por sucursal.</p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700">
              <div className="h-40 bg-slate-700 relative">
                <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80" alt="Salon" className="w-full h-full object-cover opacity-60" />
                <div className="absolute top-4 left-4 size-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Scissors size={20} />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Barberías y Salones</h3>
                <p className="text-slate-400 text-sm">Agenda citas y gestiona tu equipo de forma fácil.</p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700">
              <div className="h-40 bg-slate-700 relative">
                <img src="https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=600&q=80" alt="Market" className="w-full h-full object-cover opacity-60" />
                <div className="absolute top-4 left-4 size-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Store size={20} />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Mini Markets y Colmados</h3>
                <p className="text-slate-400 text-sm">Simplifica tu operación diaria y aumenta tus ganancias.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🇵🇷</div>
              <div>
                <h3 className="text-xl font-bold text-white">Hecho en Puerto Rico, para Puerto Rico.</h3>
                <p className="text-blue-200 text-sm">Cumplimos con la ley local para que tú solo te enfoques en crecer.</p>
              </div>
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-600" /> SURI
              </div>
              <div className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-600" /> DTRH
              </div>
              <div className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-600" /> SINOT
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest mb-4">
              Todo lo que necesitas en un solo lugar
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-12">
              Herramientas poderosas,<br/> fáciles de usar.
            </h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="size-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Horarios automáticos con AI</h3>
                  <p className="text-slate-600 text-sm">Crea horarios en minutos considerando disponibilidad, horas extras y necesidades del negocio.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="size-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Nómina en minutos</h3>
                  <p className="text-slate-600 text-sm">Calculamos horas, extras, deducciones y pagos para que pagues correcto y a tiempo.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="size-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                  <Smartphone size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Asistencia desde el celular</h3>
                  <p className="text-slate-600 text-sm">Tus empleados marcan entrada y salida desde cualquier lugar con GPS y selfie.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="size-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Trimestrales automáticos (PR)</h3>
                  <p className="text-slate-600 text-sm">Genera y exporta tus reportes SURI, DTRH y SINOT en segundos. Cumple con la ley sin estrés.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative w-full flex justify-center">
            <div className="w-[300px] h-[600px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl relative border-[6px] border-slate-800">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20"></div>
              
              <div className="w-full h-full bg-[#f8fafc] rounded-[2.5rem] overflow-hidden flex flex-col relative z-10 text-slate-800 text-xs select-none">
                {/* Status Bar Spacer */}
                <div className="h-9 w-full bg-white shrink-0"></div>

                {/* Top Header */}
                <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-2">
                    <Menu size={16} className="text-[#0d225c] stroke-[2.5]" />
                    <span className="text-sm font-black tracking-tight text-[#0d225c]">TURNOS</span>
                  </div>
                  <div className="relative">
                    <div className="size-7 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
                      <div className="relative">
                        <svg className="size-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                        <span className="absolute -top-1.5 -right-1.5 bg-[#f43f5e] text-white text-[8px] font-black rounded-full size-3.5 flex items-center justify-center">2</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 relative pb-6">
                  {/* View Selector (Diaria/Semanal) */}
                  <div className="bg-[#f1f5f9] p-1 rounded-full flex border border-slate-200">
                    <button className="flex-1 bg-[#0d225c] text-white text-[9px] font-black py-1.5 rounded-full text-center transition-all">
                      VISTA DIARIA
                    </button>
                    <button className="flex-1 text-[#0d225c] text-[9px] font-black py-1.5 rounded-full text-center hover:bg-slate-200/50 transition-all">
                      VISTA SEMANAL
                    </button>
                  </div>

                  {/* Date Selector Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#0d225c] stroke-[2.5]" />
                      <span className="font-extrabold text-slate-800 text-[11px]">mayo de 2026</span>
                    </div>
                    <div className="flex gap-1">
                      <button className="size-5 rounded bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                        <svg className="size-2.5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                      </button>
                      <button className="size-5 rounded bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                        <svg className="size-2.5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Week Strip */}
                  <div className="grid grid-cols-7 gap-1">
                    {[
                      { label: "DOM", num: 24, active: false },
                      { label: "LUN", num: 25, active: false },
                      { label: "MAR", num: 26, active: true },
                      { label: "MIÉ", num: 27, active: false },
                      { label: "JUE", num: 28, active: false },
                      { label: "VIE", num: 29, active: false },
                      { label: "SÁB", num: 30, active: false }
                    ].map((d, idx) => (
                      <div key={idx} className={`rounded-xl border flex flex-col items-center py-2 transition-all ${
                        d.active 
                          ? 'bg-[#0d225c] border-[#0d225c] text-white shadow-md shadow-[#0d225c]/10' 
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}>
                        <span className={`text-[7px] font-black ${d.active ? 'text-blue-200' : 'text-slate-400'}`}>{d.label}</span>
                        <span className="text-[11px] font-black leading-tight mt-0.5">{d.num}</span>
                        <span className={`size-1 rounded-full mt-1.5 ${d.active ? 'bg-blue-300' : 'bg-slate-300'}`}></span>
                      </div>
                    ))}
                  </div>

                  {/* Roster Active Summary Box */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-2.5 shadow-sm flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400">
                        <span className="size-1.5 rounded-full bg-[#8c9fc2]"></span>
                        ROSTER ACTIVO
                      </div>
                      <div className="text-[11px] font-extrabold text-[#0d225c]">
                        0 Empleados Hoy
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="bg-[#f0f4f9] rounded-lg p-1.5 text-center min-w-[36px]">
                        <p className="text-[6px] font-bold text-slate-400">HORAS</p>
                        <p className="text-[9px] font-black text-slate-800">0h</p>
                      </div>
                      <div className="bg-[#ebf3ff] rounded-lg p-1.5 text-center min-w-[42px]">
                        <p className="text-[6px] font-bold text-slate-400">COSTO</p>
                        <p className="text-[9px] font-black text-[#0d225c]">$ 0</p>
                      </div>
                    </div>
                  </div>

                  {/* Publish Button */}
                  <button className="w-full bg-[#0d5c3f] hover:bg-[#0b4a33] text-white font-extrabold text-[10px] tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/15 transition-all">
                    <CheckCircle2 size={12} className="stroke-[2.5]" />
                    PUBLICAR
                  </button>

                  {/* Sub-tabs Selectors */}
                  <div className="flex items-center border-b border-slate-100 pb-1.5">
                    <button className="bg-[#e4ecf5] text-[#0d225c] border border-blue-100 rounded-lg py-1 px-2.5 text-[8px] font-black">
                      ACTIVOS / PENDIENTES
                    </button>
                    <button className="text-slate-400 hover:text-slate-600 py-1 px-3 text-[8px] font-black">
                      RECHAZADOS
                    </button>
                  </div>

                  {/* Empty State Area */}
                  <div className="border border-dashed border-slate-200 bg-[#fbfcfd] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="size-10 bg-slate-100/50 rounded-xl flex items-center justify-center text-slate-300 border border-slate-100 mb-2">
                      <Calendar size={18} className="stroke-[1.5]" />
                    </div>
                    <h5 className="text-[10px] font-black text-slate-800 tracking-wide uppercase">SIN TURNOS PROGRAMADOS</h5>
                    <p className="text-[8px] text-slate-400 mt-0.5">Desliza lateralmente para cambiar de día</p>
                  </div>

                  {/* Floating Action Button (FAB) */}
                  <button className="absolute bottom-4 right-3 size-10 bg-gradient-to-br from-amber-400 to-orange-400 hover:scale-105 active:scale-95 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 border border-amber-300/30 transition-all z-20">
                    <span className="text-lg font-light leading-none">+</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest mb-4">
              Simplicidad ante todo
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              Cómo funciona en 3 simples pasos.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[4rem] left-10 right-10 h-0.5 bg-slate-100 z-0"></div>
            
            <div className="bg-white border border-slate-200 p-8 rounded-3xl relative z-10 text-center shadow-sm hover:border-blue-300 transition-colors">
              <div className="size-16 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-2xl mb-6 shadow-lg shadow-blue-600/20">1</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Configura tu negocio</h3>
              <p className="text-slate-500 font-medium text-sm">Crea tu cuenta en minutos, añade a tus empleados y define las reglas de pago de tu empresa.</p>
            </div>
            
            <div className="bg-white border border-slate-200 p-8 rounded-3xl relative z-10 text-center shadow-sm hover:border-blue-300 transition-colors">
              <div className="size-16 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-2xl mb-6 shadow-lg shadow-blue-600/20">2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Tu equipo usa la app</h3>
              <p className="text-slate-500 font-medium text-sm">Ellos reciben sus horarios en el celular y marcan sus entradas y salidas usando GPS.</p>
            </div>
            
            <div className="bg-white border border-slate-200 p-8 rounded-3xl relative z-10 text-center shadow-sm hover:border-blue-300 transition-colors">
              <div className="size-16 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-2xl mb-6 shadow-lg shadow-blue-600/20">3</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Nómina a un clic</h3>
              <p className="text-slate-500 font-medium text-sm">Al final de la semana, aprueba las horas y obtén la nómina y los trimestrales listos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-[#fafafc]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest mb-4">
              Negocios reales, resultados reales
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
              Negocios en Puerto Rico<br/> ya confían en Turnos Móvil.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { name: "María González", biz: "Café Don Pepe", img: "https://i.pravatar.cc/150?img=47", text: "Turnos Móvil nos ahorró horas de trabajo cada semana. Ahora los horarios y la nómina son pan comido." },
              { name: "Juan Pérez", biz: "Panadería La Unión", img: "https://i.pravatar.cc/150?img=11", text: "Los trimestrales automáticos son lo mejor. Nunca había sido tan fácil cumplir con la ley." },
              { name: "Laura Martínez", biz: "Barbería Fresh Cut", img: "https://i.pravatar.cc/150?img=32", text: "Mi equipo marca desde el celular y yo veo todo en tiempo real. Totalmente recomendado." }
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <img src={t.img} alt={t.name} className="size-12 rounded-full" />
                    <div>
                      <p className="font-bold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.biz}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 italic font-medium">"{t.text}"</p>
                </div>
                <div className="flex gap-1 text-amber-400 mt-6">
                  {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-center gap-8 text-white shadow-xl">
            <div className="flex -space-x-4">
              <img src="https://i.pravatar.cc/150?img=47" className="size-12 rounded-full border-2 border-slate-900" alt="User" />
              <img src="https://i.pravatar.cc/150?img=11" className="size-12 rounded-full border-2 border-slate-900" alt="User" />
              <img src="https://i.pravatar.cc/150?img=32" className="size-12 rounded-full border-2 border-slate-900" alt="User" />
              <img src="https://i.pravatar.cc/150?img=68" className="size-12 rounded-full border-2 border-slate-900" alt="User" />
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-2xl font-black mb-1">
                4.9/5 <div className="flex text-amber-400"><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /></div>
              </div>
              <p className="text-slate-400 text-sm font-medium">Calificación promedio de nuestros clientes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Moved here based on user request) */}
      <section id="pricing" className="py-24 px-6 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest mb-4">
              Precios simples y justos
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-8">
              Elige el plan que mejor se adapta a tu negocio.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-10">
            {/* Básico */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-300 transition-all shadow-sm flex flex-col">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Básico (Starter)</h3>
              <p className="text-sm text-slate-500 font-medium mb-6 h-10">Para pequeños negocios locales que buscan digitalizar su control de asistencia.</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-black text-slate-900">$29.99</span>
                <span className="text-slate-500 font-bold">/mes</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-8">Hasta 10 empleados</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                {[ "Asistencia digital (Clock In/Out)", "Calendario semanal básico", "Gestión de hasta 10 empleados", "Revisión simple de Timesheets", "App móvil incluida" ].map((ft, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    <span className="font-medium text-slate-700 text-sm">{ft}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleSelectPlan('Starter')}
                disabled={loadingPlan !== null}
                className="w-full bg-white border border-slate-300 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 text-slate-900 text-center font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loadingPlan === 'Starter' && <Loader2 className="animate-spin size-4" />}
                {loadingPlan === 'Starter' ? 'Cargando Stripe...' : 'Elegir Plan'}
              </button>
              <p className="text-center text-xs text-slate-400 mt-3 font-medium">14 días gratis, sin tarjeta</p>
            </div>

            {/* Profesional */}
            <div className="bg-white p-8 rounded-3xl border-2 border-blue-600 flex flex-col relative shadow-xl shadow-blue-900/10 transform md:-translate-y-4 mt-4 md:mt-0">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                Más popular
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Profesional (Pro)</h3>
              <p className="text-sm text-slate-500 font-medium mb-6 h-10">El plan de mayor valor para negocios que quieren automatizar su nómina.</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-black text-slate-900">$49</span>
                <span className="text-slate-500 font-bold">/mes</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-8">Hasta 50 empleados</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                {[ "Todo lo del plan Básico", "Cálculo de Nómina automatizado", "Bolsa de Turnos (Shift Swap)", "Historial de nómina y reportes", "Duplicador de turnos (1 toque)" ].map((ft, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    <span className="font-medium text-slate-700 text-sm">{ft}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleSelectPlan('Pro')}
                disabled={loadingPlan !== null}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-center font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loadingPlan === 'Pro' && <Loader2 className="animate-spin size-4" />}
                {loadingPlan === 'Pro' ? 'Cargando Stripe...' : 'Elegir Plan'}
              </button>
              <p className="text-center text-xs text-slate-400 mt-3 font-medium">14 días gratis, sin tarjeta</p>
            </div>

            {/* Avanzado */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-300 transition-all shadow-sm flex flex-col mt-4 md:mt-0">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Avanzado (Premium)</h3>
              <p className="text-sm text-slate-500 font-medium mb-6 h-10">Control y seguridad total para empresas medianas y grandes.</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-black text-slate-900">$69</span>
                <span className="text-slate-500 font-bold">/mes</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-8">Personal ilimitado</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                {[ "Todo lo del plan Profesional", "Geocercas de seguridad GPS", "Alertas de marcas GPS sospechosas", "Rastreador de Horas Extras (OT)", "Detección inteligente de conflictos", "Soporte multi-administrador" ].map((ft, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    <span className="font-medium text-slate-700 text-sm">{ft}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleSelectPlan('Premium')}
                disabled={loadingPlan !== null}
                className="w-full bg-white border border-slate-300 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 text-slate-900 text-center font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loadingPlan === 'Premium' && <Loader2 className="animate-spin size-4" />}
                {loadingPlan === 'Premium' ? 'Cargando Stripe...' : 'Elegir Plan'}
              </button>
              <p className="text-center text-xs text-slate-400 mt-3 font-medium">14 días gratis, sin tarjeta</p>
            </div>
          </div>

          {/* Toggle Button */}
          <div className="text-center mt-12 mb-16">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100/80 text-blue-600 font-extrabold px-8 py-3.5 rounded-full border border-blue-200/50 transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>{showComparison ? 'Ocultar tabla comparativa' : 'Ver más beneficios y comparar planes'}</span>
              <ChevronDown size={18} className={`transition-transform duration-300 ${showComparison ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Comparison Table */}
          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="max-w-5xl mx-auto mb-20 px-4"
              >
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="p-6 font-extrabold text-slate-800 text-sm">Comparativa de Características</th>
                          <th className="p-6 font-extrabold text-slate-800 text-sm text-center bg-blue-50/10">Básico (Starter)</th>
                          <th className="p-6 font-extrabold text-[#0d225c] text-sm text-center bg-blue-50/20">Profesional (Pro)</th>
                          <th className="p-6 font-extrabold text-emerald-600 text-sm text-center bg-emerald-50/10">Avanzado (Premium)</th>
                        </tr>
                      </thead>
                      
                      {/* Category: General */}
                      <tbody className="divide-y divide-slate-100/70">
                        <tr className="bg-slate-50/30">
                          <td colSpan={4} className="px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-100/40">
                            Precios y Capacidad
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-5 font-semibold text-slate-700 text-sm">Precio Mensual</td>
                          <td className="p-5 text-center font-bold text-slate-600 text-sm bg-blue-50/5">$29.99</td>
                          <td className="p-5 text-center font-black text-[#0d225c] text-sm bg-blue-50/10">$49.00</td>
                          <td className="p-5 text-center font-black text-emerald-600 text-sm bg-emerald-50/5">$69.00</td>
                        </tr>
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-5 font-semibold text-slate-700 text-sm">Límite de Personal</td>
                          <td className="p-5 text-center text-slate-600 text-sm bg-blue-50/5">10 empleados</td>
                          <td className="p-5 text-center text-slate-700 text-sm bg-blue-50/10 font-bold">50 empleados</td>
                          <td className="p-5 text-center text-emerald-600 text-sm bg-emerald-50/5 font-extrabold">Ilimitado</td>
                        </tr>

                        {/* Category: Asistencia */}
                        <tr className="bg-slate-50/30">
                          <td colSpan={4} className="px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-100/40">
                            Control de Asistencia
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-5 font-semibold text-slate-700 text-sm">Marcado Móvil (Clock In/Out)</td>
                          <td className="p-5 text-center bg-blue-50/5"><CheckCircle2 className="inline text-emerald-500" size={18} /></td>
                          <td className="p-5 text-center bg-blue-50/10"><CheckCircle2 className="inline text-emerald-500" size={18} /></td>
                          <td className="p-5 text-center bg-emerald-50/5"><CheckCircle2 className="inline text-emerald-500" size={18} /></td>
                        </tr>
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-5 font-semibold text-slate-700 text-sm">Aprobación de Hojas de Horas</td>
                          <td className="p-5 text-center text-slate-500 text-xs bg-blue-50/5">Revisión Simple</td>
                          <td className="p-5 text-center text-slate-800 text-xs font-semibold bg-blue-50/10">Completa / Filtros</td>
                          <td className="p-5 text-center text-slate-800 text-xs font-semibold bg-emerald-50/5">Completa / Filtros</td>
                        </tr>
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-5 font-semibold text-slate-700 text-sm">Geocercas de Seguridad GPS</td>
                          <td className="p-5 text-center bg-blue-50/5"><span className="text-slate-300 text-xs">—</span></td>
                          <td className="p-5 text-center bg-blue-50/10"><span className="text-slate-300 text-xs">—</span></td>
                          <td className="p-5 text-center bg-emerald-50/5"><CheckCircle2 className="inline text-emerald-500" size={18} /></td>
                        </tr>
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-5 font-semibold text-slate-700 text-sm">Registro de Infracciones GPS</td>
                          <td className="p-5 text-center bg-blue-50/5"><span className="text-slate-300 text-xs">—</span></td>
                          <td className="p-5 text-center bg-blue-50/10"><span className="text-slate-300 text-xs">—</span></td>
                          <td className="p-5 text-center bg-emerald-50/5"><CheckCircle2 className="inline text-emerald-500" size={18} /></td>
                        </tr>

                        {/* Category: Turnos */}
                        <tr className="bg-slate-50/30">
                          <td colSpan={4} className="px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-100/40">
                            Planificación de Turnos
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-5 font-semibold text-slate-700 text-sm">Calendario de Turnos</td>
                          <td className="p-5 text-center text-slate-500 text-xs bg-blue-50/5">Semanal Básico</td>
                          <td className="p-5 text-center text-slate-800 text-xs font-semibold bg-blue-50/10">Semanal Avanzado</td>
                          <td className="p-5 text-center text-slate-800 text-xs font-semibold bg-emerald-50/5">Semanal Avanzado</td>
                        </tr>
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-5 font-semibold text-slate-700 text-sm">Duplicador de Horarios</td>
                          <td className="p-5 text-center bg-blue-50/5"><span className="text-slate-300 text-xs">—</span></td>
                          <td className="p-5 text-center bg-blue-50/10"><CheckCircle2 className="inline text-emerald-500" size={18} /></td>
                          <td className="p-5 text-center bg-emerald-50/5"><CheckCircle2 className="inline text-emerald-500" size={18} /></td>
                        </tr>
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-5 font-semibold text-slate-700 text-sm">Intercambio de Turnos (Marketplace)</td>
                          <td className="p-5 text-center bg-blue-50/5"><span className="text-slate-300 text-xs">—</span></td>
                          <td className="p-5 text-center bg-blue-50/10"><CheckCircle2 className="inline text-emerald-500" size={18} /></td>
                          <td className="p-5 text-center bg-emerald-50/5"><CheckCircle2 className="inline text-emerald-500" size={18} /></td>
                        </tr>
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-5 font-semibold text-slate-700 text-sm">Detección de Conflictos / Colisiones</td>
                          <td className="p-5 text-center bg-blue-50/5"><span className="text-slate-300 text-xs">—</span></td>
                          <td className="p-5 text-center bg-blue-50/10"><span className="text-slate-300 text-xs">—</span></td>
                          <td className="p-5 text-center bg-emerald-50/5"><CheckCircle2 className="inline text-emerald-500" size={18} /></td>
                        </tr>

                        {/* Category: Payroll */}
                        <tr className="bg-slate-50/30">
                          <td colSpan={4} className="px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-100/40">
                            Nómina y Reportes (Leyes PR)
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-5 font-semibold text-slate-700 text-sm">Cálculo de Nómina Automatizado</td>
                          <td className="p-5 text-center bg-blue-50/5"><span className="text-slate-300 text-xs">—</span></td>
                          <td className="p-5 text-center bg-blue-50/10"><CheckCircle2 className="inline text-emerald-500" size={18} /></td>
                          <td className="p-5 text-center bg-emerald-50/5"><CheckCircle2 className="inline text-emerald-500" size={18} /></td>
                        </tr>
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-5 font-semibold text-slate-700 text-sm">Reportes Trimestrales (DTRH, SURI, SINOT)</td>
                          <td className="p-5 text-center bg-blue-50/5"><span className="text-slate-300 text-xs">—</span></td>
                          <td className="p-5 text-center bg-blue-50/10 text-slate-500 text-xs font-medium">Básico (Horas/Salarios)</td>
                          <td className="p-5 text-center bg-emerald-50/5 font-bold text-slate-900 text-xs">Completo (Automático)</td>
                        </tr>
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-5 font-semibold text-slate-700 text-sm">Rastreador de Horas Extras (OT)</td>
                          <td className="p-5 text-center bg-blue-50/5"><span className="text-slate-300 text-xs">—</span></td>
                          <td className="p-5 text-center bg-blue-50/10"><span className="text-slate-300 text-xs">—</span></td>
                          <td className="p-5 text-center bg-emerald-50/5"><CheckCircle2 className="inline text-emerald-500" size={18} /></td>
                        </tr>
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-5 font-semibold text-slate-700 text-sm">Soporte Multi-Administrador</td>
                          <td className="p-5 text-center bg-blue-50/5"><span className="text-slate-300 text-xs">—</span></td>
                          <td className="p-5 text-center bg-blue-50/10"><span className="text-slate-300 text-xs">—</span></td>
                          <td className="p-5 text-center bg-emerald-50/5"><CheckCircle2 className="inline text-emerald-500" size={18} /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-blue-600"/> Sin contrato, cancela cuando quieras.</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-2"><Clock size={18} className="text-blue-600"/> Actualizaciones incluidas sin costo adicional.</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-[#fafafc] border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest mb-4">
              Dudas frecuentes
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              ¿Tienes preguntas?<br/>Tenemos respuestas.
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "¿Puedo probar Turnos Móvil gratis?", a: "Sí, todos nuestros planes incluyen una prueba gratuita de 14 días con acceso total a todas las funciones. No requerimos tarjeta de crédito para empezar." },
              { q: "¿Incluye cumplimiento con SURI, DTRH y SINOT?", a: "¡Por supuesto! Nuestro sistema está diseñado específicamente para Puerto Rico y genera los reportes necesarios para cumplir con las agencias gubernamentales automáticamente." },
              { q: "¿Cuántos empleados puedo agregar?", a: "Depende del plan que elijas. El Básico cubre hasta 10 empleados, Estándar hasta 25, y Premium es para empleados ilimitados." },
              { q: "¿Puedo usarlo en mi celular?", a: "Sí, Turnos Móvil funciona perfectamente en cualquier dispositivo. Los empleados pueden descargar nuestra app para ver sus horarios y marcar asistencia." },
              { q: "¿Cómo funciona la nómina?", a: "El sistema toma las horas trabajadas en el reloj virtual, aplica las reglas de horas extras de PR automáticamente y te da el total a pagar por empleado. Listo para exportar." },
              { q: "¿Puedo cancelar cuando quiera?", a: "Sí, no hay contratos a largo plazo. Puedes cancelar o cambiar de plan en cualquier momento desde tu panel de configuración." }
            ].map((faq, i) => (
              <div key={i} className="border border-slate-200 bg-white rounded-2xl overflow-hidden">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-4 text-left font-bold text-slate-900 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  {faq.q}
                  <ChevronDown size={20} className={`text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-4 text-slate-600 font-medium">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white border border-blue-100 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-sm">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <MessageCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">¿No encuentras la respuesta?</h4>
                <p className="text-sm text-slate-600">Estamos aquí para ayudarte.</p>
              </div>
            </div>
            <button className="bg-blue-600 text-white font-bold px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors">
              Hablar con soporte
            </button>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Rocket size={64} className="mx-auto text-blue-400 mb-8" />
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
            Comienza hoy y transforma<br className="hidden md:block"/> tu negocio.
          </h2>
          <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
            Únete a cientos de dueños que ya simplificaron su operación con Turnos Móvil.
          </p>
          <div className="flex flex-col items-center gap-4">
            <a href="#pricing" className="bg-blue-600 hover:bg-blue-500 text-white text-lg font-black px-12 py-4 rounded-full transition-all shadow-xl shadow-blue-600/20">
              Ver precios
            </a>
            <p className="text-blue-200 text-sm font-medium">14 días gratis, sin tarjeta de crédito</p>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6 text-sm font-medium text-slate-400">
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Sin contrato</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Cancela cuando quieras</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Actualizaciones incluidas</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <svg className="size-8 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="15" y="20" width="46" height="44" rx="8" fill="white" stroke="white" strokeWidth="5"/>
              <path d="M15 28C15 24.6863 17.6863 22 21 22H55C58.3137 22 61 24.6863 61 28V32H15V28Z" fill="white"/>
              <rect x="25" y="12" width="5" height="10" rx="2.5" fill="white"/>
              <rect x="46" y="12" width="5" height="10" rx="2.5" fill="white"/>
              
              <rect x="23" y="38" width="7" height="7" rx="1.5" fill="#1e293b"/>
              <rect x="34" y="38" width="7" height="7" rx="1.5" fill="#1e293b"/>
              <rect x="45" y="38" width="7" height="7" rx="1.5" fill="#1e293b"/>
              <rect x="23" y="49" width="7" height="7" rx="1.5" fill="#1e293b"/>
              <rect x="34" y="49" width="7" height="7" rx="1.5" fill="#22c55e"/>
              <path d="M36 52.5L37.5 54L40 51.5" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              
              <rect x="52" y="28" width="28" height="46" rx="6" fill="#0f172a" stroke="white" strokeWidth="5"/>
              <circle cx="66" cy="42" r="5" stroke="#22c55e" strokeWidth="2"/>
              <circle cx="66" cy="42" r="1.5" fill="#22c55e"/>
              <rect x="59" y="52" width="10" height="2" rx="1" fill="#334155"/>
              <rect x="59" y="58" width="10" height="2" rx="1" fill="#334155"/>
              <rect x="59" y="64" width="10" height="2" rx="1" fill="#334155"/>
              <circle cx="72" cy="53" r="1" fill="#22c55e"/>
              <circle cx="72" cy="59" r="1" fill="#22c55e"/>
              <circle cx="72" cy="65" r="1" fill="#22c55e"/>
              
              <circle cx="45" cy="64" r="12" fill="#0f172a" stroke="white" strokeWidth="4"/>
              <path d="M45 58.5V64H49.5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-white leading-none">Turnos</span>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="flex flex-col gap-0.5 w-3.5 shrink-0">
                  <div className="h-[2px] bg-[#22c55e] rounded-full w-full"></div>
                  <div className="h-[2px] bg-[#22c55e] rounded-full w-4/5"></div>
                  <div className="h-[2px] bg-[#22c55e] rounded-full w-2/3"></div>
                </div>
                <span className="text-base font-black tracking-tight text-[#22c55e] leading-none">Móvil</span>
              </div>
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm">
            © {new Date().getFullYear()} Turnos Móvil. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-blue-400 font-medium text-sm">Privacidad</a>
            <a href="#" className="text-slate-500 hover:text-blue-400 font-medium text-sm">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
