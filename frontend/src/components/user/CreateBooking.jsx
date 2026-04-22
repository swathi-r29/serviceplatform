import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaUser, FaCheckCircle, FaInfoCircle, FaPercentage, FaMapPin, FaRegClock, FaChevronLeft, FaRobot, FaMagic, FaChartBar, FaArrowRight } from 'react-icons/fa';
import axios from '../../api/axios';
import LocationPicker from '../common/LocationPicker';
import { useAssistantContext } from '../../context/AssistantContext';

const CreateBooking = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [workersList, setWorkersList] = useState([]);
  const [formData, setFormData] = useState({
    workerId: '',
    scheduledDate: '',
    scheduledTime: '',
    address: '',
    locationCoords: null,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const { setPageContext } = useAssistantContext();
  const [cancelMessage, setCancelMessage] = useState('');
  const [discountInfo, setDiscountInfo] = useState({ isFirstBooking: false, firstTimeDiscount: 0 });

  useEffect(() => {
    fetchService();
    fetchDiscount();
  }, [serviceId]);

  useEffect(() => {
    if (service) {
      setPageContext({
        type: 'booking',
        service: { name: service.name, price: service.price },
        worker: null
      });
    }
  }, [service, setPageContext]);

  // 🚀 RESTORED PRECISION HAVERSINE
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const p1_lat = parseFloat(lat1);
    const p1_lng = parseFloat(lon1);
    const p2_lat = parseFloat(lat2);
    const p2_lng = parseFloat(lon2);

    if (isNaN(p1_lat) || isNaN(p1_lng) || isNaN(p2_lat) || isNaN(p2_lng)) return null;

    const R = 6371; // km
    const dLat = (p2_lat - p1_lat) * Math.PI / 180;
    const dLon = (p2_lng - p1_lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(p1_lat * Math.PI / 180) * Math.cos(p2_lat * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const getTravelFee = (distance) => {
    if (distance === null || distance < 0) return 30;
    let fee = 30;
    if (distance > 5) {
      if (distance <= 25) fee += (distance - 5) * 8;
      else fee += 160 + (distance - 25) * 5;
    }
    return Math.round(fee);
  };

  const fetchDiscount = async () => {
    try { const { data } = await axios.get('/bookings/check-discount'); setDiscountInfo(data); } catch (_) { }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000'
      : 'https://servicehub-nbgj.onrender.com';
    return `${base}${path}`;
  };

  const fetchWorkers = async (category, coords = null) => {
    try {
      const activeCoords = coords || formData.locationCoords;
      let url = `/services/workers/${category}`;
      if (activeCoords) {
        const lat = activeCoords.lat || activeCoords.latitude;
        const lng = activeCoords.lng || activeCoords.longitude;
        url += `?lat=${lat}&lng=${lng}&radius=50`;
      }
      console.log(`📡 Fetching workers for ${category} with radius 50km`);
      const { data } = await axios.get(url);
      setWorkersList(data);
    } catch (_) { }
  };

  const fetchService = async () => {
    try {
      const { data } = await axios.get(`/services/${serviceId}`);
      setService(data);
      if (data.workers?.length > 0) {
        const approved = data.workers.filter(w => w.worker?.status === 'approved').map(w => ({ ...w.worker, serviceSpecificPrice: w.price }));
        if (approved.length > 0) { setWorkersList(approved); return; }
      }
      if (data.category) fetchWorkers(data.category);
    } catch (_) { setError('Failed to load service details.'); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLocationSelect = (loc) => {
    const coords = { lat: loc.latitude, lng: loc.longitude };
    setFormData(prev => ({ ...prev, address: loc.address, locationCoords: coords }));
    if (service?.category) fetchWorkers(service.category, coords);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.workerId || !formData.scheduledDate || !formData.scheduledTime) {
      setError('Complete all selections to proceed.');
      return;
    }
    setLoading(true);
    try {
      const { data: orderData } = await axios.post('/payment/create-order', { ...formData, serviceId, totalAmount: total, baseServicePrice: basePrice, travelFee: travelCharge });
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        name: 'ServiceHub',
        description: `Booking for ${service.name}`,
        order_id: orderData.orderId,
        // 👇 Force UPI ID input to be prominent
        config: {
          display: {
            blocks: {
              upi: {
                name: 'UPI ID / QR',
                instruments: [
                  {
                    method: 'vpa'
                  },
                  {
                    method: 'upi'
                  }
                ],
              },
            },
            sequence: ['block.upi'],
            preferences: { show_default_blocks: true },
          },
        },
        handler: async (resp) => {
          try {
            const { data } = await axios.post('/payment/verify-and-create', { razorpay_order_id: resp.razorpay_order_id, razorpay_payment_id: resp.razorpay_payment_id, razorpay_signature: resp.razorpay_signature, bookingDetails: { ...formData, serviceId, totalAmount: total, baseServicePrice: basePrice, travelFee: travelCharge } });
            if (data.success) navigate('/user/bookings');
            else setError('Confirmation error.');
          } catch (_) { setError('Payment received but booking failed.'); }
          setLoading(false);
        },
        prefill: {
          vpa: 'success@razorpay'
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: '#3B82F6' }
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        console.error('❌ Razorpay Payment Failed:', response.error);
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      paymentObject.open();
    } catch (err) {
      console.error('❌ Razorpay Initialization Error:', err);
      setError(err.response?.data?.message || 'Payment initiation failed.');
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!service) return { total: 0 };
    const sw = workersList.find(w => w._id === formData.workerId);
    const bPrice = parseFloat(sw?.serviceSpecificPrice) || sw?.activePrice || service.price || 0;

    const wLat = sw?.coordinates?.lat || sw?.coordinates?.latitude;
    const wLng = sw?.coordinates?.lng || sw?.coordinates?.longitude;
    const uLat = formData.locationCoords?.lat || formData.locationCoords?.latitude;
    const uLng = formData.locationCoords?.lng || formData.locationCoords?.longitude;

    const d = sw && formData.locationCoords ? calculateDistance(uLat, uLng, wLat, wLng) : null;
    const tCharge = getTravelFee(d);
    let volD = bPrice > 5000 ? bPrice * 0.2 : bPrice > 2000 ? bPrice * 0.1 : 0;
    const firstD = discountInfo.isFirstBooking ? 200 : 0;
    const tot = !!formData.workerId ? Math.max(0, bPrice + (formData.locationCoords ? tCharge : 0) - volD - firstD) : null;
    return { basePrice: bPrice, travelCharge: tCharge, total: tot, volDisc: volD, firstDisc: firstD, isConfigured: !!formData.workerId, dist: d };
  };

  const { basePrice, travelCharge, total, volDisc, firstDisc, isConfigured, dist } = calculateTotal();

  // 🚀 HARDENED 50KM PROXIMITY FILTER
  const filteredWorkers = [...workersList].filter(w => {
    if (!formData.locationCoords) return true;
    
    // Support multiple coordinate property names (lat, latitude, lng, longitude)
    const wCoords = w.coordinates || w;
    const wLat = wCoords.lat ?? wCoords.latitude;
    const wLng = wCoords.lng ?? wCoords.longitude;
    
    const uLat = formData.locationCoords.lat ?? formData.locationCoords.latitude;
    const uLng = formData.locationCoords.lng ?? formData.locationCoords.longitude;

    if (wLat === undefined || wLng === undefined) {
      console.warn(`⚠️ Missing coordinates for worker: ${w.name}`, w);
      return true; // Don't hide workers with missing data for now
    }

    const d = calculateDistance(uLat, uLng, wLat, wLng);
    console.log(`📏 Distance check for worker: ${w.name} = ${d}km`);
    return d !== null && d <= 50;
  }).sort((a, b) => {
    if (!formData.locationCoords) return 0;
    const distA = calculateDistance(
      formData.locationCoords.lat || formData.locationCoords.latitude,
      formData.locationCoords.lng || formData.locationCoords.longitude,
      a.coordinates?.lat || a.coordinates?.latitude,
      a.coordinates?.lng || a.coordinates?.longitude
    );
    const distB = calculateDistance(
      formData.locationCoords.lat || formData.locationCoords.latitude,
      formData.locationCoords.lng || formData.locationCoords.longitude,
      b.coordinates?.lat || b.coordinates?.latitude,
      b.coordinates?.lng || b.coordinates?.longitude
    );
    return (distA || 0) - (distB || 0);
  });

  if (!service) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azure-blue"></div></div>;

  return (
    <div className="min-h-screen py-10 px-6 font-lato">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* 🚀 NAVIGATION */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-deep-slate font-black text-xs uppercase tracking-widest hover:text-azure-blue transition-all">
            <FaChevronLeft /> Back
          </button>
          <h1 className="text-xl font-black text-deep-slate uppercase tracking-tighter">Configure Service</h1>
        </div>

        {error && (
          <div className="glass-panel p-4 border-rose-200 bg-rose-50/50 flex items-center gap-3 text-rose-600 text-sm font-bold">
            <FaInfoCircle /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* 🚀 LEFT COLUMN (Service & Pros) */}
          <div className="lg:col-span-8 space-y-10">
            {/* HERO CARD */}
            <div className="glass-panel overflow-hidden relative shadow-2xl shadow-slate-200/50 rounded-[3rem]">
              <div className="relative h-[30rem]">
                {service.image ? (
                  <>
                    <img src={getImageUrl(service.image)} alt={service.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent"></div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-azure-blue to-indigo-700"></div>
                )}
                <div className="absolute bottom-0 left-0 p-10 w-full z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-azure-blue/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/20 shadow-lg shadow-blue-500/30">{service.category}</span>
                    <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/10">Premium Selection</span>
                  </div>
                  <h2 className="text-5xl font-black text-white drop-shadow-2xl tracking-tighter leading-[1.1] max-w-3xl">{service.name}</h2>
                </div>
              </div>
              <div className="p-10">
                <div className="flex gap-10 mb-8 items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg"><FaRegClock className="text-azure-blue" /></div>
                    <span className="text-sm font-black text-deep-slate">{service.duration} Hours Est.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-50 rounded-lg"><FaStar className="text-yellow-400" /></div>
                    <span className="text-sm font-black text-deep-slate">4.8 (120+ Reviews)</span>
                  </div>
                </div>
                <p className="text-muted-slate font-medium leading-[1.6] text-lg max-w-3xl">{service.description || 'Professional service delivered by verified experts with quality assurance guaranteed.'}</p>
              </div>
            </div>

            {/* 🚀 WORKER SELECTION GRID */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-deep-slate tracking-tight flex items-center gap-3">
                  Assigned Professionals
                </h3>
                {/* 🚀 RESTORED AI ANALYSIS BUTTON */}
                {!service.aiAnalysis ? (
                  <button
                    onClick={async () => {
                      if (!formData.locationCoords) { setError("Set your location to run AI Analysis."); return; }
                      setAiLoading(true);
                      try {
                        const { data } = await axios.post('/ai/predict-price', { serviceId: service._id, userCoords: formData.locationCoords });
                        setService(prev => ({ ...prev, aiAnalysis: data }));
                      } catch (err) { console.error("AI Analysis failed"); } finally { setAiLoading(false); }
                    }}
                    disabled={aiLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-azure-blue transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
                  >
                    {aiLoading ? <FaMagic className="animate-spin" /> : <FaRobot />} Run AI Smart Analysis
                  </button>
                ) : (
                  <span className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    <FaCheckCircle /> Analysis Complete
                  </span>
                )}
              </div>

              {/* AI ANALYSIS RESULTS PANEL */}
              {service.aiAnalysis && (
                <div className="glass-panel p-6 border-blue-200 bg-blue-50/50 animate-in slide-in-from-top duration-500 rounded-[2rem]">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200"><FaMagic /></div>
                        <div>
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">AI Comparison Insight</p>
                          <h4 className="text-lg font-black text-deep-slate">Smart Match Score: {service.aiAnalysis.matchScore}/100</h4>
                        </div>
                      </div>
                      <p className="text-blue-900 text-sm font-bold bg-white/60 p-4 rounded-2xl border border-blue-100 italic">" {service.aiAnalysis.reasoning} "</p>
                    </div>
                    <div className="w-full md:w-auto bg-white/80 p-5 rounded-[2rem] border border-blue-200 shadow-xl shadow-blue-500/5">
                      <p className="text-[10px] font-black text-muted-slate uppercase mb-3 text-center">Value Comparison</p>
                      <div className="space-y-3">
                        {service.aiAnalysis.comparison?.map((c, i) => (
                          <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border ${c.name === service.aiAnalysis.winner ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                            <div className="flex-1">
                              <p className="text-xs font-black text-deep-slate">{c.name}</p>
                              <p className="text-[9px] font-bold text-muted-slate uppercase">{c.matchScore}% Match</p>
                            </div>
                            <p className="text-sm font-black text-deep-slate">{c.total}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* WORKER GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredWorkers.map((w, idx) => {
                  const selected = formData.workerId === w._id;
                  const wLat = w.coordinates?.lat || w.coordinates?.latitude;
                  const wLng = w.coordinates?.lng || w.coordinates?.longitude;
                  const uLat = formData.locationCoords?.lat || formData.locationCoords?.latitude;
                  const uLng = formData.locationCoords?.lng || formData.locationCoords?.longitude;

                  const charge = parseFloat(w.serviceSpecificPrice) || w.activePrice || service.price || 0;
                  const d = formData.locationCoords ? calculateDistance(uLat, uLng, wLat, wLng) : null;
                  const t = getTravelFee(d);

                  return (
                    <div key={w._id} onClick={() => setFormData({ ...formData, workerId: w._id })} className={`glass-panel p-6 cursor-pointer transition-all duration-300 relative group rounded-[2.5rem] border-2 shadow-sm ${selected ? 'border-azure-blue bg-blue-50/50 shadow-blue-500/10' : 'border-white hover:border-blue-200 hover:shadow-xl hover:-translate-y-1'}`}>
                      {selected && <div className="absolute top-5 right-5 text-azure-blue p-2 bg-white rounded-full shadow-lg border border-blue-50"><FaCheckCircle size={20} /></div>}
                      <div className="flex gap-6 items-center">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                          {w.profileImage ? (
                            <img 
                              src={getImageUrl(w.profileImage)} 
                              alt={w.name}
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                          ) : null}
                          {(!w.profileImage || w.profileImage) && (
                            <FaUser 
                              className="text-slate-300 w-full h-full p-6" 
                              style={{ display: w.profileImage ? 'none' : 'block' }} 
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-base font-black text-deep-slate group-hover:text-azure-blue transition-colors">{w.name}</p>
                            {w.name === service.aiAnalysis?.winner && <span className="bg-blue-600 text-white text-[8px] px-2 py-1 rounded font-black uppercase shadow-sm">AI Winner</span>}
                            {idx === 0 && <span className="bg-emerald-100 text-emerald-600 text-[8px] px-2 py-1 rounded font-black uppercase">Top Rate</span>}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-yellow-500 font-black mt-1">
                            <FaStar /> {w.rating?.toFixed(1) || 'New'} <span className="text-muted-slate font-bold font-mono ml-1">({w.reviewCount || 0} reviews)</span>
                          </div>

                          <div className="mt-5 pt-5 border-t border-slate-200/50 flex justify-between items-end">
                            <div>
                              <p className="text-[9px] font-black text-muted-slate uppercase tracking-widest opacity-60 mb-1">Total Quote</p>
                              <p className="text-lg font-black text-deep-slate tracking-tighter">₹{(charge + t).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-black text-muted-slate uppercase tracking-widest opacity-60 mb-1">Distance</p>
                              <p className="text-[11px] font-black text-azure-blue">{d !== null ? `${d} KM` : '---'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {formData.locationCoords && filteredWorkers.length === 0 && (
                  <div className="col-span-full glass-panel p-10 text-center space-y-4 rounded-[3rem]">
                    <div className="mx-auto w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400"><FaMapMarkerAlt size={24} /></div>
                    <div className="max-w-md mx-auto">
                      <h4 className="text-xl font-black text-deep-slate">No Professionals Nearby</h4>
                      <p className="text-muted-slate text-sm font-medium mt-2">
                        {formData.locationCoords 
                          ? `To maintain quality, we only show professionals within a 50KM radius of your selected area. Try a different location or check back soon!` 
                          : `Please set your service location above to find available professionals in your area.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🚀 RIGHT COLUMN (Reservation & Billing) */}
          <div className="lg:col-span-4 lg:sticky lg:top-10 space-y-8 pb-10">
            <div className="glass-panel p-10 space-y-8 shadow-2xl shadow-slate-200/50 border border-white/60 bg-white/70 backdrop-blur-xl rounded-[3rem]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-deep-slate uppercase tracking-widest opacity-40">Reservation</h3>
                <div className="p-2 bg-azure-blue shadow-lg shadow-blue-500/20 text-white rounded-xl"><FaChartBar /></div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-slate uppercase tracking-widest block pl-1">Booking Date</label>
                    <input type="date" name="scheduledDate" value={formData.scheduledDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="w-full bg-white/60 border border-white p-4 rounded-2xl text-xs font-black text-deep-slate focus:ring-4 focus:ring-azure-blue/10 outline-none transition-all shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-slate uppercase tracking-widest block pl-1">Start Time</label>
                    <select name="scheduledTime" value={formData.scheduledTime} onChange={handleChange} className="w-full bg-white/60 border border-white p-4 rounded-2xl text-xs font-black text-deep-slate focus:ring-4 focus:ring-azure-blue/10 outline-none transition-all shadow-sm appearance-none cursor-pointer">
                      <option value="">Time...</option>
                      {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-slate uppercase tracking-widest block pl-1">Service Location</label>
                  <LocationPicker onLocationSelect={handleLocationSelect} showRadius={true} radius={50} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-slate uppercase tracking-widest block pl-1">Special Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Any specific requirements for your pro..." rows="3" className="w-full bg-white/60 border border-white p-5 rounded-[2rem] text-sm font-medium outline-none resize-none focus:ring-4 focus:ring-azure-blue/10 transition-all shadow-sm" />
                </div>
              </div>

              {/* BILLING BREAKDOWN */}
              <div className="pt-8 border-t border-slate-200/50 space-y-5">
                <div className="flex justify-between items-center group">
                  <div>
                    <p className="text-[10px] font-black text-muted-slate uppercase tracking-widest opacity-50">Core Service</p>
                    <p className="text-sm font-black text-deep-slate">Base Charge</p>
                  </div>
                  <span className="text-base font-black text-deep-slate">₹{basePrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-muted-slate uppercase tracking-widest opacity-50">Support & Logistics</p>
                    <p className="text-sm font-black text-deep-slate">Travel Charge</p>
                  </div>
                  <span className={`text-base font-black ${isConfigured && formData.locationCoords ? 'text-azure-blue' : 'text-slate-300 italic'}`}>
                    {isConfigured && formData.locationCoords ? `₹${travelCharge.toLocaleString()}` : 'Pending Location'}
                  </span>
                </div>

                {(volDisc > 0 || firstDisc > 0) && (
                  <div className="bg-emerald-50/70 p-5 rounded-[2rem] border border-emerald-100 space-y-2 shadow-sm animate-in fade-in zoom-in duration-300">
                    {volDisc > 0 && <div className="flex justify-between text-[11px] font-black text-emerald-600 uppercase"><span>Volume Savings</span><span>-₹{volDisc.toLocaleString()}</span></div>}
                    {firstDisc > 0 && <div className="flex justify-between text-[11px] font-black text-emerald-600 uppercase"><span>First Booking Credit</span><span>-₹{firstDisc.toLocaleString()}</span></div>}
                  </div>
                )}

                <div className="pt-8 border-t-4 border-azure-blue/10">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <p className="text-[11px] font-black text-muted-slate uppercase tracking-widest mb-1">Final Payable</p>
                      <p className="text-[9px] font-bold text-azure-blue uppercase tracking-tighter italic">Professional Service Guaranteed</p>
                    </div>
                    <div className="text-right">
                      <span className="text-5xl font-black text-deep-slate tracking-tighter leading-none">
                        {total ? `₹${Math.round(total).toLocaleString()}` : '—'}
                      </span>
                    </div>
                  </div>

                  <button onClick={handleSubmit} disabled={loading} className="w-full py-6 bg-azure-blue text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><FaCheckCircle /> SECURE FAST BOOKING</>}
                  </button>
                  <div className="mt-6 flex items-center justify-center gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                    <span className="text-[9px] font-black text-muted-slate flex items-center gap-1"><FaMagic aria-hidden="true" /> SSL ENCRYPTED</span>
                    <span className="text-[9px] font-black text-muted-slate flex items-center gap-1"><FaUser aria-hidden="true" /> SECURE PAY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;