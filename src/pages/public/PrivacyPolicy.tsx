import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import SEO from '../../components/SEO';

const PrivacyPolicy = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();

  const getContent = () => {
    switch (language) {
      case 'de':
        return (
          <>
            <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Datenschutzerklärung</h1>
            <div className="space-y-6">
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>1. Verantwortliche Stelle</h2>
                <p>Verantwortliche Stelle im Sinne der Datenschutzgesetze ist:</p>
                <p className="mt-2">
                  MärchenNails<br />
                  Beispielstraße 123<br />
                  12345 Beispielstadt<br />
                  Deutschland
                </p>
              </section>
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>2. Erhebung und Verwendung personenbezogener Daten</h2>
                <p>Wir erheben personenbezogene Daten nur, wenn Sie uns diese freiwillig mitteilen, z.B. bei der Registrierung, der Buchung von Terminen oder der Kontaktaufnahme.</p>
                <p className="mt-2">Zu den von uns erhobenen Daten können gehören:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Name</li>
                  <li>Kontaktdaten (E-Mail, Telefonnummer)</li>
                  <li>Gesundheitsinformationen im Zusammenhang mit unseren Dienstleistungen</li>
                  <li>Termindaten</li>
                </ul>
              </section>
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>3. Cookies</h2>
                <p>Unsere Website verwendet Cookies. Nähere Informationen dazu finden Sie in unserer Cookie-Richtlinie.</p>
              </section>
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>4. Datensicherheit</h2>
                <p>Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre personenbezogenen Daten gegen Verlust, Zerstörung, Manipulation und unberechtigten Zugriff zu schützen.</p>
              </section>
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>5. Ihre Rechte</h2>
                <p>Nach der DSGVO haben Sie folgende Rechte:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Recht auf Auskunft</li>
                  <li>Recht auf Berichtigung</li>
                  <li>Recht auf Löschung</li>
                  <li>Recht auf Einschränkung der Verarbeitung</li>
                  <li>Recht auf Datenuübertragbarkeit</li>
                  <li>Widerspruchsrecht</li>
                </ul>
              </section>
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>6. Kontakt</h2>
                <p>Bei Fragen zur Verarbeitung Ihrer personenbezogenen Daten oder zur Ausübung Ihrer Rechte können Sie sich an uns wenden:</p>
                <p className="mt-2">kontakt@maerchennails.com</p>
              </section>
              <p className="italic text-sm mt-8">Letzte Aktualisierung: 23.03.2025</p>
            </div>
          </>
        );
      case 'es':
        return (
          <>
            <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Política de Privacidad</h1>
            <div className="space-y-6">
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>1. Responsable del Tratamiento</h2>
                <p>El responsable del tratamiento de datos según las leyes de protección de datos es:</p>
                <p className="mt-2">
                  MärchenNails<br />
                  Calle Ejemplo 123<br />
                  12345 Ciudad Ejemplo<br />
                  Alemania
                </p>
              </section>
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>2. Recogida y Uso de Datos Personales</h2>
                <p>Recogemos datos personales solo si usted nos los proporciona voluntariamente, por ejemplo, al registrarse, reservar citas o contactar con nosotros.</p>
                <p className="mt-2">Los datos que podemos recoger incluyen:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Nombre</li>
                  <li>Datos de contacto (correo electrónico, número de teléfono)</li>
                  <li>Información de salud relacionada con nuestros servicios</li>
                  <li>Datos de citas</li>
                </ul>
              </section>
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>3. Cookies</h2>
                <p>Nuestro sitio web utiliza cookies. Puede encontrar más información en nuestra Política de Cookies.</p>
              </section>
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>4. Seguridad de los Datos</h2>
                <p>Utilizamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra la pérdida, destrucción, manipulación y acceso no autorizado.</p>
              </section>
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>5. Sus Derechos</h2>
                <p>De acuerdo con el RGPD, usted tiene los siguientes derechos:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Derecho de acceso</li>
                  <li>Derecho de rectificación</li>
                  <li>Derecho de supresión</li>
                  <li>Derecho a la limitación del tratamiento</li>
                  <li>Derecho a la portabilidad de los datos</li>
                  <li>Derecho de oposición</li>
                </ul>
              </section>
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>6. Contacto</h2>
                <p>Si tiene preguntas sobre el tratamiento de sus datos personales o para ejercer sus derechos, puede ponerse en contacto con nosotros:</p>
                <p className="mt-2">contacto@maerchennails.com</p>
              </section>
              <p className="italic text-sm mt-8">Última actualización: 23.03.2025</p>
            </div>
          </>
        );
      default: // English
        return (
          <>
            <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Privacy Policy</h1>
            <div className="space-y-6">
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>1. Data Controller</h2>
                <p>The data controller according to data protection laws is:</p>
                <p className="mt-2">
                  MärchenNails<br />
                  Example Street 123<br />
                  12345 Example City<br />
                  Germany
                </p>
              </section>
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>2. Collection and Use of Personal Data</h2>
                <p>We collect personal data only if you voluntarily provide it to us, e.g., when registering, booking appointments, or contacting us.</p>
                <p className="mt-2">The data we may collect includes:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Name</li>
                  <li>Contact details (email, phone number)</li>
                  <li>Health information related to our services</li>
                  <li>Appointment data</li>
                </ul>
              </section>
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>3. Cookies</h2>
                <p>Our website uses cookies. More information can be found in our Cookie Policy.</p>
              </section>
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>4. Data Security</h2>
                <p>We employ technical and organizational security measures to protect your personal data against loss, destruction, manipulation, and unauthorized access.</p>
              </section>
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>5. Your Rights</h2>
                <p>According to the GDPR, you have the following rights:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Right to information</li>
                  <li>Right to rectification</li>
                  <li>Right to erasure</li>
                  <li>Right to restriction of processing</li>
                  <li>Right to data portability</li>
                  <li>Right to object</li>
                </ul>
              </section>
              <section>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-accent-400' : 'text-accent-600'}`}>6. Contact</h2>
                <p>If you have questions about the processing of your personal data or to exercise your rights, you can contact us:</p>
                <p className="mt-2">contact@maerchennails.com</p>
              </section>
              <p className="italic text-sm mt-8">Last updated: March 23, 2025</p>
            </div>
          </>
        );
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <SEO 
        title={language === 'de' ? 'MärchenNails - Datenschutzerklärung' : 
              language === 'es' ? 'MärchenNails - Política de Privacidad' : 
              'MärchenNails - Privacy Policy'}
        description={language === 'de' ? 'Datenschutzerklärung für MärchenNails' : 
                     language === 'es' ? 'Política de privacidad para MärchenNails' : 
                     'Privacy policy for MärchenNails nail salon services'}
        ogType="website"
      />
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {getContent()}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
