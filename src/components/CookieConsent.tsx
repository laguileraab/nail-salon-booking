import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

interface CookieSettings {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const { theme } = useTheme();
  const { language } = useLanguage();

  const [cookieSettings, setCookieSettings] = useState<CookieSettings>({
    necessary: true, // Always required
    functional: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if the user has already made a choice
    const consentGiven = localStorage.getItem('cookieConsentGiven');
    if (!consentGiven) {
      // Show the cookie banner after a short delay
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    // Load saved settings if consent was given
    if (consentGiven === 'true') {
      const savedSettings = localStorage.getItem('cookieSettings');
      if (savedSettings) {
        try {
          setCookieSettings(JSON.parse(savedSettings));
        } catch (error: unknown) {
          console.error('Error parsing cookie settings:', error instanceof Error ? error.message : String(error));
        }
      }
    }
  }, []);

  const saveCookieSettings = useCallback((settings: CookieSettings) => {
    localStorage.setItem('cookieConsentGiven', 'true');
    localStorage.setItem('cookieSettings', JSON.stringify(settings));

    // Here you would normally implement the actual cookie handling logic
    // For example, enabling/disabling Google Analytics based on analytics setting
    
    // This is a placeholder for actual implementation
    console.log('Cookie settings saved:', settings);
  }, []);

  const handleAcceptAll = useCallback(() => {
    const settings: CookieSettings = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    saveCookieSettings(settings);
    setVisible(false);
  }, [saveCookieSettings]);

  const handleAcceptSelected = useCallback(() => {
    saveCookieSettings(cookieSettings);
    setVisible(false);
  }, [cookieSettings, saveCookieSettings]);

  const handleRejectAll = useCallback(() => {
    const settings: CookieSettings = {
      necessary: true, // Always needed
      functional: false,
      analytics: false,
      marketing: false
    };
    saveCookieSettings(settings);
    setVisible(false);
  }, [saveCookieSettings]);

  const handleSettingChange = useCallback((setting: keyof CookieSettings) => {
    if (setting === 'necessary') return; // Cannot toggle necessary cookies
    
    setCookieSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  }, [setCookieSettings]);

  const translations = {
    en: {
      title: 'Cookie Settings',
      description: 'We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.',
      necessary: 'Necessary (Required)',
      necessaryDesc: 'Essential cookies enable core functionality. The website cannot function properly without these cookies, and they can only be disabled by changing your browser preferences.',
      functional: 'Functional',
      functionalDesc: 'Functional cookies help perform certain functionalities like sharing content on social media platforms, collecting feedback, and other third-party features.',
      analytics: 'Analytics',
      analyticsDesc: 'Analytical cookies help us understand how visitors interact with our website, allowing us to improve user experience and website functionality.',
      marketing: 'Marketing',
      marketingDesc: 'Marketing cookies are used to track visitors across websites to display relevant advertisements that are engaging and valuable to the visitor.',
      acceptAll: 'Accept All',
      acceptSelected: 'Accept Selected',
      rejectAll: 'Reject All',
      preferences: 'Preferences',
      moreInfo: 'For more information, please view our',
      privacyPolicy: 'Privacy Policy'
    },
    de: {
      title: 'Cookie-Einstellungen',
      description: 'Wir verwenden Cookies, um Ihr Surferlebnis zu verbessern, personalisierte Anzeigen oder Inhalte bereitzustellen und unseren Datenverkehr zu analysieren. Indem Sie auf "Alle akzeptieren" klicken, stimmen Sie der Verwendung von Cookies zu.',
      necessary: 'Notwendig (Erforderlich)',
      necessaryDesc: 'Notwendige Cookies ermöglichen die Kernfunktionalität. Die Website kann ohne diese Cookies nicht richtig funktionieren und kann nur durch Änderung Ihrer Browsereinstellungen deaktiviert werden.',
      functional: 'Funktional',
      functionalDesc: 'Funktionale Cookies helfen bei der Ausführung bestimmter Funktionen wie dem Teilen von Inhalten auf sozialen Medienplattformen, dem Sammeln von Feedback und anderen Funktionen von Drittanbietern.',
      analytics: 'Analytik',
      analyticsDesc: 'Analytische Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, was uns ermöglicht, die Benutzererfahrung und die Funktionalität der Website zu verbessern.',
      marketing: 'Marketing',
      marketingDesc: 'Marketing-Cookies werden verwendet, um Besucher über Websites hinweg zu verfolgen, um relevante Werbung anzuzeigen, die für den Besucher ansprechend und wertvoll ist.',
      acceptAll: 'Alle akzeptieren',
      acceptSelected: 'Ausgewählte akzeptieren',
      rejectAll: 'Alle ablehnen',
      preferences: 'Einstellungen',
      moreInfo: 'Weitere Informationen finden Sie in unserer',
      privacyPolicy: 'Datenschutzerklärung'
    },
    es: {
      title: 'Configuración de Cookies',
      description: 'Utilizamos cookies para mejorar su experiencia de navegación, mostrar anuncios o contenido personalizado y analizar nuestro tráfico. Al hacer clic en "Aceptar todo", usted consiente nuestro uso de cookies.',
      necessary: 'Necesarias (Requeridas)',
      necessaryDesc: 'Las cookies esenciales permiten la funcionalidad central. El sitio web no puede funcionar correctamente sin estas cookies, y solo se pueden deshabilitar cambiando las preferencias de su navegador.',
      functional: 'Funcionales',
      functionalDesc: 'Las cookies funcionales ayudan a realizar ciertas funcionalidades como compartir contenido en plataformas de redes sociales, recopilar comentarios y otras características de terceros.',
      analytics: 'Analíticas',
      analyticsDesc: 'Las cookies analíticas nos ayudan a comprender cómo los visitantes interactúan con nuestro sitio web, lo que nos permite mejorar la experiencia del usuario y la funcionalidad del sitio web.',
      marketing: 'Marketing',
      marketingDesc: 'Las cookies de marketing se utilizan para rastrear a los visitantes en los sitios web y mostrar anuncios relevantes que sean atractivos y valiosos para el visitante.',
      acceptAll: 'Aceptar todo',
      acceptSelected: 'Aceptar seleccionadas',
      rejectAll: 'Rechazar todo',
      preferences: 'Preferencias',
      moreInfo: 'Para más información, consulte nuestra',
      privacyPolicy: 'Política de Privacidad'
    }
  };

  // Get the appropriate translations for the current language
  const currentTranslations = language === 'de' ? translations.de : 
                             language === 'es' ? translations.es : 
                             translations.en;

  if (!visible) {
    return null;
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto">
        {!showPreferences ? (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0 md:pr-8">
              <h3 className="text-lg font-medium mb-2">{currentTranslations.title}</h3>
              <p className="text-sm">
                {currentTranslations.description}
              </p>
              <p className="text-sm mt-2">
                {currentTranslations.moreInfo} <Link to="/privacy-policy" className="text-accent-600 hover:text-accent-500">{currentTranslations.privacyPolicy}</Link>.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
              <button 
                onClick={() => setShowPreferences(true)}
                className={`px-4 py-2 text-sm rounded-md border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}
              >
                {currentTranslations.preferences}
              </button>
              <button 
                onClick={handleRejectAll}
                className={`px-4 py-2 text-sm rounded-md border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}
              >
                {currentTranslations.rejectAll}
              </button>
              <button 
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm bg-accent-600 text-white rounded-md hover:bg-accent-700"
              >
                {currentTranslations.acceptAll}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{currentTranslations.title}</h3>
              <button 
                onClick={() => setShowPreferences(false)}
                className="text-accent-600 hover:text-accent-500"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              {/* Necessary Cookies */}
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{currentTranslations.necessary}</h4>
                    <p className="text-sm mt-1">{currentTranslations.necessaryDesc}</p>
                  </div>
                  <div className="ml-4">
                    <input 
                      type="checkbox" 
                      checked={cookieSettings.necessary} 
                      disabled 
                      className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500" 
                    />
                  </div>
                </div>
              </div>
              
              {/* Functional Cookies */}
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{currentTranslations.functional}</h4>
                    <p className="text-sm mt-1">{currentTranslations.functionalDesc}</p>
                  </div>
                  <div className="ml-4">
                    <input 
                      type="checkbox" 
                      checked={cookieSettings.functional} 
                      onChange={() => handleSettingChange('functional')}
                      className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500" 
                    />
                  </div>
                </div>
              </div>
              
              {/* Analytics Cookies */}
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{currentTranslations.analytics}</h4>
                    <p className="text-sm mt-1">{currentTranslations.analyticsDesc}</p>
                  </div>
                  <div className="ml-4">
                    <input 
                      type="checkbox" 
                      checked={cookieSettings.analytics} 
                      onChange={() => handleSettingChange('analytics')}
                      className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500" 
                    />
                  </div>
                </div>
              </div>
              
              {/* Marketing Cookies */}
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{currentTranslations.marketing}</h4>
                    <p className="text-sm mt-1">{currentTranslations.marketingDesc}</p>
                  </div>
                  <div className="ml-4">
                    <input 
                      type="checkbox" 
                      checked={cookieSettings.marketing} 
                      onChange={() => handleSettingChange('marketing')}
                      className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500" 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                onClick={handleRejectAll}
                className={`px-4 py-2 text-sm rounded-md border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}
              >
                {currentTranslations.rejectAll}
              </button>
              <button 
                onClick={handleAcceptSelected}
                className="px-4 py-2 text-sm bg-accent-600 text-white rounded-md hover:bg-accent-700"
              >
                {currentTranslations.acceptSelected}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;
