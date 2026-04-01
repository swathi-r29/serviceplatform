import React from 'react';
import { useWebRTC } from '../../context/WebRTCContext';
import { FaPhone, FaPhoneSlash, FaVideo } from 'react-icons/fa';

const IncomingCallAlert = ({ onAnswer }) => {
    const { call, receivingCall, setReceivingCall, answerCall } = useWebRTC();

    if (!receivingCall) return null;

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[10000] animate-in slide-in-top duration-500">
            <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl border border-blue-100 flex items-center gap-6 min-w-[400px]">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-200 animate-pulse">
                        {call.name ? call.name.charAt(0) : '?'}
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 tracking-tight">{call.name || 'Professional'}</h3>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                             <FaVideo /> Incoming Video Call...
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setReceivingCall(false)}
                        className="p-4 bg-gray-100 text-gray-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                        <FaPhoneSlash size={20} />
                    </button>
                    <button 
                        onClick={() => {
                            answerCall();
                            setReceivingCall(false);
                            onAnswer(); // Opens the VideoCallModal
                        }}
                        className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600 hover:scale-110 transition-all shadow-lg shadow-green-200 animate-bounce"
                    >
                        <FaPhone size={20} />
                    </button>
                </div>
            </div>

            <style jsx="true">{`
                .animate-in { animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes slideDown {
                    from { opacity: 0; transform: translate(-50%, -100%) scale(0.9); }
                    to { opacity: 1; transform: translate(-50%, 0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default IncomingCallAlert;
