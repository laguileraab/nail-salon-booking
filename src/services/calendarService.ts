/**
 * Service for managing calendar and availability
 */
import { supabase } from '../lib/supabase';
import { format, parseISO, addMinutes, addDays } from 'date-fns';
import { de, es, enUS } from 'date-fns/locale';

// Define types
type Language = 'en' | 'de' | 'es';

// Add back the PostgrestQuery type definition
type PostgrestQuery<T> = {
  eq: (column: string, value: string | number) => PostgrestQuery<T>;
  neq: (column: string, value: string | number) => PostgrestQuery<T>;
  gt: (column: string, value: string | number | Date) => PostgrestQuery<T>;
  gte: (column: string, value: string | number | Date) => PostgrestQuery<T>;
  lt: (column: string, value: string | number | Date) => PostgrestQuery<T>;
  lte: (column: string, value: string | number | Date) => PostgrestQuery<T>;
  in: (column: string, values: (string | number)[]) => PostgrestQuery<T>;
  is: (column: string, value: boolean | null) => PostgrestQuery<T>;
  select: (columns: string) => PostgrestQuery<T>;
  order: (column: string, options?: { ascending?: boolean }) => PostgrestQuery<T>;
  limit: (count: number) => PostgrestQuery<T>;
  single: () => Promise<{ data: T | null; error: Error | null }>;
  then: (callback: (result: { data: T[] | null; error: Error | null }) => void) => Promise<unknown>;
};

