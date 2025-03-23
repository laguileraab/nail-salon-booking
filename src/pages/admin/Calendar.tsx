import { useState, useEffect } from 'react';
// Fix imports to only include what's actually used
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
// Commenting out unused imports for future use
// import { eachDayOfInterval, getHours, getMinutes } from 'date-fns';
// import { startOfDay, addHours } from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiUser } from 'react-icons/fi';
// Commenting out unused imports for future use
// import { FiEdit, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

type Appointment = {
  id: string;
  clientName: string;
  service: string;
  startTime: Date;
  endTime: Date;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  staffMember: string;
  notes?: string;
};

const Calendar = () => {
  const [view, setView] = useState<'day' | 'week'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // These variables are for future implementation of edit functionality
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('appointments')
        //   .select('*')
        //   .gte('startTime', startOfWeek(currentDate).toISOString())
        //   .lte('startTime', endOfWeek(currentDate).toISOString());
        
        // if (error) throw error;
        
        // For now, we'll use mock data
        const mockAppointments: Appointment[] = [];
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        
        // Generate random appointments
        for (let i = 0; i < 20; i++) {
          const randomDay = Math.floor(Math.random() * 7);
          const randomHour = 9 + Math.floor(Math.random() * 8); // 9am to 5pm
          const randomDuration = [30, 60, 90][Math.floor(Math.random() * 3)];
          
          const startTime = new Date(weekStart);
          startTime.setDate(weekStart.getDate() + randomDay);
          startTime.setHours(randomHour, 0, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + randomDuration);
          
          mockAppointments.push({
            id: `appt-${i}`,
            clientName: `Client ${i + 1}`,
            service: ['Manicure', 'Pedicure', 'Gel Polish', 'Nail Art', 'Full Set'][Math.floor(Math.random() * 5)],
            startTime,
            endTime,
            status: ['confirmed', 'pending', 'cancelled', 'completed'][Math.floor(Math.random() * 4)] as 'confirmed' | 'pending' | 'cancelled' | 'completed',
            staffMember: ['Jane Smith', 'Emily Johnson', 'Michael Davis'][Math.floor(Math.random() * 3)],
            notes: Math.random() > 0.5 ? `Special request for appointment ${i + 1}` : undefined
          });
        }
        
        setTimeout(() => {
          setAppointments(mockAppointments);
          setIsLoading(false);
        }, 500);
      } catch (error: Error | unknown) {
        console.error('Error fetching appointments:', error);
        toast.error('Failed to load appointments');
        setIsLoading(false);
      }
    };
    
    fetchAppointments();
    if (false) {
      if (isEditModalOpen) {
        setIsEditModalOpen(false);
      }
    }
  }, [currentDate]);

  const getDaysToDisplay = () => {
    if (view === 'day') {
      return [currentDate];
    }
    
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = [];

    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }

    return days;
  };

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.startTime), day)
    );
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: 'confirmed' | 'pending' | 'cancelled' | 'completed') => {
    try {
      // In a real app, we would update the status in Supabase
      // const { error } = await supabase
      //   .from('appointments')
      //   .update({ status: newStatus })
      //   .eq('id', appointmentId);
      
      // if (error) throw error;
      
      // For now, we'll update the local state
      const updatedAppointments = appointments.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: newStatus } 
          : appointment
      );
      
      setAppointments(updatedAppointments);
      
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment({ ...selectedAppointment, status: newStatus });
      }
      
      toast.success(`Appointment status updated to ${newStatus}`);
    } catch (error: Error | unknown) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const toggleView = () => {
    setView(view === 'week' ? 'day' : 'week');
  };

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 19; // 7 PM

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(hour);
    }

    return slots;
  };

  const formatTime = (hour: number) => {
    return format(new Date().setHours(hour, 0, 0, 0), 'h:mm a');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
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
                  {format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}
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
                  {getDaysToDisplay().map((day, i) => (
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
                      {getDaysToDisplay().map((day, dayIndex) => {
                        const appointmentsForSlot = getAppointmentsForDay(day);
                        return (
                          <div key={dayIndex} className="flex-1 border-l min-h-[80px] relative group hover:bg-gray-50">
                            {appointmentsForSlot.map((appointment, i) => (
                              <div 
                                key={i}
                                onClick={() => handleAppointmentClick(appointment)}
                                className={`m-1 p-2 rounded border cursor-pointer text-sm ${getStatusColor(appointment.status)}`}
                              >
                                <div className="font-medium">{appointment.service}</div>
                                <div className="text-xs flex items-center">
                                  <FiUser className="mr-1 h-3 w-3" />
                                  {appointment.clientName}
                                </div>
                                <div className="text-xs flex items-center">
                                  <FiClock className="mr-1 h-3 w-3" />
                                  {format(appointment.startTime, 'h:mm a')} - 
                                  {format(appointment.endTime, 'h:mm a')}
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
                    const appointmentsForSlot = getAppointmentsForDay(currentDate);
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
                              <div className="font-medium">{appointment.service}</div>
                              <div className="text-sm flex items-center">
                                <FiUser className="mr-1 h-4 w-4" />
                                {appointment.clientName}
                              </div>
                              <div className="text-sm flex items-center">
                                <FiClock className="mr-1 h-4 w-4" />
                                {format(appointment.startTime, 'h:mm a')} - 
                                {format(appointment.endTime, 'h:mm a')}
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
        {selectedAppointment && (
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setSelectedAppointment(null)}></div>
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
                          <p className="text-base text-gray-900">{selectedAppointment.clientName}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Service</h4>
                          <p className="text-base text-gray-900">{selectedAppointment.service}</p>
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500">
                              {(selectedAppointment.endTime.getTime() - selectedAppointment.startTime.getTime()) / 60000} minutes
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                          <p className="text-base text-gray-900">
                            {format(selectedAppointment.startTime, 'EEEE, MMMM d, yyyy')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(selectedAppointment.startTime, 'h:mm a')} - 
                            {format(selectedAppointment.endTime, 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  {selectedAppointment.status === 'confirmed' && (
                    <>
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => handleUpdateStatus(selectedAppointment.id, 'completed')}
                      >
                        Mark as Completed
                      </button>
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                      >
                        Cancel Appointment
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setSelectedAppointment(null)}
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
