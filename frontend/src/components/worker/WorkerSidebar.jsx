import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaUser, FaHistory, FaCalendarAlt, FaWallet, FaTasks } from 'react-icons/fa';

const WorkerSidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', to: '/worker/dashboard', icon: <FaTasks /> },
    { label: 'History', to: '/worker/bookings', icon: <FaHistory /> },
    { label: 'Schedule', to: '/worker/availability', icon: <FaCalendarAlt /> },
    { label: 'Earnings', to: '/worker/earnings', icon: <FaWallet /> },
    { label: 'Profile', to: '/worker/profile', icon: <FaUser /> }
  ];

  return (
    <aside className="w-64 glass-panel flex flex-col fixed h-[calc(100vh-2rem)] m-4 z-50 shadow-2xl overflow-hidden">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-azure-blue flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
            {user?.name?.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-black text-deep-slate truncate">{user?.name}</p>
            <p className="text-[9px] font-bold text-azure-blue uppercase tracking-widest">Verified Expert</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item, i) => (
            <Link 
              key={i} 
              to={item.to} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                location.pathname === item.to 
                  ? 'glass-active text-azure-blue shadow-lg shadow-blue-500/10' 
                  : 'text-muted-slate hover:bg-white/40 hover:text-deep-slate'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/10">
        <button 
          onClick={logout} 
          className="w-full flex items-center justify-center gap-2 py-3 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50/50 rounded-xl transition-all"
        >
          <FaHistory size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default WorkerSidebar;