interface BookingFormData {
  serviceId: string;
  staffId: string;
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface EventData {
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  language?: Language;
}

interface CalendarEvent {
  icsFileContent: string;
  googleCalendarLink: string;
  outlookLink: string;
  yahooLink: string;
  appleCalendarLink: string;
}

interface BookingSummary {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  staff: string;
}

interface WorkingHours {
  monday: { start: string; end: string };
  tuesday: { start: string; end: string };
  wednesday: { start: string; end: string };
  thursday: { start: string; end: string };
  friday: { start: string; end: string };
  saturday: { start: string; end: string };
  sunday: { start: string; end: string };
}

const mockWorkingHours: WorkingHours = {
  monday: { start: '09:00', end: '18:00' },
  tuesday: { start: '09:00', end: '18:00' },
  wednesday: { start: '09:00', end: '18:00' },
  thursday: { start: '09:00', end: '18:00' },
  friday: { start: '09:00', end: '18:00' },
  saturday: { start: '09:00', end: '18:00' },
  sunday: { start: '09:00', end: '18:00' },
};

// Use mock translations object for now
const translations = {
  en: {
    unknownService: 'Unknown Service',
    unknownStaff: 'Unknown Staff',
    calendar: {
      appointment: 'Appointment',
      with: 'with',
      reminder: 'Reminder',
    },
    email: {
      appointmentDetails: 'Appointment Details',
    },
  },
  de: {
    unknownService: 'Unbekannter Service',
    unknownStaff: 'Unbekannter Mitarbeiter',
    calendar: {
      appointment: 'Termin',
      with: 'mit',
      reminder: 'Erinnerung',
    },
    email: {
      appointmentDetails: 'Termin Details',
    },
  },
  es: {
    unknownService: 'Servicio Desconocido',
    unknownStaff: 'Personal Desconocido',
    calendar: {
      appointment: 'Cita',
      with: 'con',
      reminder: 'Recordatorio',
    },
    email: {
      appointmentDetails: 'Detalles de la Cita',
    },
  },
};

/**
 * Service for handling calendar integrations and appointment scheduling
 */
export const calendarService = {
  /**
   * Get the appropriate locale for date-fns based on language
   * @private
   */
  _getLocale(language: Language = 'en'): typeof de | typeof es | undefined {
    switch (language) {
      case 'de':
        return de;
      case 'es':
        return es;
      default:
        return undefined; // Default is English
    }
  },

  /**
   * Format date according to the user's language preference
   * @private
   */
  _formatDate(date: Date, formatString: string, language: Language = 'en'): string {
    return format(date, formatString, { locale: this._getLocale(language) });
  },

  /**
   * Generate a calendar event file (ICS) for a booking
   */
  generateIcsFile(
    serviceName: string,
    appointmentDate: Date,
    appointmentTime: string,
    durationMinutes: number,
    language: Language = 'en',
    location = 'MärchenNails, Musterstraße 123, 10115 Berlin'
  ): string {
    try {
      const t = translations[language];

      const [hours, minutes] = appointmentTime.split(':').map(Number);
      const startTime = new Date(appointmentDate);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = addMinutes(startTime, durationMinutes);

      const formatIcsDate = (date: Date) => {
        return format(date, "yyyyMMdd'T'HHmmss'Z'");
      };

      const startDateFormatted = formatIcsDate(startTime);
      const endDateFormatted = formatIcsDate(endTime);
      const now = formatIcsDate(new Date());

      const summary = `${t['calendar']['appointment']}: ${serviceName}`;
      const description = `${t['email']['appointmentDetails']} - ${serviceName} ${t['calendar']['with']} MärchenNails`;

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//MärchenNails//Nail Salon Booking//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${Math.random().toString(36).substring(2)}@maerchennails.com`,
        `DTSTAMP:${now}`,
        `DTSTART:${startDateFormatted}`,
        `DTEND:${endDateFormatted}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'BEGIN:VALARM',
        'TRIGGER:-PT1H',
        'ACTION:DISPLAY',
        `DESCRIPTION:${t['calendar']['reminder']}`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      return icsContent;
    } catch (err: unknown) {
      console.error('Error generating ICS file:', err instanceof Error ? err.message : String(err));
      return '';
    }
  },

  /**
   * Generate a Google Calendar event link
   */
  generateGoogleCalendarLink(
    serviceName: string,
    appointmentDate: Date,
    appointmentTime: string,
    durationMinutes: number,
    language: Language = 'en',
    location = 'MärchenNails, Musterstraße 123, 10115 Berlin'
  ): string {
    try {
      const t = translations[language];

      const [hours, minutes] = appointmentTime.split(':').map(Number);
      const startTime = new Date(appointmentDate);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = addMinutes(startTime, durationMinutes);

      const formatGoogleDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
      };

      const startDateFormatted = formatGoogleDate(startTime);
      const endDateFormatted = formatGoogleDate(endTime);

      const summary = `${t['calendar']['appointment']}: ${serviceName}`;
      const description = `${t['email']['appointmentDetails']} - ${serviceName} ${t['calendar']['with']} MärchenNails`;

      const baseUrl = 'https://www.google.com/calendar/render';
      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: summary,
        dates: `${startDateFormatted}/${endDateFormatted}`,
        details: description,
        location,
        sf: 'true',
        output: 'xml',
      });

      return `${baseUrl}?${params.toString()}`;
    } catch (err: unknown) {
      console.error('Error generating Google Calendar link:', err instanceof Error ? err.message : String(err));
      return '';
    }
  },

  /**
   * Generate an Outlook calendar link
   */
  generateOutlookLink(
    serviceName: string,
    appointmentDate: Date,
    appointmentTime: string,
    durationMinutes: number,
    language: Language = 'en',
    location = 'MärchenNails, Musterstraße 123, 10115 Berlin'
  ): string {
    try {
      const t = translations[language];

      const [hours, minutes] = appointmentTime.split(':').map(Number);
      const startTime = new Date(appointmentDate);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = addMinutes(startTime, durationMinutes);

      const formatOutlookDate = (date: Date) => {
        return date.toISOString();
      };

      const startDateFormatted = formatOutlookDate(startTime);
      const endDateFormatted = formatOutlookDate(endTime);

      const summary = `${t['calendar']['appointment']}: ${serviceName}`;
      const description = `${t['email']['appointmentDetails']} - ${serviceName} ${t['calendar']['with']} MärchenNails`;

      const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
      const params = new URLSearchParams({
        subject: summary,
        startdt: startDateFormatted,
        enddt: endDateFormatted,
        body: description,
        location,
        path: '/calendar/action/compose',
      });

      return `${baseUrl}?${params.toString()}`;
    } catch (err: unknown) {
      console.error('Error generating Outlook link:', err instanceof Error ? err.message : String(err));
      return '';
    }
  },

  /**
   * Generate a Yahoo calendar link
   */
  generateYahooLink(
    serviceName: string,
    appointmentDate: Date,
    appointmentTime: string,
    durationMinutes: number,
    language: Language = 'en',
    location = 'MärchenNails, Musterstraße 123, 10115 Berlin'
  ): string {
    try {
      const t = translations[language];

      const [hours, minutes] = appointmentTime.split(':').map(Number);
      const startTime = new Date(appointmentDate);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = addMinutes(startTime, durationMinutes);

      const formatYahooDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
      };

      const startDateFormatted = formatYahooDate(startTime);
      const endDateFormatted = formatYahooDate(endTime);

      const summary = `${t['calendar']['appointment']}: ${serviceName}`;
      const description = `${t['email']['appointmentDetails']} - ${serviceName} ${t['calendar']['with']} MärchenNails`;

      const baseUrl = 'https://calendar.yahoo.com/';
      const params = new URLSearchParams({
        title: summary,
        st: startDateFormatted,
        et: endDateFormatted,
        desc: description,
        in_loc: location,
      });

      return `${baseUrl}?${params.toString()}`;
    } catch (err: unknown) {
      console.error('Error generating Yahoo link:', err instanceof Error ? err.message : String(err));
      return '';
    }
  },

  /**
   * Generate event data for calendar integration and email attachments
   */
  async generateEventData(eventData: EventData): Promise<CalendarEvent> {
    try {
      const appointmentDate = parseISO(eventData.date);
      const appointmentTime = eventData.startTime;
      const language = eventData.language || 'en';

      const icsFileContent = this.generateIcsFile(
        eventData.serviceName,
        appointmentDate,
        appointmentTime,
        eventData.duration,
        language,
        eventData.businessAddress
      );

      const googleCalendarLink = this.generateGoogleCalendarLink(
        eventData.serviceName,
        appointmentDate,
        appointmentTime,
        eventData.duration,
        language,
        eventData.businessAddress
      );

      const outlookLink = this.generateOutlookLink(
        eventData.serviceName,
        appointmentDate,
        appointmentTime,
        eventData.duration,
        language,
        eventData.businessAddress
      );

      const yahooLink = this.generateYahooLink(
        eventData.serviceName,
        appointmentDate,
        appointmentTime,
        eventData.duration,
        language,
        eventData.businessAddress
      );

      const appleCalendarLink = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsFileContent)}`;

      return {
        icsFileContent,
        googleCalendarLink,
        outlookLink,
        yahooLink,
        appleCalendarLink,
      };
    } catch (err: unknown) {
      console.error('Error generating event data:', err instanceof Error ? err.message : String(err));
      return {
        icsFileContent: '',
        googleCalendarLink: '',
        outlookLink: '',
        yahooLink: '',
        appleCalendarLink: '',
      };
    }
  },

  /**
   * Find all available staff members for a given service and time slot
   */
  async findAvailableStaffForTime(
    date: string,
    timeSlot: string,
    serviceId: string
  ): Promise<string | null> {
    try {
      const { data: qualifiedStaff, error: staffError } = await (supabase
        .from('staff_services')
        .select('staff_id') as unknown as PostgrestQuery<{ staff_id: string }>)
        .eq('service_id', serviceId);

      if (staffError || !qualifiedStaff || qualifiedStaff.length === 0) {
        console.error('Error fetching qualified staff:', staffError);
        return null;
      }

      const staffIds = qualifiedStaff.map((staff: { staff_id: string }) => staff.staff_id);

      const startTime = `${date}T${timeSlot}`;

      const { data: serviceData, error: serviceError } = await (supabase
        .from('services')
        .select('duration') as unknown as PostgrestQuery<{ duration: number }>)
        .eq('id', serviceId)
        .single();

      if (serviceError || !serviceData) {
        console.error('Error fetching service duration:', serviceError);
        return null;
      }

      const startDateTime = new Date(startTime);
      const endDateTime = new Date(startDateTime.getTime() + serviceData.duration * 60000);
      const endTime = endDateTime.toISOString();

      const { data: appointments, error: appointmentsError } = await (supabase
        .from('appointments')
        .select('staff_id') as unknown as PostgrestQuery<{ staff_id: string }>)
        .in('staff_id', staffIds)
        .lte('start_time', endTime)
        .gte('end_time', startTime)
        .in('status', ['confirmed', 'pending']);

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        return null;
      }

      const busyStaffIds = new Set(appointments?.map((appointment: { staff_id: string }) => appointment.staff_id) || []);
      const availableStaffIds = staffIds.filter((id: string) => !busyStaffIds.has(id));

      return availableStaffIds.length > 0 ? availableStaffIds[0] : null;
    } catch (error) {
      console.error('Error finding available staff:', error);
      return null;
    }
  },

