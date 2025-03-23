import { useState, useEffect, useCallback, useRef } from 'react';
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
  const catalogRef = useRef<HTMLDivElement>(null);
  
  // Translations
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
            imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&auto=format&fit=crop&q=80',
            price: 35,
            category: 'manicure',
            popular: true
          },
          {
            id: '2',
            name: 'Gel Polish Full Color',
            description: 'Long-lasting gel polish in the color of your choice.',
            imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&auto=format&fit=crop&q=80',
            price: 40,
            category: 'gelPolish',
            popular: true
          },
          {
            id: '3',
            name: 'Acrylic Extensions',
            description: 'Full set of acrylic extensions for added length and strength.',
            imageUrl: 'https://images.unsplash.com/photo-1604902396830-aca29e19b2b3?w=400&auto=format&fit=crop&q=80',
            price: 55,
            category: 'acrylicExtensions',
            popular: false
          },
          {
            id: '4',
            name: 'Nail Art Design',
            description: 'Custom nail art designs created by our skilled technicians.',
            imageUrl: 'https://images.unsplash.com/photo-1607779097040-28d8a56e32b0?w=400&auto=format&fit=crop&q=80',
            price: 45,
            category: 'nailArt',
            popular: true
          },
          {
            id: '5',
            name: 'Spa Pedicure',
            description: 'Relaxing pedicure with exfoliation, massage, and polish.',
            imageUrl: 'https://images.unsplash.com/photo-1582291652525-cde3dbd88162?w=400&auto=format&fit=crop&q=80',
            price: 50,
            category: 'pedicure',
            popular: true
          },
          {
            id: '6',
            name: 'Marble Nail Art',
            description: 'Elegant marble effect created with specialized techniques.',
            imageUrl: 'https://images.unsplash.com/photo-1604902396830-aca29e19b2b3?w=400&auto=format&fit=crop&q=80',
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
      }, 500); // Reduced loading delay
    } catch (error: unknown) {
      console.error('Error fetching nail designs:', error instanceof Error ? error.message : String(error));
      setIsLoading(false);
    }
  }, [category, limit]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  // Handle scroll performance
  useEffect(() => {
    if (!catalogRef.current) return;

    const handleScroll = () => {
      if (!catalogRef.current) return;
      
      // Add will-change property during scroll for better performance
      catalogRef.current.style.willChange = 'transform';
      
      // Remove will-change after scroll stops to save memory
      const cleanup = () => {
        if (catalogRef.current) {
          catalogRef.current.style.willChange = 'auto';
        }
      };
      
      // Debounce the cleanup
      const timeoutId = setTimeout(cleanup, 100);
      return () => clearTimeout(timeoutId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="py-8" ref={catalogRef}>
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
                className={`relative overflow-hidden rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} transform transition duration-300 hover:scale-105 will-change-transform`}
              >
                <div className="aspect-w-3 aspect-h-2 overflow-hidden">
                  <img 
                    src={design.imageUrl} 
                    alt={design.name}
                    loading="lazy" 
                    className="w-full h-48 object-cover transform transition duration-300 hover:scale-110 will-change-transform"
                    style={{ 
                      transform: 'translate3d(0, 0, 0)',
                      backfaceVisibility: 'hidden' 
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{design.name}</h3>
                  <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{design.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-accent-600 font-bold">${design.price}</p>
                    <Link 
                      to="/booking" 
                      className={`text-sm font-medium px-4 py-2 rounded ${theme === 'dark' ? 'bg-accent-500 text-white hover:bg-accent-600' : 'bg-accent-100 text-accent-700 hover:bg-accent-200'}`}
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {showAllLink && designs.length > 0 && (
            <div className="mt-12 text-center">
              <Link 
                to="/designs" 
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm ${theme === 'dark' ? 'bg-accent-500 text-white hover:bg-accent-600' : 'bg-accent-600 text-white hover:bg-accent-700'}`}
              >
                {currentTranslations.viewAll}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NailCatalog;
