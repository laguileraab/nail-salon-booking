/**
 * Services for managing bookings with Supabase
 */
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { createClient, PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';

// Create a properly typed Supabase client
const typedClient = supabase as unknown as ReturnType<typeof createClient>;

// Type for working hours configuration
interface WorkingHoursConfig {
  [day: string]: {
    open: boolean;
    start: string;
    end: string;
  };
}

// Type for business settings
interface BusinessSettings {
  working_hours: WorkingHoursConfig;
  appointment_buffer: number;
}

// Create a simple confirmation code generator
function generateConfirmationCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit similar-looking characters
  let code = '';
  
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  
  return code;
}

// Email service mock - replace with actual implementation or import
const emailService = {
  sendBookingCancellation: async (data: { 
    to: string; 
    name: string; 
    date: string; 
    time: string;
  }): Promise<void> => {
    console.log('Sending cancellation email to:', data.to);
    // Email sending logic would go here
  }
};

/**
 * Types for booking data
 */
export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  category: string;
}

export interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bio: string;
}

export interface GuestBooking {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  appointment_date: string; // ISO date format
  appointment_time: string; // HH:MM format
  confirmation_code: string;
  service_id: string;
  staff_id: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
}

export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  serviceId: string;
  staffId: string;
  notes?: string;
}

