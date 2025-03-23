import { useLanguage } from '../../contexts/LanguageContext';
import SEO from '../../components/SEO';

const PrivacyPolicy = () => {
  const { language } = useLanguage();

  const getContent = () => {
    switch (language) {
      case 'de':
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Datenschutzerklu00e4rung</h1>
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Verantwortliche Stelle</h2>
                <p>Verantwortliche Stelle im Sinne der Datenschutzgesetze ist:</p>
                <p className="mt-2">
                  Mu00e4rchenNails<br />
                  Beispielstrau00dfe 123<br />
                  12345 Beispielstadt<br />
                  Deutschland
                </p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">2. Erhebung und Verwendung persu00f6nlicher Daten</h2>
                <p>Wir erheben persu00f6nliche Daten nur, wenn Sie uns diese freiwillig mitteilen, z.B. bei der Registrierung, der Buchung von Terminen oder der Kontaktaufnahme.</p>
                <p className="mt-2">Zu den von uns erhobenen Daten ku00f6nnen gehu00f6ren:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Name</li>
                  <li>Kontaktdaten (E-Mail, Telefonnummer)</li>
                  <li>Gesundheitsinformationen im Zusammenhang mit unseren Dienstleistungen</li>
                  <li>Termindaten</li>
                </ul>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">3. Cookies</h2>
                <p>Unsere Website verwendet Cookies. Nu00e4here Informationen dazu finden Sie in unserer Cookie-Richtlinie.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">4. Datensicherheit</h2>
                <p>Wir setzen technische und organisatorische Sicherheitsmau00dfnahmen ein, um Ihre persu00f6nlichen Daten gegen Verlust, Zerstu00f6rung, Manipulation und unberechtigten Zugriff zu schu00fctzen.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">5. Ihre Rechte</h2>
                <p>Nach der DSGVO haben Sie folgende Rechte:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Recht auf Auskunft</li>
                  <li>Recht auf Berichtigung</li>
                  <li>Recht auf Lu00f6schung</li>
                  <li>Recht auf Einschru00e4nkung der Verarbeitung</li>
                  <li>Recht auf Datenu00fcbertragbarkeit</li>
                  <li>Widerspruchsrecht</li>
                </ul>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">6. Kontakt</h2>
                <p>Bei Fragen zur Verarbeitung Ihrer persu00f6nlichen Daten oder zur Ausu00fcbung Ihrer Rechte ku00f6nnen Sie sich an uns wenden:</p>
                <p className="mt-2">kontakt@maerchennails.com</p>
              </section>
              <p className="italic text-sm mt-8">Letzte Aktualisierung: 23.03.2025</p>
            </div>
          </>
        );
      case 'es':
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Polu00edtica de Privacidad</h1>
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Responsable del Tratamiento</h2>
                <p>El responsable del tratamiento de datos segu00fan las leyes de protecciu00f3n de datos es:</p>
                <p className="mt-2">
                  Mu00e4rchenNails<br />
                  Calle Ejemplo 123<br />
                  12345 Ciudad Ejemplo<br />
                  Alemania
                </p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">2. Recogida y Uso de Datos Personales</h2>
                <p>Recogemos datos personales solo si usted nos los proporciona voluntariamente, por ejemplo, al registrarse, reservar citas o contactar con nosotros.</p>
                <p className="mt-2">Los datos que podemos recoger incluyen:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Nombre</li>
                  <li>Datos de contacto (correo electru00f3nico, nu00famero de telu00e9fono)</li>
                  <li>Informaciu00f3n de salud relacionada con nuestros servicios</li>
                  <li>Datos de citas</li>
                </ul>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">3. Cookies</h2>
                <p>Nuestro sitio web utiliza cookies. Puede encontrar mu00e1s informaciu00f3n en nuestra Polu00edtica de Cookies.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">4. Seguridad de los Datos</h2>
                <p>Utilizamos medidas de seguridad tu00e9cnicas y organizativas para proteger sus datos personales contra la pu00e9rdida, destrucciu00f3n, manipulaciu00f3n y acceso no autorizado.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">5. Sus Derechos</h2>
                <p>De acuerdo con el RGPD, usted tiene los siguientes derechos:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Derecho de acceso</li>
                  <li>Derecho de rectificaciu00f3n</li>
                  <li>Derecho de supresiu00f3n</li>
                  <li>Derecho a la limitaciu00f3n del tratamiento</li>
                  <li>Derecho a la portabilidad de los datos</li>
                  <li>Derecho de oposiciu00f3n</li>
                </ul>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">6. Contacto</h2>
                <p>Si tiene preguntas sobre el tratamiento de sus datos personales o para ejercer sus derechos, puede ponerse en contacto con nosotros:</p>
                <p className="mt-2">contacto@maerchennails.com</p>
              </section>
              <p className="italic text-sm mt-8">u00daltima actualizaciu00f3n: 23.03.2025</p>
            </div>
          </>
        );
      default: // English
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Data Controller</h2>
                <p>The data controller according to data protection laws is:</p>
                <p className="mt-2">
                  Mu00e4rchenNails<br />
                  Example Street 123<br />
                  12345 Example City<br />
                  Germany
                </p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">2. Collection and Use of Personal Data</h2>
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
                <h2 className="text-xl font-semibold mb-3">3. Cookies</h2>
                <p>Our website uses cookies. More information can be found in our Cookie Policy.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
                <p>We employ technical and organizational security measures to protect your personal data against loss, destruction, manipulation, and unauthorized access.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
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
                <h2 className="text-xl font-semibold mb-3">6. Contact</h2>
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
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <SEO 
        title={`Privacy Policy - Mu00e4rchenNails`}
        description="Privacy policy for Mu00e4rchenNails salon services and website usage."
        ogType="website"
      />
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 lg:p-8">
          {getContent()}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
