import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  structuredData?: Record<string, unknown>;
}

/**
 * SEO component for improving search engine optimization and social sharing
 * Add this component to your pages to customize metadata
 */
const SEO = ({
  title = 'Beautiful Nails Salon - Book Your Appointment Online',
  description = 'Premium nail salon services including manicures, pedicures, gel, acrylics, and nail art. Book your appointment online today!',
  canonicalUrl,
  ogType = 'website',
  ogImage = '/images/salon-og-image.jpg',
  structuredData,
}: SEOProps) => {
  const fullTitle = title.includes('Beautiful Nails') ? title : `${title} | Beautiful Nails Salon`;
  const siteUrl = import.meta.env.VITE_APP_URL || 'https://beautiful-nails-salon.com';
  const fullCanonicalUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
  const fullOgImageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  
  // Default structured data for the local business
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'NailSalon',
    name: 'Beautiful Nails Salon',
    description,
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    image: fullOgImageUrl,
    telephone: '+1-555-123-4567',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Beauty Lane',
      addressLocality: 'Fashion City',
      addressRegion: 'FC',
      postalCode: '12345',
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '40.7128',
      longitude: '-74.0060'
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '19:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '10:00',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday'],
        opens: '11:00',
        closes: '16:00'
      }
    ],
    priceRange: '$$',
    servesCuisine: 'Nail Services'
  };

  const jsonLd = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImageUrl} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImageUrl} />
      
      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};

export default SEO;
