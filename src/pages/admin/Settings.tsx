import { useState, useEffect, useCallback } from 'react';
// Import is preserved but commented for future implementation with real database
// import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { FiSave, FiRefreshCw, FiMail, FiPhone, FiMapPin, FiDollarSign, FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';
import SEO from '../../components/SEO';
import WorkingHoursManager, { WorkingHours } from '../../components/admin/WorkingHoursManager';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useContactInfo } from '../../contexts/ContactInfoContext';

// Settings interfaces
interface BusinessSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  openingHours: WorkingHours;
  currencySymbol: string;
  taxRate: number;
  cancellationPolicy: string;
  bookingNotice: number; // hours in advance
  appointmentBuffer: number; // minutes between appointments
}

const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { contactInfo, updateContactInfo } = useContactInfo();
  
  const [settings, setSettings] = useState<BusinessSettings>({
    name: contactInfo.name,
    email: contactInfo.email,
    phone: contactInfo.phone,
    address: contactInfo.address,
    openingHours: contactInfo.openingHours,
    currencySymbol: '€', // Euro symbol since it's a European business
    taxRate: 19, // Standard German VAT rate
    cancellationPolicy: 'Cancellations must be made at least 24 hours in advance to avoid a cancellation fee.',
    bookingNotice: 2,
    appointmentBuffer: 15,
  });

  // Translations
  const translations = {
    en: {
      businessSettings: 'Business Settings',
      refresh: 'Refresh',
      save: 'Save Changes',
      saving: 'Saving...',
      loading: 'Loading settings...',
      businessInfo: 'Business Information',
      basicInfo: 'Basic information about your salon.',
      businessName: 'Business Name',
      emailAddress: 'Email Address',
      phoneNumber: 'Phone Number',
      address: 'Address',
      bookingSettings: 'Booking Settings',
      bookingInfo: 'Configure parameters for appointment booking.',
      currency: 'Currency Symbol',
      taxRate: 'Tax Rate (%)',
      cancellationPolicy: 'Cancellation Policy',
      bookingNotice: 'Minimum Booking Notice (hours)',
      appointmentBuffer: 'Buffer Between Appointments (minutes)',
      successMessage: 'Settings saved successfully',
      errorMessage: 'Failed to save settings',
      socialMedia: 'Social Media',
      socialMediaInfo: 'Links to your social media profiles.',
      facebook: 'Facebook URL',
      instagram: 'Instagram URL',
      twitter: 'Twitter URL'
    },
    de: {
      businessSettings: 'Geschäftseinstellungen',
      refresh: 'Aktualisieren',
      save: 'Änderungen speichern',
      saving: 'Speichern...',
      loading: 'Einstellungen werden geladen...',
      businessInfo: 'Unternehmensinformationen',
      basicInfo: 'Grundlegende Informationen über Ihren Salon.',
      businessName: 'Unternehmensname',
      emailAddress: 'E-Mail-Adresse',
      phoneNumber: 'Telefonnummer',
      address: 'Adresse',
      bookingSettings: 'Buchungseinstellungen',
      bookingInfo: 'Parameter für die Terminbuchung konfigurieren.',
      currency: 'Währungssymbol',
      taxRate: 'Steuersatz (%)',
      cancellationPolicy: 'Stornierungsrichtlinie',
      bookingNotice: 'Mindestreservierungsfrist (Stunden)',
      appointmentBuffer: 'Puffer zwischen Terminen (Minuten)',
      successMessage: 'Einstellungen erfolgreich gespeichert',
      errorMessage: 'Fehler beim Speichern der Einstellungen',
      socialMedia: 'Soziale Medien',
      socialMediaInfo: 'Links zu Ihren Social-Media-Profilen.',
      facebook: 'Facebook URL',
      instagram: 'Instagram URL',
      twitter: 'Twitter URL'
    },
    es: {
      businessSettings: 'Configuración de Negocio',
      refresh: 'Actualizar',
      save: 'Guardar Cambios',
      saving: 'Guardando...',
      loading: 'Cargando configuración...',
      businessInfo: 'Información del Negocio',
      basicInfo: 'Información básica sobre su salón.',
      businessName: 'Nombre del Negocio',
      emailAddress: 'Correo Electrónico',
      phoneNumber: 'Número de Teléfono',
      address: 'Dirección',
      bookingSettings: 'Configuración de Reservas',
      bookingInfo: 'Configurar parámetros para la reserva de citas.',
      currency: 'Símbolo de Moneda',
      taxRate: 'Tasa de Impuestos (%)',
      cancellationPolicy: 'Política de Cancelación',
      bookingNotice: 'Aviso Mínimo para Reservas (horas)',
      appointmentBuffer: 'Tiempo entre Citas (minutos)',
      successMessage: 'Configuración guardada con éxito',
      errorMessage: 'Error al guardar la configuración',
      socialMedia: 'Redes Sociales',
      socialMediaInfo: 'Enlaces a sus perfiles de redes sociales.',
      facebook: 'URL de Facebook',
      instagram: 'URL de Instagram',
      twitter: 'URL de Twitter'
    }
  };

  // Get translations for the current language
  const t = language === 'de' ? translations.de : 
           language === 'es' ? translations.es : 
           translations.en;

  // Define fetchSettings as a useCallback to avoid infinite loops
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate loading delay
      setTimeout(() => {
        setSettings({
          ...settings,
          name: contactInfo.name,
          email: contactInfo.email,
          phone: contactInfo.phone,
          address: contactInfo.address,
          openingHours: contactInfo.openingHours,
        });
        setIsLoading(false);
      }, 600);
    } catch (error: unknown) {
      console.error('Error fetching settings:', error instanceof Error ? error.message : String(error));
      toast.error(t.errorMessage);
      setIsLoading(false);
    }
  }, [t.errorMessage, contactInfo, settings]); // Add contactInfo as a dependency

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]); // Add fetchSettings as a dependency

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update contact info
      updateContactInfo({
        name: settings.name,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        openingHours: settings.openingHours,
      });
      
      // Simulate saving delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success(t.successMessage);
    } catch (error: unknown) {
      console.error('Error saving settings:', error instanceof Error ? error.message : String(error));
      toast.error(t.errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'taxRate' || name === 'bookingNotice' || name === 'appointmentBuffer' 
        ? parseFloat(value) 
        : value,
    }));
  };

  const handleWorkingHoursChange = async (hours: WorkingHours) => {
    setSettings(prev => ({
      ...prev,
      openingHours: hours
    }));
    
    // We'll handle actual saving through the main save button,
    // but we could implement auto-save here if desired
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
      <SEO title={t.businessSettings} />
      <div className="flex mb-6">
        <h1 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t.businessSettings}
        </h1>
        <div className="ml-auto flex">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={isLoading}
            className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 mr-3`}
          >
            <FiRefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t.refresh}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500`}
          >
            {isSaving ? (
              <>
                <FiRefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {t.saving}
              </>
            ) : (
              <>
                <FiSave className="mr-2 h-4 w-4" />
                {t.save}
              </>
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={`animate-pulse flex items-center justify-center h-64 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <FiRefreshCw className="mr-2 h-5 w-5 animate-spin" />
          {t.loading}
        </div>
      ) : (
        <form>
          {/* Business Information Section */}
          <div className="space-y-8 divide-y divide-gray-200">
            <div>
              <div>
                <h3 className={`text-lg leading-6 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t.businessInfo}</h3>
                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{t.basicInfo}</p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t.businessName}
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={settings.name}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'} shadow-sm focus:ring-accent-500 focus:border-accent-500 sm:text-sm`}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="email" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t.emailAddress}
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex items-stretch flex-grow focus-within:z-10">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={settings.email}
                        onChange={handleInputChange}
                        className={`block w-full rounded-md pl-10 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'} shadow-sm focus:ring-accent-500 focus:border-accent-500 sm:text-sm`}
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="phone" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t.phoneNumber}
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex items-stretch flex-grow focus-within:z-10">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={settings.phone}
                        onChange={handleInputChange}
                        className={`block w-full rounded-md pl-10 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'} shadow-sm focus:ring-accent-500 focus:border-accent-500 sm:text-sm`}
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="address" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t.address}
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex items-stretch flex-grow focus-within:z-10">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        type="text"
                        name="address"
                        id="address"
                        value={settings.address}
                        onChange={handleInputChange}
                        className={`block w-full rounded-md pl-10 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'} shadow-sm focus:ring-accent-500 focus:border-accent-500 sm:text-sm`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social Media Section */}
            <div className="pt-8">
              <div>
                <h3 className={`text-lg leading-6 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t.socialMedia}</h3>
                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{t.socialMediaInfo}</p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="facebook" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t.facebook}
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex items-stretch flex-grow focus-within:z-10">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiFacebook className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        type="url"
                        name="facebookUrl"
                        id="facebook"
                        value={contactInfo.socialMedia.facebook}
                        onChange={(e) => updateContactInfo({
                          socialMedia: {
                            ...contactInfo.socialMedia,
                            facebook: e.target.value
                          }
                        })}
                        className={`block w-full rounded-md pl-10 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'} shadow-sm focus:ring-accent-500 focus:border-accent-500 sm:text-sm`}
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="instagram" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t.instagram}
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex items-stretch flex-grow focus-within:z-10">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiInstagram className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        type="url"
                        name="instagramUrl"
                        id="instagram"
                        value={contactInfo.socialMedia.instagram}
                        onChange={(e) => updateContactInfo({
                          socialMedia: {
                            ...contactInfo.socialMedia,
                            instagram: e.target.value
                          }
                        })}
                        className={`block w-full rounded-md pl-10 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'} shadow-sm focus:ring-accent-500 focus:border-accent-500 sm:text-sm`}
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="twitter" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t.twitter}
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex items-stretch flex-grow focus-within:z-10">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiTwitter className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        type="url"
                        name="twitterUrl"
                        id="twitter"
                        value={contactInfo.socialMedia.twitter}
                        onChange={(e) => updateContactInfo({
                          socialMedia: {
                            ...contactInfo.socialMedia,
                            twitter: e.target.value
                          }
                        })}
                        className={`block w-full rounded-md pl-10 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'} shadow-sm focus:ring-accent-500 focus:border-accent-500 sm:text-sm`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Working Hours Manager */}
          <div className="mt-8">
            <WorkingHoursManager 
              initialHours={settings.openingHours} 
              onSave={handleWorkingHoursChange}
              isLoading={isLoading || isSaving}
            />
          </div>

          {/* Booking Settings */}
          <div className="mt-8">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow sm:rounded-lg`}>
              <div className="px-4 py-5 sm:px-6">
                <h2 className={`text-lg leading-6 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t.bookingSettings}</h2>
                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{t.bookingInfo}</p>
              </div>
              <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} px-4 py-5 sm:px-6`}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-2">
                    <label htmlFor="currencySymbol" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t.currency}
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiDollarSign className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} aria-hidden="true" />
                      </div>
                      <input
                        type="text"
                        name="currencySymbol"
                        id="currencySymbol"
                        value={settings.currencySymbol}
                        onChange={handleInputChange}
                        className={`focus:ring-accent-500 focus:border-accent-500 block w-full pl-10 sm:text-sm rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="taxRate" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t.taxRate}
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="taxRate"
                        id="taxRate"
                        min="0"
                        max="100"
                        step="0.5"
                        value={settings.taxRate}
                        onChange={handleInputChange}
                        className={`shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="bookingNotice" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t.bookingNotice}
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="bookingNotice"
                        id="bookingNotice"
                        min="0"
                        step="1"
                        value={settings.bookingNotice}
                        onChange={handleInputChange}
                        className={`shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="appointmentBuffer" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t.appointmentBuffer}
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="appointmentBuffer"
                        id="appointmentBuffer"
                        min="0"
                        step="5"
                        value={settings.appointmentBuffer}
                        onChange={handleInputChange}
                        className={`shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="cancellationPolicy" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t.cancellationPolicy}
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="cancellationPolicy"
                        name="cancellationPolicy"
                        rows={3}
                        value={settings.cancellationPolicy}
                        onChange={handleInputChange}
                        className={`shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminSettings;
