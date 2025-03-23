import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { FiSave, FiLock, FiUser, FiBell } from 'react-icons/fi';

const Settings = () => {
  const { profile, updateProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  
  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_reminders: true,
    email_promotions: false,
    sms_reminders: true,
    sms_promotions: false,
  });

  // Load user profile data
  useEffect(() => {
    if (profile) {
      setProfileForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
      
      // Fetch notification preferences from user metadata or defaults
      const fetchNotificationPrefs = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('notification_preferences')
            .eq('id', profile.id)
            .single();
          
          if (error) throw error;
          if (data?.notification_preferences) {
            setNotificationPrefs(data.notification_preferences);
          }
        } catch (error) {
          console.error('Error fetching notification preferences:', error);
        }
      };
      
      fetchNotificationPrefs();
    }
  }, [profile]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationPrefs((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setIsLoading(true);
    try {
      // Update profile in the database
      const { error } = await updateProfile({
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        phone: profileForm.phone,
      });
      
      if (error) throw error;
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.new_password.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.new_password,
      });
      
      if (error) throw error;
      
      // Reset form
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      
      toast.success('Password updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
      console.error('Error updating password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setIsLoading(true);
    try {
      // Update notification preferences in the database
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: notificationPrefs })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      toast.success('Notification preferences updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update notification preferences');
      console.error('Error updating notification preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // In a real implementation, you would need a more secure way to delete accounts
        // This is a simplified example
        const { error } = await supabase.auth.admin.deleteUser(profile?.id || '');
        
        if (error) throw error;
        
        await signOut();
        toast.success('Account deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete account');
        console.error('Error deleting account:', error);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Account Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account information and preferences</p>
      </div>

      <div className="mt-6">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-accent-500 focus:ring-accent-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="profile">Profile</option>
            <option value="password">Password</option>
            <option value="notifications">Notifications</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('profile')}
              className={`${activeTab === 'profile' ? 'bg-accent-100 text-accent-700' : 'text-gray-500 hover:text-gray-700'} px-3 py-2 font-medium text-sm rounded-md`}
              aria-current={activeTab === 'profile' ? 'page' : undefined}
            >
              <FiUser className="-ml-0.5 mr-2 h-4 w-4 inline-block" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`${activeTab === 'password' ? 'bg-accent-100 text-accent-700' : 'text-gray-500 hover:text-gray-700'} px-3 py-2 font-medium text-sm rounded-md`}
              aria-current={activeTab === 'password' ? 'page' : undefined}
            >
              <FiLock className="-ml-0.5 mr-2 h-4 w-4 inline-block" />
              Password
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`${activeTab === 'notifications' ? 'bg-accent-100 text-accent-700' : 'text-gray-500 hover:text-gray-700'} px-3 py-2 font-medium text-sm rounded-md`}
              aria-current={activeTab === 'notifications' ? 'page' : undefined}
            >
              <FiBell className="-ml-0.5 mr-2 h-4 w-4 inline-block" />
              Notifications
            </button>
          </nav>
        </div>
      </div>

      <div className="mt-6 bg-white shadow sm:rounded-lg">
        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="first_name"
                      id="first_name"
                      autoComplete="given-name"
                      value={profileForm.first_name}
                      onChange={handleProfileChange}
                      className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="last_name"
                      id="last_name"
                      autoComplete="family-name"
                      value={profileForm.last_name}
                      onChange={handleProfileChange}
                      className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={profileForm.email}
                      disabled
                      className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Your email cannot be changed.</p>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone number
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      autoComplete="tel"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="(123) 456-7890"
                      className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSave className="-ml-1 mr-2 h-5 w-5" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            <div className="mt-10 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Delete Account</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Once you delete your account, all of your personal data will be permanently removed.</p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Settings */}
        {activeTab === 'password' && (
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                    Current password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="current_password"
                      id="current_password"
                      autoComplete="current-password"
                      value={passwordForm.current_password}
                      onChange={handlePasswordChange}
                      className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                    New password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="new_password"
                      id="new_password"
                      autoComplete="new-password"
                      value={passwordForm.new_password}
                      onChange={handlePasswordChange}
                      className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Must be at least 6 characters long.</p>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                    Confirm new password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="confirm_password"
                      id="confirm_password"
                      autoComplete="new-password"
                      value={passwordForm.confirm_password}
                      onChange={handlePasswordChange}
                      className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSave className="-ml-1 mr-2 h-5 w-5" />
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleNotificationSubmit} className="space-y-6">
              <fieldset>
                <legend className="text-base font-medium text-gray-900">Email Notifications</legend>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="email_reminders"
                        name="email_reminders"
                        type="checkbox"
                        checked={notificationPrefs.email_reminders}
                        onChange={handleNotificationChange}
                        className="focus:ring-accent-500 h-4 w-4 text-accent-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="email_reminders" className="font-medium text-gray-700">
                        Appointment reminders
                      </label>
                      <p className="text-gray-500">Receive email reminders about upcoming appointments.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="email_promotions"
                        name="email_promotions"
                        type="checkbox"
                        checked={notificationPrefs.email_promotions}
                        onChange={handleNotificationChange}
                        className="focus:ring-accent-500 h-4 w-4 text-accent-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="email_promotions" className="font-medium text-gray-700">
                        Promotional emails
                      </label>
                      <p className="text-gray-500">Receive emails about special offers and promotions.</p>
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-base font-medium text-gray-900">SMS Notifications</legend>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="sms_reminders"
                        name="sms_reminders"
                        type="checkbox"
                        checked={notificationPrefs.sms_reminders}
                        onChange={handleNotificationChange}
                        className="focus:ring-accent-500 h-4 w-4 text-accent-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="sms_reminders" className="font-medium text-gray-700">
                        Appointment reminders
                      </label>
                      <p className="text-gray-500">Receive SMS reminders about upcoming appointments.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="sms_promotions"
                        name="sms_promotions"
                        type="checkbox"
                        checked={notificationPrefs.sms_promotions}
                        onChange={handleNotificationChange}
                        className="focus:ring-accent-500 h-4 w-4 text-accent-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="sms_promotions" className="font-medium text-gray-700">
                        Promotional messages
                      </label>
                      <p className="text-gray-500">Receive SMS messages about special offers and promotions.</p>
                    </div>
                  </div>
                </div>
              </fieldset>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSave className="-ml-1 mr-2 h-5 w-5" />
                  {isLoading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
