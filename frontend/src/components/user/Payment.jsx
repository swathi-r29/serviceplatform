import { useState } from 'react';
import axios from '../../api/axios';

const Payment = ({ booking, onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleOnlinePayment = async () => {
    setError('');
    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway');
        setLoading(false);
        return;
      }

      const { data: orderData } = await axios.post('/payment/create-order', {
        bookingId: booking._id
      });

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ServiceHub',
        description: `Payment for ${booking.service?.name}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            await axios.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id
            });
            onSuccess();
          } catch (error) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: booking.user?.name,
          email: booking.user?.email,
          contact: booking.user?.phone
        },
        theme: {
          color: '#2563eb'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
      setLoading(false);
    }
  };

  const handleCashPayment = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.put(`/bookings/${booking._id}/payment`, { paymentMethod });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (paymentMethod === 'online') {
      handleOnlinePayment();
    } else {
      handleCashPayment(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Complete Payment</h2>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <div className="mb-6">
          <p className="text-gray-600 mb-2">Service: <span className="font-semibold">{booking.service?.name}</span></p>
          <p className="text-gray-600 mb-2">Worker: <span className="font-semibold">{booking.worker?.name}</span></p>
          <p className="text-2xl font-bold text-blue-600">Amount: ₹{booking.totalAmount}</p>
        </div>

        <form onSubmit={handlePayment}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span>Pay Online (Card/UPI/Netbanking)</span>
              </label>
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span>Cash on Service</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Processing...' : paymentMethod === 'online' ? 'Pay Now' : 'Confirm Payment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payment;