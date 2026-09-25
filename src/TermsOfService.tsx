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

export default function TermsOfService() {
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
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>Términos de Servicio</h1>
          <p style={{ color: B.muted, fontSize: 14 }}>Última actualización: 20 de agosto de 2026</p>
        </div>

        <div style={{ color: B.muted, fontSize: 15, lineHeight: 1.8 }}>

          <Section title="1. Aceptación de los Términos">
            <p>Al registrarte o usar Turnos Móvil ("el Servicio"), aceptas estos Términos de Servicio en su totalidad. Si no estás de acuerdo con alguna parte, no debes usar el Servicio.</p>
          </Section>

          <Section title="2. Descripción del Servicio">
            <p>Turnos Móvil es una plataforma de gestión de turnos, asistencia y nómina dirigida a dueños y administradores de pequeños negocios en Puerto Rico. El servicio incluye:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 8 }}>Aplicación móvil para Android</li>
              <li style={{ marginBottom: 8 }}>Panel de administración web en turnosmovil.com</li>
              <li style={{ marginBottom: 8 }}>Herramientas de nómina, reportes y gestión de empleados</li>
            </ul>
          </Section>

          <Section title="3. Cuentas de usuario">
            <p>Eres responsable de:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 8 }}>Mantener la confidencialidad de tu contraseña y credenciales</li>
              <li style={{ marginBottom: 8 }}>Todas las actividades que ocurran bajo tu cuenta</li>
              <li style={{ marginBottom: 8 }}>Notificarnos inmediatamente si sospechas acceso no autorizado</li>
            </ul>
            <p>Debes proporcionar información veraz y actualizada al crear tu cuenta.</p>
          </Section>

          <Section title="4. Planes y pagos">
            <p>Turnos Móvil ofrece cuatro planes de suscripción mensual:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 8 }}><strong style={{ color: B.white }}>Básico — $29.99/mes:</strong> Hasta 10 empleados, asistencia digital, calendario y app móvil.</li>
              <li style={{ marginBottom: 8 }}><strong style={{ color: B.white }}>Empresarial — $49.99/mes:</strong> Hasta 50 empleados, nómina automatizada, bolsa de turnos e historial.</li>
              <li style={{ marginBottom: 8 }}><strong style={{ color: B.white }}>Elite — $69.99/mes:</strong> Personal ilimitado, geocercas GPS, alertas, horas extra y multi-administrador.</li>
              <li style={{ marginBottom: 8 }}><strong style={{ color: B.white }}>Pro — $99.99/mes:</strong> Todo lo anterior más gestión completa de vacaciones y licencias.</li>
            </ul>
            <p>Los pagos se procesan de forma segura a través de Stripe. Los precios están en dólares estadounidenses (USD) e incluyen acceso durante el período de facturación.</p>
          </Section>

          <Section title="5. Período de prueba y cancelación">
            <p>Ofrecemos un período de prueba gratuito de 14 días sin necesidad de tarjeta de crédito. Puedes cancelar tu suscripción en cualquier momento desde el panel de administración. Al cancelar, mantendrás acceso al servicio hasta el final del período de facturación en curso.</p>
            <p style={{ marginTop: 8 }}>No ofrecemos reembolsos por períodos parciales de uso, salvo que la ley aplicable lo requiera.</p>
          </Section>

          <Section title="6. Uso aceptable">
            <p>Al usar Turnos Móvil, aceptas <strong style={{ color: B.white }}>no</strong>:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 8 }}>Usar el Servicio para actividades ilegales o fraudulentas</li>
              <li style={{ marginBottom: 8 }}>Intentar acceder a datos de otros negocios o usuarios</li>
              <li style={{ marginBottom: 8 }}>Realizar ingeniería inversa, descompilar o desensamblar el software</li>
              <li style={{ marginBottom: 8 }}>Revender o sublicenciar el acceso al Servicio sin autorización escrita</li>
              <li style={{ marginBottom: 8 }}>Introducir virus, malware u otro código malicioso</li>
            </ul>
          </Section>

          <Section title="7. Datos y privacidad">
            <p>Tu uso del Servicio también está regido por nuestra <Link to="/privacidad" style={{ color: B.blue }}>Política de Privacidad</Link>, que se incorpora por referencia a estos Términos. Eres responsable de obtener el consentimiento necesario de tus empleados para recopilar y procesar sus datos mediante Turnos Móvil.</p>
          </Section>

          <Section title="8. Propiedad intelectual">
            <p>Turnos Móvil y todo su contenido, incluyendo el software, diseño, logotipos y textos, son propiedad de sus creadores y están protegidos por las leyes de propiedad intelectual aplicables. Esta licencia es personal, no exclusiva, no transferible y revocable.</p>
          </Section>

          <Section title="9. Limitación de responsabilidad">
            <p>En la medida máxima permitida por la ley, Turnos Móvil no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo pérdida de datos o lucro cesante, derivados del uso o la imposibilidad de uso del Servicio.</p>
            <p style={{ marginTop: 8 }}>Nuestra responsabilidad total no superará el monto pagado por el usuario en los 12 meses anteriores al evento que originó el reclamo.</p>
          </Section>

          <Section title="10. Cumplimiento laboral">
            <p>Turnos Móvil es una herramienta de gestión. El usuario (dueño del negocio) es el único responsable de cumplir con la Ley 180 de Puerto Rico y demás leyes laborales aplicables, incluyendo el cálculo correcto de nómina, horas extra, beneficios y retenciones.</p>
          </Section>

          <Section title="11. Modificaciones al Servicio">
            <p>Nos reservamos el derecho de modificar, suspender o descontinuar cualquier parte del Servicio con aviso previo razonable. No seremos responsables ante ti ni terceros por dichas modificaciones.</p>
          </Section>

          <Section title="12. Ley aplicable y jurisdicción">
            <p>Estos Términos se rigen por las leyes del Estado Libre Asociado de Puerto Rico y las leyes federales de los Estados Unidos aplicables. Cualquier disputa se resolverá exclusivamente en los tribunales de Puerto Rico.</p>
          </Section>

          <Section title="13. Contacto">
            <p>Para preguntas sobre estos Términos:</p>
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
