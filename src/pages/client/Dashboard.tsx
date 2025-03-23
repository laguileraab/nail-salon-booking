import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FiCalendar, FiClock, FiCheck, FiX } from 'react-icons/fi';

type Appointment = {
  id: string;
  service: {
    name: string;
    price: number;
    duration: number;
  };
  start_time: string;
  status: 'scheduled' | 'completed' | 'canceled';
};

const Dashboard = () => {
  const { profile } = useAuth();
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [past, setPast] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!profile?.id) return;

      setIsLoading(true);

      try {
        // Fetch upcoming appointments
        const { data: upcomingData, error: upcomingError } = await supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            status,
            services:service_id (name, price, duration)
          `)
          .eq('user_id', profile.id)
          .eq('status', 'scheduled')
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(5);

        if (upcomingError) throw upcomingError;

        // Fetch past appointments
        const { data: pastData, error: pastError } = await supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            status,
            services:service_id (name, price, duration)
          `)
          .eq('user_id', profile.id)
          .or(`status.eq.completed,status.eq.canceled`)
          .order('start_time', { ascending: false })
          .limit(5);

        if (pastError) throw pastError;

        setUpcoming(upcomingData || []);
        setPast(pastData || []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [profile?.id]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <FiClock className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <FiCheck className="h-5 w-5 text-green-500" />;
      case 'canceled':
        return <FiX className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
          Welcome back, {profile?.first_name || 'Client'}
        </h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Link
            to="/client/bookings"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
          >
            <FiCalendar className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Book New Appointment
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Appointments</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Your next scheduled sessions</p>
            </div>
            <Link to="/client/bookings" className="text-sm font-medium text-accent-600 hover:text-accent-500">
              View all
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {isLoading ? (
              <div className="text-center py-6">Loading...</div>
            ) : upcoming.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {upcoming.map((appointment) => (
                  <li key={appointment.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-accent-100 flex items-center justify-center">
                            <FiCalendar className="h-6 w-6 text-accent-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900">{appointment.service.name}</h4>
                          <p className="text-sm text-gray-500">{formatDateTime(appointment.start_time)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        <span className="ml-2 flex-shrink-0 flex">
                          <button
                            type="button"
                            className="ml-4 bg-white rounded-md font-medium text-accent-600 hover:text-accent-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
                          >
                            Cancel
                          </button>
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">No upcoming appointments</p>
                <Link
                  to="/client/bookings"
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
                >
                  Book an appointment
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Past Appointments */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Past Appointments</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Your completed or canceled sessions</p>
            </div>
            <Link to="/client/bookings" className="text-sm font-medium text-accent-600 hover:text-accent-500">
              View all
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {isLoading ? (
              <div className="text-center py-6">Loading...</div>
            ) : past.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {past.map((appointment) => (
                  <li key={appointment.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {getStatusIcon(appointment.status)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900">{appointment.service.name}</h4>
                          <p className="text-sm text-gray-500">{formatDateTime(appointment.start_time)}</p>
                        </div>
                      </div>
                      <div>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        {appointment.status === 'completed' && (
                          <Link
                            to={`/client/feedback?appointment=${appointment.id}`}
                            className="ml-4 bg-white rounded-md font-medium text-accent-600 hover:text-accent-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
                          >
                            Leave Feedback
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">No past appointments</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-accent-500 rounded-md p-3">
                <FiCalendar className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Appointments</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{upcoming.length + past.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/client/bookings" className="font-medium text-accent-600 hover:text-accent-500">
                View all appointments<span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <FiCheck className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed Appointments</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {past.filter(a => a.status === 'completed').length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/client/feedback" className="font-medium text-accent-600 hover:text-accent-500">
                Manage feedback<span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <FiClock className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Appointments</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{upcoming.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/client/bookings" className="font-medium text-accent-600 hover:text-accent-500">
                Book appointment<span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
