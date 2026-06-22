import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaUser, FaCheckCircle, FaInfoCircle, FaPercentage, FaMapPin, FaRegClock, FaChevronLeft, FaRobot, FaMagic, FaChartBar, FaArrowRight, FaShoppingCart } from 'react-icons/fa';
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
  const [currentStep, setCurrentStep] = useState(1);

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

  const handleAddToCart = async () => {
    if (!formData.workerId || !formData.scheduledDate || !formData.scheduledTime) {
      setError('Select a professional and schedule to add to cart.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/cart/add', {
        serviceId,
        workerId: formData.workerId,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        address: formData.address,
        locationCoords: formData.locationCoords,
        landmark: formData.landmark
      });
      
      // Dispatch cart updated event
      try {
        const { data } = await axios.get('/cart');
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: data.items.length } }));
      } catch (e) {
        console.error('Failed to dispatch cart updated event', e);
      }
      
      navigate('/user/cart');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to cart.');
    } finally {
      setLoading(false);
    }
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
        setError(`Payment failed: ${response.error.description}. (Hint: The default test card 4111 1111 1111 1111 is international and is blocked on domestic Indian test accounts. Please use domestic test cards like Visa: 4100 2800 0000 1007, Mastercard: 5500 6700 0000 1002, or RuPay: 6527 6589 0000 1005 with any future expiry and CVV. Alternatively, select Netbanking/UPI, or add to Cart and select 'Cash After Service' on checkout.)`);
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
  const selectedWorker = workersList.find(w => w._id === formData.workerId);

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
          {/* 🚀 LEFT COLUMN (Service Info Sidebar) */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-10">
            {/* HERO CARD */}
            <div className="glass-panel overflow-hidden relative shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white/70 backdrop-blur-xl">
              <div className="relative h-[20rem]">
                {service.image ? (
                  <>
                    <img src={getImageUrl(service.image)} alt={service.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent"></div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-azure-blue to-indigo-700"></div>
                )}
                <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-azure-blue/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-black text-white uppercase tracking-widest border border-white/20 shadow-md">{service.category}</span>
                  </div>
                  <h2 className="text-3xl font-black text-white drop-shadow-2xl tracking-tighter leading-[1.1]">{service.name}</h2>
                </div>
              </div>
              <div className="p-8">
                <div className="flex gap-6 mb-6 items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg"><FaRegClock className="text-azure-blue" /></div>
                    <span className="text-xs font-black text-deep-slate">{service.duration} Hours Est.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-50 rounded-lg"><FaStar className="text-yellow-400" /></div>
                    <span className="text-xs font-black text-deep-slate">4.8 (120+ Reviews)</span>
                  </div>
                </div>
                <p className="text-muted-slate font-medium leading-[1.6] text-sm">{service.description || 'Professional service delivered by verified experts with quality assurance guaranteed.'}</p>
              </div>
            </div>
          </div>

          {/* 🚀 RIGHT COLUMN (Wizard Steps) */}
          <div className="lg:col-span-8 space-y-8 pb-10">
            {/* SVG Progress Tracker */}
            <div className="glass-panel p-6 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white/70 backdrop-blur-xl">
              <div className="relative w-full max-w-lg mx-auto h-20 flex flex-col justify-center">
                {/* SVG Progress Line */}
                <div className="absolute inset-0 z-0 flex items-center">
                  <svg className="w-full h-4" viewBox="0 0 400 20" fill="none" preserveAspectRatio="none">
                    {/* Background Line */}
                    <path d="M 40,10 L 360,10" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
                    {/* Active Colored Line */}
                    <path 
                      d="M 40,10 L 360,10" 
                      stroke="#3B82F6" 
                      strokeWidth="4" 
                      strokeLinecap="round"
                      strokeDasharray="320"
                      strokeDashoffset={320 - ((currentStep - 1) / 2) * 320}
                      className="transition-all duration-300 ease-in-out progress-line"
                    />
                  </svg>
                </div>

                {/* Step Buttons */}
                <div className="relative z-10 flex justify-between items-center w-full px-6">
                  {[
                    { num: 1, label: 'Select Pro' },
                    { num: 2, label: 'Schedule' },
                    { num: 3, label: 'Confirm' }
                  ].map((s) => {
                    const isActive = currentStep === s.num;
                    const isCompleted = currentStep > s.num;
                    return (
                      <div key={s.num} className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (s.num === 1) setCurrentStep(1);
                            else if (s.num === 2 && formData.locationCoords && formData.workerId) setCurrentStep(2);
                            else if (s.num === 3 && formData.locationCoords && formData.workerId && formData.scheduledDate && formData.scheduledTime) setCurrentStep(3);
                          }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                            isCompleted
                              ? 'bg-azure-blue text-white'
                              : isActive
                              ? 'bg-azure-blue text-white ring-4 ring-blue-100 scale-110 shadow-lg shadow-blue-500/20'
                              : 'bg-white border-2 border-slate-200 text-slate-400'
                          }`}
                        >
                          {isCompleted ? '✓' : s.num}
                        </button>
                        <span className={`mt-2 text-[9px] font-black uppercase tracking-widest ${
                          isActive ? 'text-azure-blue' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                        }`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sliding steps container */}
            <div className="overflow-hidden w-full relative">
              <div 
                className="flex transition-transform duration-500 ease-in-out" 
                style={{ transform: `translateX(-${(currentStep - 1) * 100}%)` }}
              >
                {/* STEP 1: Select Pro */}
                <div className="w-full flex-shrink-0 px-2 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-deep-slate flex items-center gap-2">
                      <span className="bg-azure-blue text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">1</span>
                      Pin Service Location
                    </h3>
                    <div className="glass-panel p-2 bg-white/40 border-white/60 rounded-[2rem] overflow-hidden shadow-sm">
                      <LocationPicker onLocationSelect={handleLocationSelect} showRadius={true} radius={50} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-deep-slate flex items-center gap-2">
                      <span className="bg-azure-blue text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">2</span>
                      Specific House No. / Landmark
                    </h3>
                    <input 
                      type="text" 
                      name="landmark" 
                      value={formData.landmark || ''} 
                      onChange={handleChange} 
                      placeholder="e.g. Near Royal Hospital, Apollo Apts Room 402..." 
                      className="w-full bg-white/60 border border-white p-5 rounded-[2rem] text-sm font-medium text-deep-slate focus:ring-4 focus:ring-azure-blue/10 outline-none transition-all shadow-sm"
                    />
                  </div>

                  {formData.locationCoords && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-deep-slate flex items-center gap-2">
                          <span className="bg-azure-blue text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">3</span>
                          Assigned Professionals
                        </h3>
                        {!service.aiAnalysis ? (
                          <button
                            type="button"
                            onClick={async () => {
                              if (!formData.locationCoords) { setError("Set your location to run AI Analysis."); return; }
                              setAiLoading(true);
                              try {
                                const { data } = await axios.post('/ai/predict-price', { serviceId: service._id, userCoords: formData.locationCoords });
                                setService(prev => ({ ...prev, aiAnalysis: data }));
                              } catch (err) { console.error("AI Analysis failed"); } finally { setAiLoading(false); }
                            }}
                            disabled={aiLoading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-azure-blue active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
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
                      </div>
                    </div>
                  )}

                  {!formData.locationCoords && (
                    <div className="glass-panel p-10 text-center space-y-4 rounded-[3rem]">
                      <div className="mx-auto w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400"><FaMapMarkerAlt size={24} /></div>
                      <h4 className="text-xl font-black text-deep-slate">Set Your Service Location</h4>
                      <p className="text-muted-slate text-sm font-medium">Please select your location on the map above to view available professionals in your area.</p>
                    </div>
                  )}

                  {formData.locationCoords && filteredWorkers.length === 0 && (
                    <div className="glass-panel p-10 text-center space-y-4 rounded-[3rem]">
                      <div className="mx-auto w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400"><FaMapMarkerAlt size={24} /></div>
                      <h4 className="text-xl font-black text-deep-slate">No Professionals Nearby</h4>
                      <p className="text-muted-slate text-sm font-medium mt-2">To maintain quality, we only show professionals within a 50KM radius of your selected area. Try a different location or check back soon!</p>
                    </div>
                  )}

                  <div className="flex justify-end pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={!formData.workerId || !formData.address}
                      onClick={() => setCurrentStep(2)}
                      className="px-8 py-5 bg-azure-blue text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.95] disabled:opacity-50 transition-all flex items-center gap-2 shadow-2xl shadow-blue-500/25"
                    >
                      Continue to Schedule <FaArrowRight />
                    </button>
                  </div>
                </div>

                {/* STEP 2: Schedule Service */}
                <div className="w-full flex-shrink-0 px-2 space-y-6">
                  {selectedWorker && (
                    <div className="glass-panel p-6 bg-slate-50/50 border-slate-100 flex items-center gap-4 rounded-[2rem]">
                      <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center">
                        {selectedWorker.profileImage ? (
                          <img src={getImageUrl(selectedWorker.profileImage)} alt={selectedWorker.name} className="w-full h-full object-cover" />
                        ) : (
                          <FaUser className="text-slate-300 w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-slate uppercase tracking-widest mb-1">Selected Professional</p>
                        <h4 className="text-base font-black text-deep-slate">{selectedWorker.name}</h4>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-deep-slate flex items-center gap-2">
                      <span className="bg-azure-blue text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">1</span>
                      Booking Date
                    </h3>
                    <input 
                      type="date" 
                      name="scheduledDate" 
                      value={formData.scheduledDate} 
                      onChange={handleChange} 
                      min={new Date().toISOString().split('T')[0]} 
                      className="w-full bg-white/60 border border-white p-5 rounded-[2rem] text-sm font-black text-deep-slate focus:ring-4 focus:ring-azure-blue/10 outline-none transition-all shadow-sm" 
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-deep-slate flex items-center gap-2">
                      <span className="bg-azure-blue text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">2</span>
                      Available Time Slots
                    </h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map(t => {
                        const isSelected = formData.scheduledTime === t;
                        const hasSelection = !!formData.scheduledTime;
                        const [hrs, mins] = t.split(':');
                        const h = parseInt(hrs);
                        const ampm = h >= 12 ? 'PM' : 'AM';
                        const displayHrs = h > 12 ? h - 12 : h;
                        const formattedTime = `${displayHrs.toString().padStart(2, '0')}:${mins} ${ampm}`;

                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFormData({ ...formData, scheduledTime: t })}
                            className={`p-5 rounded-[2rem] border text-xs font-black transition-all duration-150 text-center ${
                              isSelected
                                ? 'bg-azure-blue border-azure-blue text-white scale-[1.02] shadow-lg shadow-blue-500/25'
                                : hasSelection
                                ? 'bg-white/30 border-white text-deep-slate opacity-40 hover:opacity-70'
                                : 'bg-white/60 border-white text-deep-slate hover:bg-white hover:border-azure-blue/30'
                            }`}
                          >
                            <FaRegClock className="inline mr-1" /> {formattedTime}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-deep-slate flex items-center gap-2">
                      <span className="bg-azure-blue text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">3</span>
                      Special Instructions / Notes
                    </h3>
                    <textarea 
                      name="notes" 
                      value={formData.notes} 
                      onChange={handleChange} 
                      placeholder="Any specific requirements or notes for your professional..." 
                      rows="3" 
                      className="w-full bg-white/60 border border-white p-5 rounded-[2rem] text-sm font-medium outline-none resize-none focus:ring-4 focus:ring-azure-blue/10 transition-all shadow-sm" 
                    />
                  </div>

                  <div className="flex justify-between pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[2rem] font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!formData.scheduledDate || !formData.scheduledTime}
                      onClick={() => setCurrentStep(3)}
                      className="px-8 py-5 bg-azure-blue text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.95] disabled:opacity-50 transition-all flex items-center gap-2 shadow-2xl shadow-blue-500/25"
                    >
                      Review Booking <FaArrowRight />
                    </button>
                  </div>
                </div>

                {/* STEP 3: Confirm & Pay */}
                <div className="w-full flex-shrink-0 px-2 space-y-6">
                  <div className="glass-panel p-8 space-y-6 bg-slate-50/50 border-slate-100 rounded-[2rem]">
                    <h4 className="text-lg font-black text-deep-slate uppercase tracking-wider">Booking Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-blue-50 text-azure-blue rounded-xl"><FaUser /></div>
                        <div>
                          <p className="text-[10px] font-black text-muted-slate uppercase tracking-widest">Professional</p>
                          <p className="text-sm font-black text-deep-slate">{selectedWorker?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-blue-50 text-azure-blue rounded-xl"><FaCalendarAlt /></div>
                        <div>
                          <p className="text-[10px] font-black text-muted-slate uppercase tracking-widest">Scheduled Time</p>
                          <p className="text-sm font-black text-deep-slate">{formData.scheduledDate} @ {formData.scheduledTime}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 md:col-span-2">
                        <div className="p-3 bg-blue-50 text-azure-blue rounded-xl"><FaMapMarkerAlt /></div>
                        <div>
                          <p className="text-[10px] font-black text-muted-slate uppercase tracking-widest">Location Address</p>
                          <p className="text-sm font-medium text-deep-slate leading-relaxed">{formData.address}</p>
                          {formData.landmark && <p className="text-xs text-azure-blue font-bold mt-1">Landmark: {formData.landmark}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BILLING BREAKDOWN */}
                  <div className="glass-panel p-8 space-y-6 border-white/60 bg-white/70 backdrop-blur-xl rounded-[2.5rem]">
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
                      <span className="text-base font-black text-azure-blue">
                        ₹{travelCharge.toLocaleString()}
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

                      <div className="flex gap-4">
                        <button onClick={handleSubmit} disabled={loading} className="flex-1 py-6 bg-azure-blue text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.95] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><FaCheckCircle /> FAST BOOKING</>}
                        </button>
                        <button onClick={handleAddToCart} disabled={loading} className="px-8 py-6 bg-white border-2 border-azure-blue text-azure-blue rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-blue-50 active:scale-[0.95] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                          {loading ? <div className="w-5 h-5 border-2 border-blue-200 border-t-azure-blue rounded-full animate-spin"></div> : <FaShoppingCart />}
                        </button>
                      </div>

                      {/* Razorpay Domestic Test Mode Helper Box */}
                      <div className="mt-6 p-5 bg-blue-50/50 rounded-[2rem] border border-blue-100/50 space-y-3 text-left">
                        <div className="flex items-center gap-2 text-azure-blue">
                          <FaInfoCircle size={14} />
                          <span className="text-[10px] font-black uppercase tracking-wider">Razorpay Test Mode Helper</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                          The default test card <code className="bg-white px-1.5 py-0.5 rounded font-mono border text-slate-800">4111 1111 1111 1111</code> is international and blocked on domestic test merchant accounts. Please use one of the domestic test credentials below to complete the payment:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-bold text-slate-700 font-mono">
                          <div className="bg-white p-2.5 rounded-xl border flex justify-between items-center shadow-sm">
                            <span className="text-slate-400">Visa:</span>
                            <span>4100 2800 0000 1007</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border flex justify-between items-center shadow-sm">
                            <span className="text-slate-400">Mastercard:</span>
                            <span>5500 6700 0000 1002</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border flex justify-between items-center shadow-sm">
                            <span className="text-slate-400">RuPay:</span>
                            <span>6527 6589 0000 1005</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border flex justify-between items-center shadow-sm">
                            <span className="text-slate-400">UPI VPA:</span>
                            <span>success@razorpay</span>
                          </div>
                        </div>
                        <p className="text-[9.5px] text-slate-500 italic">
                          * For cards, enter any future expiry date (e.g., 12/30) and any 3-digit CVV. Or choose <strong className="text-azure-blue">Netbanking / UPI</strong> in the modal.
                        </p>
                      </div>

                      <div className="mt-6 flex items-center justify-center gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                        <span className="text-[9px] font-black text-muted-slate flex items-center gap-1"><FaMagic aria-hidden="true" /> SSL ENCRYPTED</span>
                        <span className="text-[9px] font-black text-muted-slate flex items-center gap-1"><FaUser aria-hidden="true" /> SECURE PAY</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[2rem] font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Back
                    </button>
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