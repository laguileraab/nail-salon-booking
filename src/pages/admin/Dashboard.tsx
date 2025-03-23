import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiUsers, FiCalendar, FiDollarSign, FiStar, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';

type DashboardStats = {
  totalClients: number;
  totalAppointments: number;
  totalRevenue: number;
  averageRating: number;
  upcomingAppointments: number;
  popularServices: Array<{
    name: string;
    count: number;
  }>;
  recentAppointments: Array<{
    id: string;
    client_name: string;
    service_name: string;
    start_time: string;
    status: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
};

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    averageRating: 0,
    upcomingAppointments: 0,
    popularServices: [],
    recentAppointments: [],
    monthlyRevenue: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'year'

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get total clients
        const { count: clientCount, error: clientError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'client');

        if (clientError) throw clientError;

        // Get appointment statistics
        const { data: appointments, error: appointmentError } = await supabase
          .from('appointments')
          .select(`
            id, 
            start_time,
            status,
            profiles:user_id (first_name, last_name),
            services:service_id (name, price)
          `);

        if (appointmentError) throw appointmentError;

        // Get feedback data
        const { data: feedback, error: feedbackError } = await supabase
          .from('feedback')
          .select('rating');

        if (feedbackError) throw feedbackError;

        // Calculate statistics
        const now = new Date();
        const upcomingAppointments = appointments?.filter(
          (appointment: any) => 
            new Date(appointment.start_time) >= now && 
            appointment.status === 'scheduled'
        ).length || 0;

        const totalRevenue = appointments?.reduce(
          (sum: number, appointment: any) => sum + (appointment.services?.price || 0), 
          0
        ) || 0;

        const averageRating = feedback?.length
          ? feedback.reduce((sum: number, item: any) => sum + item.rating, 0) / feedback.length
          : 0;

        // Get popular services
        const serviceCount = appointments?.reduce((counts: {[key: string]: number}, appointment: any) => {
          const serviceName = appointment.services?.name;
          if (serviceName) {
            counts[serviceName] = (counts[serviceName] || 0) + 1;
          }
          return counts;
        }, {});

        const popularServices = Object.entries(serviceCount || {})
          .map(([name, count]) => ({ name, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Get recent appointments
        const recentAppointments = appointments
          ?.sort((a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
          .slice(0, 5)
          .map((appointment: any) => ({
            id: appointment.id,
            client_name: `${appointment.profiles?.first_name || ''} ${appointment.profiles?.last_name || ''}`,
            service_name: appointment.services?.name || '',
            start_time: appointment.start_time,
            status: appointment.status,
          }));

        // Generate monthly revenue data (dummy data for now)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyRevenue = months.map((month, index) => ({
          month,
          revenue: Math.floor(Math.random() * 5000) + 1000, // Dummy data
        }));

        setStats({
          totalClients: clientCount || 0,
          totalAppointments: appointments?.length || 0,
          totalRevenue,
          averageRating,
          upcomingAppointments,
          popularServices,
          recentAppointments: recentAppointments || [],
          monthlyRevenue,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Dashboard</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              className={`${dateRange === 'week' ? 'bg-accent-100 text-accent-700' : 'bg-white text-gray-700'} relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500`}
              onClick={() => setDateRange('week')}
            >
              Week
            </button>
            <button
              type="button"
              className={`${dateRange === 'month' ? 'bg-accent-100 text-accent-700' : 'bg-white text-gray-700'} relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500`}
              onClick={() => setDateRange('month')}
            >
              Month
            </button>
            <button
              type="button"
              className={`${dateRange === 'year' ? 'bg-accent-100 text-accent-700' : 'bg-white text-gray-700'} relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500`}
              onClick={() => setDateRange('year')}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      ) : (
        <div className="mt-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Clients */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-accent-500 rounded-md p-3">
                    <FiUsers className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Clients</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.totalClients}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/admin/clients" className="font-medium text-accent-700 hover:text-accent-900">
                    View all clients
                  </Link>
                </div>
              </div>
            </div>

            {/* Total Appointments */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <FiCalendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Appointments</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.totalAppointments}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/admin/calendar" className="font-medium text-accent-700 hover:text-accent-900">
                    View calendar
                  </Link>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <FiDollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{formatCurrency(stats.totalRevenue)}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/admin/reports" className="font-medium text-accent-700 hover:text-accent-900">
                    View reports
                  </Link>
                </div>
              </div>
            </div>

            {/* Average Rating */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <FiStar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Average Rating</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {stats.averageRating.toFixed(1)} / 5.0
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/admin/feedbacks" className="font-medium text-accent-700 hover:text-accent-900">
                    View feedback
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Tables */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <FiTrendingUp className="mr-2 h-5 w-5 text-gray-500" />
                  Revenue Overview
                </h3>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  +4.5% from last {dateRange}
                </span>
              </div>
              <div className="px-4 py-5 sm:p-6 h-80">
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">
                    Chart component would go here (using Chart.js or similar)
                  </p>
                </div>
              </div>
            </div>

            {/* Popular Services */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <FiBarChart2 className="mr-2 h-5 w-5 text-gray-500" />
                  Popular Services
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <ul className="divide-y divide-gray-200">
                  {stats.popularServices.map((service, index) => (
                    <li key={index} className="py-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="bg-accent-100 text-accent-700 py-1 px-3 rounded-full text-xs font-medium">
                          #{index + 1}
                        </span>
                        <span className="ml-3 text-sm font-medium text-gray-900">{service.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{service.count} bookings</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Appointments</h3>
              <Link
                to="/admin/calendar"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-accent-700 bg-accent-100 hover:bg-accent-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
              >
                View all
              </Link>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Client
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Service
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date & Time
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">View</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {appointment.client_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.service_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(appointment.start_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/admin/appointments/${appointment.id}`}
                            className="text-accent-600 hover:text-accent-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
