import { Link } from 'react-router-dom';
import { FiCalendar, FiHome, FiPhone } from 'react-icons/fi';
import SEO from '../../components/SEO';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const BookingSuccess = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  
  // Translations
  const translations = {
    en: {
      title: 'Booking Confirmed',
      heading: 'Thank You for Your Booking!',
      subtitle: 'Your appointment at MärchenNails has been successfully confirmed.',
      checkEmail: 'Please check your email for booking details and confirmation.',
      reminderText: 'We will send you a reminder 24 hours before your appointment.',
      questionsTitle: 'Have Questions?',
      contactText: 'If you need to change or cancel your appointment, please contact us:',
      phone: '+49 123 456 7890',
      returnHome: 'Return to Home',
      viewBookings: 'View My Bookings'
    },
    de: {
      title: 'Buchung bestätigt',
      heading: 'Vielen Dank für Ihre Buchung!',
      subtitle: 'Ihr Termin bei MärchenNails wurde erfolgreich bestätigt.',
      checkEmail: 'Bitte überprüfen Sie Ihre E-Mail für Buchungsdetails und Bestätigung.',
      reminderText: 'Wir senden Ihnen 24 Stunden vor Ihrem Termin eine Erinnerung.',
      questionsTitle: 'Haben Sie Fragen?',
      contactText: 'Wenn Sie Ihren Termin ändern oder stornieren möchten, kontaktieren Sie uns bitte:',
      phone: '+49 123 456 7890',
      returnHome: 'Zurück zur Startseite',
      viewBookings: 'Meine Buchungen anzeigen'
    },
    es: {
      title: 'Reserva Confirmada',
      heading: '¡Gracias por Su Reserva!',
      subtitle: 'Su cita en MärchenNails ha sido confirmada con éxito.',
      checkEmail: 'Por favor, revise su correo electrónico para obtener detalles de la reserva y confirmación.',
      reminderText: 'Le enviaremos un recordatorio 24 horas antes de su cita.',
      questionsTitle: '¿Tiene Preguntas?',
      contactText: 'Si necesita cambiar o cancelar su cita, por favor contáctenos:',
      phone: '+49 123 456 7890',
      returnHome: 'Volver al Inicio',
      viewBookings: 'Ver Mis Reservas'
    }
  };

  // Get translations for the current language
  const t = language === 'de' ? translations.de : 
           language === 'es' ? translations.es : 
           translations.en;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <SEO 
        title={t.title} 
        description={t.subtitle}
      />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto text-center">
          {/* Success icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-green-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{t.heading}</h1>
          <p className="text-lg mb-4">{t.subtitle}</p>
          <p className={`mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t.checkEmail}</p>
          
          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md mb-8 text-left`}>
            <div className="flex items-start mb-4">
              <FiCalendar className="mr-3 mt-1 text-accent-500" />
              <p>{t.reminderText}</p>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h3 className="font-medium mb-2">{t.questionsTitle}</h3>
              <p className="mb-4">{t.contactText}</p>
              
              <div className="flex items-center">
                <FiPhone className="mr-2 text-accent-500" />
                <span>{t.phone}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/" 
              className={`flex items-center justify-center px-6 py-3 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              <FiHome className="mr-2" />
              {t.returnHome}
            </Link>
            
            <Link 
              to="/client/bookings" 
              className="flex items-center justify-center px-6 py-3 rounded-md bg-accent-600 text-white hover:bg-accent-700"
            >
              <FiCalendar className="mr-2" />
              {t.viewBookings}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
