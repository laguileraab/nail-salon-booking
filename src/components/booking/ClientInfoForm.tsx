import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiUser, FiMail, FiPhone, FiMessageSquare } from 'react-icons/fi';

interface ClientInfoFormProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}

const ClientInfoForm: React.FC<ClientInfoFormProps> = ({
  firstName,
  lastName,
  email,
  phone,
  notes,
  onInputChange,
  errors,
}) => {
  const { theme } = useTheme();
  const { language } = useLanguage();

  // Translations
  const translations = {
    en: {
      personalInfo: 'Personal Information',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone Number',
      notes: 'Special Requests or Notes (optional)',
      requiredField: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
    },
    de: {
      personalInfo: 'Persönliche Informationen',
      firstName: 'Vorname',
      lastName: 'Nachname',
      email: 'E-Mail',
      phone: 'Telefonnummer',
      notes: 'Besondere Anfragen oder Anmerkungen (optional)',
      requiredField: 'Dieses Feld ist erforderlich',
      invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      invalidPhone: 'Bitte geben Sie eine gültige Telefonnummer ein',
    },
    es: {
      personalInfo: 'Información Personal',
      firstName: 'Nombre',
      lastName: 'Apellido',
      email: 'Correo Electrónico',
      phone: 'Número de Teléfono',
      notes: 'Solicitudes Especiales o Notas (opcional)',
      requiredField: 'Este campo es obligatorio',
      invalidEmail: 'Por favor ingrese una dirección de correo electrónico válida',
      invalidPhone: 'Por favor ingrese un número de teléfono válido',
    },
  };

  // Get translations for the current language
  const t = language === 'de' ? translations.de : 
           language === 'es' ? translations.es : 
           translations.en;

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-md p-6`}>
      <h3 className="text-lg font-semibold mb-4">{t.personalInfo}</h3>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            {t.firstName} *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
            </div>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={firstName}
              onChange={onInputChange}
              className={`pl-10 block w-full rounded-md py-2 px-3 ${theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-accent-500 focus:border-accent-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:ring-accent-500 focus:border-accent-500'} 
                ${errors.firstName ? 'border-red-500' : ''}`}
              required
            />
          </div>
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">
            {t.lastName} *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
            </div>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={onInputChange}
              className={`pl-10 block w-full rounded-md py-2 px-3 ${theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-accent-500 focus:border-accent-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:ring-accent-500 focus:border-accent-500'} 
                ${errors.lastName ? 'border-red-500' : ''}`}
              required
            />
          </div>
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            {t.email} *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onInputChange}
              className={`pl-10 block w-full rounded-md py-2 px-3 ${theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-accent-500 focus:border-accent-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:ring-accent-500 focus:border-accent-500'} 
                ${errors.email ? 'border-red-500' : ''}`}
              required
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            {t.phone} *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiPhone className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={onInputChange}
              className={`pl-10 block w-full rounded-md py-2 px-3 ${theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-accent-500 focus:border-accent-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:ring-accent-500 focus:border-accent-500'} 
                ${errors.phone ? 'border-red-500' : ''}`}
              required
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="mt-4">
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          {t.notes}
        </label>
        <div className="relative">
          <div className="absolute top-3 left-3 flex items-start pointer-events-none">
            <FiMessageSquare className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
          </div>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={notes}
            onChange={onInputChange}
            className={`pl-10 block w-full rounded-md py-2 px-3 ${theme === 'dark' 
              ? 'bg-gray-700 border-gray-600 text-white focus:ring-accent-500 focus:border-accent-500' 
              : 'bg-white border-gray-300 text-gray-900 focus:ring-accent-500 focus:border-accent-500'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientInfoForm;
