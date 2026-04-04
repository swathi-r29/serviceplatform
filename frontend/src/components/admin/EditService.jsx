import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axios';

const EditService = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    workers: [],
    isActive: true
  });
  const [image, setImage] = useState(null);
  const [allWorkers, setAllWorkers] = useState([]);
  const [showAllWorkers, setShowAllWorkers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [serviceRes, workersRes] = await Promise.all([
        axios.get(`/services/${id}`),
        axios.get('/admin/workers')
      ]);

      const service = serviceRes.data;
      setFormData({
        name: service.name,
        description: service.description,
        category: service.category,
        price: service.price,
        duration: service.duration,
        workers: service.workers.map(w => ({
          workerId: w.worker?._id || w.worker,
          price: w.price || service.price
        })),
        isActive: service.isActive
      });
      setAllWorkers(workersRes.data);
    } catch (error) {
      setError('Failed to load service');
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
        // 🚀 Senior Logic: Auto-Sync Price from Worker's Skill Registry
        const worker = allWorkers.find(w => w._id === workerId);
        const skillMatch = worker?.skillRates?.find(s =>
          s.skillName.toLowerCase() === prev.category.toLowerCase()
        );

        const initialPrice = skillMatch ? skillMatch.rate : (prev.price || 0);

        return {
          ...prev,
          workers: [...prev.workers, { workerId, price: initialPrice }]
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
      data.append('isActive', formData.isActive);
      if (image) data.append('image', image);

      await axios.put(`/services/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/admin/services');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update service');
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
            Edit Service
          </h1>
          <p className="text-[#c4975d] font-medium tracking-widest uppercase text-xs italic">
            Refining Excellence • ServiceHub Registry
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
              <label className="block text-xs font-bold text-[#c4975d] uppercase tracking-widest mb-2 ml-1 cursor-default">Service Identity</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#c4975d] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" /></svg>
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Service Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-[#fdfaf5]/50 border-2 border-transparent border-b-[#f5ede2] rounded-xl focus:border-[#c4975d] focus:bg-white focus:outline-none transition-all placeholder-gray-400 font-medium text-[#1a1a1a]"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-[#c4975d] uppercase tracking-widest mb-2 ml-1 cursor-default">Description & Details</label>
              <textarea
                name="description"
                placeholder="Service Description"
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
                <label className="block text-xs font-bold text-[#c4975d] uppercase tracking-widest mb-2 ml-1 cursor-default">Market Category</label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-[#fdfaf5]/50 border-2 border-transparent border-b-[#f5ede2] rounded-xl focus:border-[#c4975d] focus:bg-white focus:outline-none transition-all appearance-none font-medium text-[#1a1a1a]"
                  >
                    {[
                      'Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting',
                      'AC Repair', 'Pest Control', 'Appliance Repair', 'Moving & Packing',
                      'Home Tutoring', 'Salon & Spa', 'Gardening', 'Smart Home', 'Other'
                    ].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#c4975d]">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-bold text-[#c4975d] uppercase tracking-widest mb-2 ml-1 cursor-default">Service Fee (₹)</label>
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
                <label className="block text-xs font-bold text-[#c4975d] uppercase tracking-widest mb-2 ml-1 cursor-default">Est. Duration (hours)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#c4975d]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
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
                <label className="block text-xs font-bold text-[#c4975d] uppercase tracking-widest mb-2 ml-1 cursor-default">Update Visual (Image)</label>
                <label className="flex items-center justify-center w-full px-5 py-4 bg-[#fdfaf5]/50 border-2 border-dashed border-[#f5ede2] rounded-xl hover:border-[#c4975d] cursor-pointer transition-all group">
                  <svg width="20" height="20" className="mr-3 text-gray-400 group-hover:text-[#c4975d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-sm font-medium text-gray-500 group-hover:text-[#1a1a1a] truncate">
                    {image ? image.name : 'Change image visual...'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Active Service Status */}
            <div>
              <label className="block text-xs font-bold text-[#c4975d] uppercase tracking-widest mb-3 ml-1 cursor-default">Registry Status</label>
              <div
                className={`p-5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${formData.isActive
                    ? 'bg-green-50/50 border-green-200'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${formData.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                    }`}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${formData.isActive ? 'text-green-800' : 'text-gray-600'}`}>
                      {formData.isActive ? 'Active & Visible' : 'Inactive & Hidden'}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                      {formData.isActive ? 'Service is live in marketplace' : 'Service is archived from marketplace'}
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${formData.isActive ? 'left-7' : 'left-1'}`} />
                </div>
              </div>
            </div>

            {/* Professional Discovery & Assignment */}
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex flex-col">
                  <label className="block text-xs font-bold text-[#c4975d] uppercase tracking-widest leading-none cursor-default">Assignment Engine</label>
                  <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">Registry Context: {formData.category}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllWorkers(!showAllWorkers)}
                  className={`text-[9px] font-bold px-3 py-1 rounded-full border transition-all ${showAllWorkers
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#c4975d]'
                    }`}
                >
                  {showAllWorkers ? 'Showing All' : 'Expert Match Only'}
                </button>
              </div>

              <div className="bg-[#fdfaf5]/50 border-2 border-[#f5ede2] rounded-3xl p-6 max-h-[400px] overflow-y-auto space-y-4 shadow-inner">
                {allWorkers
                  .map(worker => {
                    const skillMatch = worker.skillRates?.find(s =>
                      s.skillName.toLowerCase() === (formData.category || '').toLowerCase()
                    );
                    const isExpert = !!skillMatch;
                    const selectedWorker = formData.workers.find(w => (w.workerId || w) === worker._id);
                    const isSelected = !!selectedWorker;

                    // Logic: Show experts, assigned workers, or show all if toggled
                    if (!showAllWorkers && !isExpert && !isSelected) return null;

                    return (
                      <div
                        key={worker._id}
                        className={`group relative flex flex-col p-5 rounded-[1.5rem] border-2 transition-all ${isSelected
                            ? 'bg-white border-[#c4975d] shadow-lg shadow-[#c4975d]/5'
                            : 'bg-transparent border-transparent hover:bg-white hover:border-[#f5ede2]'
                          }`}
                      >
                        <div className="flex items-start">
                          <div
                            onClick={() => handleWorkerToggle(worker._id)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center mr-4 cursor-pointer transition-all duration-300 ${isSelected ? 'bg-[#c4975d] text-white scale-110' : 'bg-gray-100 group-hover:shadow-inner'
                              }`}
                          >
                            {isSelected && <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>}
                          </div>

                          <div className="flex-1 cursor-pointer" onClick={() => handleWorkerToggle(worker._id)}>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-[#1a1a1a]">{worker.name}</p>
                              {isExpert && (
                                <span className="bg-yellow-100 text-yellow-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest whitespace-nowrap">
                                  Top Expert
                                </span>
                              )}
                            </div>

                            {isExpert ? (
                              <div className="mt-2 flex items-center gap-3">
                                <div className="flex items-center text-[10px] bg-[#fdfaf5] border border-[#f5ede2] text-[#c4975d] font-bold px-2 py-1 rounded-lg">
                                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  ₹{skillMatch.rate}/{skillMatch.pricingType === 'hourly' ? 'hr' : 'fix'}
                                </div>
                                <div className="flex items-center text-[10px] text-gray-400 font-bold">
                                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  Est: {skillMatch.estimatedTime}h
                                </div>
                              </div>
                            ) : (
                              <p className="text-[10px] text-gray-400 font-medium uppercase mt-1 tracking-tight truncate max-w-[200px]">{worker.location} • General Professional</p>
                            )}
                          </div>

                          {isSelected && (
                            <div className="flex flex-col items-end gap-1 ml-4 animate-in fade-in slide-in-from-right duration-300">
                              <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Assigned Price</label>
                              <div className="flex items-center bg-[#fdfaf5] border border-[#f5ede2] rounded-xl px-3 py-2 group-focus-within:border-[#c4975d] transition-colors">
                                <span className="text-xs font-bold text-[#c4975d] mr-1">₹</span>
                                <input
                                  type="number"
                                  value={selectedWorker.price}
                                  onChange={(e) => handleWorkerPriceChange(worker._id, e.target.value)}
                                  className="w-16 bg-transparent border-none focus:outline-none text-sm font-black text-[#1a1a1a]"
                                  placeholder="Rate"
                                />
                              </div>
                              {isExpert && Number(selectedWorker.price) < skillMatch.rate && (
                                <p className="text-[8px] text-red-400 font-bold">Below Market Rate (₹{skillMatch.rate})</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                {allWorkers.length === 0 && (
                  <div className="text-center py-12 opacity-30 italic">
                    <svg width="40" height="40" className="mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m12-16a4 4 0 11-8 0 4 4 0 018 0zm6 16v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    No professionals found.
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
                {loading ? 'Committing Changes...' : 'Save Registry Updates'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/services')}
                className="px-10 py-4 bg-transparent text-[#1a1a1a] border-2 border-[#1a1a1a]/5 rounded-2xl font-bold tracking-widest uppercase text-xs hover:bg-[#1a1a1a]/5 transition-all outline-none"
              >
                Discard
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditService;