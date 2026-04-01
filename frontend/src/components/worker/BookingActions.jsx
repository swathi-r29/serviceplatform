import axios from '../../api/axios';

const BookingActions = ({ booking, onRefresh }) => {
  const handleAccept = async () => {
    try {
      await axios.put(`/worker/bookings/${booking._id}/accept`);
      onRefresh();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to accept booking');
    }
  };

  const handleReject = async () => {
    if (window.confirm('Are you sure you want to reject this booking?')) {
      try {
        await axios.put(`/worker/bookings/${booking._id}/reject`);
        onRefresh();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to reject booking');
      }
    }
  };

  const handleStartTravel = async () => {
    try {
      await axios.put(`/worker/bookings/${booking._id}/start-travel`);
      onRefresh();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to start travel');
    }
  };

  const handleStartService = async () => {
    try {
      await axios.put(`/worker/bookings/${booking._id}/start-service`);
      onRefresh();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to start service');
    }
  };

  const handleComplete = async () => {
    try {
      await axios.put(`/worker/bookings/${booking._id}/complete`);
      onRefresh();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to complete booking');
    }
  };

  if (booking.status === 'pending') {
    return (
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleAccept}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold"
        >
          Accept Booking
        </button>
        <button
          onClick={handleReject}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 font-semibold"
        >
          Reject Booking
        </button>
      </div>
    );
  }

  if (booking.status === 'accepted' && booking.paymentStatus === 'paid') {
    return (
      <button
        onClick={handleStartTravel}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-4 font-semibold"
      >
        Start Travel
      </button>
    );
  }

  if (booking.status === 'on-the-way') {
    return (
      <button
        onClick={handleStartService}
        className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 mt-4 font-semibold"
      >
        Start Service
      </button>
    );
  }

  if (booking.status === 'in-progress') {
    return (
      <button
        onClick={handleComplete}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 mt-4 font-semibold"
      >
        Mark as Completed
      </button>
    );
  }

  if (booking.status === 'accepted' && booking.paymentStatus === 'pending') {
    return (
      <p className="text-orange-600 font-semibold mt-4">Waiting for customer payment...</p>
    );
  }

  return null;
};

export default BookingActions;