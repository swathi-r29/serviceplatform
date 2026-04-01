import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const AddService = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Plumbing',
    price: '',
    duration: '',
    workers: []
  });
  const [image, setImage] = useState(null);
  const [allWorkers, setAllWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const { data } = await axios.get('/admin/workers');
      setAllWorkers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWorkerToggle = (workerId) => {
    setFormData(prev => {
      const isSelected = prev.workers.some(w => (w.workerId || w) === workerId);
      if (isSelected) {
        return {
          ...prev,
          workers: prev.workers.filter(w => (w.workerId || w) !== workerId)
        };
      } else {
        return {
          ...prev,
          workers: [...prev.workers, { workerId, price: prev.price || 0 }]
        };
      }
    });
  };

  const handleWorkerPriceChange = (workerId, newPrice) => {
    setFormData(prev => ({
      ...prev,
      workers: prev.workers.map(w => 
        (w.workerId || w) === workerId ? { ...w, price: newPrice } : w
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('price', formData.price);
      data.append('duration', formData.duration);
      data.append('workers', JSON.stringify(formData.workers));
      if (image) data.append('image', image);

      // FIXED: Changed from 'api/services' to '/services'
      // The baseURL already includes '/api', so we just need '/services'
      await axios.post('/services', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/admin/services');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf5] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-black text-[#1a1a1a] mb-3 tracking-tight">
            Add New Service
          </h1>
          <p className="text-[#c4975d] font-medium tracking-widest uppercase text-xs">
            Admin Creation Central • ServiceHub Premium
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center space-x-3 text-red-700 animate-pulse">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Main Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#1a1a1a]/5 p-8 md:p-12 border border-[#f5ede2]">
          <div className="space-y-8">
            
            {/* Service Name */}
            <div className="group relative">
              <label className="block text-xs font-bold text-[#c4975d] uppercase tracking-widest mb-2 ml-1">Service Identity</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#c4975d] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01"/></svg>
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Premium Bathroom Restoration"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-[#fdfaf5]/50 border-2 border-transparent border-b-[#f5ede2] rounded-xl focus:border-[#c4975d] focus:bg-white focus:outline-none transition-all placeholder-gray-400 font-medium text-[#1a1a1a]"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-[#c4975d] uppercase tracking-widest mb-2 ml-1">Description & Details</label>
              <textarea
                name="description"
                placeholder="Describe the value of this service..."
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-5 py-4 bg-[#fdfaf5]/50 border-2 border-transparent border-b-[#f5ede2] rounded-2xl focus:border-[#c4975d] focus:bg-white focus:outline-none transition-all placeholder-gray-400 font-medium text-[#1a1a1a] leading-relaxed"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-[#c4975d] uppercase tracking-widest mb-2 ml-1">Market Category</label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-[#fdfaf5]/50 border-2 border-transparent border-b-[#f5ede2] rounded-xl focus:border-[#c4975d] focus:bg-white focus:outline-none transition-all appearance-none font-medium text-[#1a1a1a]"
                  >
                    {['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 'AC Repair', 'Pest Control', 'Appliance Repair', 'Moving & Packing', 'Home Tutoring', 'Salon & Spa', 'Gardening', 'Smart Home', 'Other'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#c4975d]">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-bold text-[#c4975d] uppercase tracking-widest mb-2 ml-1">Service Fee (₹)</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#c4975d] font-bold text-lg">₹</div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-4 bg-[#fdfaf5]/50 border-2 border-transparent border-b-[#f5ede2] rounded-xl focus:border-[#c4975d] focus:bg-white focus:outline-none transition-all font-bold text-[#1a1a1a] text-lg"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-[#c4975d] uppercase tracking-widest mb-2 ml-1">Est. Duration (hours)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#c4975d]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  </div>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-[#fdfaf5]/50 border-2 border-transparent border-b-[#f5ede2] rounded-xl focus:border-[#c4975d] focus:bg-white focus:outline-none transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Service Image */}
              <div>
                <label className="block text-xs font-bold text-[#c4975d] uppercase tracking-widest mb-2 ml-1">Brand Visual (Image)</label>
                <label className="flex items-center justify-center w-full px-5 py-4 bg-[#fdfaf5]/50 border-2 border-dashed border-[#f5ede2] rounded-xl hover:border-[#c4975d] cursor-pointer transition-all group">
                   <svg width="20" height="20" className="mr-3 text-gray-400 group-hover:text-[#c4975d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                   <span className="text-sm font-medium text-gray-500 group-hover:text-[#1a1a1a]">{image ? image.name : 'Upload visual...'}</span>
                   <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Worker Selection */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <label className="block text-xs font-bold text-[#c4975d] uppercase tracking-widest">Assign Professionals</label>
                <span className="text-[10px] font-bold bg-[#c4975d]/10 text-[#c4975d] px-2 py-0.5 rounded-full">
                  Skill Match: {formData.category}
                </span>
              </div>
              <div className="bg-[#fdfaf5]/50 border-2 border-[#f5ede2] rounded-2xl p-6 max-h-72 overflow-y-auto space-y-4">
                {allWorkers
                  .filter(worker => {
                    const category = formData.category.toLowerCase();
                    return worker.skills?.some(skill => {
                      const s = skill.toLowerCase();
                      return s.includes(category) || category.includes(s) ||
                        (category === 'carpentry' && s.includes('carpenter')) ||
                        (category === 'electrical' && s.includes('electrician'));
                    });
                  })
                  .map(worker => {
                    const selectedWorker = formData.workers.find(w => (w.workerId || w) === worker._id);
                    const isSelected = !!selectedWorker;
                    
                    return (
                      <div 
                        key={worker._id} 
                        className={`flex flex-col p-4 rounded-2xl border-2 transition-all ${
                          isSelected 
                            ? 'bg-white border-[#c4975d] shadow-sm' 
                            : 'bg-transparent border-transparent hover:bg-white hover:border-[#f5ede2]'
                        }`}
                      >
                        <div className="flex items-center mb-3">
                          <div 
                            onClick={() => handleWorkerToggle(worker._id)}
                            className={`w-6 h-6 rounded flex items-center justify-center mr-4 cursor-pointer transition-colors ${
                              isSelected ? 'bg-[#c4975d] text-white' : 'bg-gray-200'
                            }`}
                          >
                            {isSelected && <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>}
                          </div>
                          <div className="flex-1 cursor-pointer" onClick={() => handleWorkerToggle(worker._id)}>
                            <p className="text-sm font-bold text-[#1a1a1a] leading-none">{worker.name}</p>
                            <p className="text-[10px] text-gray-500 font-medium uppercase mt-1 tracking-tight">{worker.location} • {worker.skills?.slice(0,2).join(', ')}</p>
                          </div>
                          {isSelected && (
                            <div className="flex items-center bg-[#fdfaf5] border border-[#f5ede2] rounded-xl px-3 py-1 ml-4 group-focus-within:border-[#c4975d] transition-colors">
                              <span className="text-[10px] font-bold text-[#c4975d] mr-2 uppercase tracking-tighter">Rate: ₹</span>
                              <input 
                                type="number"
                                value={selectedWorker.price || formData.price}
                                onChange={(e) => handleWorkerPriceChange(worker._id, e.target.value)}
                                className="w-16 bg-transparent border-none focus:outline-none text-xs font-bold text-[#1a1a1a]"
                                placeholder="Rate"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                {allWorkers.filter(worker => {
                  const category = formData.category.toLowerCase();
                  return worker.skills?.some(skill => {
                    const s = skill.toLowerCase();
                    return s.includes(category) || category.includes(s) ||
                      (category === 'carpentry' && s.includes('carpenter'));
                  });
                }).length === 0 && (
                    <div className="text-center py-8 opacity-40">
                      <svg width="40" height="40" className="mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m12-16a4 4 0 11-8 0 4 4 0 018 0zm6 16v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                      <p className="text-xs font-medium uppercase tracking-widest italic">No matching professionals found</p>
                    </div>
                  )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[#f5ede2]">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-[#1a1a1a] text-white rounded-2xl font-extrabold tracking-widest uppercase text-sm hover:bg-[#c4975d] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0 shadow-lg shadow-black/10"
              >
                {loading ? 'Processing Registry...' : 'Add Service'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/services')}
                className="px-10 py-4 bg-transparent text-[#1a1a1a] border-2 border-[#1a1a1a]/5 rounded-2xl font-bold tracking-widest uppercase text-xs hover:bg-[#1a1a1a]/5 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddService;