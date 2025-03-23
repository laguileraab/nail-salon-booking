import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

// Types for business contact information
export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  openingHours: {
    [day: string]: { open: string; close: string; isOpen: boolean };
  };
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}

// Default contact information
const defaultContactInfo: ContactInfo = {
  name: 'MärchenNails',
  email: 'contact@maerchennails.com',
  phone: '+49 30 123 45678',
  address: 'Hauptstraße 123, 10115 Berlin, Germany',
  openingHours: {
    monday: { open: '09:00', close: '18:00', isOpen: true },
    tuesday: { open: '09:00', close: '18:00', isOpen: true },
    wednesday: { open: '09:00', close: '18:00', isOpen: true },
    thursday: { open: '09:00', close: '20:00', isOpen: true },
    friday: { open: '09:00', close: '20:00', isOpen: true },
    saturday: { open: '10:00', close: '17:00', isOpen: true },
    sunday: { open: '10:00', close: '15:00', isOpen: false },
  },
  socialMedia: {
    facebook: 'https://facebook.com/maerchennails',
    instagram: 'https://instagram.com/maerchennails',
    twitter: 'https://twitter.com/maerchennails',
  },
};

interface ContactInfoContextType {
  contactInfo: ContactInfo;
  updateContactInfo: (info: Partial<ContactInfo>) => void;
  isAdmin: boolean;
}

const ContactInfoContext = createContext<ContactInfoContextType | undefined>(undefined);

export const ContactInfoProvider: React.FC<{ children: ReactNode; isAdmin?: boolean }> = ({ 
  children, 
  isAdmin = false 
}) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(() => {
    const savedInfo = localStorage.getItem('contactInfo');
    try {
      return savedInfo ? JSON.parse(savedInfo) as ContactInfo : defaultContactInfo;
    } catch (error) {
      console.error('Failed to parse saved contact info:', error);
      return defaultContactInfo;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('contactInfo', JSON.stringify(contactInfo));
    } catch (error) {
      console.error('Failed to save contact info to localStorage:', error);
    }
  }, [contactInfo]);

  const updateContactInfo = useCallback((info: Partial<ContactInfo>) => {
    setContactInfo(prev => {
      const updated = { ...prev, ...info };
      
      // For nested objects, we need to handle them separately
      if (info.openingHours) {
        updated.openingHours = { ...prev.openingHours, ...info.openingHours };
      }
      
      if (info.socialMedia) {
        updated.socialMedia = { ...prev.socialMedia, ...info.socialMedia };
      }
      
      return updated;
    });
  }, []);

  return (
    <ContactInfoContext.Provider value={{ contactInfo, updateContactInfo, isAdmin }}>
      {children}
    </ContactInfoContext.Provider>
  );
};

export const useContactInfo = (): ContactInfoContextType => {
  const context = useContext(ContactInfoContext);
  if (context === undefined) {
    throw new Error('useContactInfo must be used within a ContactInfoProvider');
  }
  return context;
};
