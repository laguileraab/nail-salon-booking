import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { fetchNailDesigns, createNailDesign, updateNailDesign, deleteNailDesign } from '../../services/nailDesignService';
import { NailDesign } from '../../components/NailCatalog';
import { useToast } from '../../contexts/ToastContext';

interface NailDesignFormData extends Omit<NailDesign, 'id'> {
  translations: {
    language: string;
    name: string;
    description: string;
  }[];
}

interface CategoryOption {
  value: string;
  labelKey: string;
}

// We need a type-safe way to access translations
interface NestedTranslation {
  [key: string]: string | NestedTranslation;
}

interface TranslationsType {
  [key: string]: NestedTranslation;
}

const CATEGORIES: CategoryOption[] = [
  { value: 'manicure', labelKey: 'manicure' },
  { value: 'pedicure', labelKey: 'pedicure' },
  { value: 'gelPolish', labelKey: 'gelPolish' },
  { value: 'acrylicExtensions', labelKey: 'acrylicExtensions' },
  { value: 'nailArt', labelKey: 'nailArt' }
];

const ManageNailDesigns = (): JSX.Element => {
  const { theme } = useTheme();
  const { language, translations } = useLanguage();
  const { showToast } = useToast();
  
  const [designs, setDesigns] = useState<NailDesign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDesign, setSelectedDesign] = useState<NailDesign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<NailDesignFormData>({
    name: '',
    description: '',
    imageUrl: '',
    fallbackImageUrl: '',
    price: 0,
    category: 'manicure',
    popular: false,
    translations: [
      { language: 'en', name: '', description: '' },
      { language: 'de', name: '', description: '' },
      { language: 'es', name: '', description: '' }
    ]
  });

  // Type-safe access to translations
  const getTranslation = useCallback((path: string, fallback: string): string => {
    const translationsObj = translations as TranslationsType;
    const trans = translationsObj[language] || {};
    const parts = path.split('.');
    let result: string | NestedTranslation = trans;
    
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return fallback;
      }
    }
    
    return typeof result === 'string' ? result : fallback;
  }, [language, translations]);

  // Translation keys
  const t = {
    title: getTranslation('admin.nailDesigns.title', 'Manage Nail Designs'),
    addNewDesign: getTranslation('admin.nailDesigns.addNew', 'Add New Design'),
    editDesign: getTranslation('admin.nailDesigns.edit', 'Edit Design'),
    deleteDesign: getTranslation('admin.nailDesigns.delete', 'Delete Design'),
    confirmDelete: getTranslation('admin.nailDesigns.confirmDelete', 'Are you sure you want to delete this design?'),
    yes: getTranslation('common.yes', 'Yes'),
    no: getTranslation('common.no', 'No'),
    save: getTranslation('common.save', 'Save'),
    cancel: getTranslation('common.cancel', 'Cancel'),
    name: getTranslation('admin.nailDesigns.name', 'Name'),
    description: getTranslation('admin.nailDesigns.description', 'Description'),
    imageUrl: getTranslation('admin.nailDesigns.imageUrl', 'Image URL'),
    fallbackImageUrl: getTranslation('admin.nailDesigns.fallbackImageUrl', 'Fallback Image URL (Optional)'),
    price: getTranslation('admin.nailDesigns.price', 'Price'),
    category: getTranslation('admin.nailDesigns.category', 'Category'),
    popular: getTranslation('admin.nailDesigns.popular', 'Popular'),
    translations: getTranslation('admin.nailDesigns.translations', 'Translations'),
    english: getTranslation('languages.en', 'English'),
    german: getTranslation('languages.de', 'German'),
    spanish: getTranslation('languages.es', 'Spanish'),
    successAdd: getTranslation('admin.nailDesigns.successAdd', 'Design added successfully'),
    successEdit: getTranslation('admin.nailDesigns.successEdit', 'Design updated successfully'),
    successDelete: getTranslation('admin.nailDesigns.successDelete', 'Design deleted successfully'),
    error: getTranslation('common.error', 'An error occurred'),
    categories: {
      manicure: getTranslation('services.manicure', 'Manicure'),
      pedicure: getTranslation('services.pedicure', 'Pedicure'),
      gelPolish: getTranslation('services.gelPolish', 'Gel Polish'),
      acrylicExtensions: getTranslation('services.acrylicExtensions', 'Acrylic Extensions'),
      nailArt: getTranslation('services.nailArt', 'Nail Art')
    },
    noDesigns: getTranslation('admin.nailDesigns.noDesigns', 'No designs found')
  };

  // Load nail designs
  const loadDesigns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNailDesigns(undefined, undefined, language);
      setDesigns(data);
    } catch (error) {
      console.error('Error loading designs:', error);
      showToast(t.error, 'error');
    } finally {
      setLoading(false);
    }
  }, [language, showToast, t.error]);

  useEffect(() => {
    loadDesigns();
  }, [loadDesigns]);

  const openAddModal = (): void => {
    setSelectedDesign(null);
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      fallbackImageUrl: '',
      price: 0,
      category: 'manicure',
      popular: false,
      translations: [
        { language: 'en', name: '', description: '' },
        { language: 'de', name: '', description: '' },
        { language: 'es', name: '', description: '' }
      ]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (design: NailDesign): void => {
    setSelectedDesign(design);
    // Fetch translations or use existing ones
    setFormData({
      name: design.name,
      description: design.description,
      imageUrl: design.imageUrl,
      fallbackImageUrl: design.fallbackImageUrl || '',
      price: design.price,
      category: design.category,
      popular: design.popular,
      translations: [
        { language: 'en', name: design.name, description: design.description },
        { language: 'de', name: '', description: '' },
        { language: 'es', name: '', description: '' }
      ]
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (design: NailDesign): void => {
    setSelectedDesign(design);
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'price') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTranslationChange = (language: string, field: string, value: string): void => {
    setFormData(prev => ({
      ...prev,
      translations: prev.translations.map(t => 
        t.language === language ? { ...t, [field]: value } : t
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      if (selectedDesign) {
        // Update existing design
        const result = await updateNailDesign(
          selectedDesign.id, 
          formData, 
          formData.translations
        );
        
        if (result.success) {
          showToast(t.successEdit, 'success');
          // Reload designs
          await loadDesigns();
        } else {
          showToast(result.error || t.error, 'error');
        }
      } else {
        // Create new design
        const result = await createNailDesign(
          formData, 
          formData.translations
        );
        
        if (result.success) {
          showToast(t.successAdd, 'success');
          // Reload designs
          await loadDesigns();
        } else {
          showToast(result.error || t.error, 'error');
        }
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving design:', error);
      showToast(t.error, 'error');
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!selectedDesign) return;
    
    try {
      const result = await deleteNailDesign(selectedDesign.id);
      
      if (result.success) {
        showToast(t.successDelete, 'success');
        // Remove design from state
        setDesigns(designs.filter(d => d.id !== selectedDesign.id));
      } else {
        showToast(result.error || t.error, 'error');
      }
      
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting design:', error);
      showToast(t.error, 'error');
    }
  };

  const getBackgroundColor = (): string => {
    return theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  };

  const getTextColor = (): string => {
    return theme === 'dark' ? 'text-white' : 'text-gray-900';
  };

  return (
    <div className={`min-h-screen ${getBackgroundColor()} ${getTextColor()} py-10`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <button
            className="px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700"
            onClick={openAddModal}
          >
            {t.addNewDesign}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-600"></div>
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-10">
            <p>{t.noDesigns}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {designs.map(design => (
              <div 
                key={design.id} 
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg shadow-md overflow-hidden`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={design.imageUrl} 
                    alt={design.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (design.fallbackImageUrl) {
                        const target = e.target as HTMLImageElement;
                        target.src = design.fallbackImageUrl;
                      }
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <p className="text-white font-bold">{design.name}</p>
                    <p className="text-white">€{design.price.toFixed(2)}</p>
                  </div>
                  {design.popular && (
                    <div className="absolute top-2 right-2 bg-accent-600 text-white px-2 py-1 rounded text-xs">
                      Popular
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm mb-2 truncate">{design.description}</p>
                  <p className="text-sm">
                    <span className="font-semibold">{t.category}:</span> {t.categories[design.category as keyof typeof t.categories]}
                  </p>
                  <div className="mt-4 flex justify-between">
                    <button
                      className="px-3 py-1 bg-accent-600 text-white rounded-md hover:bg-accent-700 text-sm"
                      onClick={() => openEditModal(design)}
                    >
                      {t.editDesign}
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      onClick={() => openDeleteModal(design)}
                    >
                      {t.deleteDesign}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} w-full max-w-3xl rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto`}>
            <h2 className="text-2xl font-bold mb-4">
              {selectedDesign ? t.editDesign : t.addNewDesign}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Basic information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2">{t.name}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">{t.price}</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-900"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2">{t.description}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-900"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2">{t.imageUrl}</label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">{t.fallbackImageUrl}</label>
                  <input
                    type="text"
                    name="fallbackImageUrl"
                    value={formData.fallbackImageUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2">{t.category}</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-900"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {t.categories[cat.labelKey as keyof typeof t.categories]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="popular"
                      checked={formData.popular}
                      onChange={handleInputChange}
                      className="form-checkbox h-5 w-5 text-accent-600"
                    />
                    <span className="ml-2">{t.popular}</span>
                  </label>
                </div>
              </div>

              {/* Translations */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">{t.translations}</h3>
                
                {/* English */}
                <div className="p-4 mb-4 border rounded-md">
                  <h4 className="font-semibold mb-2">{t.english}</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block mb-2">{t.name}</label>
                      <input
                        type="text"
                        value={formData.translations.find(t => t.language === 'en')?.name || ''}
                        onChange={(e) => handleTranslationChange('en', 'name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">{t.description}</label>
                      <textarea
                        value={formData.translations.find(t => t.language === 'en')?.description || ''}
                        onChange={(e) => handleTranslationChange('en', 'description', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-900"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* German */}
                <div className="p-4 mb-4 border rounded-md">
                  <h4 className="font-semibold mb-2">{t.german}</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block mb-2">{t.name}</label>
                      <input
                        type="text"
                        value={formData.translations.find(t => t.language === 'de')?.name || ''}
                        onChange={(e) => handleTranslationChange('de', 'name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">{t.description}</label>
                      <textarea
                        value={formData.translations.find(t => t.language === 'de')?.description || ''}
                        onChange={(e) => handleTranslationChange('de', 'description', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-900"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Spanish */}
                <div className="p-4 mb-4 border rounded-md">
                  <h4 className="font-semibold mb-2">{t.spanish}</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block mb-2">{t.name}</label>
                      <input
                        type="text"
                        value={formData.translations.find(t => t.language === 'es')?.name || ''}
                        onChange={(e) => handleTranslationChange('es', 'name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">{t.description}</label>
                      <textarea
                        value={formData.translations.find(t => t.language === 'es')?.description || ''}
                        onChange={(e) => handleTranslationChange('es', 'description', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-900"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-md"
                  onClick={() => setIsModalOpen(false)}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} w-full max-w-md rounded-lg shadow-xl p-6`}>
            <h2 className="text-2xl font-bold mb-4">{t.deleteDesign}</h2>
            <p className="mb-6">{t.confirmDelete}</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 border rounded-md"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                {t.no}
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleDelete}
              >
                {t.yes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageNailDesigns;
