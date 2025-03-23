import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiClock, FiDollarSign, FiSearch } from 'react-icons/fi';

type Service = {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  is_active: boolean;
  created_at: string;
};

type ServiceFormData = Omit<Service, 'id' | 'created_at'>;

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    is_active: true,
  });

  // Fetch services data
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      console.error('Error fetching services:', error.message);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredServices = services.filter((service) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      service.name.toLowerCase().includes(searchLower) ||
      service.description.toLowerCase().includes(searchLower)
    );
  });

  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentService(null);
    setFormData({
      name: '',
      description: '',
      duration: 30,
      price: 0,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setIsEditMode(true);
    setCurrentService(service);
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      is_active: service.is_active,
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditMode && currentService) {
        const { error } = await supabase
          .from('services')
          .update(formData)
          .eq('id', currentService.id);

        if (error) throw error;
        toast.success('Service updated successfully');
        
        // Update local state
        setServices(services.map(service => 
          service.id === currentService.id 
            ? { ...service, ...formData } 
            : service
        ));
      } else {
        const { data, error } = await supabase
          .from('services')
          .insert([formData])
          .select();

        if (error) throw error;
        toast.success('Service added successfully');
        
        // Update local state
        if (data) {
          setServices([...services, data[0]]);
        }
      }
      
      setIsModalOpen(false);
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} service:`, error.message);
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} service`);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      toast.success('Service deleted successfully');
      
      // Update local state
      setServices(services.filter(service => service.id !== serviceId));
    } catch (error: any) {
      console.error('Error deleting service:', error.message);
      toast.error('Failed to delete service');
    }
  };

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
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Services Management</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex space-x-3">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="focus:ring-accent-500 focus:border-accent-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search services"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Service
          </button>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading services...</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {filteredServices.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <li key={service.id}>
                    <div className="px-4 py-4 flex items-center sm:px-6">
                      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <div className="flex">
                            <h3 className="text-lg font-medium text-accent-600 truncate">{service.name}</h3>
                            {!service.is_active && (
                              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500 mr-6">
                              <FiClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {service.duration} minutes
                            </div>
                            <div className="flex items-center text-sm font-medium text-accent-600">
                              <FiDollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {formatCurrency(service.price)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-5 flex-shrink-0 flex space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(service)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
                        >
                          <FiEdit className="-ml-1 mr-1 h-4 w-4 text-gray-500" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteService(service.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FiTrash2 className="-ml-1 mr-1 h-4 w-4 text-red-500" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchTerm ? 'No services matching your search.' : 'No services found. Create your first service!'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsModalOpen(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {isEditMode ? 'Edit Service' : 'Add New Service'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Service Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="mt-1 focus:ring-accent-500 focus:border-accent-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows={3}
                        className="mt-1 focus:ring-accent-500 focus:border-accent-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.description}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          name="duration"
                          id="duration"
                          min="5"
                          step="5"
                          required
                          className="mt-1 focus:ring-accent-500 focus:border-accent-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.duration}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                          Price ($)
                        </label>
                        <input
                          type="number"
                          name="price"
                          id="price"
                          min="0"
                          step="0.01"
                          required
                          className="mt-1 focus:ring-accent-500 focus:border-accent-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.price}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="is_active"
                        name="is_active"
                        type="checkbox"
                        className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                        Active (available for booking)
                      </label>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent-600 text-base font-medium text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isEditMode ? 'Update Service' : 'Add Service'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
