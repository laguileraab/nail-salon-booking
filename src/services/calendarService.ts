import { supabase } from '../lib/supabase';
import { format, addMinutes, parseISO } from 'date-fns';
import { de, es } from 'date-fns/locale';
import type { BookingFormData } from './bookingService';
import { translations, Language } from '../types/language.types';

interface EventData {
  serviceId: string;
  serviceName: string;
  date: Date;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
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

/**
 * Service for handling calendar integrations and appointment scheduling
 */
export const calendarService = {
  /**
   * Get the appropriate locale for date-fns based on language
   * @private
   */
  _getLocale(language: Language = 'en') {
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
      
      // Parse the appointment time
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      const startTime = new Date(appointmentDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      // Calculate end time based on service duration
      const endTime = addMinutes(startTime, durationMinutes);
      
      // Format dates for ICS file
      const formatIcsDate = (date: Date) => {
        return format(date, "yyyyMMdd'T'HHmmss'Z'");
      };
      
      const startDateFormatted = formatIcsDate(startTime);
      const endDateFormatted = formatIcsDate(endTime);
      const now = formatIcsDate(new Date());
      
      // Build the ICS content
      const summary = `${t['calendar.appointment']}: ${serviceName}`;
      const description = `${t['email.appointmentDetails']} - ${serviceName} ${t['calendar.with']} MärchenNails`;
      
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
        `DESCRIPTION:${t['calendar.reminder']}`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
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
      
      // Parse the appointment time
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      const startTime = new Date(appointmentDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      // Calculate end time based on service duration
      const endTime = addMinutes(startTime, durationMinutes);
      
      // Format dates for Google Calendar
      const formatGoogleDate = (date: Date) => {
        // Format to ISO 8601 format
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
      };
      
      const startDateFormatted = formatGoogleDate(startTime);
      const endDateFormatted = formatGoogleDate(endTime);
      
      // Build the URL
      const summary = `${t['calendar.appointment']}: ${serviceName}`;
      const description = `${t['email.appointmentDetails']} - ${serviceName} ${t['calendar.with']} MärchenNails`;
      
      const baseUrl = 'https://www.google.com/calendar/render';
      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: summary,
        dates: `${startDateFormatted}/${endDateFormatted}`,
        details: description,
        location,
        sf: 'true',
        output: 'xml'
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
      
      // Parse the appointment time
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      const startTime = new Date(appointmentDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      // Calculate end time based on service duration
      const endTime = addMinutes(startTime, durationMinutes);
      
      // Format dates for Outlook
      const formatOutlookDate = (date: Date) => {
        return date.toISOString();
      };
      
      const startDateFormatted = formatOutlookDate(startTime);
      const endDateFormatted = formatOutlookDate(endTime);
      
      // Build the URL
      const summary = `${t['calendar.appointment']}: ${serviceName}`;
      const description = `${t['email.appointmentDetails']} - ${serviceName} ${t['calendar.with']} MärchenNails`;
      
      const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
      const params = new URLSearchParams({
        subject: summary,
        startdt: startDateFormatted,
        enddt: endDateFormatted,
        body: description,
        location,
        path: '/calendar/action/compose'
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
      
      // Parse the appointment time
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      const startTime = new Date(appointmentDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      // Calculate end time based on service duration
      const endTime = addMinutes(startTime, durationMinutes);
      
      // Format dates for Yahoo Calendar
      const formatYahooDate = (date: Date) => {
        // Format to ISO 8601 format needed for Yahoo
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
      };
      
      const startDateFormatted = formatYahooDate(startTime);
      const endDateFormatted = formatYahooDate(endTime);
      
      // Build the URL
      const summary = `${t['calendar.appointment']}: ${serviceName}`;
      const description = `${t['email.appointmentDetails']} - ${serviceName} ${t['calendar.with']} MärchenNails`;
      
      const baseUrl = 'https://calendar.yahoo.com/';
      const params = new URLSearchParams({
        title: summary,
        st: startDateFormatted,
        et: endDateFormatted,
        desc: description,
        in_loc: location
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
      const appointmentDate = new Date(eventData.date);
      const appointmentTime = `${eventData.startHour.toString().padStart(2, '0')}:${eventData.startMinute.toString().padStart(2, '0')}`;
      const language = eventData.language || 'en';
      
      // Generate ICS file content
      const icsFileContent = this.generateIcsFile(
        eventData.serviceName,
        appointmentDate,
        appointmentTime,
        eventData.durationMinutes,
        language,
        eventData.businessAddress
      );
      
      // Generate Google Calendar link
      const googleCalendarLink = this.generateGoogleCalendarLink(
        eventData.serviceName,
        appointmentDate,
        appointmentTime,
        eventData.durationMinutes,
        language,
        eventData.businessAddress
      );
      
      // Generate Outlook link
      const outlookLink = this.generateOutlookLink(
        eventData.serviceName,
        appointmentDate,
        appointmentTime,
        eventData.durationMinutes,
        language,
        eventData.businessAddress
      );
      
      // Generate Yahoo link
      const yahooLink = this.generateYahooLink(
        eventData.serviceName,
        appointmentDate,
        appointmentTime,
        eventData.durationMinutes,
        language,
        eventData.businessAddress
      );
      
      // Apple Calendar uses the same ICS file
      const appleCalendarLink = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsFileContent)}`;
      
      return {
        icsFileContent,
        googleCalendarLink,
        outlookLink,
        yahooLink,
        appleCalendarLink
      };
    } catch (err: unknown) {
      console.error('Error generating event data:', err instanceof Error ? err.message : String(err));
      return {
        icsFileContent: '',
        googleCalendarLink: '',
        outlookLink: '',
        yahooLink: '',
        appleCalendarLink: ''
      };
    }
  },
  
  /**
   * Check if a time slot is available based on staff and business constraints
   */
  async isTimeSlotAvailable(
    staffId: string,
    serviceId: string,
    appointmentDate: Date,
    appointmentTime: string
  ): Promise<boolean> {
    try {
      // Get service duration
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('duration')
        .eq('id', serviceId)
        .single();
        
      if (serviceError || !serviceData) {
        console.error('Error fetching service details:', serviceError);
        return false;
      }
      
      // Parse the time string and create Date objects for start and end time
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      const startTime = new Date(appointmentDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      // Calculate end time based on service duration
      const endTime = addMinutes(startTime, serviceData.duration);
      
      // Format dates for database query
      const startDateFormatted = startTime.toISOString();
      const endDateFormatted = endTime.toISOString();
      
      // Check if there are any appointments that overlap with the requested time slot
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .eq('staff_id', staffId)
        .lte('start_time', endDateFormatted) // Appointment starts before our end time
        .gte('end_time', startDateFormatted)   // Appointment ends after our start time
        .not('status', 'eq', 'cancelled');
      
      if (appointmentsError) {
        console.error('Error checking appointment availability:', appointmentsError);
        return false;
      }
      
      // If there are no overlapping appointments, the time slot is available
      return appointments.length === 0;
    } catch (err: unknown) {
      console.error('Error checking time slot availability:', err instanceof Error ? err.message : String(err));
      return false;
    }
  },
  
  /**
   * Find the next available staff member for a service at the requested time
   */
  async findAvailableStaffForTime(
    serviceId: string,
    appointmentDate: Date,
    appointmentTime: string
  ): Promise<string | null> {
    try {
      // Get staff members who can perform this service
      const { data: staffData, error: staffError } = await supabase
        .from('staff_services')
        .select('staff_id')
        .eq('service_id', serviceId);
      
      if (staffError || !staffData || staffData.length === 0) {
        console.error('Error finding staff for service:', staffError || 'No staff available');
        return null;
      }
      
      // Check each staff member's availability
      for (const staff of staffData) {
        const isAvailable = await this.isTimeSlotAvailable(
          staff.staff_id,
          serviceId,
          appointmentDate,
          appointmentTime
        );
        
        if (isAvailable) {
          return staff.staff_id;
        }
      }
      
      // No available staff found
      return null;
    } catch (err: unknown) {
      console.error('Error finding available staff:', err instanceof Error ? err.message : String(err));
      return null;
    }
  },
  
  /**
   * Automatically assign staff to a booking based on availability
   */
  async autoAssignStaff(bookingData: BookingFormData): Promise<string | null> {
    try {
      // Parse the booking date
      const appointmentDate = typeof bookingData.appointmentDate === 'string' 
        ? parseISO(bookingData.appointmentDate) 
        : new Date(bookingData.appointmentDate);
      
      // Find available staff for the selected service and time
      const staffId = await this.findAvailableStaffForTime(
        bookingData.serviceId,
        appointmentDate,
        bookingData.appointmentTime
      );
      
      return staffId;
    } catch (err: unknown) {
      console.error('Error auto-assigning staff:', err instanceof Error ? err.message : String(err));
      return null;
    }
  }
};
