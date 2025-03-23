import { useState, useEffect, useCallback } from 'react';
import { NailService } from '../../types/NailService';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiClock, FiCheckCircle } from 'react-icons/fi';
import { bookingService } from '../../services/bookingService';

interface ServiceSelectionProps {
  onServiceSelect: (service: NailService | null) => void;
  selectedServiceId?: string;
}

const ServiceSelection = ({ onServiceSelect, selectedServiceId }: ServiceSelectionProps) => {
  const [services, setServices] = useState<NailService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { theme } = useTheme();
  const { language } = useLanguage();
  
  // Translations
  const translations = {
    en: {
      title: 'Select Service',
      loading: 'Loading services...',
      noServices: 'No services available',
      duration: 'Duration',
      minutes: 'minutes',
      select: 'Select',
      selected: 'Selected',
      price: 'Price',
      allCategories: 'All',
      categories: 'Categories',
      search: 'Search services...',
    },
    de: {
      title: 'Service auswählen',
      loading: 'Dienste werden geladen...',
      noServices: 'Keine Dienste verfügbar',
      duration: 'Dauer',
      minutes: 'Minuten',
      select: 'Auswählen',
      selected: 'Ausgewählt',
      price: 'Preis',
      allCategories: 'Alle',
      categories: 'Kategorien',
      search: 'Dienste suchen...',
    },
    es: {
      title: 'Seleccionar Servicio',
      loading: 'Cargando servicios...',
      noServices: 'No hay servicios disponibles',
      duration: 'Duración',
      minutes: 'minutos',
      select: 'Seleccionar',
      selected: 'Seleccionado',
      price: 'Precio',
      allCategories: 'Todos',
      categories: 'Categorías',
      search: 'Buscar servicios...',
    },
  };

  // Get translations for the current language
  const t = language === 'de' ? translations.de : 
           language === 'es' ? translations.es : 
           translations.en;

  // Fetch services from Supabase
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const servicesData = await bookingService.getServices();
      
      // Map the response to match NailService interface
      const mappedServices: NailService[] = servicesData.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description || '',
        price: service.price,
        durationMinutes: service.duration,
        category: service.category,
        isActive: true,
        // Add translations if available (would come from database in real implementation)
        translations: {}
      }));
      
      setServices(mappedServices);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(mappedServices.map(service => service.category))];
      setCategories(uniqueCategories);
      
      // If a service was previously selected, find and select it again
      if (selectedServiceId) {
        const selectedService = mappedServices.find(service => service.id === selectedServiceId);
        if (selectedService) {
          onServiceSelect(selectedService);
        }
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onServiceSelect, selectedServiceId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleServiceSelect = (service: NailService) => {
    onServiceSelect(service);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter services by category and search query
  const filteredServices = services.filter(service => 
    (activeCategory === 'All' || service.category === activeCategory) &&
    (service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     service.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get the translated name and description based on current language
  const getLocalizedField = (service: NailService, field: 'name' | 'description') => {
    if (language === 'en') return service[field];
    
    const translation = service.translations?.[language as 'de' | 'es'];
    return translation && translation[field] ? translation[field] : service[field];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t.title}</h2>
      
      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          className={`w-full p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} focus:ring-2 focus:ring-accent-500 focus:outline-none`}
          placeholder={t.search}
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      
      {/* Categories */}
      <div>
        <h3 className="font-medium mb-2">{t.categories}</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm ${activeCategory === category
                ? 'bg-accent-600 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              {category === 'All' ? t.allCategories : category}
            </button>
          ))}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent-600"></div>
          <p className="ml-3">{t.loading}</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <p>{t.noServices}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredServices.map(service => (
            <div 
              key={service.id}
              onClick={() => handleServiceSelect(service)}
              className={`p-4 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${selectedServiceId === service.id 
                ? 'ring-2 ring-accent-500 ' + (theme === 'dark' ? 'bg-gray-700' : 'bg-accent-50') 
                : theme === 'dark' 
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-50 shadow-sm'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{getLocalizedField(service, 'name')}</h3>
                  <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {getLocalizedField(service, 'description')}
                  </p>
                </div>
                {selectedServiceId === service.id && (
                  <FiCheckCircle className="text-accent-500 text-xl" />
                )}
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center">
                  <FiClock className={`mr-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    {service.durationMinutes} {t.minutes}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold text-accent-600">
                    €{service.price.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <button 
                className={`mt-3 w-full py-2 rounded-lg text-center text-sm ${selectedServiceId === service.id
                  ? theme === 'dark' 
                    ? 'bg-accent-500 text-white' 
                    : 'bg-accent-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleServiceSelect(service);
                }}
              >
                {selectedServiceId === service.id ? t.selected : t.select}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceSelection;
