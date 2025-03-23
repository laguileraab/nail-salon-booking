import React, { useState, useEffect } from 'react';
import { NailService } from '../../types/NailService';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiClock, FiCheckCircle } from 'react-icons/fi';

interface TimeSlot {
  hour: number;
  minute: number;
  available: boolean;
}

interface DateTimeSelectionProps {
  selectedService: NailService | null;
  onDateSelect: (date: Date | null) => void;
  onTimeSlotSelect: (timeSlot: TimeSlot | null) => void;
  selectedDate: Date | null;
  selectedTimeSlot: TimeSlot | null;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  selectedService,
  onDateSelect,
  onTimeSlotSelect,
  selectedDate,
  selectedTimeSlot,
}) => {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const { theme } = useTheme();
  const { language } = useLanguage();

  // Translations
  const translations = {
    en: {
      selectDate: 'Select Date',
      selectTime: 'Select Time',
      noTimeSlots: 'No available time slots on this date',
      loading: 'Loading available times...',
      next30Days: 'Next 30 days',
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      duration: 'Duration',
      minutes: 'minutes',
    },
    de: {
      selectDate: 'Datum auswählen',
      selectTime: 'Zeit auswählen',
      noTimeSlots: 'Keine verfügbaren Zeitfenster an diesem Datum',
      loading: 'Verfügbare Zeiten werden geladen...',
      next30Days: 'Nächste 30 Tage',
      morning: 'Vormittag',
      afternoon: 'Nachmittag',
      evening: 'Abend',
      duration: 'Dauer',
      minutes: 'Minuten',
    },
    es: {
      selectDate: 'Seleccionar Fecha',
      selectTime: 'Seleccionar Hora',
      noTimeSlots: 'No hay horarios disponibles en esta fecha',
      loading: 'Cargando horarios disponibles...',
      next30Days: 'Próximos 30 días',
      morning: 'Mañana',
      afternoon: 'Tarde',
      evening: 'Noche',
      duration: 'Duración',
      minutes: 'minutos',
    },
  };

  // Get translations for the current language
  const t = language === 'de' ? translations.de : 
           language === 'es' ? translations.es : 
           translations.en;

  // Generate available dates (30 days from today, excluding past dates)
  useEffect(() => {
    const today = new Date();
    const dates: Date[] = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      // Skip Sundays (day 0) if the salon is closed on Sundays
      if (date.getDay() !== 0) {
        dates.push(date);
      }
    }
    
    setAvailableDates(dates);
  }, []);

  // Generate time slots when date is selected
  useEffect(() => {
    if (selectedDate && selectedService) {
      generateTimeSlots(selectedDate, selectedService.durationMinutes);
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate, selectedService]);

  // This function would interact with your backend in a real implementation
  const generateTimeSlots = (_date: Date, serviceDurationMinutes: number) => {
    setIsLoadingSlots(true);
    
    // For demo, simulate an API call
    setTimeout(() => {
      // Generate slots based on service duration and date
      // In a real app, this would check against existing bookings and working hours
      const slots: TimeSlot[] = [];
      
      // Sample business hours: 9 AM to 6 PM
      // In production, these would vary based on the selected date
      const startHour = 9;
      const endHour = 18;
      
      // Generate slots based on service duration
      // Round up to nearest 15 minutes
      const intervalMinutes = Math.max(15, Math.ceil(serviceDurationMinutes / 15) * 15);
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
          // If the service can't be completed by closing time, don't add the slot
          if (hour + (minute + serviceDurationMinutes) / 60 > endHour) {
            continue;
          }
          
          // Randomly mark some slots as unavailable to simulate existing bookings
          // In a real app, check your database for actual availability
          const available = Math.random() > 0.3;
          slots.push({ hour, minute, available });
        }
      }
      
      setTimeSlots(slots);
      setIsLoadingSlots(false);
    }, 500);
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    onTimeSlotSelect(null); // Reset time slot when date changes
  };

  const handleTimeSlotClick = (slot: TimeSlot) => {
    if (!slot.available) return; // Ignore unavailable slots
    onTimeSlotSelect(slot);
  };

  // No need for a separate formatDate function since we're using the datepicker component
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

  // Group time slots by morning, afternoon, evening
  const groupedTimeSlots = {
    morning: timeSlots.filter(slot => slot.hour < 12),
    afternoon: timeSlots.filter(slot => slot.hour >= 12 && slot.hour < 16),
    evening: timeSlots.filter(slot => slot.hour >= 16),
  };

  const isDateSelected = (date: Date) => {
    return selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
  };

  const isTimeSlotSelected = (slot: TimeSlot) => {
    return selectedTimeSlot ? 
      slot.hour === selectedTimeSlot.hour && slot.minute === selectedTimeSlot.minute : false;
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-md`}>
      {/* Date Selection */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">{t.selectDate}</h3>
        <div className="grid grid-cols-7 gap-2">
          {availableDates.slice(0, 7).map((date) => (
            <div
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={`cursor-pointer p-2 text-center rounded transition-colors
                ${isDateSelected(date)
                  ? 'bg-accent-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
            >
              <div className="text-xs">{date.toLocaleDateString(undefined, { weekday: 'short' })}</div>
              <div className="text-lg font-medium">{date.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Show more dates if needed */}
        <div className="mt-2 grid grid-cols-7 gap-2">
          {availableDates.slice(7, 14).map((date) => (
            <div
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={`cursor-pointer p-2 text-center rounded transition-colors
                ${isDateSelected(date)
                  ? 'bg-accent-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
            >
              <div className="text-xs">{date.toLocaleDateString(undefined, { weekday: 'short' })}</div>
              <div className="text-lg font-medium">{date.getDate()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Slot Selection */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">{t.selectTime}</h3>
        
        {!selectedDate ? (
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">{t.selectDate}</p>
        ) : isLoadingSlots ? (
          <p className="text-center py-4">{t.loading}</p>
        ) : timeSlots.length === 0 ? (
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">{t.noTimeSlots}</p>
        ) : (
          <div className="space-y-6">
            {selectedService && (
              <div className="flex items-center text-sm mb-4">
                <FiClock className="mr-2" />
                <span>
                  {t.duration}: {selectedService.durationMinutes} {t.minutes}
                </span>
              </div>
            )}

            {/* Morning slots */}
            {groupedTimeSlots.morning.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">{t.morning}</h4>
                <div className="grid grid-cols-4 gap-2">
                  {groupedTimeSlots.morning.map((slot) => (
                    <button
                      key={`${slot.hour}-${slot.minute}`}
                      onClick={() => handleTimeSlotClick(slot)}
                      disabled={!slot.available}
                      className={`py-2 px-3 text-sm rounded text-center transition-colors flex items-center justify-center
                        ${isTimeSlotSelected(slot) 
                          ? 'bg-accent-500 text-white'
                          : slot.available
                            ? theme === 'dark'
                              ? 'bg-gray-700 hover:bg-gray-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            : theme === 'dark'
                              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                              : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
                    >
                      {formatTime(slot.hour, slot.minute)}
                      {isTimeSlotSelected(slot) && <FiCheckCircle className="ml-1" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Afternoon slots */}
            {groupedTimeSlots.afternoon.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">{t.afternoon}</h4>
                <div className="grid grid-cols-4 gap-2">
                  {groupedTimeSlots.afternoon.map((slot) => (
                    <button
                      key={`${slot.hour}-${slot.minute}`}
                      onClick={() => handleTimeSlotClick(slot)}
                      disabled={!slot.available}
                      className={`py-2 px-3 text-sm rounded text-center transition-colors flex items-center justify-center
                        ${isTimeSlotSelected(slot) 
                          ? 'bg-accent-500 text-white'
                          : slot.available
                            ? theme === 'dark'
                              ? 'bg-gray-700 hover:bg-gray-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            : theme === 'dark'
                              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                              : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
                    >
                      {formatTime(slot.hour, slot.minute)}
                      {isTimeSlotSelected(slot) && <FiCheckCircle className="ml-1" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Evening slots */}
            {groupedTimeSlots.evening.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">{t.evening}</h4>
                <div className="grid grid-cols-4 gap-2">
                  {groupedTimeSlots.evening.map((slot) => (
                    <button
                      key={`${slot.hour}-${slot.minute}`}
                      onClick={() => handleTimeSlotClick(slot)}
                      disabled={!slot.available}
                      className={`py-2 px-3 text-sm rounded text-center transition-colors flex items-center justify-center
                        ${isTimeSlotSelected(slot) 
                          ? 'bg-accent-500 text-white'
                          : slot.available
                            ? theme === 'dark'
                              ? 'bg-gray-700 hover:bg-gray-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            : theme === 'dark'
                              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                              : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
                    >
                      {formatTime(slot.hour, slot.minute)}
                      {isTimeSlotSelected(slot) && <FiCheckCircle className="ml-1" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateTimeSelection;
