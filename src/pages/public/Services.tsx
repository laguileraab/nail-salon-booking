import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SEO from '../../components/SEO';
import { useContactInfo } from '../../contexts/ContactInfoContext';
import { serviceManagementService } from '../../services/serviceManagementService';
import { NailService } from '../../types/NailService';
import { FiClock, FiArrowRight, FiLoader } from 'react-icons/fi';

const Services = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { contactInfo } = useContactInfo();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [services, setServices] = useState<NailService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const fallbackImages = [
    'https://images.unsplash.com/photo-1604654894611-6973b7069432?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1601887573188-79bdaed4fe9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1609587312208-cea54be969e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1604902396830-aca29e19b067?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await serviceManagementService.getActiveServices();
        setServices(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(language === 'de' 
          ? 'Fehler beim Laden der Dienstleistungen.' 
          : language === 'es' 
          ? 'Error al cargar los servicios.' 
          : 'Error loading services.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [language]);

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

  // Get localized name and description based on user's language
  const getLocalizedName = (service: NailService) => {
    if (language === 'de' && service.translations?.de?.name) {
      return service.translations.de.name;
    } else if (language === 'es' && service.translations?.es?.name) {
      return service.translations.es.name;
    }
    return service.name;
  };

  const getLocalizedDescription = (service: NailService) => {
    if (language === 'de' && service.translations?.de?.description) {
      return service.translations.de.description;
    } else if (language === 'es' && service.translations?.es?.description) {
      return service.translations.es.description;
    }
    return service.description;
  };

  // Select a random fallback image for services without images
  const getFallbackImage = (index: number) => {
    return fallbackImages[index % fallbackImages.length];
  };

  // Format currency based on locale
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'de' ? 'de-DE' : language === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Determine which services to display based on showAll flag
  const displayedServices = showAll ? services : services.slice(0, 8);
  const hasMoreServices = services.length > 8;

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <SEO 
        title={language === 'de' ? 'MärchenNails - Unsere Dienste' : language === 'es' ? 'MärchenNails - Nuestros Servicios' : 'MärchenNails - Our Services'}
        description={language === 'de' ? 'Entdecken Sie unsere Premium-Nagelpflegedienste' : language === 'es' ? 'Descubre nuestros servicios premium de cuidado de uñas' : 'Discover our premium nail care services'}
        ogType="website"
      />
      
      {/* Header Section */}
      <div className={`py-16 ${theme === 'dark' ? 'bg-gray-800' : 'bg-accent-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">{language === 'de' ? 'Unsere Dienste' : language === 'es' ? 'Nuestros Servicios' : 'Our Services'}</span>
            </h1>
            <p className={`mt-3 max-w-md mx-auto text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} sm:text-lg md:mt-5 md:text-xl md:max-w-3xl`}>
              {language === 'de' 
                ? 'Entdecken Sie unsere Auswahl an professionellen Nagelpflegeanwendungen, die von unseren Experten durchgeführt werden.'
                : language === 'es'
                ? 'Descubre nuestra gama de tratamientos profesionales para uñas realizados por nuestros expertos.'
                : 'Discover our range of professional nail treatments performed by our expert technicians.'}
            </p>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <FiLoader className="animate-spin h-10 w-10 text-accent-600" />
              <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">
                {language === 'de' ? 'Lade Dienste...' : language === 'es' ? 'Cargando servicios...' : 'Loading services...'}
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
              >
                {language === 'de' ? 'Erneut versuchen' : language === 'es' ? 'Intentar nuevamente' : 'Try again'}
              </button>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                {language === 'de' ? 'Keine Dienste gefunden.' : language === 'es' ? 'No se encontraron servicios.' : 'No services found.'}
              </p>
            </div>
          ) : (
            <>
              <div className="mt-10">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {displayedServices.map((service, index) => (
                    <div key={service.id} className={`flex flex-col overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="flex-shrink-0 relative">
                        <img 
                          className="h-48 w-full object-cover" 
                          src={imageErrors[service.id] || !service.image ? getFallbackImage(index) : service.image} 
                          alt={getLocalizedName(service)} 
                          onError={() => handleImageError(service.id)}
                        />
                      </div>
                      <div className={`flex-1 p-6 flex flex-col justify-between ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex-1">
                          <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{getLocalizedName(service)}</p>
                          <p className={`mt-3 text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{getLocalizedDescription(service)}</p>
                        </div>
                        <div className="mt-6 flex items-center justify-between">
                          <div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                              <FiClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                              <span>{service.durationMinutes} {language === 'de' ? 'Min.' : language === 'es' ? 'min.' : 'min'}</span>
                            </div>
                            <div className="text-accent-600 dark:text-accent-400 font-bold">
                              {formatCurrency(service.price)}
                            </div>
                          </div>
                          <Link 
                            to={`/booking?service=${service.id}`} 
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
                          >
                            {language === 'de' ? 'Buchen' : language === 'es' ? 'Reservar' : 'Book Now'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {hasMoreServices && !showAll && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => setShowAll(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      {language === 'de' ? 'Alle Dienste anzeigen' : language === 'es' ? 'Ver todos los servicios' : 'View All Services'}
                      <FiArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className={`py-16 ${theme === 'dark' ? 'bg-gray-800' : 'bg-accent-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              <span className="block">{language === 'de' ? 'Bereit, sich verwöhnen zu lassen?' : language === 'es' ? '¿Lista para consentirte?' : 'Ready to pamper yourself?'}</span>
            </h2>
            <p className={`mt-4 max-w-md mx-auto text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} sm:text-lg md:mt-5 md:text-xl md:max-w-3xl`}>
              {language === 'de' 
                ? 'Buchen Sie Ihren Termin heute und genießen Sie unsere entspannende Atmosphäre und erstklassigen Dienstleistungen.'
                : language === 'es'
                ? 'Reserva tu cita hoy y disfruta de nuestro ambiente relajante y servicios de primera calidad.'
                : 'Book your appointment today and enjoy our relaxing atmosphere and top-quality services.'}
            </p>
            <div className="mt-8">
              <Link
                to="/booking"
                className="w-full inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 md:py-4 md:text-lg md:px-10"
              >
                {language === 'de' ? 'Termin buchen' : language === 'es' ? 'Reservar cita' : 'Book Appointment'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div id="contact" className={`py-12 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              <span className="block">{language === 'de' ? 'Kontaktieren Sie uns' : language === 'es' ? 'Contáctenos' : 'Contact Us'}</span>
            </h2>
            <p className={`mt-4 max-w-md mx-auto text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} sm:text-lg md:mt-5 md:text-xl md:max-w-3xl`}>
              {language === 'de'
                ? 'Haben Sie Fragen oder möchten Sie weitere Informationen? Wir sind für Sie da.'
                : language === 'es'
                ? '¿Tiene preguntas o necesita más información? Estamos aquí para ayudarle.'
                : 'Have questions or need more information? We\'re here to help.'}
            </p>
            {contactInfo && (
              <div className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
                {contactInfo.phone && (
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="ml-2 text-gray-900 dark:text-white">{contactInfo.phone}</span>
                  </div>
                )}
                {contactInfo.email && (
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="ml-2 text-gray-900 dark:text-white">{contactInfo.email}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
