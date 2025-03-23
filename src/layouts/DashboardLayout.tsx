import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiCalendar, FiHome, FiMessageSquare, FiSettings, FiUsers, FiBarChart2, FiLogOut } from 'react-icons/fi';

type DashboardLayoutProps = {
  userType: 'client' | 'admin';
};

const DashboardLayout = ({ userType }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const clientNavigation = [
    { name: 'Dashboard', href: '/client/dashboard', icon: FiHome },
    { name: 'Book Appointment', href: '/client/bookings', icon: FiCalendar },
    { name: 'Feedback', href: '/client/feedback', icon: FiMessageSquare },
    { name: 'Settings', href: '/client/settings', icon: FiSettings },
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: FiBarChart2 },
    { name: 'Calendar', href: '/admin/calendar', icon: FiCalendar },
    { name: 'Clients', href: '/admin/clients', icon: FiUsers },
    { name: 'Feedbacks', href: '/admin/feedbacks', icon: FiMessageSquare },
    { name: 'Settings', href: '/admin/settings', icon: FiSettings },
  ];

  const navigation = userType === 'admin' ? adminNavigation : clientNavigation;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? 'visible' : 'invisible'}`}>
        {/* Sidebar background overlay */}
        <div 
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ease-linear ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div className={`relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white transition duration-300 ease-in-out transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-shrink-0 flex items-center px-4">
            <span className="text-xl font-bold text-accent-600">NailSalon</span>
          </div>
          <div className="mt-5 flex-1 h-0 overflow-y-auto scrollbar-hide">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive
                        ? 'bg-accent-50 text-accent-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-4 flex-shrink-0 h-6 w-6 ${
                        isActive ? 'text-accent-700' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={handleSignOut}
                className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <FiLogOut
                  className="mr-4 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
                Sign Out
              </button>
            </nav>
          </div>
        </div>

        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Placeholder for sidebar width */}
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-xl font-bold text-accent-600">NailSalon</span>
            </div>
            <div className="mt-8">
              <div className="px-4 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-accent-400 to-accent-600 flex items-center justify-center text-white text-lg font-semibold">
                    {profile?.first_name?.[0] || '?'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                    <p className="text-xs font-medium text-gray-500">
                      {profile?.role || 'User'}
                    </p>
                  </div>
                </div>
              </div>
              <nav className="mt-2 flex-1 px-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-accent-50 text-accent-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 ${
                          isActive ? 'text-accent-700' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
                <button
                  onClick={handleSignOut}
                  className="w-full mt-6 group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <FiLogOut
                    className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="md:pl-64 flex flex-col">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow md:hidden">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <span className="flex items-center text-xl font-bold text-accent-600">NailSalon</span>
            </div>
          </div>
        </div>

        <main className="flex-1">
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

export default DashboardLayout;
