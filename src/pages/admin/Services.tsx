import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiClock, FiDollarSign, FiSearch, FiGlobe } from 'react-icons/fi';
import SEO from '../../components/SEO';
import { NailService, NailServiceFormData } from '../../types/NailService';
import { serviceManagementService } from '../../services/serviceManagementService';
import { useLanguage } from '../../contexts/LanguageContext';

const Services = () => {
  const { language, translations } = useLanguage();
  const [services, setServices] = useState<NailService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentService, setCurrentService] = useState<NailService | null>(null);
  const [categories] = useState<string[]>([
    'Manicure',
    'Pedicure',
    'Nail Art',
    'Gel Polish',
    'Acrylic',
    'Other'
  ]);
  const [formData, setFormData] = useState<NailServiceFormData>({
    name: '',
    description: '',
    durationMinutes: 30,
    price: 0,
    category: 'Manicure',
    isActive: true,
    image: '',
    nameDE: '',
    descriptionDE: '',
    nameES: '',
    descriptionES: '',
  });

  // Define fetchServices with useCallback to avoid unnecessary recreations
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await serviceManagementService.getAllServices();
      setServices(data);
    } catch (error: unknown) {
      console.error('Error fetching services:', error instanceof Error ? error.message : String(error));
      toast.error(translations[language]['errorMessage'] || 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  }, [language, translations]);

  // Fetch services data
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredServices = services.filter((service) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      service.name.toLowerCase().includes(searchLower) ||
      service.description.toLowerCase().includes(searchLower) ||
      service.category.toLowerCase().includes(searchLower)
    );
  });

  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentService(null);
    setFormData({
      name: '',
      description: '',
      durationMinutes: 30,
      price: 0,
      category: 'Manicure',
      isActive: true,
      image: '',
      nameDE: '',
      descriptionDE: '',
      nameES: '',
      descriptionES: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service: NailService) => {
    setIsEditMode(true);
    setCurrentService(service);
    
    // Set form data, including translations if available
    const formData: NailServiceFormData = {
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: service.price,
      category: service.category,
      isActive: service.isActive,
      image: service.image,
      nameDE: service.translations?.de?.name || '',
      descriptionDE: service.translations?.de?.description || '',
      nameES: service.translations?.es?.name || '',
      descriptionES: service.translations?.es?.description || '',
    };
    
    setFormData(formData);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        const updatedService = await serviceManagementService.updateService(currentService.id, formData);
        toast.success(translations[language]['successMessage'] || 'Service updated successfully');
        
        // Update local state
        setServices(services.map(service => 
          service.id === currentService.id 
            ? updatedService
            : service
        ));
      } else {
        const newService = await serviceManagementService.createService(formData);
        toast.success(translations[language]['successMessage'] || 'Service added successfully');
        
        // Update local state
        setServices([...services, newService]);
      }
      
      setIsModalOpen(false);
    } catch (error: unknown) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} service:`, error instanceof Error ? error.message : String(error));
      toast.error(translations[language]['errorMessage'] || `Failed to ${isEditMode ? 'update' : 'add'} service`);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm(translations[language]['admin.confirmDelete'] || 'Are you sure you want to delete this service?')) return;
    
    try {
      await serviceManagementService.deleteService(serviceId);
      toast.success(translations[language]['successMessage'] || 'Service deleted successfully');
      
      // Update local state
      setServices(services.filter(service => service.id !== serviceId));
    } catch (error: unknown) {
      console.error('Error deleting service:', error instanceof Error ? error.message : String(error));
      toast.error(translations[language]['errorMessage'] || 'Failed to delete service');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get appropriate name and description based on user's language
  const getLocalizedServiceName = (service: NailService) => {
    if (language === 'de' && service.translations?.de?.name) {
      return service.translations.de.name;
    } else if (language === 'es' && service.translations?.es?.name) {
      return service.translations.es.name;
    }
    return service.name;
  };

  const getLocalizedServiceDescription = (service: NailService) => {
    if (language === 'de' && service.translations?.de?.description) {
      return service.translations.de.description;
    } else if (language === 'es' && service.translations?.es?.description) {
      return service.translations.es.description;
    }
    return service.description;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <SEO 
        title={translations[language]['admin.servicesTitle'] || "Services Management - MärchenNails"}
        description={translations[language]['admin.servicesDescription'] || "Manage salon services, pricing, and descriptions for MärchenNails"}
        ogType="website"
      />
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl dark:text-white">
          {translations[language]['admin.servicesTitle'] || "Services Management"}
        </h1>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex space-x-3">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="focus:ring-accent-500 focus:border-accent-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder={translations[language]['admin.searchServices'] || "Search services"}
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
            {translations[language]['admin.addService'] || "Add Service"}
          </button>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-300">{translations[language]['admin.loading'] || "Loading services..."}</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            {filteredServices.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredServices.map((service) => (
                  <li key={service.id}>
                    <div className="px-4 py-4 flex items-center sm:px-6">
                      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-accent-600 truncate dark:text-accent-400">{getLocalizedServiceName(service)}</h3>
                            {!service.isActive && (
                              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                {translations[language]['admin.inactive'] || "Inactive"}
                              </span>
                            )}
                            {(service.translations?.de || service.translations?.es) && (
                              <span className="ml-2 px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                <FiGlobe className="mr-1" />
                                {translations[language]['admin.translated'] || "Translated"}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">{getLocalizedServiceDescription(service)}</p>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 mr-6">
                              <FiClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                              {service.durationMinutes} {translations[language]['admin.minutes'] || "minutes"}
                            </div>
                            <div className="flex items-center text-sm font-medium text-accent-600 dark:text-accent-400">
                              <FiDollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                              {formatCurrency(service.price)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-5 flex-shrink-0 flex space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(service)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                          <FiEdit className="-ml-1 mr-1 h-4 w-4 text-gray-500 dark:text-gray-300" />
                          {translations[language]['admin.edit'] || "Edit"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteService(service.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-700 dark:text-red-400 dark:border-gray-600 dark:hover:bg-red-900 dark:hover:text-red-300"
                        >
                          <FiTrash2 className="-ml-1 mr-1 h-4 w-4 text-red-500 dark:text-red-400" />
                          {translations[language]['admin.delete'] || "Delete"}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-300">
                  {searchTerm 
                    ? (translations[language]['admin.noSearchResults'] || "No services matching your search.") 
                    : (translations[language]['admin.noServices'] || "No services found. Create your first service!")}
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
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-75" onClick={() => setIsModalOpen(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                    {isEditMode 
                      ? (translations[language]['admin.editService'] || "Edit Service")
                      : (translations[language]['admin.addService'] || "Add New Service")}
                  </h3>
                  <div className="space-y-4">
                    {/* Main Info Tab */}
                    <div>
                      <h4 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">
                        {translations[language]['admin.mainInfo'] || "Basic Information"}
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {translations[language]['admin.serviceName'] || "Service Name"}
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="mt-1 focus:ring-accent-500 focus:border-accent-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {translations[language]['admin.description'] || "Description"}
                          </label>
                          <textarea
                            name="description"
                            id="description"
                            rows={3}
                            className="mt-1 focus:ring-accent-500 focus:border-accent-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={formData.description}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {translations[language]['admin.duration'] || "Duration (minutes)"}
                            </label>
                            <input
                              type="number"
                              name="durationMinutes"
                              id="durationMinutes"
                              min="5"
                              step="5"
                              required
                              className="mt-1 focus:ring-accent-500 focus:border-accent-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              value={formData.durationMinutes}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {translations[language]['admin.price'] || "Price (€)"}
                            </label>
                            <input
                              type="number"
                              name="price"
                              id="price"
                              min="0"
                              step="0.01"
                              required
                              className="mt-1 focus:ring-accent-500 focus:border-accent-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              value={formData.price}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {translations[language]['admin.category'] || "Category"}
                          </label>
                          <select
                            id="category"
                            name="category"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={formData.category}
                            onChange={handleInputChange}
                          >
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {translations[language]['admin.imageUrl'] || "Image URL"}
                          </label>
                          <input
                            type="text"
                            name="image"
                            id="image"
                            className="mt-1 focus:ring-accent-500 focus:border-accent-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={formData.image}
                            onChange={handleInputChange}
                            placeholder="https://example.com/image.jpg"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {translations[language]['admin.imageUrlInfo'] || "Enter a URL for the service image. Leave blank to use a default image."}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="isActive"
                            name="isActive"
                            type="checkbox"
                            className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                            {translations[language]['admin.activeService'] || "Active (available for booking)"}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Translations Tab */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">
                        {translations[language]['admin.translations'] || "Translations"}
                      </h4>
                      
                      {/* German Translation */}
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {translations[language]['languages.german'] || "German"}
                        </h5>
                        <div className="space-y-3">
                          <div>
                            <label htmlFor="nameDE" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {translations[language]['admin.serviceName'] || "Service Name"} (DE)
                            </label>
                            <input
                              type="text"
                              name="nameDE"
                              id="nameDE"
                              className="mt-1 focus:ring-accent-500 focus:border-accent-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              value={formData.nameDE}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <label htmlFor="descriptionDE" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {translations[language]['admin.description'] || "Description"} (DE)
                            </label>
                            <textarea
                              name="descriptionDE"
                              id="descriptionDE"
                              rows={2}
                              className="mt-1 focus:ring-accent-500 focus:border-accent-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              value={formData.descriptionDE}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Spanish Translation */}
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {translations[language]['languages.spanish'] || "Spanish"}
                        </h5>
                        <div className="space-y-3">
                          <div>
                            <label htmlFor="nameES" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {translations[language]['admin.serviceName'] || "Service Name"} (ES)
                            </label>
                            <input
                              type="text"
                              name="nameES"
                              id="nameES"
                              className="mt-1 focus:ring-accent-500 focus:border-accent-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              value={formData.nameES}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <label htmlFor="descriptionES" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {translations[language]['admin.description'] || "Description"} (ES)
                            </label>
                            <textarea
                              name="descriptionES"
                              id="descriptionES"
                              rows={2}
                              className="mt-1 focus:ring-accent-500 focus:border-accent-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              value={formData.descriptionES}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent-600 text-base font-medium text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isEditMode 
                      ? (translations[language]['admin.updateService'] || "Update Service")
                      : (translations[language]['admin.addService'] || "Add Service")}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                    onClick={() => setIsModalOpen(false)}
                  >
                    {translations[language]['admin.cancel'] || "Cancel"}
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
