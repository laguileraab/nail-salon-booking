import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FiCalendar, FiClock, FiDollarSign, FiClock as FiDuration } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  image_url?: string;
};

type TimeSlot = {
  time: string;
  available: boolean;
};

const Bookings = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('price', { ascending: true });

        if (error) throw error;
        setServices(data || []);
      } catch (error: any) {
        console.error('Error fetching services:', error.message);
        toast.error('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Generate time slots
  useEffect(() => {
    if (!selectedDate || !selectedService) return;

    const fetchTimeSlots = async () => {
      setIsLoading(true);
      try {
        // Business hours: 9am to 6pm
        const businessHours = {
          start: 9, // 9 AM
          end: 18, // 6 PM
        };

        // Generate time slots in 30-minute intervals
        const slots: TimeSlot[] = [];
        const serviceDuration = selectedService.duration;
        const slotInterval = 30; // minutes

        // Format the date for query
        const startDate = new Date(`${selectedDate}T00:00:00`);
        const endDate = new Date(`${selectedDate}T23:59:59`);

        // Get booked slots from the database
        const { data: bookedSlots, error } = await supabase
          .from('appointments')
          .select('start_time, services:service_id (duration)')
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString())
          .eq('status', 'scheduled');

        if (error) throw error;

        // Create a map of unavailable times
        const unavailableTimes = new Map();
        bookedSlots?.forEach((booking: any) => {
          const startTime = new Date(booking.start_time);
          const endTime = new Date(startTime.getTime() + booking.services.duration * 60 * 1000);
          
          // Mark all 30-minute slots within the appointment duration as unavailable
          let currentSlot = new Date(startTime);
          while (currentSlot < endTime) {
            unavailableTimes.set(
              `${currentSlot.getHours().toString().padStart(2, '0')}:${currentSlot.getMinutes().toString().padStart(2, '0')}`,
              true
            );
            currentSlot = new Date(currentSlot.getTime() + slotInterval * 60 * 1000);
          }
        });

        // Generate available time slots
        for (let hour = businessHours.start; hour < businessHours.end; hour++) {
          for (let minute = 0; minute < 60; minute += slotInterval) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            // Check if this slot can accommodate the service duration
            let isAvailable = true;
            const startDateTime = new Date(`${selectedDate}T${timeString}:00`);
            const endDateTime = new Date(startDateTime.getTime() + serviceDuration * 60 * 1000);
            
            // Don't offer slots that end after business hours
            if (endDateTime.getHours() >= businessHours.end) {
              continue;
            }

            // Check if any part of the service duration overlaps with unavailable times
            let checkTime = new Date(startDateTime);
            while (checkTime < endDateTime) {
              const checkTimeString = `${checkTime.getHours().toString().padStart(2, '0')}:${checkTime.getMinutes().toString().padStart(2, '0')}`;
              if (unavailableTimes.has(checkTimeString)) {
                isAvailable = false;
                break;
              }
              checkTime = new Date(checkTime.getTime() + slotInterval * 60 * 1000);
            }

            slots.push({
              time: timeString,
              available: isAvailable
            });
          }
        }

        setAvailableTimeSlots(slots);
      } catch (error: any) {
        console.error('Error generating time slots:', error.message);
        toast.error('Failed to load available times');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate, selectedService]);

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setSelectedTimeSlot('');
  };

  const handleSelectTimeSlot = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3 && validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!selectedService) {
          toast.error('Please select a service');
          return false;
        }
        return true;
      case 2:
        if (!selectedDate) {
          toast.error('Please select a date');
          return false;
        }
        if (!selectedTimeSlot) {
          toast.error('Please select a time slot');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep() || !profile?.id || !selectedService || !selectedDate || !selectedTimeSlot) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Format the appointment date and time
      const appointmentDateTime = new Date(`${selectedDate}T${selectedTimeSlot}:00`);

      // Create the appointment
      const { data, error } = await supabase.from('appointments').insert([
        {
          user_id: profile.id,
          service_id: selectedService.id,
          start_time: appointmentDateTime.toISOString(),
          status: 'scheduled',
        },
      ]).select();

      if (error) throw error;

      toast.success('Appointment booked successfully!');
      navigate('/client/dashboard');
    } catch (error: any) {
      console.error('Error booking appointment:', error.message);
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderServiceSelection = () => (
    <div className="space-y-6">
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Select a Service</h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Choose the service you'd like to book an appointment for.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.id}
            className={`relative rounded-lg border ${selectedService?.id === service.id ? 'border-accent-500 ring-2 ring-accent-500' : 'border-gray-300'} bg-white px-6 py-5 shadow-sm flex flex-col space-y-3 hover:border-accent-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent-500 cursor-pointer`}
            onClick={() => handleSelectService(service)}
          >
            <div className="flex-shrink-0">
              {service.image_url ? (
                <img
                  className="h-10 w-10 rounded-full"
                  src={service.image_url}
                  alt={service.name}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-accent-100 flex items-center justify-center">
                  <span className="text-accent-600 font-medium">{service.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-medium text-gray-900">{service.name}</h4>
              <p className="text-sm text-gray-500 line-clamp-2">{service.description}</p>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-gray-500">
                <FiDuration className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                {service.duration} min
              </div>
              <div className="flex items-center text-sm font-medium text-accent-600">
                <FiDollarSign className="flex-shrink-0 mr-1 h-4 w-4" />
                {service.price.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDateTimeSelection = () => (
    <div className="space-y-6">
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Select Date & Time</h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Choose an available date and time slot for your {selectedService?.name} appointment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiCalendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="date"
              name="date"
              id="date"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={handleDateChange}
              className="focus:ring-accent-500 focus:border-accent-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Available Time Slots</label>
          
          {isLoading ? (
            <div className="text-center py-4">Loading available time slots...</div>
          ) : availableTimeSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {availableTimeSlots.map((slot, index) => (
                <button
                  key={index}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => slot.available && handleSelectTimeSlot(slot.time)}
                  className={`inline-flex items-center justify-center px-2.5 py-1.5 border text-xs font-medium rounded shadow-sm ${selectedTimeSlot === slot.time ? 'border-accent-500 bg-accent-50 text-accent-700' : slot.available ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50' : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  <FiClock
                    className={`mr-1 h-4 w-4 ${selectedTimeSlot === slot.time ? 'text-accent-500' : slot.available ? 'text-gray-400' : 'text-gray-300'}`}
                    aria-hidden="true"
                  />
                  {formatTime(slot.time)}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No available time slots for this date. Please select another date.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Confirm Your Appointment</h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Please review your appointment details before confirming.
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Appointment Summary</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Service</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedService?.name}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Time</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatTime(selectedTimeSlot)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Duration</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedService?.duration} minutes</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Price</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${selectedService?.price.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FiCalendar className="h-6 w-6 text-accent-500" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">Appointment Policy</h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>Please arrive 10 minutes before your scheduled appointment time. If you need to cancel or reschedule, please do so at least 24 hours in advance to avoid a cancellation fee.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Book an Appointment</h1>
      </div>

      {/* Progress Steps */}
      <div className="py-6">
        <nav aria-label="Progress">
          <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
            <li className="md:flex-1">
              <button
                onClick={() => setCurrentStep(1)}
                className="group pl-4 py-2 flex flex-col border-l-4 md:border-l-0 md:pl-0 md:pt-4 md:pb-0 border-accent-600 md:border-t-4 focus:outline-none"
              >
                <span className="text-xs text-accent-600 font-semibold tracking-wide uppercase">Step 1</span>
                <span className="text-sm font-medium">Select Service</span>
              </button>
            </li>

            <li className="md:flex-1">
              <button
                onClick={() => selectedService && setCurrentStep(2)}
                disabled={!selectedService}
                className={`group pl-4 py-2 flex flex-col border-l-4 md:border-l-0 md:pl-0 md:pt-4 md:pb-0 ${currentStep >= 2 ? 'border-accent-600 md:border-t-4' : 'border-gray-200 md:border-t-4'} focus:outline-none ${!selectedService && 'cursor-not-allowed opacity-50'}`}
              >
                <span className={`text-xs font-semibold tracking-wide uppercase ${currentStep >= 2 ? 'text-accent-600' : 'text-gray-500'}`}>Step 2</span>
                <span className="text-sm font-medium">Choose Date & Time</span>
              </button>
            </li>

            <li className="md:flex-1">
              <button
                onClick={() => selectedService && selectedDate && selectedTimeSlot && setCurrentStep(3)}
                disabled={!selectedService || !selectedDate || !selectedTimeSlot}
                className={`group pl-4 py-2 flex flex-col border-l-4 md:border-l-0 md:pl-0 md:pt-4 md:pb-0 ${currentStep >= 3 ? 'border-accent-600 md:border-t-4' : 'border-gray-200 md:border-t-4'} focus:outline-none ${(!selectedService || !selectedDate || !selectedTimeSlot) && 'cursor-not-allowed opacity-50'}`}
              >
                <span className={`text-xs font-semibold tracking-wide uppercase ${currentStep >= 3 ? 'text-accent-600' : 'text-gray-500'}`}>Step 3</span>
                <span className="text-sm font-medium">Confirm</span>
              </button>
            </li>
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="py-6">
        {currentStep === 1 && renderServiceSelection()}
        {currentStep === 2 && renderDateTimeSelection()}
        {currentStep === 3 && renderConfirmation()}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookings;
