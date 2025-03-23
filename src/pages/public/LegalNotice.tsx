import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import SEO from '../../components/SEO';

const LegalNotice: React.FC = () => {
  const { language, translations } = useLanguage();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <SEO 
        title={language === 'de' ? 'MärchenNails - Impressum' : 
              language === 'es' ? 'MärchenNails - Aviso Legal' : 
              'MärchenNails - Legal Notice'}
        description="Legal notice for MärchenNails nail salon services"
        ogType="website"
      />
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-accent-600">
          {translations[language]['nav.legal'] || 'Legal Notice'}
        </h1>

        <div className={`prose ${theme === 'dark' ? 'prose-dark' : ''} space-y-6`}>
          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent-500">1. Company Information</h2>
            <p className="mb-2">
              MärchenNails GmbH<br />
              Hauptstraße 123<br />
              10115 Berlin<br />
              Germany
            </p>
            <p className="mb-2">
              Phone: +49 30 1234567<br />
              Email: info@maerchennails.com
            </p>
            <p>
              Commercial Register: Amtsgericht Berlin-Charlottenburg<br />
              Registration Number: HRB 123456<br />
              VAT ID: DE123456789
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent-500">2. Responsible for Content</h2>
            <p>
              Emma Schmidt<br />
              CEO, MärchenNails GmbH<br />
              Address as above
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent-500">3. Disclaimer</h2>
            <h3 className="font-medium mb-2">3.1 Liability for Content</h3>
            <p className="mb-4">
              The contents of our pages have been created with the utmost care. However, we cannot guarantee the 
              accuracy, completeness or topicality of the content. As a service provider, we are responsible for 
              our own content on these pages in accordance with general law. However, we are not obliged to monitor 
              transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.
            </p>
            <h3 className="font-medium mb-2">3.2 Liability for Links</h3>
            <p>
              Our website contains links to external websites over which we have no control. Therefore, we cannot 
              accept any liability for these external contents. The respective provider or operator of the linked 
              pages is always responsible for the contents of the linked pages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent-500">4. Copyright</h2>
            <p>
              The content and works created by the site operators on these pages are subject to German copyright law. 
              Duplication, processing, distribution, or any form of commercialization of such material beyond the scope 
              of the copyright law shall require the prior written consent of its respective author or creator.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent-500">5. Data Protection</h2>
            <p>
              Please refer to our Privacy Policy for information on how we collect, process, and use personal data.
            </p>
          </section>

          <p className="italic text-sm mt-8">Last updated: March 23, 2025</p>
        </div>
      </div>
    </div>
  );
};

export default LegalNotice;
