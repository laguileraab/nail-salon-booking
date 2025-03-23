import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiMessageSquare,
  FiScissors,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiUserPlus,
  FiTag
} from 'react-icons/fi';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', to: '/admin', icon: FiHome },
    { name: 'Calendar', to: '/admin/calendar', icon: FiCalendar },
    { name: 'Clients', to: '/admin/clients', icon: FiUsers },
    { name: 'Staff', to: '/admin/staff', icon: FiUserPlus },
    { name: 'Services', to: '/admin/services', icon: FiScissors },
    { name: 'Promotions', to: '/admin/promotions', icon: FiTag },
    { name: 'Feedbacks', to: '/admin/feedbacks', icon: FiMessageSquare },
    { name: 'Reports', to: '/admin/reports', icon: FiBarChart2 },
    { name: 'Settings', to: '/admin/settings', icon: FiSettings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    if (path !== '/admin' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white shadow">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <span className="text-xl font-bold text-accent-600">NailSalon Admin</span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.to}
                    className={`${isActive(item.to) ? 'bg-accent-50 text-accent-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon
                      className={`${isActive(item.to) ? 'text-accent-500' : 'text-gray-400 group-hover:text-gray-500'} mr-3 flex-shrink-0 h-6 w-6`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button
                onClick={handleSignOut}
                className="flex-shrink-0 group block w-full flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <FiLogOut className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden fixed inset-0 flex z-40" style={{ display: isMobileMenuOpen ? 'flex' : 'none' }}>
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          aria-hidden="true"
          onClick={toggleMobileMenu}
        ></div>

        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Close menu</span>
              <FiX className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <span className="text-xl font-bold text-accent-600">NailSalon Admin</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`${isActive(item.to) ? 'bg-accent-50 text-accent-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  onClick={toggleMobileMenu}
                >
                  <item.icon
                    className={`${isActive(item.to) ? 'text-accent-500' : 'text-gray-400 group-hover:text-gray-500'} mr-3 flex-shrink-0 h-6 w-6`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={handleSignOut}
              className="flex-shrink-0 group block w-full flex items-center text-base font-medium text-gray-600 hover:text-gray-900"
            >
              <FiLogOut className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex-shrink-0 w-14">{/* Spacer element */}</div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top mobile header */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white shadow z-10">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-500"
            onClick={toggleMobileMenu}
          >
            <span className="sr-only">Open sidebar</span>
            <FiMenu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
