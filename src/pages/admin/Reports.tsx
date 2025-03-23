import { useState, useEffect } from 'react';
// Import is preserved but commented for future implementation with real database
// import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import {
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiBarChart2,
  FiArrowUp,
  FiArrowDown,
  FiDownload
} from 'react-icons/fi';

// Date ranges for filtering
type DateRange = '7days' | '30days' | '90days' | 'year' | 'custom';

// Report data structure
interface ReportData {
  revenue: {
    total: number;
    previousPeriod: number;
    percentChange: number;
  };
  appointments: {
    total: number;
    previousPeriod: number;
    percentChange: number;
    completed: number;
    canceled: number;
    noShow: number;
  };
  clients: {
    total: number;
    newClients: number;
    returning: number;
    percentNew: number;
  };
  services: {
    mostPopular: Array<{ name: string; count: number; revenue: number }>;
  };
  staff: {
    topPerforming: Array<{ name: string; appointments: number; revenue: number }>;
  };
}

const AdminReports = () => {
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // Fetch report data based on date range
  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // In a real application, we would fetch from Supabase
      // const { data, error } = await supabase
      //   .from('appointments')
      //   .select(...)
      //   .gte('appointment_date', startDate)
      //   .lte('appointment_date', endDate);
      
      // Instead, we'll use mock data for the demo
      // Simulating API delay
      setTimeout(() => {
        const mockData: ReportData = {
          revenue: {
            total: 12580.50,
            previousPeriod: 10980.25,
            percentChange: 14.57
          },
          appointments: {
            total: 348,
            previousPeriod: 310,
            percentChange: 12.26,
            completed: 312,
            canceled: 28,
            noShow: 8
          },
          clients: {
            total: 156,
            newClients: 42,
            returning: 114,
            percentNew: 26.92
          },
          services: {
            mostPopular: [
              { name: "Gel Manicure", count: 127, revenue: 3810.00 },
              { name: "Pedicure", count: 98, revenue: 2940.00 },
              { name: "Nail Art", count: 76, revenue: 1520.00 },
              { name: "Full Set Acrylic", count: 62, revenue: 2480.00 },
              { name: "Manicure", count: 58, revenue: 1160.00 }
            ]
          },
          staff: {
            topPerforming: [
              { name: "Jane Smith", appointments: 92, revenue: 3680.00 },
              { name: "Alice Johnson", appointments: 78, revenue: 3120.00 },
              { name: "Lisa Brown", appointments: 64, revenue: 2560.00 },
              { name: "Mark Davis", appointments: 62, revenue: 2480.00 },
              { name: "Emma Wilson", appointments: 52, revenue: 2080.00 }
            ]
          }
        };
        setReportData(mockData);
        setIsLoading(false);
      }, 800);
    } catch (error: Error | unknown) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
      setIsLoading(false);
    }
  };

  // Update date range when selection changes
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    const now = new Date();
    let start = new Date();

    switch (range) {
      case '7days':
        start.setDate(now.getDate() - 7);
        break;
      case '30days':
        start.setDate(now.getDate() - 30);
        break;
      case '90days':
        start.setDate(now.getDate() - 90);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        // Don't change dates for custom range
        return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
  };

  // Fetch data when date range changes
  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate, fetchReportData]);

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Reports & Analytics</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
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
            {(['7days', '30days', '90days', 'year', 'custom'] as DateRange[]).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => handleDateRangeChange(range)}
                className={`inline-flex items-center px-3 py-1.5 border ${dateRange === range ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-gray-300 bg-white text-gray-700'} rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500`}
              >
                {range === '7days' ? '7 Days' : 
                 range === '30days' ? '30 Days' : 
                 range === '90days' ? '90 Days' : 
                 range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {dateRange === 'custom' && (
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
                  onChange={(e) => setStartDate(e.target.value)}
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
                  onChange={(e) => setEndDate(e.target.value)}
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
      ) : reportData ? (
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
                <div className="text-sm flex items-center">
                  {reportData.revenue.percentChange >= 0 ? (
                    <FiArrowUp className="mr-1 text-green-500" />
                  ) : (
                    <FiArrowDown className="mr-1 text-red-500" />
                  )}
                  <span className={`font-medium ${reportData.revenue.percentChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {Math.abs(reportData.revenue.percentChange)}% from previous period
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
                  <span className="text-gray-700">
                    Completed: {reportData.appointments.completed}
                  </span>
                  <span className="text-gray-700">
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
                  <span className="text-gray-700">
                    New: {reportData.clients.newClients}
                  </span>
                  <span className="text-gray-700">
                    Returning: {reportData.clients.returning}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* More report sections would go here */}
          <div className="mt-8 bg-white overflow-hidden shadow rounded-lg p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <FiBarChart2 className="mr-2 h-5 w-5 text-gray-500" />
              Performance Metrics
            </h3>
            <p className="mt-4 text-gray-500">Detailed charts and analytics would be displayed here.</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No report data available</p>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
