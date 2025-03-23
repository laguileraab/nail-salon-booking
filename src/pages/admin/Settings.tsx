import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { FiSave, FiRefreshCw, FiClock, FiMail, FiPhone, FiMapPin, FiDollarSign } from 'react-icons/fi';

interface BusinessSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  currencySymbol: string;
  taxRate: number;
  cancellationPolicy: string;
  bookingNotice: number; // hours in advance
  appointmentBuffer: number; // minutes between appointments
}

const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<BusinessSettings>({
    name: 'Elegant Nails Salon',
    email: 'contact@elegantnails.com',
    phone: '(555) 123-4567',
    address: '123 Main Street, Anytown, AN 12345',
    openingHours: {
      monday: { open: '09:00', close: '18:00', isOpen: true },
      tuesday: { open: '09:00', close: '18:00', isOpen: true },
      wednesday: { open: '09:00', close: '18:00', isOpen: true },
      thursday: { open: '09:00', close: '20:00', isOpen: true },
      friday: { open: '09:00', close: '20:00', isOpen: true },
      saturday: { open: '10:00', close: '17:00', isOpen: true },
      sunday: { open: '10:00', close: '15:00', isOpen: false },
    },
    currencySymbol: '$',
    taxRate: 8.5,
    cancellationPolicy: 'Cancellations must be made at least 24 hours in advance to avoid a cancellation fee.',
    bookingNotice: 2,
    appointmentBuffer: 15,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      // In a real app, we would fetch this from Supabase
      // For now, we'll use the default values
      
      /*
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      if (data) setSettings(data);
      */
      
      // Simulate loading delay
      setTimeout(() => {
        setIsLoading(false);
      }, 600);
    } catch (error: any) {
      console.error('Error fetching settings:', error.message);
      toast.error('Failed to load settings');
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real app, we would save to Supabase
      /*
      const { error } = await supabase
        .from('business_settings')
        .upsert(settings);
      
      if (error) throw error;
      */
      
      // Simulate saving delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error.message);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    setSettings(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleDayToggle = (day: string) => {
    setSettings(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          isOpen: !prev.openingHours[day].isOpen,
        },
      },
    }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Business Settings</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={isLoading}
            className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
          >
            <FiRefreshCw className="-ml-1 mr-2 h-5 w-5" />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
          >
            <FiSave className="-ml-1 mr-2 h-5 w-5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {/* Business Information */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Business Information</h2>
              <p className="mt-1 text-sm text-gray-500">Basic information about your salon.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Business Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={settings.name}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={settings.email}
                      onChange={handleInputChange}
                      className="focus:ring-accent-500 focus:border-accent-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={settings.phone}
                      onChange={handleInputChange}
                      className="focus:ring-accent-500 focus:border-accent-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={settings.address}
                      onChange={handleInputChange}
                      className="focus:ring-accent-500 focus:border-accent-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Business Hours</h2>
              <p className="mt-1 text-sm text-gray-500">Set your salon's working hours.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="space-y-4">
                {Object.entries(settings.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id={`${day}-toggle`}
                        name={`${day}-toggle`}
                        type="checkbox"
                        checked={hours.isOpen}
                        onChange={() => handleDayToggle(day)}
                        className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`${day}-toggle`} className="ml-2 block text-sm font-medium text-gray-700 capitalize w-24">
                        {day}
                      </label>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <label htmlFor={`${day}-open`} className="sr-only">
                          Opening time
                        </label>
                        <input
                          type="time"
                          id={`${day}-open`}
                          value={hours.open}
                          onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                          disabled={!hours.isOpen}
                          className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <span className="text-gray-500">to</span>
                      <div>
                        <label htmlFor={`${day}-close`} className="sr-only">
                          Closing time
                        </label>
                        <input
                          type="time"
                          id={`${day}-close`}
                          value={hours.close}
                          onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                          disabled={!hours.isOpen}
                          className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Settings */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Booking Settings</h2>
              <p className="mt-1 text-sm text-gray-500">Configure how appointments are booked and managed.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="bookingNotice" className="block text-sm font-medium text-gray-700">
                    Minimum Booking Notice (hours)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="number"
                      name="bookingNotice"
                      id="bookingNotice"
                      min="0"
                      value={settings.bookingNotice}
                      onChange={handleInputChange}
                      className="focus:ring-accent-500 focus:border-accent-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">How many hours in advance customers must book.</p>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="appointmentBuffer" className="block text-sm font-medium text-gray-700">
                    Appointment Buffer (minutes)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="number"
                      name="appointmentBuffer"
                      id="appointmentBuffer"
                      min="0"
                      step="5"
                      value={settings.appointmentBuffer}
                      onChange={handleInputChange}
                      className="focus:ring-accent-500 focus:border-accent-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Buffer time between appointments.</p>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="currencySymbol" className="block text-sm font-medium text-gray-700">
                    Currency Symbol
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      name="currencySymbol"
                      id="currencySymbol"
                      value={settings.currencySymbol}
                      onChange={handleInputChange}
                      className="focus:ring-accent-500 focus:border-accent-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
                    Tax Rate (%)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="taxRate"
                      id="taxRate"
                      step="0.01"
                      min="0"
                      value={settings.taxRate}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="cancellationPolicy" className="block text-sm font-medium text-gray-700">
                    Cancellation Policy
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="cancellationPolicy"
                      name="cancellationPolicy"
                      rows={3}
                      value={settings.cancellationPolicy}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">This will be displayed to clients when booking.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
