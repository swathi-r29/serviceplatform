import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import WorkerBookingCard from './WorkerBookingCard';
import { FaFilter, FaHistory, FaSearch } from 'react-icons/fa';

const WorkerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get('/worker/bookings');
      setBookings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' ? true : booking.status === filter;
    const matchesSearch = booking.service?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          booking.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azure-blue"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex justify-between items-end">
        <div>
           <h1 className="text-4xl font-extrabold text-deep-slate tracking-tight">Service History</h1>
           <p className="text-muted-slate font-medium text-sm mt-1">Manage and track your past and current service records.</p>
        </div>
        <div className="flex bg-white/40 p-1 rounded-xl border border-white/20 glass-panel shadow-inner">
          {['all', 'pending', 'accepted', 'completed', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === s ? 'bg-deep-slate text-white shadow-lg' : 'text-muted-slate hover:text-deep-slate'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      {/* 🔍 SEARCH & FILTERS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="relative group">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-slate group-focus-within:text-azure-blue transition-colors" />
          <input
            type="text"
            placeholder="Search by service or customer name..."
            className="w-full pl-12 pr-6 py-4 glass-panel border-transparent focus:border-azure-blue/30 outline-none font-bold text-sm text-deep-slate placeholder:text-muted-slate/50 transition-all shadow-xl shadow-slate-200/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex justify-end items-center gap-4 text-muted-slate font-bold text-xs">
          <FaFilter />
          <span>Showing {filteredBookings.length} results</span>
        </div>
      </div>

      {/* 📦 BOOKINGS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {filteredBookings.map(booking => (
          <div key={booking._id} className="animate-fadeIn">
             <WorkerBookingCard booking={booking} onRefresh={fetchBookings} />
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="col-span-full glass-panel p-20 text-center">
             <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FaHistory size={40} />
             </div>
             <p className="text-muted-slate font-black italic">No bookings match your current filters.</p>
             <button onClick={() => {setFilter('all'); setSearchTerm('');}} className="mt-4 text-azure-blue font-black text-[10px] uppercase tracking-widest hover:underline">Reset Filters</button>
          </div>
        )}
      </div>

      <style jsx="true">{`
         .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
         @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default WorkerBookings;