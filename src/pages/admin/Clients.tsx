import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { FiSearch, FiUser, FiMail, FiPhone, FiCalendar, FiEdit, FiEye } from 'react-icons/fi';

type Client = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  appointment_count?: number;
};

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [clientAppointments, setClientAppointments] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({ 
    key: 'created_at', 
    direction: 'descending' 
  });

  // Fetch clients data
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        // Fetch all clients (profiles with role 'client')
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'client')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // For each client, count their appointments
        const clientsWithAppointmentCount = await Promise.all(
          (data || []).map(async (client) => {
            const { count, error: countError } = await supabase
              .from('appointments')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', client.id);

            if (countError) throw countError;

            return {
              ...client,
              appointment_count: count || 0,
            };
          })
        );

        setClients(clientsWithAppointmentCount);
      } catch (error: any) {
        console.error('Error fetching clients:', error.message);
        toast.error('Failed to load clients');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedClients = () => {
    const sorted = [...clients];
    sorted.sort((a, b) => {
      if (a[sortConfig.key as keyof Client] < b[sortConfig.key as keyof Client]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key as keyof Client] > b[sortConfig.key as keyof Client]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  };

  const filteredClients = sortedClients().filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.first_name.toLowerCase().includes(searchLower) ||
      client.last_name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      (client.phone && client.phone.includes(searchTerm))
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleViewClient = async (client: Client) => {
    setSelectedClient(client);
    setIsViewModalOpen(true);
    
    try {
      // Fetch client's appointments
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          status,
          services:service_id (name, price)
        `)
        .eq('user_id', client.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      setClientAppointments(data || []);
    } catch (error: any) {
      console.error('Error fetching client appointments:', error.message);
      toast.error('Failed to load client appointments');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Clients</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="focus:ring-accent-500 focus:border-accent-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search clients"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading clients...</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('first_name')}
                        >
                          Name
                          {sortConfig.key === 'first_name' && (
                            <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('email')}
                        >
                          Email
                          {sortConfig.key === 'email' && (
                            <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('phone')}
                        >
                          Phone
                          {sortConfig.key === 'phone' && (
                            <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('appointment_count')}
                        >
                          Appointments
                          {sortConfig.key === 'appointment_count' && (
                            <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('created_at')}
                        >
                          Joined
                          {sortConfig.key === 'created_at' && (
                            <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <tr key={client.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-accent-100 rounded-full flex items-center justify-center">
                                  <FiUser className="h-5 w-5 text-accent-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {client.first_name} {client.last_name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-500">
                                <FiMail className="mr-2 h-4 w-4 text-gray-400" />
                                {client.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-500">
                                <FiPhone className="mr-2 h-4 w-4 text-gray-400" />
                                {client.phone || 'Not provided'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <FiCalendar className="mr-2 h-4 w-4 text-gray-400" />
                                {client.appointment_count} appointments
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(client.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleViewClient(client)}
                                className="text-accent-600 hover:text-accent-900 mr-4"
                              >
                                <FiEye className="h-5 w-5" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <FiEdit className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                            No clients found matching your search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Client Detail Modal */}
      {isViewModalOpen && selectedClient && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsViewModalOpen(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-accent-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiUser className="h-6 w-6 text-accent-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedClient.first_name} {selectedClient.last_name}
                    </h3>
                    <div className="mt-2">
                      <div className="text-sm text-gray-500 flex items-center mb-1">
                        <FiMail className="mr-2 h-4 w-4" />
                        {selectedClient.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mb-1">
                        <FiPhone className="mr-2 h-4 w-4" />
                        {selectedClient.phone || 'No phone number'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <FiCalendar className="mr-2 h-4 w-4" />
                        Client since {formatDate(selectedClient.created_at)}
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-2">Appointment History</h4>
                      {clientAppointments.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto">
                          <ul className="divide-y divide-gray-200">
                            {clientAppointments.map((appointment) => (
                              <li key={appointment.id} className="py-3">
                                <div className="flex justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{appointment.services.name}</p>
                                    <p className="text-sm text-gray-500">
                                      {formatDate(appointment.start_time)}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <p className="text-sm font-medium text-gray-900">
                                      ${appointment.services.price.toFixed(2)}
                                    </p>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                    >
                                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                    </span>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No appointment history found.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent-600 text-base font-medium text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
