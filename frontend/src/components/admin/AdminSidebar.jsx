import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminSidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-white/60 backdrop-blur-md border-r border-white/20 flex flex-col transition-all duration-500 shadow-xl fixed h-screen overflow-y-auto z-10">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-azure rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">ServiceHub</h2>
            <p className="text-xs text-slate-500 font-bold tracking-tight">ADMIN CENTRAL</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/admin/dashboard"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/dashboard')
                ? 'bg-blue-50 text-brand-azure'
                : 'text-slate-600 hover:bg-slate-50 hover:text-brand-azure'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="font-semibold">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/services"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/services')
                ? 'bg-blue-50 text-brand-azure'
                : 'text-slate-600 hover:bg-slate-50 hover:text-brand-azure'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold">Services</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/workers"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/workers')
                ? 'bg-blue-50 text-brand-azure'
                : 'text-slate-600 hover:bg-slate-50 hover:text-brand-azure'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="font-semibold">Workers</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/analytics"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/analytics')
                ? 'bg-blue-50 text-brand-azure'
                : 'text-slate-600 hover:bg-slate-50 hover:text-brand-azure'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-semibold">Analytics</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/settings"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/settings')
                ? 'bg-blue-50 text-brand-azure'
                : 'text-slate-600 hover:bg-slate-50 hover:text-brand-azure'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-semibold">Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Bottom Section - System Status */}
      <div className="p-4 border-t border-slate-100 mt-auto">
        <div className="bg-blue-50 text-brand-azure rounded-lg p-3 mb-4 border border-blue-100">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">System: Live</span>
          </div>
        </div>

        {/* Admin User Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-azure rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">{user?.name?.charAt(0) || 'A'}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-500 font-medium">Super Admin</p>
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
