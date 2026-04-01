import { useWebRTC } from '../../context/WebRTCContext';
import { FaPhone, FaMapMarkerAlt, FaPlay } from 'react-icons/fa';

const WorkerBookingCard = ({ booking, onRefresh }) => {
  const { startStream, callUser, setIsCallModalOpen, socket } = useWebRTC();
  const [isSimulating, setIsSimulating] = useState(false);

  const startGpsSimulation = () => {
    setIsSimulating(true);
    // Simulation coordinates (starting in Bangalore)
    let lat = 12.9716;
    let lng = 77.5946;

    const interval = setInterval(() => {
      lat += 0.0002;
      lng += 0.0002;
      socket.emit('update-location', { 
         bookingId: booking._id, 
         coords: { lat, lng } 
      });
    }, 3000);

    // Stop simulation after 2 minutes or if component unmounts
    setTimeout(() => {
      clearInterval(interval);
      setIsSimulating(false);
    }, 120000);
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    'on-the-way': 'bg-indigo-100 text-indigo-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 min-h-[300px] flex flex-col group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
             <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${statusColors[booking.status]}`}>
               {booking.status}
             </span>
          </div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
            {booking.service?.name}
          </h3>
          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
               <span className="text-gray-400 font-medium">Customer:</span> {booking.user?.name}
            </p>
            <p className="text-xs text-gray-500 font-medium">{booking.address}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-black text-gray-900">₹{booking.totalAmount}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
            {booking.paymentStatus === 'paid' ? '💰 Payment Confirmed' : '⌛ Payment Pending'}
          </p>
        </div>
      </div>

      <div className="bg-gray-50/50 rounded-xl p-4 mb-6">
         <LifecycleTimeline 
           currentStatus={booking.status} 
           history={booking.statusHistory} 
         />
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3">
        {['accepted', 'on-the-way', 'in-progress'].includes(booking.status) && (
          <>
            <button
              onClick={() => {
                startStream();
                callUser(booking.user._id);
                setIsCallModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-bold text-xs hover:bg-green-600 transition-all shadow-lg shadow-green-100"
            >
              <FaPhone size={12} /> Call Customer
            </button>
            <Link
              to={`/chat/booking/${booking._id}`}
              className="flex items-center justify-center border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-50 transition-all"
            >
              Open Messaging
            </Link>
          </>
        )}

        {booking.status === 'on-the-way' && (
          <button
            disabled={isSimulating}
            onClick={startGpsSimulation}
            className={`col-span-2 flex items-center justify-center gap-2 py-3 ${isSimulating ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'} rounded-xl font-bold text-xs transition-all shadow-lg uppercase tracking-widest`}
          >
            <FaPlay size={10} className={isSimulating ? 'animate-spin' : ''} />
            {isSimulating ? 'Broadcasting GPS Signal...' : 'Simulate GPS Trip (New)'}
          </button>
        )}

        <div className="col-span-2">
            <BookingActions booking={booking} onRefresh={onRefresh} />
        </div>
      </div>
    </div>
  );
};

export default WorkerBookingCard;
