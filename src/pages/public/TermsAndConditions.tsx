import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import SEO from '../../components/SEO';

const TermsAndConditions = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();

  const getContent = () => {
    switch (language) {
      case 'de':
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Allgemeine Geschäftsbedingungen</h1>
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Geltungsbereich</h2>
                <p>Diese Allgemeinen Geschäftsbedingungen gelten für alle Dienstleistungen und Angebote von MärchenNails.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">2. Terminvereinbarung</h2>
                <p>Die Terminreservierung stellt einen verbindlichen Vertrag dar. Terminabsagen müssen mindestens 24 Stunden vorher erfolgen, andernfalls kann eine Gebühr erhoben werden.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">3. Preise und Zahlung</h2>
                <p>Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer. Die Zahlung erfolgt nach Erbringung der Dienstleistung in bar oder per Kartenzahlung.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">4. Gesundheitliche Hinweise</h2>
                <p>Kunden sind verpflichtet, uns über gesundheitliche Probleme, Allergien oder Unverträglichkeiten zu informieren, die die Behandlung beeinflussen könnten.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">5. Datenschutz</h2>
                <p>Der Schutz Ihrer persönlichen Daten ist uns wichtig. Detaillierte Informationen finden Sie in unserer Datenschutzerklärung.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">6. Gerichtsstand und Geltendes Recht</h2>
                <p>Es gilt deutsches Recht. Gerichtsstand ist der Sitz von MärchenNails.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">7. Schlussbestimmungen</h2>
                <p>Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Gültigkeit der übrigen Bestimmungen unberührt.</p>
              </section>
              <p className="italic text-sm mt-8">Letzte Aktualisierung: 23.03.2025</p>
            </div>
          </>
        );
      case 'es':
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Términos y Condiciones</h1>
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Ámbito de Aplicación</h2>
                <p>Estos Términos y Condiciones Generales se aplican a todos los servicios y ofertas de MärchenNails.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">2. Reserva de Citas</h2>
                <p>La reserva de una cita constituye un contrato vinculante. Las cancelaciones deben realizarse con al menos 24 horas de antelación, de lo contrario, se podría aplicar una tarifa.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">3. Precios y Pagos</h2>
                <p>Todos los precios incluyen el impuesto sobre el valor añadido legal. El pago se realiza después de la prestación del servicio en efectivo o mediante pago con tarjeta.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">4. Avisos de Salud</h2>
                <p>Los clientes están obligados a informarnos sobre problemas de salud, alergias o intolerancias que puedan afectar al tratamiento.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">5. Protección de Datos</h2>
                <p>La protección de sus datos personales es importante para nosotros. Puede encontrar información detallada en nuestra Política de Privacidad.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">6. Jurisdicción y Ley Aplicable</h2>
                <p>Se aplica la ley alemana. La jurisdicción es la sede de MärchenNails.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">7. Disposiciones Finales</h2>
                <p>Si alguna disposición de estos Términos y Condiciones no es válida, la validez de las disposiciones restantes no se verá afectada.</p>
              </section>
              <p className="italic text-sm mt-8">Última actualización: 23.03.2025</p>
            </div>
          </>
        );
      default: // English
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Scope</h2>
                <p>These General Terms and Conditions apply to all services and offers from MärchenNails.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">2. Appointment Booking</h2>
                <p>The reservation of an appointment constitutes a binding contract. Appointment cancellations must be made at least 24 hours in advance, otherwise a fee may be charged.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">3. Prices and Payment</h2>
                <p>All prices include statutory value-added tax. Payment is made after the service has been provided in cash or by card payment.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">4. Health Notices</h2>
                <p>Customers are obliged to inform us about health problems, allergies, or intolerances that could affect the treatment.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">5. Data Protection</h2>
                <p>The protection of your personal data is important to us. You can find detailed information in our Privacy Policy.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">6. Jurisdiction and Applicable Law</h2>
                <p>German law applies. The place of jurisdiction is the registered office of MärchenNails.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">7. Final Provisions</h2>
                <p>If any provision of these Terms and Conditions is invalid, the validity of the remaining provisions shall not be affected.</p>
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
        title={language === 'de' ? 'MärchenNails - Allgemeine Geschäftsbedingungen' : 
              language === 'es' ? 'MärchenNails - Términos y Condiciones' : 
              'MärchenNails - Terms and Conditions'}
        description="Terms and conditions for MärchenNails nail salon services"
        ogType="website"
      />
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className={`prose ${theme === 'dark' ? 'prose-invert' : ''} max-w-none`}>
          {getContent()}
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
