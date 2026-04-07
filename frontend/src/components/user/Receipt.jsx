import React from 'react';
import { FaCheckCircle, FaDownload, FaTimes, FaMapMarkerAlt, FaUser, FaCalendarAlt, FaClock, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { getImageUrl } from '../../utils/helpers';

const Receipt = ({ booking, onClose }) => {
  if (!booking) return null;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative animate-in zoom-in-95 duration-300">
        
        {/* Header Section */}
        <div className="bg-indigo-600 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FaTimes size={18} />
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-white/20 p-2 rounded-xl">
              <FaCheckCircle className="text-emerald-400" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">E-Receipt</h2>
              <p className="text-white/70 text-xs font-bold tracking-widest">TRANSACTION SUCCESSFUL</p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between items-end">
            <div>
              <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider">Booking ID</p>
              <p className="font-mono text-sm uppercase tracking-tighter">#{booking._id?.slice(-8)}</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider">Date Issued</p>
              <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-6">
          
          {/* Service Info */}
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-50 flex-shrink-0">
                {booking.service?.image ? (
                  <img src={getImageUrl(booking.service.image)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-indigo-400 font-bold text-xl uppercase">{booking.service?.name?.slice(0, 2)}</div>
                )}
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-lg leading-tight">{booking.service?.name}</h3>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mt-1">{booking.service?.category}</p>
                <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-gray-500 uppercase">
                  <span className="flex items-center gap-1"><FaCalendarAlt /> {formatDate(booking.scheduledDate)}</span>
                  <span className="flex items-center gap-1"><FaClock /> {booking.scheduledTime}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                {booking.worker?.profileImage ? (
                  <img src={getImageUrl(booking.worker.profileImage)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-gray-300" />
                )}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Service Professional</p>
                <p className="text-sm font-black text-indigo-900">{booking.worker?.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Status</p>
              <div className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">PAID</div>
            </div>
          </div>

          {/* Billing Details */}
          <div className="pt-2">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Payment Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium font-bold">Base Service Rate</span>
                <span className="text-gray-900 font-black">₹{(booking.baseServicePrice || booking.totalAmount)?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium font-bold">Travel & Convenience</span>
                <span className="text-gray-900 font-black">₹{(booking.travelFee || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t-2 border-dashed border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    {booking.paymentMethod === 'online' ? <FaCreditCard size={12} /> : <FaMoneyBillWave size={12} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Total Paid via {booking.paymentMethod}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-600 leading-none">₹{booking.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 no-print">
            <button
              onClick={handlePrint}
              className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 py-3.5 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group"
            >
              <FaDownload className="group-hover:-translate-y-0.5 transition-transform" /> 
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Done
            </button>
          </div>
        </div>

        {/* Aesthetic footer detail */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
            Thank you for using ServiceHub Marketplace
          </p>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
