import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export type BookingFormData = {
  serviceId: string;
  staffId?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  // For guest bookings
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  // For user bookings
  userId?: string;
};

export type GuestBooking = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  service_id: string;
  staff_id?: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  confirmation_code: string;
};

export type Appointment = {
  client_id: string;
  service_id: string;
  staff_id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
};

export type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
};

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
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('duration')
        .eq('id', bookingData.serviceId)
        .single();

      if (serviceError || !serviceData) {
        console.error('Error fetching service:', serviceError);
        return { success: false, error: 'Failed to fetch service details' };
      }

      // Parse the time string and create a Date object for appointment
      const [hours, minutes] = bookingData.appointmentTime.split(':').map(Number);
      const appointmentDate = new Date(bookingData.appointmentDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      // Generate a unique confirmation code
      const confirmationCode = generateConfirmationCode();
      
      // Format data for insertion
      const guestBookingData: GuestBooking = {
        first_name: bookingData.firstName || '',
        last_name: bookingData.lastName || '',
        email: bookingData.email || '',
        phone: bookingData.phone || '',
        service_id: bookingData.serviceId,
        staff_id: bookingData.staffId || undefined,
        appointment_date: format(appointmentDate, 'yyyy-MM-dd'),
        appointment_time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`,
        duration_minutes: serviceData.duration,
        status: 'pending',
        notes: bookingData.notes || null,
        confirmation_code: confirmationCode
      };

      // Insert the booking into the guest_bookings table
      const { data, error } = await supabase
        .from('guest_bookings')
        .insert(guestBookingData)
        .select('id')
        .single();

      if (error) {
        console.error('Error creating guest booking:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    } catch (err: unknown) {
      console.error('Unexpected error in createGuestBooking:', err instanceof Error ? err.message : String(err));
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  /**
   * Create a new booking for an authenticated user
   */
  async createUserBooking(bookingData: BookingFormData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      if (!bookingData.userId) {
        return { success: false, error: 'User ID is required for registered user bookings' };
      }

      // Get the service details to calculate end time
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('duration')
        .eq('id', bookingData.serviceId)
        .single();

      if (serviceError || !serviceData) {
        console.error('Error fetching service:', serviceError);
        return { success: false, error: 'Failed to fetch service details' };
      }

      // Parse the time string and create Date objects for start and end time
      const [hours, minutes] = bookingData.appointmentTime.split(':').map(Number);
      const startTime = new Date(bookingData.appointmentDate);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime.getTime());
      endTime.setMinutes(endTime.getMinutes() + serviceData.duration);

      // Format data for insertion
      const appointmentData: Appointment = {
        client_id: bookingData.userId,
        service_id: bookingData.serviceId,
        staff_id: bookingData.staffId || '', // Handle staff assignment logic
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'pending',
        notes: bookingData.notes || null
      };

      // Insert the booking into the appointments table
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select('id')
        .single();

      if (error) {
        console.error('Error creating user booking:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
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
      const { data: settingsData } = await supabase
        .from('business_settings')
        .select('working_hours, appointment_buffer')
        .single();

      if (!settingsData) {
        console.error('Business settings not found');
        return [];
      }

      // Get the day of the week
      const dayOfWeek = format(date, 'EEEE').toLowerCase();
      
      // Parse the working hours for this day
      const workingHours = settingsData.working_hours;
      const dayHours = workingHours[dayOfWeek] || { open: false, start: '', end: '' };
      
      if (!dayHours.open) {
        // Business is closed on this day
        return [];
      }
      
      // Convert working hours to time slots
      const timeSlots: { hour: number; minute: number; available: boolean; staffId?: string }[] = [];
      
      // Parse start and end hours
      const [startHour, startMinute] = dayHours.start.split(':').map(Number);
      const [endHour, endMinute] = dayHours.end.split(':').map(Number);
      
      // Get the selected service details
      const { data: serviceData } = await supabase
        .from('services')
        .select('duration')
        .eq('id', serviceId)
        .single();
      
      if (!serviceData) {
        console.error('Service not found');
        return [];
      }
      
      const serviceDuration = serviceData.duration || 60; // Default to 60 minutes if not specified
      const appointmentBuffer = settingsData.appointment_buffer || 0;
      const totalDuration = serviceDuration + appointmentBuffer;
      
      // Generate time slots at 15-minute intervals within working hours
      let currentHour = startHour;
      let currentMinute = startMinute;
      
      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMinute <= endMinute - totalDuration)
      ) {
        // Create a time slot
        timeSlots.push({
          hour: currentHour,
          minute: currentMinute,
          available: true, // Default to available, will be updated below
          staffId: staffId
        });
        
        // Move to the next slot (15 min intervals)
        currentMinute += 15;
        if (currentMinute >= 60) {
          currentHour += 1;
          currentMinute = 0;
        }
      }
      
      // If a staff ID is provided, check their availability
      if (staffId) {
        // Check existing appointments for this staff on this date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const { data: appointments } = await supabase
          .from('appointments')
          .select('start_time, end_time')
          .eq('staff_id', staffId)
          .gte('start_time', startOfDay.toISOString())
          .lte('start_time', endOfDay.toISOString())
          .in('status', ['pending', 'confirmed']);
        
        if (appointments && appointments.length > 0) {
          // Mark slots as unavailable if they overlap with existing appointments
          for (const appointment of appointments) {
            const appointmentStart = new Date(appointment.start_time);
            const appointmentEnd = new Date(appointment.end_time);
            
            timeSlots.forEach((slot, index) => {
              const slotStart = new Date(date);
              slotStart.setHours(slot.hour, slot.minute, 0, 0);
              
              const slotEnd = new Date(slotStart);
              slotEnd.setMinutes(slotEnd.getMinutes() + totalDuration);
              
              // Check if this slot overlaps with the appointment
              if (
                (slotStart >= appointmentStart && slotStart < appointmentEnd) ||
                (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
                (slotStart <= appointmentStart && slotEnd >= appointmentEnd)
              ) {
                timeSlots[index].available = false;
              }
            });
          }
        }
      }
      
      return timeSlots;
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
      const { data, error } = await supabase
        .from('staff_services')
        .select('staff_id, staff:staff_id(id, first_name, last_name)')
        .eq('service_id', serviceId);

      if (error || !data) {
        console.error('Error fetching available staff:', error);
        return [];
      }

      // Format the response using a type assertion to handle the Supabase join result structure
      return data.map(item => {
        // Cast the staff object to the expected structure
        const staff = item.staff as unknown as { id: string; first_name: string; last_name: string };
        return {
          id: staff.id,
          name: `${staff.first_name} ${staff.last_name}`
        };
      });
    } catch (err: unknown) {
      console.error('Error in getAvailableStaffForService:', err instanceof Error ? err.message : String(err));
      return [];
    }
  },

  /**
   * Get all services offered by the salon
   */
  async getServices(): Promise<{ id: string; name: string; price: number; duration: number; description: string; category: string }[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, price, duration, description, category')
        .eq('is_active', true)
        .order('category');

      if (error) {
        console.error('Error fetching services:', error);
        return [];
      }

      return data;
    } catch (err: unknown) {
      console.error('Error in getServices:', err instanceof Error ? err.message : String(err));
      return [];
    }
  },

  /**
   * Get a specific service by ID
   */
  async getServiceById(serviceId: string): Promise<{ id: string; name: string; price: number; duration: number; description: string; category: string } | null> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, price, duration, description, category')
        .eq('id', serviceId)
        .single();

      if (error) {
        console.error('Error fetching service by ID:', error);
        return null;
      }

      return data;
    } catch (err: unknown) {
      console.error('Error in getServiceById:', err instanceof Error ? err.message : String(err));
      return null;
    }
  },

  /**
   * Get user profile data
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (err: unknown) {
      console.error('Error in getUserProfile:', err instanceof Error ? err.message : String(err));
      return null;
    }
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, isGuest: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      let error;

      if (isGuest) {
        // Cancel a guest booking
        const { error: cancelError } = await supabase
          .from('guest_bookings')
          .update({ status: 'cancelled' })
          .eq('id', bookingId);

        error = cancelError;
      } else {
        // Cancel a user booking
        const { error: cancelError } = await supabase
          .from('appointments')
          .update({ status: 'cancelled' })
          .eq('id', bookingId);

        error = cancelError;
      }

      if (error) {
        console.error('Error cancelling booking:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      console.error('Unexpected error in cancelBooking:', err instanceof Error ? err.message : String(err));
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  /**
   * Get booking details by confirmation code (for guest bookings)
   */
  async getBookingByConfirmationCode(code: string): Promise<GuestBooking | null> {
    try {
      const { data, error } = await supabase
        .from('guest_bookings')
        .select('*')
        .eq('confirmation_code', code)
        .single();

      if (error) {
        console.error('Error fetching booking by confirmation code:', error);
        return null;
      }

      return data;
    } catch (err: unknown) {
      console.error('Error in getBookingByConfirmationCode:', err instanceof Error ? err.message : String(err));
      return null;
    }
  }
};

/**
 * Generate a random confirmation code for guest bookings
 */
function generateConfirmationCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
