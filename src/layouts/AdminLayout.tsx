import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { FiHome, FiCalendar, FiUsers, FiMessageSquare, FiScissors, FiBarChart2, FiSettings, FiMenu, FiX, FiUserPlus, FiTag, FiLogOut } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import SEO from '../components/SEO';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const AdminLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Get current page title from pathname
  const getCurrentPageTitle = (): string => {
    const path = pathname.split('/').pop() || '';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/admin', icon: <FiHome className="mr-3 h-5 w-5" /> },
    { name: 'Calendar', path: '/admin/calendar', icon: <FiCalendar className="mr-3 h-5 w-5" /> },
    { name: 'Clients', path: '/admin/clients', icon: <FiUsers className="mr-3 h-5 w-5" /> },
    { name: 'Staff', path: '/admin/staff', icon: <FiUserPlus className="mr-3 h-5 w-5" /> },
    { name: 'Services', path: '/admin/services', icon: <FiScissors className="mr-3 h-5 w-5" /> },
    { name: 'Promotions', path: '/admin/promotions', icon: <FiTag className="mr-3 h-5 w-5" /> },
    { name: 'Feedbacks', path: '/admin/feedbacks', icon: <FiMessageSquare className="mr-3 h-5 w-5" /> },
    { name: 'Reports', path: '/admin/reports', icon: <FiBarChart2 className="mr-3 h-5 w-5" /> },
    { name: 'Settings', path: '/admin/settings', icon: <FiSettings className="mr-3 h-5 w-5" /> },
  ];

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <SEO 
        title={`${getCurrentPageTitle()} - Admin Dashboard`}
        description="Admin management dashboard for Beautiful Nails Salon"
        ogType="website"
      />
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 right-0 p-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="bg-primary text-white p-2 rounded-md"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4">
        <div className="flex items-center justify-center flex-shrink-0 px-6">
          <span className="text-xl font-bold text-accent-600">NailSalon Admin</span>
        </div>
        <div className="mt-8 flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md ${
                  pathname === item.path || pathname.startsWith(item.path + '/')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-primary hover:text-white'
                }`}
              >
                {item.icon}
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

      {/* Mobile menu, show/hide based on state */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-40">
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl z-50 overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <span className="text-xl font-bold text-accent-600">NailSalon Admin</span>
              <button
                onClick={toggleMobileMenu}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close menu"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <nav className="px-6 pb-6 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md ${
                    pathname === item.path || pathname.startsWith(item.path + '/')
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-primary hover:text-white'
                  }`}
                  onClick={toggleMobileMenu}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
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
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
