import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const Imprint: React.FC = () => {
  const { language, translations } = useLanguage();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-accent-600">
          {translations[language]['nav.imprint'] || 'Imprint'}
        </h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent-500">Information According to § 5 TMG</h2>
            <p className="mb-2">
              MärchenNails GmbH<br />
              Hauptstraße 123<br />
              10115 Berlin<br />
              Germany
            </p>
            <p className="mb-2">
              Commercial Register: Amtsgericht Berlin-Charlottenburg<br />
              Registration Number: HRB 123456<br />
              VAT ID: DE123456789
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent-500">Contact</h2>
            <p className="mb-2">
              Phone: +49 30 1234567<br />
              Email: info@maerchennails.com<br />
              Website: www.maerchennails.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent-500">Responsible for Content</h2>
            <p>
              Emma Schmidt<br />
              CEO, MärchenNails GmbH<br />
              (Address as above)
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent-500">EU Dispute Resolution</h2>
            <p>
              The European Commission provides a platform for online dispute resolution (OS):
              https://ec.europa.eu/consumers/odr/
              Our email address is listed above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent-500">Consumer Dispute Resolution</h2>
            <p>
              We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent-500">Liability for Content</h2>
            <p>
              As a service provider, we are responsible for our own content on these pages according to general laws. 
              However, we are not obligated to monitor transmitted or stored third-party information or to investigate 
              circumstances that indicate illegal activity. Obligations to remove or block the use of information under 
              general laws remain unaffected. However, liability in this regard is only possible from the point in time 
              at which a concrete infringement of the law is known. If we become aware of any such legal violations, 
              we will remove the content in question immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent-500">Liability for Links</h2>
            <p>
              Our website contains links to external third-party websites over whose content we have no control. 
              We cannot, therefore, accept any liability for this third-party content. The respective provider 
              or operator of the linked pages is always responsible for the content of the linked pages. 
              The linked pages were checked for possible legal violations at the time the links were created. 
              No illegal content was apparent at that time. However, permanent monitoring of the content of the 
              linked pages is not reasonable without concrete indication of a legal violation. If we become aware 
              of any legal violations, we will remove such links immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent-500">Copyright</h2>
            <p>
              The content and works created by the site operators on these pages are subject to German copyright law. 
              Duplication, processing, distribution, or any form of commercialization of such material beyond the scope 
              of the copyright law shall require the prior written consent of its respective author or creator. 
              Downloads and copies of this site are only permitted for private, non-commercial use. Insofar as the 
              content on this site was not created by the operator, the copyrights of third parties are respected. 
              In particular, third-party content is marked as such. Should you nevertheless become aware of a copyright 
              infringement, please inform us accordingly. If we become aware of any infringements, we will remove such 
              content immediately.
            </p>
          </section>
        </div>

        <p className="mt-10 text-sm">Last updated: March 2025</p>
      </div>
    </div>
  );
};

export default Imprint;
