import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format, startOfWeek, addDays, startOfDay, addHours, isSameDay } from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiUser, FiEdit, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

type Appointment = {
  id: string;
  user_id: string;
  service_id: string;
  start_time: string;
  status: 'scheduled' | 'completed' | 'canceled';
  client?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  service?: {
    name: string;
    duration: number;
    price: number;
  };
};

const Calendar = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'day' | 'week'>('week');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch appointments data
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            id,
            user_id,
            service_id,
            start_time,
            status,
            client:profiles!appointments_user_id_fkey(first_name, last_name, email, phone),
            service:services!appointments_service_id_fkey(name, duration, price)
          `);

        if (error) throw error;
        setAppointments(data || []);
      } catch (error: any) {
        console.error('Error fetching appointments:', error.message);
        toast.error('Failed to load appointments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Navigate to previous week/day
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  // Navigate to next week/day
  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  // Set to today
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Toggle between day and week view
  const toggleView = () => {
    setView(view === 'week' ? 'day' : 'week');
  };

  // Generate week days
  const generateWeekDays = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    const days = [];

    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }

    return days;
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 19; // 7 PM

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(hour);
    }

    return slots;
  };

  // Get appointments for a specific day and hour
  const getAppointmentsForTimeSlot = (day: Date, hour: number) => {
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.start_time);
      return (
        isSameDay(appointmentDate, day) &&
        appointmentDate.getHours() === hour
      );
    });
  };

  // Format time (e.g., 9 -> "9:00 AM")
  const formatTime = (hour: number) => {
    return format(new Date().setHours(hour, 0, 0, 0), 'h:mm a');
  };

  // Handle appointment click
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };

  // Handle appointment status change
  const handleStatusChange = async (appointmentId: string, newStatus: 'scheduled' | 'completed' | 'canceled') => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      // Update local state
      setAppointments(appointments.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: newStatus } 
          : appointment
      ));

      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment({ ...selectedAppointment, status: newStatus });
      }

      toast.success(`Appointment ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating appointment status:', error.message);
      toast.error('Failed to update appointment status');
    }
  };

  // Get color by appointment status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Appointment Calendar</h1>
        <div className="mt-3 sm:mt-0 flex">
          <button
            type="button"
            onClick={handleToday}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 mr-2"
          >
            Today
          </button>
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={toggleView}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
            >
              <FiCalendar className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
              {view === 'week' ? 'Week View' : 'Day View'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mx-4">
              {view === 'week' ? (
                <span>
                  {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')} - 
                  {format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6), 'MMM d, yyyy')}
                </span>
              ) : (
                <span>{format(currentDate, 'MMMM d, yyyy')}</span>
              )}
            </h2>
            <button
              onClick={handleNext}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading calendar...</p>
          </div>
        ) : (
          <div className="bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            {view === 'week' ? (
              // Week View
              <div className="flex flex-col">
                <div className="flex border-b">
                  <div className="w-20 flex-shrink-0" />
                  {generateWeekDays().map((day, i) => (
                    <div key={i} className="flex-1 text-center py-2 border-l">
                      <div className="text-sm font-medium text-gray-900">{format(day, 'EEE')}</div>
                      <div className="text-sm text-gray-500">{format(day, 'MMM d')}</div>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  {generateTimeSlots().map((hour, hourIndex) => (
                    <div key={hourIndex} className="flex border-b">
                      <div className="w-20 flex-shrink-0 py-3 text-right pr-2 text-sm text-gray-500">
                        {formatTime(hour)}
                      </div>
                      {generateWeekDays().map((day, dayIndex) => {
                        const appointmentsForSlot = getAppointmentsForTimeSlot(day, hour);
                        return (
                          <div key={dayIndex} className="flex-1 border-l min-h-[80px] relative group hover:bg-gray-50">
                            {appointmentsForSlot.map((appointment, i) => (
                              <div 
                                key={i}
                                onClick={() => handleAppointmentClick(appointment)}
                                className={`m-1 p-2 rounded border cursor-pointer text-sm ${getStatusColor(appointment.status)}`}
                              >
                                <div className="font-medium">{appointment.service?.name}</div>
                                <div className="text-xs flex items-center">
                                  <FiUser className="mr-1 h-3 w-3" />
                                  {appointment.client?.first_name} {appointment.client?.last_name}
                                </div>
                                <div className="text-xs flex items-center">
                                  <FiClock className="mr-1 h-3 w-3" />
                                  {format(new Date(appointment.start_time), 'h:mm a')} - 
                                  {format(new Date(new Date(appointment.start_time).getTime() + (appointment.service?.duration || 0) * 60000), 'h:mm a')}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Day View
              <div className="flex flex-col">
                <div className="flex border-b">
                  <div className="w-20 flex-shrink-0" />
                  <div className="flex-1 text-center py-2">
                    <div className="text-sm font-medium text-gray-900">{format(currentDate, 'EEEE')}</div>
                    <div className="text-sm text-gray-500">{format(currentDate, 'MMMM d, yyyy')}</div>
                  </div>
                </div>
                <div className="relative">
                  {generateTimeSlots().map((hour, hourIndex) => {
                    const appointmentsForSlot = getAppointmentsForTimeSlot(currentDate, hour);
                    return (
                      <div key={hourIndex} className="flex border-b">
                        <div className="w-20 flex-shrink-0 py-3 text-right pr-2 text-sm text-gray-500">
                          {formatTime(hour)}
                        </div>
                        <div className="flex-1 min-h-[100px] relative group hover:bg-gray-50">
                          {appointmentsForSlot.map((appointment, i) => (
                            <div 
                              key={i}
                              onClick={() => handleAppointmentClick(appointment)}
                              className={`m-1 p-2 rounded border cursor-pointer ${getStatusColor(appointment.status)}`}
                            >
                              <div className="font-medium">{appointment.service?.name}</div>
                              <div className="text-sm flex items-center">
                                <FiUser className="mr-1 h-4 w-4" />
                                {appointment.client?.first_name} {appointment.client?.last_name}
                              </div>
                              <div className="text-sm flex items-center">
                                <FiClock className="mr-1 h-4 w-4" />
                                {format(new Date(appointment.start_time), 'h:mm a')} - 
                                {format(new Date(new Date(appointment.start_time).getTime() + (appointment.service?.duration || 0) * 60000), 'h:mm a')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Appointment Detail Modal */}
        {isAppointmentModalOpen && selectedAppointment && (
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsAppointmentModalOpen(false)}></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 flex justify-between">
                        <span>Appointment Details</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                          {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                        </span>
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Client</h4>
                          <p className="text-base text-gray-900">
                            {selectedAppointment.client?.first_name} {selectedAppointment.client?.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{selectedAppointment.client?.email}</p>
                          {selectedAppointment.client?.phone && (
                            <p className="text-sm text-gray-500">{selectedAppointment.client?.phone}</p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Service</h4>
                          <p className="text-base text-gray-900">{selectedAppointment.service?.name}</p>
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500">
                              {selectedAppointment.service?.duration} minutes
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              ${selectedAppointment.service?.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                          <p className="text-base text-gray-900">
                            {format(new Date(selectedAppointment.start_time), 'EEEE, MMMM d, yyyy')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(selectedAppointment.start_time), 'h:mm a')} - 
                            {format(new Date(new Date(selectedAppointment.start_time).getTime() + (selectedAppointment.service?.duration || 0) * 60000), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  {selectedAppointment.status === 'scheduled' && (
                    <>
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => handleStatusChange(selectedAppointment.id, 'completed')}
                      >
                        Mark as Completed
                      </button>
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => handleStatusChange(selectedAppointment.id, 'canceled')}
                      >
                        Cancel Appointment
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setIsAppointmentModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
