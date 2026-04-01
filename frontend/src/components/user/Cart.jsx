import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaArrowLeft, FaCheckCircle, FaPercentage } from 'react-icons/fa';
import axios from '../../api/axios';

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [checkoutData, setCheckoutData] = useState({
        address: '',
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
            navigate('/user/bookings');
        } catch (err) {
            setError('Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
                        <FaArrowLeft className="text-gray-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FaShoppingCart className="text-blue-600" />
                        Your Service Cart
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 text-red-700 rounded-r-lg">
                        {error}
                    </div>
                )}

                {!cart || cart.items.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaShoppingCart className="text-gray-300 text-3xl" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8">Looks like you haven't added any services yet.</p>
                        <button
                            onClick={() => navigate('/services')}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                        >
                            Browse Services
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map((item) => (
                                <div key={item._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-6 hover:shadow-md transition-shadow">
                                    <div className="w-24 h-24 bg-blue-50 rounded-xl overflow-hidden flex-shrink-0">
                                        {item.service.image ? (
                                            <img src={`http://localhost:5000${item.service.image}`} alt={item.service.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-blue-300 font-bold">
                                                {item.service.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">{item.service.name}</h3>
                                            <button onClick={() => removeItem(item._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <FaTrash />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                            <div>
                                                <span className="block font-medium text-gray-400 uppercase text-[10px]">Professional</span>
                                                {item.worker?.name || 'Assigned Expert'}
                                            </div>
                                            <div>
                                                <span className="block font-medium text-gray-400 uppercase text-[10px]">Schedule</span>
                                                {new Date(item.scheduledDate).toLocaleDateString()} at {item.scheduledTime}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-between items-center text-blue-600 font-bold">
                                            <span>Rate</span>
                                            <span>₹{item.priceAtAddition}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary & Checkout */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 font-playfair">Order Summary</h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{cart.totalAmount}</span>
                                    </div>

                                    {cart.discountDetails?.firstTime > 0 && (
                                        <div className="flex justify-between text-pink-600 font-medium bg-pink-50/50 p-2 rounded-lg border border-pink-100/50">
                                            <span className="flex items-center gap-2">
                                                <FaPercentage className="text-pink-500" />
                                                First User Offer!
                                            </span>
                                            <span>-₹{cart.discountDetails.firstTime}</span>
                                        </div>
                                    )}

                                    {cart.discountDetails?.volume > 0 && (
                                        <div className="flex justify-between text-green-600 font-medium bg-green-50/50 p-2 rounded-lg border border-green-100/50">
                                            <span className="flex items-center gap-2">
                                                <FaPercentage className="text-green-500" />
                                                Volume Reward ({cart.totalAmount > 5000 ? '20%' : '10%'})
                                            </span>
                                            <span>-₹{cart.discountDetails.volume}</span>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-900">Total Amount</span>
                                        <span className="text-2xl font-bold text-blue-600">₹{cart.finalAmount}</span>
                                    </div>
                                </div>

                                <form onSubmit={handleCheckout} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Service Address</label>
                                        <textarea
                                            required
                                            value={checkoutData.address}
                                            onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                            rows="3"
                                            placeholder="Street, City, Landmark"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                        <select
                                            value={checkoutData.paymentMethod}
                                            onChange={(e) => setCheckoutData({ ...checkoutData, paymentMethod: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="cash">Cash After Service</option>
                                            <option value="card">Credit/Debit Card</option>
                                            <option value="upi">UPI / Online</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-3"
                                    >
                                        {loading ? 'Processing...' : (
                                            <>
                                                <FaCheckCircle />
                                                Confirm All Bookings
                                            </>
                                        )}
                                    </button>

                                    {cart.totalAmount <= 5000 && (
                                        <p className="text-xs text-center text-blue-400 mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50/50 rounded-lg">
                                            {cart.totalAmount <= 2000 ? (
                                                `Add ₹${2000 - cart.totalAmount + 1} more for 10% off!`
                                            ) : (
                                                `Add ₹${5000 - cart.totalAmount + 1} more for 20% off!`
                                            )}
                                        </p>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
