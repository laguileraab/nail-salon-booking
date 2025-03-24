import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import NailCatalog from '../../components/NailCatalog';
import SEO from '../../components/SEO';

const NailDesigns: React.FC = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Category translations
  const categoryTranslations = {
    en: {
      all: 'All',
      manicure: 'Manicure',
      pedicure: 'Pedicure',
      gelPolish: 'Gel Polish',
      acrylicExtensions: 'Acrylic Extensions',
      nailArt: 'Nail Art'
    },
    de: {
      all: 'Alle',
      manicure: 'Maniküre',
      pedicure: 'Pediküre',
      gelPolish: 'Gel-Lack',
      acrylicExtensions: 'Acryl-Verlängerungen',
      nailArt: 'Nagelkunst'
    },
    es: {
      all: 'Todos',
      manicure: 'Manicura',
      pedicure: 'Pedicura',
      gelPolish: 'Esmalte de Gel',
      acrylicExtensions: 'Extensiones Acrílicas',
      nailArt: 'Arte de Uñas'
    }
  };

  const currentCategoryTranslations = 
    language === 'de' ? categoryTranslations.de : 
    language === 'es' ? categoryTranslations.es : 
    categoryTranslations.en;

  const categories = [
    { key: 'all', label: currentCategoryTranslations.all },
    { key: 'manicure', label: currentCategoryTranslations.manicure },
    { key: 'pedicure', label: currentCategoryTranslations.pedicure },
    { key: 'gelPolish', label: currentCategoryTranslations.gelPolish },
    { key: 'acrylicExtensions', label: currentCategoryTranslations.acrylicExtensions },
    { key: 'nailArt', label: currentCategoryTranslations.nailArt }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <SEO 
        title={
          language === 'de' ? 'MärchenNails - Nageldesigns Katalog' : 
          language === 'es' ? 'MärchenNails - Catálogo de Diseños de Uñas' : 
          'MärchenNails - Nail Designs Catalog'
        }
        description={
          language === 'de' ? 'Entdecken Sie unsere vielfältige Auswahl an Nageldesigns und buchen Sie Ihren Termin heute!' : 
          language === 'es' ? 'Descubra nuestra amplia variedad de diseños de uñas y reserve su cita hoy mismo!' : 
          'Explore our wide variety of nail designs and book your appointment today!'
        }
        ogType="website"
      />
      <div className="container mx-auto px-4 py-12">
        <h1 className={`text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {language === 'de' ? 'Nageldesigns Katalog' : 
           language === 'es' ? 'Catálogo de Diseños de Uñas' : 
           'Nail Designs Catalog'}
        </h1>

        {/* Filter categories */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          {categories.map(category => (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                ${activeCategory === category.key 
                  ? (theme === 'dark' ? 'bg-accent-500 text-white' : 'bg-accent-600 text-white') 
                  : (theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Nail catalog with selected category */}
        <NailCatalog category={activeCategory} showAllLink={false} />
      </div>
    </div>
  );
};

export default NailDesigns;