  /**
   * Check if a time slot is available for booking
   */
  async isTimeSlotAvailable(
    date: string,
    time: string,
    serviceId: string,
    staffId?: string
  ): Promise<boolean> {
    try {
      const serviceQuery = supabase
        .from('services')
        .select('duration') as unknown as PostgrestQuery<{ duration: number }>;

      const finalServiceQuery = serviceQuery.eq('id', serviceId);

      const { data: serviceData, error: serviceError } = await finalServiceQuery;

      if (serviceError || !serviceData || serviceData.length === 0) {
        console.error('Error fetching service duration:', serviceError);
        return false;
      }

      const serviceDuration = serviceData[0].duration;

      // Calculate appointment start and end time
      const [hours, minutes] = time.split(':').map(Number);
      const startTime = new Date(date);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime.getTime());
      endTime.setMinutes(endTime.getMinutes() + serviceDuration);

      const query = supabase
        .from('appointments')
        .select('id') as unknown as PostgrestQuery<{ id: string }>;

      // Build the query with proper type assertions at each step
      const query1 = query.gte('start_time', startTime.toISOString());
      const query2 = query1.lt('start_time', endTime.toISOString());
      const query3 = query2.in('status', ['pending', 'confirmed']);

      // If staff ID provided, check only that staff member's availability
      const finalQuery = staffId ? (query3 as PostgrestQuery<{ id: string }>).eq('staff_id', staffId) : query3;

      const { data: existingAppointments, error: appointmentError } = await finalQuery;

      if (appointmentError) {
        console.error('Error checking appointment availability:', appointmentError);
        return false;
      }

      // If any appointments exist in this slot, it's not available
      return existingAppointments ? existingAppointments.length === 0 : true;
    } catch (err: unknown) {
      console.error('Error checking time slot availability:', err instanceof Error ? err.message : String(err));
      return false;
    }
  },

  /**
   * Automatically assign staff to a booking based on availability
   */
  async autoAssignStaff(bookingData: BookingFormData): Promise<string | null> {
    try {
      const appointmentDate = typeof bookingData.date === 'string' ? parseISO(bookingData.date) : new Date(bookingData.date);

      const staffId = await this.findAvailableStaffForTime(appointmentDate.toISOString().split('T')[0], bookingData.time, bookingData.serviceId).then((staff) => staff || null);

      return staffId;
    } catch (err) {
      console.error('Error auto-assigning staff:', err);
      return null;
    }
  },

  /**
   * Get a booking summary for display
   */
  async getBookingSummary(bookingId: string, language: Language = 'en'): Promise<BookingSummary | null> {
    try {
      const bookingQuery = supabase
        .from('guest_bookings')
        .select('*, service:service_id(*), staff:staff_id(*)') as unknown as PostgrestQuery<{
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          date: string;
          start_time: string;
          service: { id: string; name: string; duration: number };
          staff: { id: string; first_name: string; last_name: string };
        }>;

      const { data: bookingData, error: bookingError } = await bookingQuery.eq('id', bookingId);

      if (bookingError || !bookingData || bookingData.length === 0) {
        console.error('Error fetching booking data:', bookingError);
        return null;
      }

      const booking = bookingData[0];

      const dateObj = parseISO(booking.date);
      const formattedDate = format(
        dateObj,
        'PPPP',
        { locale: language === 'de' ? de : language === 'es' ? es : undefined }
      );

      const startTime = parseISO(`${booking.date}T${booking.start_time}`);
      const endTime = addMinutes(startTime, booking.service.duration);
      const formattedEndTime = format(endTime, 'HH:mm');

      return {
        id: booking.id,
        customerName: `${booking.first_name} ${booking.last_name}`,
        email: booking.email,
        phone: booking.phone,
        date: formattedDate,
        time: `${booking.start_time} - ${formattedEndTime}`,
        service: booking.service.name,
        staff: `${booking.staff.first_name} ${booking.staff.last_name}`,
      };
    } catch (err) {
      console.error('Error getting booking summary:', err);
      return null;
    }
  },

  /**
   * Get dates with available time slots
   * @param {Language} [language='en'] - Display language for dates
   * @returns {Promise<string[]>} Array of available dates formatted as strings
   */
  getAvailableDates: async function(language: Language = 'en'): Promise<string[]> {
    return [
      format(addDays(new Date(), 1), 'PPPP', { locale: language === 'de' ? de : language === 'es' ? es : enUS }),
      format(addDays(new Date(), 2), 'PPPP', { locale: language === 'de' ? de : language === 'es' ? es : enUS }),
      format(addDays(new Date(), 3), 'PPPP', { locale: language === 'de' ? de : language === 'es' ? es : enUS })
    ];
  },

  /**
   * Format date and time strings based on the selected language
   */
  formatDateTime(date: string, time: string, language: Language): { date: string; time: string } {
    try {
      const parsedDate = parseISO(date);
      const [hours, minutes] = time.split(':').map(Number);
      parsedDate.setHours(hours, minutes, 0, 0);

      let formattedDate = '';
      let formattedTime = '';

      if (language === 'de') {
        formattedDate = format(parsedDate, 'dd. MMMM yyyy', { locale: de });
        formattedTime = format(parsedDate, 'HH:mm', { locale: de });
      } else if (language === 'es') {
        formattedDate = format(parsedDate, 'dd \'de\' MMMM yyyy', { locale: es });
        formattedTime = format(parsedDate, 'HH:mm', { locale: es });
      } else {
        formattedDate = format(parsedDate, 'MMMM dd, yyyy');
        formattedTime = format(parsedDate, 'h:mm a');
      }

      return { date: formattedDate, time: formattedTime };
    } catch (err) {
      console.error('Error formatting date and time:', err);
      return { date, time };
    }
  },

  /**
   * Get the salon's working hours
   * @returns {Promise<WorkingHours>} Working hours for each day of the week
   */
  getSalonWorkingHours: async function(): Promise<WorkingHours> {
    try {
      const { data, error } = await (supabase
        .from('business_settings')
        .select('working_hours') as unknown as PostgrestQuery<{ working_hours: WorkingHours }>)
        .single();
        
      if (error) {
        console.error('Error fetching working hours:', error);
        return mockWorkingHours;
      }
      
      return data?.working_hours || mockWorkingHours;
    } catch (error) {
      console.error('Error in getSalonWorkingHours:', error);
      return mockWorkingHours;
    }
  },
};
