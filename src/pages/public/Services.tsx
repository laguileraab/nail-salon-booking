import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SEO from '../../components/SEO';
import { useContactInfo } from '../../contexts/ContactInfoContext';
import { useState } from 'react';

const Services = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { contactInfo } = useContactInfo();
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const services = [
    {
      id: 1,
      name: language === 'de' ? 'Maniküre' : language === 'es' ? 'Manicura' : 'Manicure',
      description: language === 'de' 
        ? 'Professionelle Nagelpflege für Ihre Hände, einschließlich Formgebung, Nagelhautpflege und Politur.' 
        : language === 'es' 
        ? 'Cuidado profesional de uñas para tus manos, incluido el modelado, el cuidado de las cutículas y el pulido.' 
        : 'Professional nail care for your hands, including shaping, cuticle care, and polish.',
      price: 30,
      duration: 45,
      image: 'images/services/manicure.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1604654894611-6973b7069432?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 2,
      name: language === 'de' ? 'Pediküre' : language === 'es' ? 'Pedicura' : 'Pedicure',
      description: language === 'de'
        ? 'Umfassende Fußpflege einschließlich Peeling, Massage und Politur für schöne Füße.'
        : language === 'es'
        ? 'Cuidado integral de los pies, incluida la exfoliación, el masaje y el pulido para tener unos pies bonitos.'
        : 'Comprehensive foot care including exfoliation, massage, and polish for beautiful feet.',
      price: 45,
      duration: 60,
      image: 'images/services/pedicure.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1601887573188-79bdaed4fe9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 3,
      name: language === 'de' ? 'Gel-Nägel' : language === 'es' ? 'Uñas de Gel' : 'Gel Nails',
      description: language === 'de'
        ? 'Langanhaltende, bruchfeste Gel-Lackierung für leuchtende, glänzende Nägel.'
        : language === 'es'
        ? 'Aplicación de esmalte en gel de larga duración y resistente a los astillados para uñas vibrantes y brillantes.'
        : 'Long-lasting, chip-resistant gel polish application for vibrant, glossy nails.',
      price: 40,
      duration: 60,
      image: 'images/services/gel-nails.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1609587312208-cea54be969e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 4,
      name: language === 'de' ? 'Acryl-Verlängerungen' : language === 'es' ? 'Extensiones Acrílicas' : 'Acrylic Extensions',
      description: language === 'de'
        ? 'Acryl-Nagelverlängerungen für zusätzliche Länge und Haltbarkeit, angepasst an Ihre Vorlieben.'
        : language === 'es'
        ? 'Extensiones de uñas acrílicas para mayor longitud y durabilidad, personalizadas según tus preferencias.'
        : 'Acrylic nail extensions for added length and durability, customized to your preferences.',
      price: 60,
      duration: 90,
      image: 'images/services/acrylic-extensions.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 5,
      name: language === 'de' ? 'Nageldesign' : language === 'es' ? 'Arte de Uñas' : 'Nail Art',
      description: language === 'de'
        ? 'Kreative Designs und Verschönerungen, die Ihren Nägeln einen individuellen Look verleihen.'
        : language === 'es'
        ? 'Diseños creativos y embellecimientos que dan a tus uñas un aspecto único.'
        : 'Creative designs and embellishments that give your nails a unique look.',
      price: 25,
      duration: 30,
      image: 'images/services/nail-art.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 6,
      name: language === 'de' ? 'Nagel-Reparatur' : language === 'es' ? 'Reparación de Uñas' : 'Nail Repair',
      description: language === 'de'
        ? 'Spezialisierte Dienste zur Reparatur beschädigter Nägel und Wiederherstellung deren Gesundheit und Festigkeit.'
        : language === 'es'
        ? 'Servicios especializados para reparar uñas dañadas y restaurar su salud y fuerza.'
        : 'Specialized services to repair damaged nails and restore their health and strength.',
      price: 20,
      duration: 30,
      image: 'images/services/nail-repair.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1604902396830-aca29e19b067?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
  ];

  const handleImageError = (id: number) => {
    setImageErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

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
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div key={service.id} className={`flex flex-col overflow-hidden rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex-shrink-0 relative">
                    <img 
                      className="h-48 w-full object-cover" 
                      src={imageErrors[service.id] ? service.fallbackImage : service.image} 
                      alt={service.name} 
                      onError={() => handleImageError(service.id)}
                    />
                  </div>
                  <div className={`flex-1 p-6 flex flex-col justify-between ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex-1">
                      <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{service.name}</p>
                      <p className={`mt-3 text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{service.description}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <span className="text-accent-600 font-bold">€{service.price}</span>
                        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm ml-1`}>/ {service.duration} {language === 'de' ? 'Min.' : language === 'es' ? 'min.' : 'min'}</span>
                      </div>
                      <Link 
                        to={`/booking/${service.id}`} 
                        className="text-accent-600 hover:text-accent-800 font-medium"
                      >
                        {language === 'de' ? 'Jetzt buchen' : language === 'es' ? 'Reservar ahora' : 'Book Now'} →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                ? 'Haben Sie Fragen oder möchten Sie einen Termin vereinbaren? Kontaktieren Sie uns noch heute.'
                : language === 'es'
                ? '¿Tienes preguntas o quieres reservar una cita? Contáctanos hoy.'
                : 'Have questions or want to book an appointment? Contact us today.'}
            </p>
          </div>
          <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-center space-y-6 md:space-y-0 md:space-x-10">
            <div className={`flex items-center justify-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{contactInfo.phone}</span>
            </div>
            <div className={`flex items-center justify-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href={`mailto:${contactInfo.email}`} className="hover:text-accent-600">{contactInfo.email}</a>
            </div>
            <div className={`flex items-center justify-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{contactInfo.address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
