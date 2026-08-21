import { Link } from 'react-router-dom';

const B = {
  bg:      '#0A0F1C',
  surface: '#111827',
  border:  'rgba(255,255,255,0.08)',
  muted:   'rgba(255,255,255,0.45)',
  dim:     'rgba(255,255,255,0.25)',
  white:   '#FFFFFF',
  blue:    '#3B82F6',
};

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 no-underline">
      <div style={{ width:32, height:32, background:'#2563EB', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ color:'#fff', fontSize:16 }}>📅</span>
      </div>
      <span style={{ color:'#fff', fontWeight:800, fontSize:18, letterSpacing:'-0.3px' }}>Turnos Móvil</span>
    </Link>
  );
}

export default function PrivacyPolicy() {
  return (
    <div style={{ background: B.bg, minHeight: '100vh', color: B.white, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${B.border}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo />
          <Link to="/" style={{ color: B.muted, fontSize: 14, textDecoration: 'none' }}>← Volver al inicio</Link>
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ color: B.blue, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Legal</p>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>Política de Privacidad</h1>
          <p style={{ color: B.muted, fontSize: 14 }}>Última actualización: 20 de agosto de 2026</p>
        </div>

        <div style={{ color: B.muted, fontSize: 15, lineHeight: 1.8 }}>

          <Section title="1. Quiénes somos">
            <p>Turnos Móvil ("nosotros", "nuestro") es una aplicación de gestión de turnos y nómina diseñada para pequeños negocios en Puerto Rico. Nuestra plataforma incluye una aplicación móvil para Android y un panel web en turnosmovil.com.</p>
          </Section>

          <Section title="2. Información que recopilamos">
            <p><strong style={{ color: B.white }}>Información de cuenta:</strong> Al registrarte, recopilamos tu nombre, correo electrónico y la información de tu negocio (nombre, dirección).</p>
            <br />
            <p><strong style={{ color: B.white }}>Datos de empleados:</strong> Los dueños de negocio ingresan información de sus empleados: nombre, correo electrónico, cargo y tarifa por hora.</p>
            <br />
            <p><strong style={{ color: B.white }}>Datos de asistencia y nómina:</strong> Registramos entradas y salidas (clock in/out), horas trabajadas, turnos asignados y datos de nómina.</p>
            <br />
            <p><strong style={{ color: B.white }}>Datos de ubicación:</strong> Si el dueño configura geocercas, la app verifica la ubicación del empleado al registrar asistencia. No almacenamos coordenadas GPS continuas ni rastreamos ubicación en segundo plano.</p>
            <br />
            <p><strong style={{ color: B.white }}>Datos técnicos:</strong> Recopilamos información de errores y eventos de la app (a través de Sentry) para mejorar el servicio. Esto puede incluir el modelo de dispositivo y versión del sistema operativo.</p>
          </Section>

          <Section title="3. Cómo usamos tu información">
            <ul style={{ paddingLeft: 20 }}>
              <li style={{ marginBottom: 8 }}>Proveer y operar el servicio de Turnos Móvil</li>
              <li style={{ marginBottom: 8 }}>Calcular nóminas y generar reportes</li>
              <li style={{ marginBottom: 8 }}>Enviar notificaciones push sobre turnos y actualizaciones</li>
              <li style={{ marginBottom: 8 }}>Mejorar la aplicación mediante análisis de errores</li>
              <li style={{ marginBottom: 8 }}>Comunicarnos contigo sobre cambios al servicio o tu cuenta</li>
            </ul>
            <p>No vendemos, alquilamos ni compartimos tu información personal con terceros con fines comerciales.</p>
          </Section>

          <Section title="4. Servicios de terceros">
            <p>Turnos Móvil utiliza los siguientes proveedores de confianza:</p>
            <br />
            <p><strong style={{ color: B.white }}>Supabase (supabase.com):</strong> Base de datos y autenticación. Tus datos se almacenan en servidores seguros en la región us-west-2.</p>
            <br />
            <p><strong style={{ color: B.white }}>Firebase / Google (firebase.google.com):</strong> Notificaciones push (FCM). Google puede procesar identificadores de dispositivo para enrutar notificaciones.</p>
            <br />
            <p><strong style={{ color: B.white }}>Sentry (sentry.io):</strong> Monitoreo de errores. Los reportes de errores pueden incluir información técnica del dispositivo y trazas de código, sin datos personales identificables.</p>
            <br />
            <p><strong style={{ color: B.white }}>Resend (resend.com):</strong> Envío de correos de invitación a empleados.</p>
          </Section>

          <Section title="5. Seguridad de los datos">
            <p>Implementamos medidas técnicas para proteger tu información:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 8 }}>Toda la comunicación es cifrada con TLS/HTTPS</li>
              <li style={{ marginBottom: 8 }}>Las contraseñas se almacenan con hash bcrypt (nunca en texto plano)</li>
              <li style={{ marginBottom: 8 }}>El acceso a los datos está protegido por Row-Level Security (RLS) en la base de datos</li>
              <li style={{ marginBottom: 8 }}>Soporte para autenticación de dos factores (2FA/MFA)</li>
              <li style={{ marginBottom: 8 }}>Certificate pinning para conexiones con el servidor</li>
            </ul>
          </Section>

          <Section title="6. Retención de datos">
            <p>Conservamos tu información mientras tu cuenta esté activa. Si cancelas tu suscripción, tus datos se conservan por 30 días antes de ser eliminados de forma permanente, salvo que la ley requiera un período mayor.</p>
          </Section>

          <Section title="7. Tus derechos">
            <p>Tienes derecho a:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 8 }}>Acceder a los datos que tenemos sobre ti</li>
              <li style={{ marginBottom: 8 }}>Corregir información incorrecta</li>
              <li style={{ marginBottom: 8 }}>Solicitar la eliminación de tu cuenta y datos</li>
              <li style={{ marginBottom: 8 }}>Exportar tus datos en formato CSV o PDF</li>
            </ul>
            <p>Para ejercer estos derechos, contáctanos en <a href="mailto:soporte@turnosmovil.com" style={{ color: B.blue }}>soporte@turnosmovil.com</a>.</p>
          </Section>

          <Section title="8. Menores de edad">
            <p>Turnos Móvil no está dirigido a personas menores de 16 años. No recopilamos intencionalmente información de menores.</p>
          </Section>

          <Section title="9. Cambios a esta política">
            <p>Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos por correo electrónico o mediante un aviso en la aplicación cuando ocurran cambios significativos.</p>
          </Section>

          <Section title="10. Contacto">
            <p>Si tienes preguntas sobre esta política, contáctanos:</p>
            <br />
            <p><strong style={{ color: B.white }}>Turnos Móvil</strong><br />
            Puerto Rico, EE.UU.<br />
            Correo: <a href="mailto:soporte@turnosmovil.com" style={{ color: B.blue }}>soporte@turnosmovil.com</a><br />
            Web: <a href="https://turnosmovil.com" style={{ color: B.blue }}>turnosmovil.com</a></p>
          </Section>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${B.border}`, padding: '24px', textAlign: 'center' }}>
        <p style={{ color: B.dim, fontSize: 13 }}>
          © {new Date().getFullYear()} Turnos Móvil · <Link to="/privacidad" style={{ color: B.muted, textDecoration: 'none' }}>Privacidad</Link> · <Link to="/terminos" style={{ color: B.muted, textDecoration: 'none' }}>Términos</Link>
        </p>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 700, marginBottom: 12, marginTop: 0 }}>{title}</h2>
      {children}
    </div>
  );
}
