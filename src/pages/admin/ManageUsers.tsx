import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: 'admin' | 'client' | 'staff';
  created_at: string;
  last_login: string | null;
  is_active: boolean;
}

const ManageUsers = (): JSX.Element => {
  const { theme } = useTheme();
  const { language, translations } = useLanguage();
  const { showToast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'client' | 'staff'>('client');

  // Type-safe access to translations
  interface NestedTranslation {
    [key: string]: string | NestedTranslation;
  }

  interface TranslationsType {
    [key: string]: NestedTranslation;
  }

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
    title: getTranslation('admin.users.title', 'Manage Users'),
    editRole: getTranslation('admin.users.editRole', 'Edit Role'),
    save: getTranslation('common.save', 'Save'),
    cancel: getTranslation('common.cancel', 'Cancel'),
    role: getTranslation('admin.users.role', 'Role'),
    firstName: getTranslation('admin.users.firstName', 'First Name'),
    lastName: getTranslation('admin.users.lastName', 'Last Name'),
    email: getTranslation('admin.users.email', 'Email'),
    createdAt: getTranslation('admin.users.createdAt', 'Created At'),
    lastLogin: getTranslation('admin.users.lastLogin', 'Last Login'),
    status: getTranslation('admin.users.status', 'Status'),
    active: getTranslation('admin.users.active', 'Active'),
    inactive: getTranslation('admin.users.inactive', 'Inactive'),
    admin: getTranslation('admin.users.admin', 'Admin'),
    client: getTranslation('admin.users.client', 'Client'),
    staff: getTranslation('admin.users.staff', 'Staff'),
    successEdit: getTranslation('admin.users.successEdit', 'User role updated successfully'),
    error: getTranslation('common.error', 'An error occurred'),
    noUsers: getTranslation('admin.users.noUsers', 'No users found')
  };

  // Load users
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Use correct method chaining for Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      // Sort the data in JavaScript after receiving it
      const sortedData = [...(data || [])].sort((a, b) => {
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      });
      
      setUsers(sortedData as User[]);
    } catch (error) {
      console.error('Error loading users:', error);
      showToast(t.error, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, t.error]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openEditModal = (user: User): void => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedRole(e.target.value as 'admin' | 'client' | 'staff');
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    try {
      // Use correct method chaining for Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: selectedRole as 'admin' | 'client' | 'staff'
        })
        .eq('id', selectedUser.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? { ...user, role: selectedRole as 'admin' | 'client' | 'staff' } 
            : user
        )
      );
      
      showToast(t.successEdit, 'success');
      closeModal();
    } catch (error) {
      console.error('Error updating user role:', error);
      showToast(t.error, 'error');
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
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
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-10">
            <p>{t.noUsers}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y divide-gray-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t.firstName}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t.lastName}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t.email}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t.role}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t.createdAt}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t.lastLogin}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t.status}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {/* Actions column */}
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 ${theme === 'dark' ? 'divide-gray-700' : ''}`}>
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.first_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.last_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'staff' ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                        {user.role === 'admin' ? t.admin : 
                          user.role === 'staff' ? t.staff : t.client}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(user.last_login)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? t.active : t.inactive}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-accent-600 hover:text-accent-900"
                      >
                        {t.editRole}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} w-full max-w-md rounded-lg shadow-xl p-6`}>
            <h2 className="text-2xl font-bold mb-4">
              {t.editRole}: {selectedUser.email}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">{t.role}</label>
                <select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-900"
                >
                  <option value="client">{t.client}</option>
                  <option value="staff">{t.staff}</option>
                  <option value="admin">{t.admin}</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-md"
                  onClick={closeModal}
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
    </div>
  );
};

export default ManageUsers;
