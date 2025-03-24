import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { NailService } from '../../types/NailService';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ServiceSelection from './ServiceSelection';
import DateTimeSelection from './DateTimeSelection';
import ClientInfoForm from './ClientInfoForm';
import BookingConfirmation from './BookingConfirmation';
import { emailService } from '../../services/emailService';
import { bookingService } from '../../services/bookingService';
import { calendarService } from '../../services/calendarService';
import { useAuth } from '../../hooks/useAuth';
import { Language } from '../../types/language.types';
import { format } from 'date-fns';

type BookingStep = 'service' | 'datetime' | 'info' | 'confirmation';

interface BookingFormProps {
  preselectedServiceId?: string;
}

interface TimeSlot {
  hour: number;
  minute: number;
  available: boolean;
  staffId?: string; // ID of the staff member available for this time slot
}

interface BookingData {
  service: NailService | null;
  date: Date | null;
  timeSlot: TimeSlot | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

const BookingForm = ({ preselectedServiceId }: BookingFormProps) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [bookingData, setBookingData] = useState<BookingData>({
    service: null,
    date: null,
    timeSlot: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Translations
  const translations = {
    en: {
      steps: {
        service: 'Service',
        datetime: 'Date & Time',
        info: 'Your Information',
        confirmation: 'Confirmation'
      },
      next: 'Next',
      previous: 'Previous',
      book: 'Book Appointment',
      bookingSuccess: 'Your appointment has been booked successfully!',
      bookingError: 'There was an error booking your appointment. Please try again.',
      selectService: 'Please select a service',
      selectDate: 'Please select a date',
      selectTime: 'Please select a time',
      requiredField: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      missingBookingInfo: 'Please fill in all required booking information'
    },
    de: {
      steps: {
        service: 'Service',
        datetime: 'Datum & Zeit',
        info: 'Ihre Informationen',
        confirmation: 'Bestätigung'
      },
      next: 'Weiter',
      previous: 'Zurück',
      book: 'Termin buchen',
      bookingSuccess: 'Ihr Termin wurde erfolgreich gebucht!',
      bookingError: 'Bei der Buchung Ihres Termins ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
      selectService: 'Bitte wählen Sie einen Service',
      selectDate: 'Bitte wählen Sie ein Datum',
      selectTime: 'Bitte wählen Sie eine Uhrzeit',
      requiredField: 'Dieses Feld ist erforderlich',
      invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      missingBookingInfo: 'Bitte füllen Sie alle erforderlichen Buchungsinformationen aus'
    },
    es: {
      steps: {
        service: 'Servicio',
        datetime: 'Fecha y Hora',
        info: 'Su Información',
        confirmation: 'Confirmación'
      },
      next: 'Siguiente',
      previous: 'Anterior',
      book: 'Reservar Cita',
      bookingSuccess: '¡Su cita ha sido reservada con éxito!',
      bookingError: 'Hubo un error al reservar su cita. Por favor, inténtelo de nuevo.',
      selectService: 'Por favor seleccione un servicio',
      selectDate: 'Por favor seleccione una fecha',
      selectTime: 'Por favor seleccione una hora',
      requiredField: 'Este campo es obligatorio',
      invalidEmail: 'Por favor introduzca una dirección de correo electrónico válida',
      missingBookingInfo: 'Por favor, complete toda la información de reserva requerida'
    }
  };

  // Get translations for the current language
  const t = language === 'de' ? translations.de : 
           language === 'es' ? translations.es : 
           translations.en;

  // Load user data if logged in
  useEffect(() => {
    if (user) {
      const loadUserProfile = async () => {
        try {
          const profile = await bookingService.getUserProfile(user.id);
          if (profile) {
            setBookingData(prev => ({
              ...prev,
              firstName: profile.first_name || '',
              lastName: profile.last_name || '',
              email: profile.email || user.email || '',
              phone: profile.phone || ''
            }));
          } else {
            // If no profile exists yet, at least populate email from user auth
            setBookingData(prev => ({
              ...prev,
              email: user.email || ''
            }));
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      };

      loadUserProfile();
    }
  }, [user]);

  // Load preselected service if provided
  useEffect(() => {
    if (preselectedServiceId) {
      const loadPreselectedService = async () => {
        setIsLoading(true);
        try {
          const service = await bookingService.getServiceById(preselectedServiceId);
          if (service) {
            setBookingData(prev => ({
              ...prev,
              service: {
                id: service.id,
                name: service.name,
                description: service.description || '',
                price: service.price,
                durationMinutes: service.duration * 60, // Convert duration from hours to minutes
                category: service.category,
                isActive: true
              }
            }));
            setCurrentStep('datetime');
          }
        } catch (error) {
          console.error('Error loading preselected service:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadPreselectedService();
    }
  }, [preselectedServiceId]);

  // Handle service selection
  const handleServiceSelect = useCallback((service: NailService | null) => {
    setBookingData(prev => ({
      ...prev,
      service,
      // Reset date and time when service changes as availability might be different
      date: null,
      timeSlot: null
    }));
  }, []);

  // Handle date selection
  const handleDateSelect = useCallback((date: Date | null) => {
    setBookingData(prev => ({
      ...prev,
      date,
      // Reset time slot when date changes
      timeSlot: null
    }));
  }, []);

  // Handle time slot selection
  const handleTimeSlotSelect = useCallback((timeSlot: TimeSlot | null) => {
    setBookingData(prev => ({
      ...prev,
      timeSlot
    }));
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Validate form inputs
  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    // Validate required fields
    if (!bookingData.firstName.trim()) {
      newErrors.firstName = t.requiredField;
    }
    
    if (!bookingData.lastName.trim()) {
      newErrors.lastName = t.requiredField;
    }
    
    if (!bookingData.email.trim()) {
      newErrors.email = t.requiredField;
    } else if (!/^\S+@\S+\.\S+$/.test(bookingData.email)) {
      newErrors.email = t.invalidEmail;
    }
    
    if (!bookingData.phone.trim()) {
      newErrors.phone = t.requiredField;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission - wrapped in useCallback to prevent unnecessary recreations
  const handleSubmit = useCallback(async (e: React.FormEvent | null) => {
    if (e) e.preventDefault();
    
    if (submitting) return;
    
    // Validate that all required data is present
    if (!bookingData.service || !bookingData.date || !bookingData.timeSlot) {
      toast.error(t.missingBookingInfo);
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Format date and time for the API
      const appointmentDate = bookingData.date ? format(bookingData.date, 'yyyy-MM-dd') : '';
      const appointmentTime = `${bookingData.timeSlot?.hour.toString().padStart(2, '0')}:${bookingData.timeSlot?.minute.toString().padStart(2, '0')}`;

      let bookingId: string = '';

      // Use the appropriate booking function based on user authentication status
      if (user) {
        // User is logged in, create a user booking
        const booking = await bookingService.createUserBooking({
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          email: bookingData.email,
          phone: bookingData.phone || '',
          serviceId: bookingData.service?.id || '',
          date: appointmentDate,
          time: appointmentTime,
          staffId: bookingData.timeSlot?.staffId || '',
          notes: bookingData.notes || '',
        }, user.id);
        bookingId = booking.id || '';
      } else {
        // User is not logged in, create a guest booking
        const booking = await bookingService.createGuestBooking({
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          email: bookingData.email,
          phone: bookingData.phone || '',
          serviceId: bookingData.service?.id || '',
          date: appointmentDate,
          time: appointmentTime,
          staffId: bookingData.timeSlot?.staffId || '',
          notes: bookingData.notes || '',
        });
        bookingId = booking.id || '';
      }

      // Generate calendar event data for future integration
      const formattedTime = `${bookingData.timeSlot?.hour.toString().padStart(2, '0')}:${bookingData.timeSlot?.minute.toString().padStart(2, '0')}`;
      const calendarEvent = await calendarService.generateEventData({
        serviceId: bookingData.service?.id || '',
        serviceName: bookingData.service?.name || '',
        staffId: bookingData.timeSlot?.staffId || '',
        staffName: '', // We'd need to get the staff name from a service call
        date: bookingData.date ? format(bookingData.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        startTime: formattedTime,
        endTime: '', // Calculate end time based on duration and start time
        duration: bookingData.service?.durationMinutes || 0,
        status: 'confirmed',
        clientName: `${bookingData.firstName} ${bookingData.lastName}`,
        clientEmail: bookingData.email,
        clientPhone: bookingData.phone || '',
        notes: bookingData.notes || '',
        businessName: 'MärchenNails',
        businessAddress: 'Musterstraße 123, 10115 Berlin',
        businessPhone: '+49 30 12345678',
        language: 'en'
      });

      // TODO: Add calendar attachment to email in future
      console.log('Calendar event generated:', calendarEvent);

      // Send confirmation email
      await emailService.sendBookingConfirmation(
        bookingData.email,
        bookingData.firstName,
        bookingData.service?.name || '',
        bookingData.date, // We've already validated that this is not null above
        `${bookingData.timeSlot.hour.toString().padStart(2, '0')}:${bookingData.timeSlot.minute.toString().padStart(2, '0')}`,
        language as Language, // Use the user's language preference
        bookingId // Confirmation code
      );

      toast.success(t.bookingSuccess);
      
      // Redirect to a success page with booking details
      navigate(`/booking/success?id=${bookingId}`);
      
    } catch (error) {
      console.error('Error creating booking:', error instanceof Error ? error.message : String(error));
      toast.error(t.bookingError);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, bookingData, user, navigate, t, language]);

  // Handle next button click
  const handleNext = () => {
    if (currentStep === 'service') {
      if (!bookingData.service) {
        toast.error(t.selectService);
        return;
      }
      setCurrentStep('datetime');
    } else if (currentStep === 'datetime') {
      if (!bookingData.date) {
        toast.error(t.selectDate);
        return;
      }
      if (!bookingData.timeSlot) {
        toast.error(t.selectTime);
        return;
      }
      setCurrentStep('info');
    } else if (currentStep === 'info') {
      if (validateForm()) {
        setCurrentStep('confirmation');
      }
    } else if (currentStep === 'confirmation') {
      handleSubmit(null);
    }
  };

  // Handle previous button click
  const handlePrevious = () => {
    if (currentStep === 'datetime') setCurrentStep('service');
    else if (currentStep === 'info') setCurrentStep('datetime');
    else if (currentStep === 'confirmation') setCurrentStep('info');
  };

  // Render current step content
  const renderStep = () => {
    switch (currentStep) {
      case 'service':
        return (
          <div className="space-y-6">
            <ServiceSelection 
              onServiceSelect={handleServiceSelect}
              selectedServiceId={bookingData.service?.id}
            />
          </div>
        );
      case 'datetime':
        return (
          <div className="space-y-6">
            <DateTimeSelection 
              selectedService={bookingData.service}
              onDateSelect={handleDateSelect}
              onTimeSlotSelect={handleTimeSlotSelect}
              selectedDate={bookingData.date}
              selectedTimeSlot={bookingData.timeSlot}
            />
          </div>
        );
      case 'info':
        return (
          <div className="space-y-6">
            <ClientInfoForm 
              firstName={bookingData.firstName}
              lastName={bookingData.lastName}
              email={bookingData.email}
              phone={bookingData.phone}
              notes={bookingData.notes}
              onInputChange={handleInputChange}
              errors={errors}
            />
          </div>
        );
      case 'confirmation':
        return (
          <div className="space-y-6">
            {bookingData.service && bookingData.date && bookingData.timeSlot && (
              <BookingConfirmation 
                service={bookingData.service}
                date={bookingData.date}
                timeSlot={bookingData.timeSlot}
                firstName={bookingData.firstName}
                lastName={bookingData.lastName}
                email={bookingData.email}
                phone={bookingData.phone}
                notes={bookingData.notes}
              />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg overflow-hidden`}>
      {/* Progress steps */}
      <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
        <div className="flex justify-between">
          {(['service', 'datetime', 'info', 'confirmation'] as BookingStep[]).map((step, index) => (
            <div key={step} className="flex items-center">
              <div 
                className={`rounded-full h-8 w-8 flex items-center justify-center text-sm 
                ${currentStep === step 
                  ? 'bg-accent-600 text-white' 
                  : index < (['service', 'datetime', 'info', 'confirmation'] as BookingStep[]).indexOf(currentStep) 
                    ? 'bg-accent-200 text-accent-800' 
                    : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
              >
                {index + 1}
              </div>
              <span className={`ml-2 hidden sm:block ${currentStep === step ? 'font-medium' : ''}`}>
                {t.steps[step]}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Content area */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-600"></div>
          </div>
        ) : (
          <div>
            {renderStep()}
            
            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {currentStep !== 'service' && (
                <button
                  onClick={handlePrevious}
                  disabled={submitting}
                  className={`px-6 py-2 rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                >
                  {t.previous}
                </button>
              )}
              <div className={currentStep === 'service' ? '' : 'ml-auto'}>
                <button
                  onClick={handleNext}
                  disabled={submitting}
                  className={`px-6 py-2 rounded bg-accent-600 text-white hover:bg-accent-700 transition-colors flex items-center ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {submitting && (
                    <span className="mr-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    </span>
                  )}
                  {currentStep === 'confirmation' ? t.book : t.next}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