// Type for staff with related service
interface StaffWithService {
  staff_id: string;
  staff: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

// Type for appointment data
interface AppointmentData {
  user_id: string;
  service_id: string;
  staff_id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
}

// Type for appointment with time
interface Appointment {
  start_time: string;
  end_time: string;
}

/**
 * Service for handling all booking-related operations with Supabase
 */
export const bookingService = {
  /**
   * Create a new booking for a guest (non-authenticated user)
   */
  async createGuestBooking(bookingData: BookingFormData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Get the selected service details to calculate duration
      const { data: serviceData, error: serviceError } = await typedClient
        .from('services')
        .select('duration')
        .eq('id', bookingData.serviceId)
        .single() as PostgrestSingleResponse<{ duration: number }>;

      if (serviceError || !serviceData) {
        console.error('Error fetching service:', serviceError);
        return { success: false, error: 'Failed to fetch service details' };
      }

      // Parse the time string and create a Date object for appointment
      const [hours, minutes] = bookingData.time.split(':').map(Number);
      const appointmentDate = new Date(bookingData.date);
      appointmentDate.setHours(hours, minutes, 0, 0);

      // Generate a unique confirmation code
      const confirmationCode = generateConfirmationCode();
      
      // Format data for insertion
      const guestBookingData: GuestBooking = {
        first_name: bookingData.firstName,
        last_name: bookingData.lastName,
        email: bookingData.email,
        phone: bookingData.phone,
        appointment_date: format(appointmentDate, 'yyyy-MM-dd'),
        appointment_time: bookingData.time,
        confirmation_code: confirmationCode,
        service_id: bookingData.serviceId,
        staff_id: bookingData.staffId,
        status: 'confirmed',
        notes: bookingData.notes || null,
      };

      // Insert the booking into the guest_bookings table
      // Cast to the expected type structure required by Supabase
      const { data, error } = await typedClient
        .from('guest_bookings')
        .insert([guestBookingData as unknown as Record<string, unknown>]) as PostgrestResponse<{ id: string }>;

      if (error) {
        console.error('Error creating guest booking:', error);
        return { success: false, error: error.message };
      }

      // Ensure data is properly typed
      const typedData = data as unknown as { id: string }[];
      
      // Create the appointment
      const appointmentEndTime = new Date(appointmentDate);
      appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + serviceData.duration);

      return { success: true, id: typedData[0]?.id };
    } catch (err: unknown) {
      console.error('Unexpected error in createGuestBooking:', err instanceof Error ? err.message : String(err));
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  /**
   * Create a new booking for an authenticated user
   */
  async createUserBooking(bookingData: BookingFormData, userId: string): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Get the selected service details to calculate duration
      const { data: serviceData, error: serviceError } = await typedClient
        .from('services')
        .select('duration')
        .eq('id', bookingData.serviceId)
        .single() as PostgrestSingleResponse<{ duration: number }>;

      if (serviceError || !serviceData) {
        console.error('Error fetching service:', serviceError);
        return { success: false, error: 'Failed to fetch service details' };
      }

      // Parse the time string and create a Date object for appointment
      const [hours, minutes] = bookingData.time.split(':').map(Number);
      const appointmentDate = new Date(bookingData.date);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      // Calculate end time
      const endTime = new Date(appointmentDate);
      endTime.setMinutes(endTime.getMinutes() + serviceData.duration);

      // Insert appointment
      const appointmentData: AppointmentData = {
        user_id: userId,
        service_id: bookingData.serviceId,
        staff_id: bookingData.staffId,
        start_time: appointmentDate.toISOString(),
        end_time: endTime.toISOString(),
        status: 'confirmed',
        notes: bookingData.notes || null,
      };
      
      // Cast to the expected type structure required by Supabase
      const { data, error } = await typedClient
        .from('appointments')
        .insert([appointmentData as unknown as Record<string, unknown>]) as PostgrestResponse<{ id: string }>;

      if (error) {
        console.error('Error creating appointment:', error);
        return { success: false, error: error.message };
      }

      // Ensure data is properly typed
      const typedData = data as unknown as { id: string }[];
      
      return { success: true, id: typedData[0]?.id };
    } catch (err: unknown) {
      console.error('Unexpected error in createUserBooking:', err instanceof Error ? err.message : String(err));
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  /**
   * Get available time slots for a specific date and service
   */
  async getAvailableTimeSlots(
    date: Date,
    serviceId: string,
    staffId?: string
  ): Promise<{ hour: number; minute: number; available: boolean; staffId?: string }[]> {
    try {
      // Get business settings for working hours and appointment buffer
      const { data: settingsData, error: settingsError } = await typedClient
        .from('business_settings')
        .select('working_hours, appointment_buffer')
        .single() as PostgrestSingleResponse<BusinessSettings>;

      if (settingsError || !settingsData) {
        console.error('Error fetching business settings:', settingsError);
        return [];
      }

      // Get the day of the week
      const dayOfWeek = format(date, 'EEEE').toLowerCase();
      
      // Parse the working hours for this day
      const workingHours = settingsData.working_hours;
      const dayHours = workingHours[dayOfWeek] || { open: false, start: '', end: '' };
      
      if (!dayHours.open) {
        console.info('Business is closed on this day');
        return [];
      }
      
      // Parse start and end times
      const [startHour, startMinute] = dayHours.start.split(':').map(Number);
      const [endHour, endMinute] = dayHours.end.split(':').map(Number);
      
      // Get the selected service details
      const { data: serviceData, error: serviceError } = await typedClient
        .from('services')
        .select('duration')
        .eq('id', serviceId)
        .single() as PostgrestSingleResponse<{ duration: number }>;

      if (serviceError || !serviceData) {
        console.error('Error fetching service:', serviceError);
        return [];
      }
      
      const serviceDuration = serviceData.duration;
      
      // Generate time slots based on the working hours
      const availableTimeSlots: { hour: number; minute: number; available: boolean; staffId?: string }[] = [];
      
      // Start from the opening time
      let hour = startHour;
      let minute = startMinute;
      
      while (hour < endHour || (hour === endHour && minute <= endMinute - serviceDuration)) {
        // Create a slot
        const slot = {
          hour,
          minute,
          available: true, // Initially mark all slots as available
          staffId: undefined
        };
        
        availableTimeSlots.push(slot);
        
        // Move to the next time slot (typically 15, 30, or 60 minutes depending on the business)
        minute += 30; // Example: 30-minute increments
        if (minute >= 60) {
          hour += Math.floor(minute / 60);
          minute %= 60;
        }
      }
      
      // If staff ID is provided, check that specific staff member's availability
      if (staffId) {
        // Get all appointments for this staff on the selected date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const { data: appointments, error: appointmentsError } = await typedClient
          .from('appointments')
          .select('start_time, end_time')
          .eq('staff_id', staffId)
          .gte('start_time', startOfDay.toISOString())
          .lte('start_time', endOfDay.toISOString())
          .in('status', ['pending', 'confirmed'])
          .order('start_time') as PostgrestResponse<Appointment>;

        if (appointmentsError || !appointments) {
          console.error('Error fetching appointments:', appointmentsError);
          return availableTimeSlots;
        }

        // Mark slots as unavailable if they overlap with existing appointments
        for (const appointment of appointments) {
          const startTime = parseISO(appointment.start_time);
          const endTime = parseISO(appointment.end_time);
            
          // Check each slot against this appointment
          for (const slot of availableTimeSlots) {
            const slotStartTime = new Date(date);
            slotStartTime.setHours(slot.hour, slot.minute, 0, 0);
              
            const slotEndTime = new Date(slotStartTime.getTime());
            slotEndTime.setMinutes(slotEndTime.getMinutes() + serviceDuration);
              
            // If slot overlaps with appointment, mark as unavailable
            if (
              (slotStartTime >= startTime && slotStartTime < endTime) ||
              (slotEndTime > startTime && slotEndTime <= endTime) ||
              (slotStartTime <= startTime && slotEndTime >= endTime)
            ) {
              slot.available = false;
            }
          }
        }
        
        // Assign staff to available slots
        for (const slot of availableTimeSlots) {
          if (slot.available) {
            slot.staffId = staffId;
          }
        }
      }
      
      return availableTimeSlots;
    } catch (err: unknown) {
      console.error('Error getting available time slots:', err instanceof Error ? err.message : String(err));
      return [];
    }
  },
  
  /**
   * Get all available staff members for a specific service
   */
  async getAvailableStaffForService(serviceId: string): Promise<{ id: string; name: string }[]> {
    try {
      // Get all staff members qualified for this service
      const { data, error } = await typedClient
        .from('staff_services')
        .select('staff_id, staff:staff_id(id, first_name, last_name)')
        .eq('service_id', serviceId) as PostgrestResponse<StaffWithService>;

      if (error || !data) {
        console.error('Error fetching available staff:', error);
        return [];
      }

      // Transform data to expected format
      return data.map(item => ({
        id: item.staff_id as string,
        name: `${item.staff.first_name} ${item.staff.last_name}`
      }));
    } catch (err: unknown) {
      console.error('Error getting available staff:', err instanceof Error ? err.message : String(err));
      return [];
    }
  },

  /**
   * Get all services offered by the salon
   */
  async getServices(): Promise<{ id: string; name: string; price: number; duration: number; description: string; category: string }[]> {
    try {
      const { data, error } = await typedClient
        .from('services')
        .select('id, name, price, duration, description, category')
        .eq('is_active', true)
        .order('category') as PostgrestResponse<Service>;

      if (error) {
        console.error('Error fetching services:', error);
        return [];
      }

      return data || [];
    } catch (err: unknown) {
      console.error('Error getting services:', err instanceof Error ? err.message : String(err));
      return [];
    }
  },
  
  /**
   * Get service details by ID
   */
  async getServiceById(serviceId: string): Promise<Service | null> {
    try {
      const { data, error } = await typedClient
        .from('services')
        .select('id, name, price, duration, description, category')
        .eq('id', serviceId)
        .single() as PostgrestSingleResponse<Service>;

      if (error) {
        console.error('Error fetching service:', error);
        return null;
      }

      return data;
    } catch (err: unknown) {
      console.error('Error getting service by ID:', err instanceof Error ? err.message : String(err));
      return null;
    }
  },
  
  /**
   * Get user profile data
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await typedClient
        .from('profiles')
        .select('id, first_name, last_name, email, phone, avatar_url')
        .eq('id', userId)
        .single() as PostgrestSingleResponse<UserProfile>;

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (err: unknown) {
      console.error('Error getting user profile:', err instanceof Error ? err.message : String(err));
      return null;
    }
  },
  
  /**
   * Get booking details by confirmation code
   */
  async getBookingByConfirmationCode(confirmationCode: string): Promise<{ 
    data: { 
      id: string; 
      firstName: string; 
      lastName: string; 
      email: string; 
      phone: string; 
      appointmentDate: string; 
      appointmentTime: string; 
      serviceName: string; 
      staffName: string; 
      status: string; 
      confirmationCode: string; 
    } | null; 
    error: Error | null 
  }> {
    try {
      // Get the booking and related service and staff
      const { data, error } = await typedClient
        .from('guest_bookings')
        .select('*, service:service_id(*), staff:staff_id(*)')
        .eq('confirmation_code', confirmationCode)
        .single() as PostgrestSingleResponse<{
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          appointment_date: string;
          appointment_time: string;
          confirmation_code: string;
          status: string;
          service: { name: string };
          staff: { first_name: string; last_name: string };
        }>;

      if (error) {
        console.error('Error fetching booking:', error);
        return { data: null, error };
      }

      if (!data) {
        return { data: null, error: new Error('Booking not found') };
      }
      
      // Format data for response
      return {
        data: {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          appointmentDate: data.appointment_date,
          appointmentTime: data.appointment_time,
          serviceName: data.service.name,
          staffName: `${data.staff.first_name} ${data.staff.last_name}`,
          status: data.status,
          confirmationCode: data.confirmation_code
        },
        error: null
      };
    } catch (err: unknown) {
      console.error('Error getting booking by confirmation code:', err instanceof Error ? err.message : String(err));
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },
  
  /**
   * Cancel a booking by confirmation code
   */
  async cancelBooking(confirmationCode: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the booking to verify it exists
      const bookingResult = await this.getBookingByConfirmationCode(confirmationCode);
      
      if (bookingResult.error || !bookingResult.data) {
        console.error('Error finding booking to cancel:', bookingResult.error);
        return { success: false, error: 'Booking not found' };
      }
      
      // Update the status to 'cancelled'
      const { error } = await typedClient
        .from('guest_bookings')
        .update({ status: 'cancelled' })
        .eq('confirmation_code', confirmationCode);

      if (error) {
        console.error('Error cancelling booking:', error);
        return { success: false, error: error.message };
      }
      
      // Send cancellation email
      try {
        await emailService.sendBookingCancellation({
          to: bookingResult.data.email,
          name: `${bookingResult.data.firstName} ${bookingResult.data.lastName}`,
          date: bookingResult.data.appointmentDate,
          time: bookingResult.data.appointmentTime
        });
      } catch (emailErr) {
        console.error('Error sending cancellation email:', emailErr);
        // Don't fail the operation if email fails
      }
      
      return { success: true };
    } catch (err: unknown) {
      console.error('Error cancelling booking:', err instanceof Error ? err.message : String(err));
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
};
