import { motion } from 'motion/react';
import { CheckCircle2, Download, ShieldCheck, Smartphone, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#fafafc] flex items-center justify-center py-16 px-4 font-sans text-slate-900 selection:bg-blue-200">
      {/* Background gradients for modern aesthetic */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.05),transparent_40%)] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8 md:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-500" />
        
        {/* Success Icon Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="size-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border-2 border-emerald-100 shadow-inner">
            <CheckCircle2 className="size-10 text-emerald-500" />
          </div>
          <span className="inline-block py-1 px-3 rounded-full bg-emerald-100/70 text-emerald-700 text-xs font-black uppercase tracking-widest mb-3">
            ¡Pago Completado!
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            ¡Gracias por suscribirte!
          </h1>
          <p className="text-slate-500 font-medium mt-3 max-w-md">
            Tu suscripción está lista. Te enviamos un correo electrónico de bienvenida con todos tus accesos.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-10">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
            <Smartphone className="size-5 text-blue-600" /> Siguientes pasos para activar tu cuenta
          </h2>

          <div className="flex gap-4 items-start">
            <div className="size-8 rounded-full bg-blue-50 text-blue-600 font-black text-sm flex items-center justify-center shrink-0 border border-blue-100 mt-1">
              1
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Descarga la aplicación</h3>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Haz clic en el enlace del correo de bienvenida o descarga la app móvil directamente con los botones de abajo.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="size-8 rounded-full bg-blue-50 text-blue-600 font-black text-sm flex items-center justify-center shrink-0 border border-blue-100 mt-1">
              2
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Regístrate con tu correo de pago</h3>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Abre la aplicación móvil y crea tu cuenta usando el <strong>mismo correo electrónico</strong> con el que realizaste el pago en Stripe. Esto activará tu plan automáticamente.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="size-8 rounded-full bg-blue-50 text-blue-600 font-black text-sm flex items-center justify-center shrink-0 border border-blue-100 mt-1">
              3
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Configura tu perfil</h3>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Completa el asistente de configuración para crear el perfil de tu negocio y ¡comienza a publicar tus turnos y automatizar tu nómina!
              </p>
            </div>
          </div>
        </div>

        {/* Download Buttons Section */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h4 className="font-bold text-slate-800 text-sm">¿Prefieres la versión móvil?</h4>
            <p className="text-xs text-slate-500 mt-0.5">Escanea o haz clic para bajar el App directamente</p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <a 
              href="http://localhost:3000" 
              className="bg-slate-900 hover:bg-slate-850 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-xs flex items-center gap-2 border border-slate-800 shadow-sm cursor-pointer"
            >
              <Download className="size-4" /> Instalar App (Beta)
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-150 pt-8">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>Pago procesado de forma segura por Stripe</span>
          </div>
          <Link 
            to="/" 
            className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <Home className="size-4" /> Volver al Inicio
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
