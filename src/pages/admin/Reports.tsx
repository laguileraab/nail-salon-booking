import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { FiFilter, FiDownload, FiCalendar, FiBarChart2, FiPieChart, FiTrendingUp, FiDollarSign } from 'react-icons/fi';

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'custom';

type ReportData = {
  revenue: {
    total: number;
    byService: {
      name: string;
      revenue: number;
      count: number;
    }[];
    byMonth: {
      month: string;
      revenue: number;
    }[];
  };
  appointments: {
    total: number;
    completed: number;
    canceled: number;
    byDay: {
      day: string;
      count: number;
    }[];
  };
  clients: {
    total: number;
    new: number;
    returning: number;
  };
};

const Reports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData>({
    revenue: {
      total: 0,
      byService: [],
      byMonth: [],
    },
    appointments: {
      total: 0,
      completed: 0,
      canceled: 0,
      byDay: [],
    },
    clients: {
      total: 0,
      new: 0,
      returning: 0,
    },
  });

  useEffect(() => {
    // Set default dates based on time range
    const now = new Date();
    let start = new Date();
    
    switch (timeRange) {
      case 'week':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'custom':
        // Don't change dates for custom range
        return;
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
  }, [timeRange]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReportData();
    }
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    if (!startDate || !endDate) return;
    
    setIsLoading(true);
    try {
      // In a real app, we would fetch this data from the database
      // For now, we'll generate mock data
      
      // Mock revenue data
      const mockRevenueByService = [
        { name: 'Manicure', revenue: 2500, count: 50 },
        { name: 'Pedicure', revenue: 3200, count: 40 },
        { name: 'Gel Polish', revenue: 1800, count: 30 },
        { name: 'Nail Art', revenue: 1200, count: 20 },
        { name: 'Acrylic Nails', revenue: 4500, count: 45 },
      ];
      
      const mockRevenueByMonth = [
        { month: 'Jan', revenue: 5200 },
        { month: 'Feb', revenue: 6300 },
        { month: 'Mar', revenue: 5800 },
        { month: 'Apr', revenue: 7200 },
        { month: 'May', revenue: 8400 },
        { month: 'Jun', revenue: 9100 },
      ];
      
      const mockAppointmentsByDay = [
        { day: 'Mon', count: 15 },
        { day: 'Tue', count: 18 },
        { day: 'Wed', count: 22 },
        { day: 'Thu', count: 25 },
        { day: 'Fri', count: 30 },
        { day: 'Sat', count: 35 },
        { day: 'Sun', count: 10 },
      ];
      
      const totalRevenue = mockRevenueByService.reduce((sum, item) => sum + item.revenue, 0);
      const totalAppointments = mockRevenueByService.reduce((sum, item) => sum + item.count, 0);
      
      // Set mock report data
      setReportData({
        revenue: {
          total: totalRevenue,
          byService: mockRevenueByService,
          byMonth: mockRevenueByMonth,
        },
        appointments: {
          total: totalAppointments,
          completed: Math.floor(totalAppointments * 0.85),
          canceled: Math.floor(totalAppointments * 0.15),
          byDay: mockAppointmentsByDay,
        },
        clients: {
          total: 120,
          new: 35,
          returning: 85,
        },
      });

      // In a real app, we would fetch actual data from Supabase like this:
      /*
      // Fetch appointments within date range
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          service_id,
          user_id,
          start_time,
          status,
          services(name, price)
        `)
        .gte('start_time', `${startDate}T00:00:00`)
        .lte('start_time', `${endDate}T23:59:59`);

      if (appointmentsError) throw appointmentsError;
      
      // Process the data...
      */
    } catch (error: any) {
      console.error('Error fetching report data:', error.message);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'startDate') {
      setStartDate(value);
    } else if (name === 'endDate') {
      setEndDate(value);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleExportCSV = () => {
    // In a real app, this would generate and download a CSV file
    toast.success('Report downloaded successfully');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Reports & Analytics</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
          >
            <FiDownload className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Date filters */}
      <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Report Period</h3>
            <p className="mt-1 text-sm text-gray-500">Select a time range for the reports</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap items-center space-x-2">
            {(['week', 'month', 'quarter', 'year', 'custom'] as TimeRange[]).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`inline-flex items-center px-3 py-1.5 border ${timeRange === range ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-gray-300 bg-white text-gray-700'} rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {timeRange === 'custom' && (
          <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={startDate}
                  onChange={handleDateChange}
                  className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={endDate}
                  onChange={handleDateChange}
                  className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading report data...</p>
        </div>
      ) : (
        <div className="mt-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Revenue Card */}
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
                        <div className="text-lg font-medium text-gray-900">{formatCurrency(reportData.revenue.total)}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-green-700">
                    +12% from previous period
                  </span>
                </div>
              </div>
            </div>

            {/* Appointments Card */}
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
                        <div className="text-lg font-medium text-gray-900">{reportData.appointments.total}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm flex justify-between">
                  <span className="text-gray-500">
                    Completed: {reportData.appointments.completed}
                  </span>
                  <span className="text-gray-500">
                    Canceled: {reportData.appointments.canceled}
                  </span>
                </div>
              </div>
            </div>

            {/* Clients Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <FiUsers className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Clients</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{reportData.clients.total}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm flex justify-between">
                  <span className="text-gray-500">
                    New: {reportData.clients.new}
                  </span>
                  <span className="text-gray-500">
                    Returning: {reportData.clients.returning}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Revenue by Service */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <FiPieChart className="mr-2 h-5 w-5 text-gray-500" />
                  Revenue by Service
                </h3>
                <div className="mt-4 h-64 flex items-center justify-center">
                  <p className="text-gray-500">
                    Chart component would go here (e.g., using Chart.js)
                  </p>
                </div>
                <div className="mt-5">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bookings
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.revenue.byService.map((service, index) => (
                        <tr key={index}>
                          <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {service.name}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                            {service.count}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(service.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Revenue Trend */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <FiTrendingUp className="mr-2 h-5 w-5 text-gray-500" />
                  Revenue Trend
                </h3>
                <div className="mt-4 h-64 flex items-center justify-center">
                  <p className="text-gray-500">
                    Chart component would go here (e.g., using Chart.js)
                  </p>
                </div>
                <div className="mt-5">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Month
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.revenue.byMonth.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.month}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(item.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments by Day of Week */}
          <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <FiBarChart2 className="mr-2 h-5 w-5 text-gray-500" />
                Appointments by Day of Week
              </h3>
              <div className="mt-4 h-64 flex items-center justify-center">
                <p className="text-gray-500">
                  Chart component would go here (e.g., using Chart.js)
                </p>
              </div>
              <div className="mt-5 grid grid-cols-7 gap-2">
                {reportData.appointments.byDay.map((day, index) => (
                  <div key={index} className="bg-gray-50 rounded-md p-4 text-center">
                    <div className="text-sm font-medium text-gray-900">{day.day}</div>
                    <div className="mt-1 text-2xl font-semibold text-accent-600">{day.count}</div>
                    <div className="mt-1 text-xs text-gray-500">appointments</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FiUsers = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default Reports;
