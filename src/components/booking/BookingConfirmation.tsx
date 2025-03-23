import React from 'react';
import { NailService } from '../../types/NailService';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiCalendar, FiClock, FiUser, FiMail, FiPhone, FiCheckCircle } from 'react-icons/fi';

interface TimeSlot {
  hour: number;
  minute: number;
  available: boolean;
}

interface BookingConfirmationProps {
  service: NailService;
  date: Date;
  timeSlot: TimeSlot;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  service,
  date,
  timeSlot,
  firstName,
  lastName,
  email,
  phone,
  notes,
}) => {
  const { theme } = useTheme();
  const { language } = useLanguage();

  // Translations
  const translations = {
    en: {
      confirmBooking: 'Confirm Your Booking',
      summary: 'Booking Summary',
      service: 'Service',
      date: 'Date',
      time: 'Time',
      duration: 'Duration',
      price: 'Price',
      minutes: 'minutes',
      personalInfo: 'Personal Information',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      notes: 'Notes',
      none: 'None',
      termsAndConditions: 'By clicking "Book Appointment", you agree to our Terms and Conditions',
      bookAppointment: 'Book Appointment',
    },
    de: {
      confirmBooking: 'Buchung bestu00e4tigen',
      summary: 'Buchungsu00fcbersicht',
      service: 'Service',
      date: 'Datum',
      time: 'Zeit',
      duration: 'Dauer',
      price: 'Preis',
      minutes: 'Minuten',
      personalInfo: 'Persu00f6nliche Informationen',
      name: 'Name',
      email: 'E-Mail',
      phone: 'Telefon',
      notes: 'Anmerkungen',
      none: 'Keine',
      termsAndConditions: 'Durch Klicken auf "Termin buchen" stimmen Sie unseren Nutzungsbedingungen zu',
      bookAppointment: 'Termin buchen',
    },
    es: {
      confirmBooking: 'Confirmar Su Reserva',
      summary: 'Resumen de la Reserva',
      service: 'Servicio',
      date: 'Fecha',
      time: 'Hora',
      duration: 'Duraciu00f3n',
      price: 'Precio',
      minutes: 'minutos',
      personalInfo: 'Informaciu00f3n Personal',
      name: 'Nombre',
      email: 'Correo Electru00f3nico',
      phone: 'Telu00e9fono',
      notes: 'Notas',
      none: 'Ninguna',
      termsAndConditions: 'Al hacer clic en "Reservar Cita", acepta nuestros Tu00e9rminos y Condiciones',
      bookAppointment: 'Reservar Cita',
    },
  };

  // Get translations for the current language
  const t = language === 'de' ? translations.de : 
           language === 'es' ? translations.es : 
           translations.en;

  const getServiceName = () => {
    if (language === 'de' && service.translations?.de?.name) {
      return service.translations.de.name;
    }
    if (language === 'es' && service.translations?.es?.name) {
      return service.translations.es.name;
    }
    return service.name;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'de' ? 'de-DE' : language === 'es' ? 'es-ES' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (hour: number, minute: number) => {
    // Use 24-hour format for German, 12-hour format for others
    if (language === 'de') {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    } else {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'de' ? 'de-DE' : language === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: 'EUR', // Using EUR since it's a European business
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-md p-6`}>
      <h3 className="text-xl font-semibold mb-6">{t.confirmBooking}</h3>
      
      {/* Booking Summary Section */}
      <div className={`mb-6 rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h4 className="font-medium mb-4">{t.summary}</h4>
        
        <div className="space-y-3">
          {/* Service */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FiCheckCircle className="mr-2 text-accent-500" />
              <span>{t.service}</span>
            </div>
            <div className="font-medium">{getServiceName()}</div>
          </div>
          
          {/* Date */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FiCalendar className="mr-2 text-accent-500" />
              <span>{t.date}</span>
            </div>
            <div className="font-medium">{formatDate(date)}</div>
          </div>
          
          {/* Time */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FiClock className="mr-2 text-accent-500" />
              <span>{t.time}</span>
            </div>
            <div className="font-medium">{formatTime(timeSlot.hour, timeSlot.minute)}</div>
          </div>
          
          {/* Duration */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FiClock className="mr-2 text-accent-500" />
              <span>{t.duration}</span>
            </div>
            <div className="font-medium">{service.durationMinutes} {t.minutes}</div>
          </div>
          
          {/* Price */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="mr-2 font-bold text-accent-500">€</span>
              <span>{t.price}</span>
            </div>
            <div className="font-bold text-accent-600">{formatPrice(service.price)}</div>
          </div>
        </div>
      </div>
      
      {/* Personal Information Section */}
      <div className={`mb-6 rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h4 className="font-medium mb-4">{t.personalInfo}</h4>
        
        <div className="space-y-3">
          {/* Name */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FiUser className="mr-2 text-accent-500" />
              <span>{t.name}</span>
            </div>
            <div className="font-medium">{firstName} {lastName}</div>
          </div>
          
          {/* Email */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FiMail className="mr-2 text-accent-500" />
              <span>{t.email}</span>
            </div>
            <div className="font-medium">{email}</div>
          </div>
          
          {/* Phone */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FiPhone className="mr-2 text-accent-500" />
              <span>{t.phone}</span>
            </div>
            <div className="font-medium">{phone}</div>
          </div>
          
          {/* Notes if any */}
          {notes && (
            <div className="mt-2">
              <div className="flex items-start">
                <FiCheckCircle className="mr-2 mt-1 text-accent-500" />
                <span>{t.notes}</span>
              </div>
              <div className="mt-1 pl-6">{notes || t.none}</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Terms and Conditions */}
      <div className="mb-6 text-sm text-center">
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t.termsAndConditions}</p>
      </div>
    </div>
  );
};

export default BookingConfirmation;
