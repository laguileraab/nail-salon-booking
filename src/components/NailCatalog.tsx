import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export interface NailDesign {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  popular: boolean;
}

interface NailCatalogProps {
  limit?: number;
  showAllLink?: boolean;
  category?: string;
}

const NailCatalog = ({ limit, showAllLink = true, category }: NailCatalogProps) => {
  const [designs, setDesigns] = useState<NailDesign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'Our Nail Designs',
      viewAll: 'View All Designs',
      price: 'Price',
      loading: 'Loading designs...',
      noDesigns: 'No designs available at the moment.',
      categories: {
        all: 'All',
        manicure: 'Manicure',
        pedicure: 'Pedicure',
        gelPolish: 'Gel Polish',
        acrylicExtensions: 'Acrylic Extensions',
        nailArt: 'Nail Art'
      }
    },
    de: {
      title: 'Unsere Nageldesigns',
      viewAll: 'Alle Designs ansehen',
      price: 'Preis',
      loading: 'Designs werden geladen...',
      noDesigns: 'Aktuell sind keine Designs verfügbar.',
      categories: {
        all: 'Alle',
        manicure: 'Maniküre',
        pedicure: 'Pediküre',
        gelPolish: 'Gel-Lack',
        acrylicExtensions: 'Acryl-Verlängerungen',
        nailArt: 'Nagelkunst'
      }
    },
    es: {
      title: 'Nuestros Diseños de Uñas',
      viewAll: 'Ver Todos los Diseños',
      price: 'Precio',
      loading: 'Cargando diseños...',
      noDesigns: 'No hay diseños disponibles en este momento.',
      categories: {
        all: 'Todos',
        manicure: 'Manicura',
        pedicure: 'Pedicura',
        gelPolish: 'Esmalte de Gel',
        acrylicExtensions: 'Extensiones Acrílicas',
        nailArt: 'Arte de Uñas'
      }
    }
  };

  // Get the appropriate translations for the current language
  const currentTranslations = language === 'de' ? translations.de : 
                             language === 'es' ? translations.es : 
                             translations.en;

  // Use useCallback to memoize the fetchDesigns function to prevent unnecessary re-renders
  const fetchDesigns = useCallback(async () => {
    setIsLoading(true);
    try {
      // This would normally be a call to your backend or Supabase
      // For now, we'll use sample data
      setTimeout(() => {
        const sampleDesigns: NailDesign[] = [
          {
            id: '1',
            name: 'Classic French Manicure',
            description: 'Timeless and elegant french tips that suit any occasion.',
            imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371',
            price: 35,
            category: 'manicure',
            popular: true
          },
          {
            id: '2',
            name: 'Gel Polish Full Color',
            description: 'Long-lasting gel polish in the color of your choice.',
            imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b',
            price: 40,
            category: 'gelPolish',
            popular: true
          },
          {
            id: '3',
            name: 'Acrylic Extensions',
            description: 'Full set of acrylic extensions for added length and strength.',
            imageUrl: 'https://images.unsplash.com/photo-1604902396830-aca29e19b2b3',
            price: 55,
            category: 'acrylicExtensions',
            popular: false
          },
          {
            id: '4',
            name: 'Nail Art Design',
            description: 'Custom nail art designs created by our skilled technicians.',
            imageUrl: 'https://images.unsplash.com/photo-1607779097040-28d8a56e32b0',
            price: 45,
            category: 'nailArt',
            popular: true
          },
          {
            id: '5',
            name: 'Spa Pedicure',
            description: 'Relaxing pedicure with exfoliation, massage, and polish.',
            imageUrl: 'https://images.unsplash.com/photo-1582291652525-cde3dbd88162',
            price: 50,
            category: 'pedicure',
            popular: true
          },
          {
            id: '6',
            name: 'Marble Nail Art',
            description: 'Elegant marble effect created with specialized techniques.',
            imageUrl: 'https://images.unsplash.com/photo-1604902396830-aca29e19b2b3',
            price: 60,
            category: 'nailArt',
            popular: false
          },
        ];

        let filteredDesigns = sampleDesigns;
        
        // Filter by category if specified
        if (category && category !== 'all') {
          filteredDesigns = sampleDesigns.filter(design => design.category === category);
        }
        
        // Apply limit if specified
        if (limit && limit > 0) {
          filteredDesigns = filteredDesigns.slice(0, limit);
        }

        setDesigns(filteredDesigns);
        setIsLoading(false);
      }, 800); // Simulate loading delay
    } catch (error: unknown) {
      console.error('Error fetching nail designs:', error instanceof Error ? error.message : String(error));
      setIsLoading(false);
    }
  }, [category, limit]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>{currentTranslations.loading}</p>
      </div>
    );
  }

  if (designs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>{currentTranslations.noDesigns}</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className={`text-3xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} sm:text-4xl`}>
            {currentTranslations.title}
          </h2>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {designs.map((design) => (
              <div 
                key={design.id} 
                className={`relative overflow-hidden rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="h-64 w-full overflow-hidden">
                  <img
                    className="h-full w-full object-cover transform transition duration-500 hover:scale-110"
                    src={design.imageUrl}
                    alt={design.name}
                  />
                </div>
                <div className="p-6">
                  <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{design.name}</h3>
                  <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{design.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-accent-600 font-medium">
                      {currentTranslations.price}: ${design.price}
                    </span>
                    <Link
                      to={`/services/${design.id}`}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
                    >
                      {language === 'de' ? 'Details' : language === 'es' ? 'Detalles' : 'Details'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showAllLink && (
          <div className="mt-12 text-center">
            <Link
              to="/services"
              className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500`}
            >
              {currentTranslations.viewAll}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default NailCatalog;
