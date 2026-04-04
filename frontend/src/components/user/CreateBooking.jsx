import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaUser, FaCheckCircle, FaInfoCircle, FaShoppingCart, FaPercentage, FaMagic } from 'react-icons/fa';
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

  useEffect(() => {
    const sw = workersList.find(w => w._id === formData.workerId);
    if (service && sw) {
      setPageContext({
        type: 'booking',
        service: { name: service.name, price: service.price },
        worker: { name: sw.name, rating: sw.rating }
      });
    }
  }, [service, formData.workerId, workersList, setPageContext]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const userLat = Number(lat1);
    const userLng = Number(lon1);
    const workerLat = Number(lat2);
    const workerLng = Number(lon2);
    
    console.log(`📍 Haversine Calc: User(${userLat}, ${userLng}) <-> Pro(${workerLat}, ${workerLng})`);
    
    const R = 6371; // km
    const dLat = (workerLat - userLat) * Math.PI / 180;
    const dLon = (workerLng - userLng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLat * Math.PI / 180) * Math.cos(workerLat * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    const distance = Math.round(d * 10) / 10;
    console.log(`   📏 Distance Result: ${distance} km`);
    return distance;
  };

  const getTravelFee = (distance) => {
    if (distance === null) return 30; // Local minimum
    if (distance <= 5) return 30; // Flat local fee
    return Math.round(distance * 10); // Outstation rate: ₹10/km
  };

  const fetchDiscount = async () => {
    try {
      const { data } = await axios.get('/bookings/check-discount');
      setDiscountInfo(data);
    } catch (err) {
      console.error('Failed to fetch discount info');
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  const fetchWorkers = async (category) => {
    try {
      const { data } = await axios.get(`/services/workers/${category}`);
      setWorkersList(data);
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    }
  };

  const fetchService = async () => {
    try {
      const { data } = await axios.get(`/services/${serviceId}`);
      setService(data);

      if (data.workers && data.workers.length > 0) {
        const assignedApprovedWorkers = data.workers
          .filter(w => w.worker && w.worker.status === 'approved')
          .map(w => ({
            ...w.worker,
            serviceSpecificPrice: w.price
          }));
        
        if (assignedApprovedWorkers.length > 0) {
          setWorkersList(assignedApprovedWorkers);
          return;
        }
      }

      if (data.category) {
        fetchWorkers(data.category);
      }
    } catch (error) {
      setError('Failed to load service details. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      address: locationData.address,
      locationCoords: {
        lat: locationData.latitude,
        lng: locationData.longitude
      }
    }));
  };

  const handleWorkerSelect = (workerId) => {
    setFormData(prev => ({ ...prev, workerId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.workerId) {
      setError('Please select a professional to proceed.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.scheduledDate || !formData.scheduledTime) {
      setError('Please select a date and time.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setError('');
    setCancelMessage('');
    setLoading(true);

    try {
      // ── Step 1: Create Razorpay order (NO booking in DB yet) ──
      const { data: orderData } = await axios.post('/payment/create-order', {
        serviceId,
        workerId: formData.workerId,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        address: formData.address,
        locationCoords: formData.locationCoords,
        notes: formData.notes,
        totalAmount: total
      });

      // Capture booking details now — they must be in scope for the Razorpay handlers
      const bookingDetails = {
        serviceId,
        workerId: formData.workerId,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        address: formData.address,
        locationCoords: formData.locationCoords,
        notes: formData.notes,
        totalAmount: total
      };

      // ── Step 2: Open Razorpay modal ──
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ServiceHub',
        description: `Booking for ${service.name}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          // ── Step 3 (success): Verify signature + create booking atomically ──
          try {
            setLoading(true);
            setCancelMessage('');
            const { data } = await axios.post('/payment/verify-and-create', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingDetails
            });
            if (data.success) {
              navigate('/user/bookings');
            } else {
              setError('Booking could not be confirmed after payment. Please contact support.');
              setLoading(false);
            }
          } catch (err) {
            setError(
              err.response?.data?.message ||
              'Payment was received but booking confirmation failed. Please contact support with your payment ID: ' +
              response.razorpay_payment_id
            );
            setLoading(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: () => {
            // ── Step 3 (cancelled): Stay on page, no booking was created ──
            setLoading(false);
            setCancelMessage('Payment cancelled. Your booking was not confirmed.');
            // DO NOT navigate — no record exists in DB
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      // Don't setLoading(false) here — keep spinner until handler or ondismiss fires
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!formData.workerId || !formData.scheduledDate || !formData.scheduledTime) {
      setError('Please select a professional, date, and time to add to cart.');
      return;
    }

    // TODO: Cart checkout must also use payment-first flow
    // when CartCheckout.jsx is built. Do not create booking
    // records from cart until payment is verified.
    // The current cart stores intent only — booking is created
    // only once /payment/verify-and-create succeeds.

    setError('');
    setCancelMessage('');
    setLoading(true);

    try {
      await axios.post('/cart/add', {
        serviceId,
        ...formData
      });
      navigate('/user/cart');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!service) return { basePrice: 0, volumeDiscount: 0, firstTimeDiscount: 0, travelCharge: 0, total: 0, estimatedTime: 1, pricingType: 'standard' };
    
    const selectedWorker = workersList.find(w => w._id === formData.workerId);
    
    // 🚀 Senior Refactor: Hybrid Pricing Logic
    const skill = selectedWorker?.skillRates?.find(s => 
      s.skillName && s.skillName.toLowerCase() === service.category.toLowerCase()
    );

    let basePrice = 0;
    let estimatedTime = 1;
    let pricingType = 'standard';

    if (skill && skill.rate > 0) {
      if (skill.pricingType === "fixed") {
        basePrice = skill.rate;
        pricingType = "fixed";
        estimatedTime = skill.estimatedTime || 1;
      } else {
        // "hourly" logic (rate * time)
        basePrice = skill.rate * (skill.estimatedTime || 1);
        pricingType = "hourly";
        estimatedTime = skill.estimatedTime || 1;
      }
    } else {
      // Fallback
      basePrice = service.price;
      pricingType = "standard";
      estimatedTime = service.duration || 1;
    }

    // Calculate Travel Fee
    let travelCharge = 0;
    if (selectedWorker && formData.locationCoords) {
      const distance = calculateDistance(
        formData.locationCoords.lat, formData.locationCoords.lng,
        selectedWorker.coordinates?.lat, selectedWorker.coordinates?.lng
      );
      travelCharge = getTravelFee(distance);
    }

    // Calculate Discounts
    let volDiscount = 0;
    if (basePrice > 5000) volDiscount = basePrice * 0.20;
    else if (basePrice > 2000) volDiscount = basePrice * 0.10;
    
    const firstDiscount = discountInfo.isFirstBooking ? 200 : 0;
    
    const subtotalPrice = basePrice + (formData.locationCoords ? travelCharge : 0);
    const finalTotal = Math.max(0, subtotalPrice - volDiscount - firstDiscount);

    return { 
      basePrice, 
      volumeDiscount: volDiscount, 
      firstTimeDiscount: firstDiscount, 
      travelCharge: formData.locationCoords ? travelCharge : null, 
      total: finalTotal,
      estimatedTime,
      pricingType,
      skillRate: skill?.rate
    };
  };

  const { basePrice, volumeDiscount, firstTimeDiscount, travelCharge, total, estimatedTime, pricingType, skillRate } = calculateTotal();
  
  // ✅ Enhanced sorting logic for workersList
  const sortedWorkers = [...workersList].sort((a, b) => {
    if (!formData.locationCoords) return 0; // No sorting if location not picked
    
    const distA = calculateDistance(formData.locationCoords.lat, formData.locationCoords.lng, a.coordinates?.lat, a.coordinates?.lng);
    const distB = calculateDistance(formData.locationCoords.lat, formData.locationCoords.lng, b.coordinates?.lat, b.coordinates?.lng);
    
    const rateA = a.serviceSpecificPrice || a.serviceCharge || a.hourlyRate || service.price;
    const rateB = b.serviceSpecificPrice || b.serviceCharge || b.hourlyRate || service.price;
    
    const totalA = rateA + getTravelFee(distA);
    const totalB = rateB + getTravelFee(distB);
    
    return totalA - totalB;
  });

  // ✅ Derived values for pricing breakdown scope
  const selectedWorker = workersList.find(w => w._id === formData.workerId);
  // Check if the selected worker has a custom skill-based or legacy rate
  const hasCustomRate = (() => {
    if (!selectedWorker) return false;
    const sp = selectedWorker.skillPricing?.find(
      e => e.skill?.toLowerCase() === service.category?.toLowerCase() && e.isActive
    );
    return !!(sp?.rate || selectedWorker.serviceSpecificPrice || selectedWorker.serviceCharge);
  })();

  // Calculate potential savings (compared to most expensive option)
  const maxTotal = sortedWorkers.length > 1 
    ? Math.max(...sortedWorkers.map(w => {
        const d = calculateDistance(formData.locationCoords?.lat, formData.locationCoords?.lng, w.coordinates?.lat, w.coordinates?.lng);
        return (w.serviceSpecificPrice || w.serviceCharge || w.hourlyRate || service.price) + getTravelFee(d);
      }))
    : total;
  
  const potentialSavings = Math.max(0, maxTotal - total);

  if (!service) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configure Your Service</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Back
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - Service Details & Worker Selection */}
          <div className="lg:col-span-2 space-y-8">

            {/* Service Hero Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <div className="relative h-48 bg-gray-200">
                {service.image ? (
                  <>
                    <img
                      src={getImageUrl(service.image)}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                )}
                <div className="absolute bottom-0 left-0 p-6 text-white z-10">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold mb-2">
                    {service.category}
                  </span>
                  <h2 className="text-3xl font-bold text-shadow-sm">{service.name}</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-6 mb-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaClock className="text-blue-500" />
                    <span>{service.duration} Hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaStar className="text-yellow-400" />
                    <span>4.8 (120+ Reviews)</span>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">What's Included</h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description || "Professional service delivered by verified experts. Includes initial consultation, service execution, and post-service cleanup."}
                </p>
              </div>
            </div>

            {/* Professional Selection */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Select Assigned Professional</h3>
              <p className="text-gray-500 mb-6 text-sm">Choose a top-rated professional for your {service.category.toLowerCase()} service.</p>

              {workersList && workersList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedWorkers.map((worker, idx) => {
                    const isSelected = formData.workerId === worker._id;
                    const distance = calculateDistance(
                      formData.locationCoords?.lat, formData.locationCoords?.lng,
                      worker.coordinates?.lat, worker.coordinates?.lng
                    );
                    const travelFee = getTravelFee(distance);

                    // --- skillPricing-aware charge resolution ---
                    const skillEntry = worker.skillPricing?.find(
                      sp => sp.skill?.toLowerCase() === service.category?.toLowerCase() && sp.isActive
                    );
                    const workerCharge = skillEntry?.rate
                      || worker.serviceSpecificPrice
                      || worker.serviceCharge
                      || service.price;
                    const rateType = skillEntry?.rateType || 'fixed';
                    const estDuration = skillEntry?.estimatedDuration; // in minutes
                    const hasCustomRate = !!(skillEntry?.rate || worker.serviceSpecificPrice || worker.serviceCharge);

                    return (
                      <div
                        key={worker._id}
                        onClick={() => handleWorkerSelect(worker._id)}
                        className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 group hover:shadow-md ${isSelected
                          ? 'border-blue-600 bg-blue-50/50'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                      >
                        {isSelected && (
                          <div className="absolute top-4 right-4 text-blue-600">
                            <FaCheckCircle size={20} />
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                            {worker.profileImage ? (
                              <img src={getImageUrl(worker.profileImage)} alt={worker.name} className="h-full w-full object-cover" />
                            ) : (
                              <FaUser className="text-gray-400 text-xl" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className={`font-bold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                {worker.name}
                              </h4>
                              {idx === 0 && workersList.length > 1 && (
                                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  Best Deal
                                </span>
                              )}
                              {!hasCustomRate && (
                                <span className="bg-blue-50 text-blue-500 text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ml-1 border border-blue-100">
                                  Platform Standard
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-yellow-500 mt-1">
                              <FaStar />
                              <span className="font-medium text-gray-700">{worker.rating?.toFixed(1) || 'New'}</span>
                              <span className="text-gray-400 text-xs ml-1">({worker.reviewCount || 0} reviews)</span>
                            </div>
                            
                            {/* Breakdown */}
                            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-tighter">
                              <div className="text-gray-500">
                                <p className="opacity-50">Service</p>
                                <p className="text-gray-900 flex items-center gap-1">
                                  ₹{workerCharge}
                                  {/* Rate type badge */}
                                  {rateType === 'hourly' ? (
                                    <span className="text-[9px] bg-blue-100 text-blue-600 px-1 rounded font-black">/hr</span>
                                  ) : (
                                    <span className="text-[9px] bg-green-100 text-green-600 px-1 rounded font-black">Fixed</span>
                                  )}
                                </p>
                                {rateType === 'hourly' && estDuration && (
                                  <p className="text-[9px] text-gray-400 font-medium">~{estDuration < 60 ? `${estDuration}m` : `${Math.round(estDuration / 60 * 10) / 10}h`} job</p>
                                )}
                              </div>
                              <div className="text-gray-500">
                                <p className="opacity-50">Travel ({distance !== null ? `${distance}km` : '---'})</p>
                                <p className="text-blue-600">₹{distance !== null ? travelFee : '--'}</p>
                              </div>
                              <div className="text-right">
                                <p className="opacity-50">Total</p>
                                <p className="text-gray-900 text-xs font-black">₹{distance !== null ? workerCharge + travelFee : `${workerCharge} +`}</p>
                              </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <FaMapMarkerAlt size={10} /> {worker.location || 'Local Expert'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 bg-yellow-50 rounded-xl border border-yellow-100 text-center">
                  <p className="text-yellow-800">No specific professionals found for this category. We will assign the best available expert for you.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Booking Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Details</h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Date Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="scheduledDate"
                        value={formData.scheduledDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Time Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaClock className="text-gray-400" />
                      </div>
                      <select
                        name="scheduledTime"
                        value={formData.scheduledTime}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none bg-white"
                        required
                      >
                        <option value="">Select Time</option>
                        {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location Picker */}
                  <div className="pt-2">
                    <LocationPicker onLocationSelect={handleLocationSelect} />
                  </div>

                  {/* Notes Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="2"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                      placeholder="Gate code, parking info, etc."
                    />
                  </div>

                  {/* Price Breakdown */}
                  <div className="pt-6 border-t border-gray-100 space-y-4">
                    <div className="flex justify-between items-start text-gray-600">
                      <div>
                        <p className="text-sm">Service Charge ({pricingType})</p>
                        {pricingType === 'hourly' && (
                          <p className="text-[10px] text-gray-400 font-medium italic">₹{skillRate || '---'} × {estimatedTime} hrs</p>
                        )}
                      </div>
                      <span className="font-bold text-gray-900">₹{basePrice.toLocaleString()}</span>
                    </div>

                    {pricingType === 'hourly' && (
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Estimated Duration</span>
                        <span className="font-medium text-gray-900">{estimatedTime} Hours</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-gray-600">
                      <span className="text-sm">Travel Fee</span>
                      <span className={travelCharge !== null ? "font-bold text-blue-600" : "text-gray-400 italic text-xs"}>
                        {travelCharge !== null ? `₹${travelCharge.toLocaleString()}` : 'Select Location'}
                      </span>
                    </div>

                    {firstTimeDiscount > 0 && (
                      <div className="flex justify-between items-center text-pink-600 font-medium bg-pink-50 p-2 rounded-lg border border-pink-100">
                        <span className="flex items-center gap-1 text-xs">
                          <FaPercentage className="text-pink-400" />
                          First User Offer
                        </span>
                        <span className="font-bold">-₹{firstTimeDiscount}</span>
                      </div>
                    )}

                    {volumeDiscount > 0 && (
                      <div className="flex justify-between items-center text-green-600 font-medium bg-green-50 p-2 rounded-lg border border-green-100">
                        <span className="flex items-center gap-1 text-xs">
                          <FaPercentage className="text-green-400" />
                          Volume Reward
                        </span>
                        <span className="font-bold">-₹{volumeDiscount.toLocaleString()}</span>
                      </div>
                    )}

                    {!hasCustomRate && (
                      <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-600">
                        <FaInfoCircle size={14} className="flex-shrink-0" />
                        <p className="text-[10px] font-medium leading-relaxed">
                          Note: This professional is currently using the platform standard rate for this service category.
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total Price</span>
                        <div className="text-right">
                          <span className="text-3xl font-black text-blue-600 tracking-tight">₹{total.toLocaleString()}</span>
                          {potentialSavings > 0 && (
                            <p className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-1 rounded mt-2">
                              Saving ₹{Math.round(potentialSavings).toLocaleString()} vs. other options
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-2 items-start">
                      <FaInfoCircle size={14} className="text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-[10px] text-blue-700 font-medium leading-relaxed italic">
                        "Estimated price. Final cost may vary based on actual work."
                      </p>
                    </div>
                  </div>

                    <div className="mt-6">
                        {!service.aiAnalysis ? (
                            <button
                                type="button"
                                disabled={loading}
                                onClick={async () => {
                                    try {
                                        setLoading(true);
                                        const { data } = await axios.post('/ai/predict-price', { 
                                            serviceId: service._id,
                                            userCoords: formData.locationCoords
                                        });
                                        setService(prev => ({ ...prev, aiAnalysis: data }));
                                    } catch (err) {
                                        console.error("AI Analysis failed");
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:shadow-xl hover:scale-[1.02] transition-all group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]"></div>
                                <FaMagic className={`${loading ? 'animate-spin' : ''}`} /> 
                                {loading ? 'Locating Experts...' : 'Compare Top Nearby Pros'}
                            </button>
                        ) : (
                            (() => {
                                const ai = service.aiAnalysis;
                                const sb = ai.scoreBreakdown || {};
                                return (
                                <div className="bg-white rounded-3xl border border-indigo-100 shadow-2xl p-6 relative overflow-hidden">

                                    {/* ── Header: Score + Winner badge ── */}
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Expert Match Score</h4>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-black text-gray-900">
                                                    {ai.matchScore ?? ai.smartScore ?? '—'}
                                                </span>
                                                <span className="text-xs font-bold text-gray-400">/ 100</span>
                                            </div>
                                        </div>
                                        <div className="px-4 py-1.5 bg-green-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                            Best Choice: {ai.winner}
                                        </div>
                                    </div>

                                    {/* ── Score Breakdown Bars ── */}
                                    {ai.scoreBreakdown && (
                                        <div className="mb-5 space-y-2.5">
                                            {/* Collapsible "How is this calculated?" */}
                                            <details className="group">
                                                <summary className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider cursor-pointer select-none list-none flex items-center gap-1 mb-3">
                                                    <span>How is this score calculated?</span>
                                                    <span className="group-open:rotate-180 transition-transform inline-block">▾</span>
                                                </summary>
                                                <p className="text-[10px] text-gray-500 leading-relaxed mb-3 pl-1 border-l-2 border-indigo-100">
                                                    Price competitiveness (35pts) + Proximity (30pts) + Rating (25pts) + Rate type (10pts) = 100pts total
                                                </p>
                                            </details>

                                            {/* Price bar */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-500 w-20 shrink-0">Price</span>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full transition-all duration-700"
                                                        style={{ width: `${Math.round((sb.priceScore / 35) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-gray-700 w-10 text-right">{sb.priceScore}/35</span>
                                            </div>
                                            {/* Proximity bar */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-500 w-20 shrink-0">Proximity</span>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full transition-all duration-700"
                                                        style={{ width: `${Math.round((sb.proximityScore / 30) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-gray-700 w-10 text-right">{sb.proximityScore}/30</span>
                                            </div>
                                            {/* Rating bar */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-500 w-20 shrink-0">Rating</span>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                                                        style={{ width: `${Math.round((sb.ratingScore / 25) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-gray-700 w-10 text-right">{sb.ratingScore}/25</span>
                                            </div>
                                            {/* Rate type bar */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-500 w-20 shrink-0">Rate Type</span>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-purple-500 rounded-full transition-all duration-700"
                                                        style={{ width: `${Math.round((sb.rateTypeBonus / 10) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-gray-700 w-10 text-right">{sb.rateTypeBonus}/10</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Per-Provider Comparison Cards ── */}
                                    <div className="space-y-3 mb-5">
                                        {ai.comparison?.map((prov, idx) => (
                                            <div key={idx} className={`p-4 rounded-2xl border transition-all ${prov.name === ai.winner ? 'bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-100' : 'bg-gray-50 border-gray-100 opacity-80'}`}>
                                                <div className="flex justify-between items-center mb-3">
                                                    <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${prov.name === ai.winner ? 'bg-indigo-600' : 'bg-gray-400'}`} />
                                                        {prov.name}
                                                    </h5>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-gray-400">{prov.distance} away</span>
                                                        {prov.matchScore !== undefined && (
                                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${prov.name === ai.winner ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                                Score: {prov.matchScore}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-tighter">
                                                    <div className="text-gray-500">
                                                        <p className="mb-0.5 opacity-60">Service</p>
                                                        <p className="text-gray-900">{prov.charge}</p>
                                                    </div>
                                                    <div className="text-gray-500">
                                                        <p className="mb-0.5 opacity-60">Travel</p>
                                                        <p className="text-indigo-600">{prov.travel}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="mb-0.5 opacity-60">Total</p>
                                                        <p className="text-gray-900 text-xs font-black">{prov.total}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* ── Smart Efficiency Intel (dark box) ── */}
                                    <div className="bg-slate-900 rounded-2xl p-4 text-white/90 relative group">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest italic leading-none">Smart Efficiency Intel</span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed font-medium italic">
                                            "{ai.reasoning} {ai.savingsDetail}"
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setService(prev => ({ ...prev, aiAnalysis: null }))}
                                        className="w-full mt-4 text-[10px] font-bold text-gray-300 hover:text-indigo-600 transition-colors uppercase tracking-widest text-center"
                                    >
                                        Reset Matcher
                                    </button>

                                    {/* Aesthetic background blur */}
                                    <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-blue-400/10 blur-3xl rounded-full" />
                                    <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 bg-indigo-400/10 blur-3xl rounded-full" />
                                </div>
                                );
                            })()
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={loading}
                      className="w-full bg-white text-blue-600 border-2 border-blue-600 py-3 rounded-xl font-bold text-lg hover:bg-blue-50 focus:outline-none transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart />
                      Add to Cart
                    </button>

                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl mb-4">
                      <p className="text-xs text-yellow-800 font-bold flex items-center gap-2">
                        <FaInfoCircle className="text-yellow-600 shrink-0" />
                        DEVELOPER TEST MODE TIP:
                      </p>
                      <p className="text-[10px] text-yellow-700 mt-1">
                        When the Razorpay modal opens, <b>DO NOT</b> use dummy credit cards as they trigger International Card locks. 
                        Instead, select <b>UPI</b> and type <code className="bg-white px-1 py-0.5 rounded text-blue-600 font-black">success@razorpay</code> to simulate a successful payment!
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 shadow-lg shadow-blue-200"
                    >
                      {loading ? 'Processing...' : 'Confirm Booking Now'}
                    </button>
                  </div>

                  <p className="text-xs text-center text-gray-400 mt-4">
                    By booking, you agree to our Terms of Service.
                  </p>

                  {cancelMessage && (
                    <p className="text-sm text-amber-600 text-center mt-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
                      {cancelMessage}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;