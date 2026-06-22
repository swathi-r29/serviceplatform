import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';

const SupportManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/support/messages');
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Fetch Messages Error:', error);
      toast.error('Failed to load support messages');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { data } = await axios.patch(`/support/${id}/status`, { status: newStatus });
      if (data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setMessages(messages.map(msg => msg._id === id ? { ...msg, status: newStatus } : msg));
        if (selectedMessage?._id === id) {
          setSelectedMessage({ ...selectedMessage, status: newStatus });
        }
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const { data } = await axios.delete(`/support/${id}`);
      if (data.success) {
        toast.success('Message deleted');
        setMessages(messages.filter(msg => msg._id !== id));
        if (selectedMessage?._id === id) setSelectedMessage(null);
      }
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'closed': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || msg.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-azure"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Support Center</h1>
          <p className="text-slate-500 mt-1">Manage customer inquiries and support requests</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterStatus === 'all' ? 'bg-brand-azure text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterStatus === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilterStatus('resolved')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterStatus === 'resolved' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Resolved
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Messages List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search by name, email or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-azure/20 focus:border-brand-azure transition-all outline-none"
            />
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden min-h-[500px]">
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((msg) => (
                  <div 
                    key={msg._id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-4 cursor-pointer transition-all hover:bg-white group ${selectedMessage?._id === msg._id ? 'bg-white border-l-4 border-l-brand-azure shadow-inner' : 'border-l-4 border-l-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${getStatusColor(msg.status)}`}>
                        {msg.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 truncate">{msg.subject}</h3>
                    <p className="text-sm text-slate-600 font-medium truncate">{msg.name}</p>
                    <p className="text-xs text-slate-400 mt-1 truncate">{msg.message}</p>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="font-semibold">No messages found</p>
                  <p className="text-xs">Adjust your search or filter</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Details */}
        <div className="lg:col-span-7">
          {selectedMessage ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden sticky top-6">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-brand-azure rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold uppercase">{selectedMessage.name.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-700">{selectedMessage.name}</span>
                      </div>
                      <span className="text-slate-300">|</span>
                      <a href={`mailto:${selectedMessage.email}`} className="text-sm text-brand-azure font-medium hover:underline">
                        {selectedMessage.email}
                      </a>
                      {selectedMessage.phone && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span className="text-sm text-slate-500 font-medium">{selectedMessage.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(selectedMessage._id)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete Message"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="bg-slate-50 rounded-2xl p-6 min-h-[200px] text-slate-700 leading-relaxed font-medium">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status:</span>
                  <select 
                    value={selectedMessage.status}
                    onChange={(e) => handleUpdateStatus(selectedMessage._id, e.target.value)}
                    className={`text-sm font-bold px-3 py-1.5 rounded-lg border focus:ring-2 focus:ring-brand-azure/20 outline-none cursor-pointer transition-all ${getStatusColor(selectedMessage.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="flex items-center space-x-2 bg-brand-azure text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-azure/25 hover:bg-blue-600 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Reply via Email</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800">No message selected</h2>
              <p className="max-w-xs mt-2 font-medium">Select an inquiry from the list on the left to view details and take action.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportManagement;
