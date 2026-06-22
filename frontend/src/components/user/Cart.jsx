import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaChevronLeft, FaCheckCircle, FaPercentage, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaReceipt, FaUser } from 'react-icons/fa';
import axios from '../../api/axios';

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [checkoutData, setCheckoutData] = useState({
        address: '',
        landmark: '',
        notes: '',
        paymentMethod: 'cash'
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const { data } = await axios.get('/cart');
            setCart(data);
            
            // Sync cart badge count
            if (data && data.items) {
                window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: data.items.length } }));
            }

            // 🚀 SMART PRE-FILL: Inherit address & landmark from the first item if available
            if (data.items?.length > 0 && !checkoutData.address) {
                const firstItem = data.items[0];
                setCheckoutData(prev => ({ 
                    ...prev, 
                    address: firstItem.address || '',
                    landmark: firstItem.landmark || ''
                }));
            }
        } catch (err) {
            setError('Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (itemId) => {
        try {
            await axios.delete(`/cart/item/${itemId}`);
            fetchCart();
        } catch (err) {
            setError('Failed to remove item');
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!checkoutData.address) {
            setError('Please provide a service address');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/cart/checkout', checkoutData);
            window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: 0 } }));
            navigate('/user/bookings');
        } catch (err) {
            setError('Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:5000${path}`;
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azure-blue"></div>
        </div>
    );

    return (
        <div className="min-h-screen py-12 px-6 font-lato animate-fadeIn">
            <div className="max-w-7xl mx-auto">
                {/* 🚀 NAVIGATION & HEADER */}
                <div className="flex items-center justify-between mb-12">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-deep-slate font-black text-xs uppercase tracking-widest hover:text-azure-blue transition-all">
                        <FaChevronLeft /> Back to Shop
                    </button>
                    <h1 className="text-xl font-black text-deep-slate uppercase tracking-tighter flex items-center gap-3">
                        <FaShoppingCart className="text-azure-blue" />
                        Service Cart
                    </h1>
                </div>

                {error && (
                    <div className="glass-panel p-4 border-rose-200 bg-rose-50/50 flex items-center gap-3 text-rose-600 text-sm font-bold mb-8">
                        <FaCheckCircle className="rotate-180" /> {error}
                    </div>
                )}

                {!cart || cart.items.length === 0 ? (
                    <div className="glass-panel max-w-2xl mx-auto p-20 text-center shadow-2xl shadow-slate-200/50 rounded-[3rem]">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <FaShoppingCart className="text-slate-200 text-4xl" />
                        </div>
                        <h2 className="text-3xl font-black text-deep-slate mb-4">Your cart is empty</h2>
                        <p className="text-muted-slate font-medium mb-10 max-w-sm mx-auto">
                            It looks like you haven't curated any services yet. Start browsing to build your dream service bundle.
                        </p>
                        <button
                            onClick={() => navigate('/services')}
                            className="bg-deep-slate text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:scale-105 transition-all"
                        >
                            Explore Professionals
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* 🚀 CART ITEMS LIST (2/3) */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="flex items-center justify-between px-4">
                               <p className="text-[10px] font-black text-muted-slate uppercase tracking-widest">Item Details ({cart.items.length})</p>
                               <p className="text-[10px] font-black text-muted-slate uppercase tracking-widest">Rate</p>
                            </div>
                            
                            {cart.items.map((item) => (
                                <div key={item._id} className="glass-panel p-6 shadow-xl relative group rounded-[2.5rem] border-white/60 bg-white/40 hover:shadow-2xl transition-all duration-500">
                                    <div className="flex gap-8 items-center">
                                        <div className="w-28 h-28 rounded-[2rem] bg-slate-50 overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                                            {item.service.image ? (
                                                <img src={getImageUrl(item.service.image)} alt={item.service.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-azure-blue bg-blue-50">
                                                    <FaShoppingCart size={30} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-[9px] font-black text-azure-blue bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">{item.service.category || 'Expert Service'}</span>
                                                    <h3 className="text-xl font-black text-deep-slate mt-2">{item.service.name}</h3>
                                                </div>
                                                <button onClick={() => removeItem(item._id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all shadow-sm">
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-400"><FaUser size={10} /></div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-muted-slate uppercase tracking-tighter">Professional</p>
                                                        <p className="text-xs font-black text-deep-slate">{item.worker?.name || 'Assigned Pro'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-400"><FaCalendarAlt size={10} /></div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-muted-slate uppercase tracking-tighter">Scheduled</p>
                                                        <p className="text-xs font-black text-deep-slate">{new Date(item.scheduledDate).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 hidden md:flex">
                                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-400"><FaClock size={10} /></div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-muted-slate uppercase tracking-tighter">Time Slot</p>
                                                        <p className="text-xs font-black text-deep-slate">{item.scheduledTime}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {(item.address || item.landmark) && (
                                                <div className="mt-4 space-y-2">
                                                    {item.address && (
                                                        <div className="flex items-center gap-2 text-muted-slate bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                                                            <FaMapMarkerAlt size={10} className="text-azure-blue" />
                                                            <p className="text-[10px] font-bold truncate max-w-md">{item.address}</p>
                                                        </div>
                                                    )}
                                                    {item.landmark && (
                                                        <div className="flex items-center gap-2 text-azure-blue bg-blue-50/30 p-2 rounded-xl border border-blue-50">
                                                            <FaMagic size={10} />
                                                            <p className="text-[9px] font-black uppercase tracking-widest truncate max-w-md">Landmark: {item.landmark}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-right flex-shrink-0 pr-4">
                                            <p className="text-xl font-black text-deep-slate">₹{item.priceAtAddition.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 🚀 BILLING SUMMARY sidebar (1/3) */}
                        <div className="lg:col-span-4 lg:sticky lg:top-10 space-y-8">
                            <div className="glass-panel p-10 space-y-8 shadow-2xl shadow-slate-200/50 border border-white/60 bg-white/70 backdrop-blur-xl rounded-[3rem]">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-deep-slate uppercase tracking-widest opacity-40">Payment Checkout</h3>
                                    <div className="p-2 bg-azure-blue shadow-lg shadow-blue-500/20 text-white rounded-xl"><FaReceipt /></div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                       <div className="flex justify-between items-center group">
                                          <div>
                                             <p className="text-[10px] font-black text-muted-slate uppercase tracking-widest opacity-50">Combined Value</p>
                                             <p className="text-sm font-black text-deep-slate">Subtotal</p>
                                          </div>
                                          <span className="text-base font-black text-deep-slate">₹{cart.totalAmount.toLocaleString()}</span>
                                       </div>

                                       {cart.discountDetails?.firstTime > 0 && (
                                          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex justify-between items-center animate-in zoom-in duration-300">
                                              <span className="text-[10px] font-black text-azure-blue uppercase tracking-widest flex items-center gap-2">
                                                  <FaPercentage /> First User Reward
                                              </span>
                                              <span className="text-sm font-black text-azure-blue">-₹{cart.discountDetails.firstTime}</span>
                                          </div>
                                       )}

                                       {cart.discountDetails?.volume > 0 && (
                                          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center animate-in zoom-in duration-500">
                                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                                  <FaPercentage /> Volume Savings ({cart.totalAmount > 5000 ? '20%' : '10%'})
                                              </span>
                                              <span className="text-sm font-black text-emerald-600">-₹{cart.discountDetails.volume}</span>
                                          </div>
                                       )}
                                    </div>

                                    <form onSubmit={handleCheckout} className="space-y-6 border-t border-slate-200/50 pt-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted-slate uppercase tracking-widest block pl-1">Primary Address</label>
                                            <textarea
                                                required
                                                value={checkoutData.address}
                                                onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                                                className="w-full bg-white/60 border border-white p-5 rounded-[2rem] text-sm font-medium outline-none resize-none focus:ring-4 focus:ring-azure-blue/10 transition-all shadow-sm"
                                                rows="3"
                                                placeholder="Street, City, Area..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted-slate uppercase tracking-widest block pl-1">Nearby Landmark / Floor / Unit</label>
                                            <input
                                                type="text"
                                                value={checkoutData.landmark}
                                                onChange={(e) => setCheckoutData({ ...checkoutData, landmark: e.target.value })}
                                                className="w-full bg-white/60 border border-white p-4 rounded-2xl text-xs font-black text-deep-slate focus:ring-4 focus:ring-azure-blue/10 outline-none transition-all shadow-sm"
                                                placeholder="e.g. Opposite Park, 4th Floor..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted-slate uppercase tracking-widest block pl-1">Payment Strategy</label>
                                            <select
                                                value={checkoutData.paymentMethod}
                                                onChange={(e) => setCheckoutData({ ...checkoutData, paymentMethod: e.target.value })}
                                                className="w-full bg-white/60 border border-white p-4 rounded-2xl text-xs font-black text-deep-slate focus:ring-4 focus:ring-azure-blue/10 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                                            >
                                                <option value="cash">Cash After Service</option>
                                                <option value="upi">UPI / Digital (Instant)</option>
                                                <option value="card">Professional Card Swap</option>
                                            </select>
                                        </div>

                                        <div className="pt-8 border-t-4 border-azure-blue/10">
                                            <div className="flex justify-between items-end mb-8">
                                                <div>
                                                    <p className="text-[11px] font-black text-muted-slate uppercase tracking-widest mb-1">Total Payable</p>
                                                    <p className="text-[9px] font-bold text-azure-blue uppercase tracking-tighter italic">Inclusive of all rewards</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-5xl font-black text-deep-slate tracking-tighter leading-none">₹{Math.round(cart.finalAmount).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full py-6 bg-azure-blue text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                            >
                                                {loading ? 'Validating...' : (
                                                    <>
                                                        <FaCheckCircle /> Confirm & Schedule Bundle
                                                    </>
                                                )}
                                            </button>

                                            {cart.totalAmount <= 5000 && (
                                                <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-4 group">
                                                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-azure-blue shadow-sm group-hover:rotate-12 transition-transform"><FaPercentage /></div>
                                                   <p className="text-[9px] font-black text-azure-blue uppercase leading-relaxed">
                                                       {cart.totalAmount <= 2000 ? (
                                                           `Curate ₹${2000 - cart.totalAmount + 1} more to unlock 10% volume reward!`
                                                       ) : (
                                                           `Curate ₹${5000 - cart.totalAmount + 1} more for 20% elite discount!`
                                                       )}
                                                   </p>
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <style jsx="true">{`
                .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Cart;
