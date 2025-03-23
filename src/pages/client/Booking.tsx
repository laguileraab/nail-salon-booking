import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BookingForm from '../../components/booking/BookingForm';
import SEO from '../../components/SEO';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const Booking = () => {
  const { serviceId } = useParams<{ serviceId?: string }>();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering form
  // This helps with hydration issues and theme/language context
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Translations
  const translations = {
    en: {
      title: 'Book an Appointment',
      subtitle: 'Select a service and date for your visit to MärchenNails',
      contactTitle: 'Questions?',
      contactText: 'If you have any questions about our services or need assistance with booking, please contact us:',
      phone: 'Phone',
      email: 'Email',
      address: 'Address'
    },
    de: {
      title: 'Termin buchen',
      subtitle: 'Wählen Sie einen Service und ein Datum für Ihren Besuch bei MärchenNails',
      contactTitle: 'Fragen?',
      contactText: 'Wenn Sie Fragen zu unseren Dienstleistungen haben oder Hilfe bei der Buchung benötigen, kontaktieren Sie uns bitte:',
      phone: 'Telefon',
      email: 'E-Mail',
      address: 'Adresse'
    },
    es: {
      title: 'Reservar una Cita',
      subtitle: 'Seleccione un servicio y una fecha para su visita a MärchenNails',
      contactTitle: '¿Preguntas?',
      contactText: 'Si tiene alguna pregunta sobre nuestros servicios o necesita ayuda con la reserva, contáctenos:',
      phone: 'Teléfono',
      email: 'Correo Electrónico',
      address: 'Dirección'
    }
  };

  // Get translations for the current language
  const t = language === 'de' ? translations.de : 
           language === 'es' ? translations.es : 
           translations.en;

  if (!mounted) {
    return null; // Return null on server-side rendering
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <SEO 
        title={t.title} 
        description={t.subtitle}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-lg mb-8 text-accent-600">{t.subtitle}</p>
          
          <div className="mb-12">
            <BookingForm preselectedServiceId={serviceId} />
          </div>
          
          {/* Contact Information */}
          <div className={`mt-12 p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-xl font-semibold mb-4">{t.contactTitle}</h2>
            <p className="mb-4">{t.contactText}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-accent-600 mb-2">{t.phone}</h3>
                <p>+49 123 456 7890</p>
              </div>
              
              <div>
                <h3 className="font-medium text-accent-600 mb-2">{t.email}</h3>
                <p>booking@maerchennails.com</p>
              </div>
              
              <div>
                <h3 className="font-medium text-accent-600 mb-2">{t.address}</h3>
                <p>Nagelstraße 123<br />10115 Berlin, Germany</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
