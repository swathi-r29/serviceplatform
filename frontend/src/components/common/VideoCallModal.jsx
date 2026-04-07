import React, { useEffect, useRef } from 'react';
import { useWebRTC } from '../../context/WebRTCContext';
import { FaPhoneSlash, FaMicrophone, FaVideo, FaVideoSlash, FaMicrophoneSlash } from 'react-icons/fa';

const VideoCallModal = ({ isOpen, onClose }) => {
    const { stream, remoteStream, userVideo, myVideo, setMyVideo, setUserVideo, callAccepted, callEnded, leaveCall, call } = useWebRTC();
    const myVideoRef = useRef();
    const userVideoRef = useRef();

    useEffect(() => {
        if (myVideoRef.current) setMyVideo(myVideoRef.current);
        if (userVideoRef.current) setUserVideo(userVideoRef.current);
    }, [setMyVideo, setUserVideo, callAccepted]);

    useEffect(() => {
        if (remoteStream && userVideoRef.current) {
            userVideoRef.current.srcObject = remoteStream;
            console.log("[WebRTC] Attached remote stream to userVideo element");
        }
    }, [remoteStream]);

    useEffect(() => {
        if (stream && myVideoRef.current) {
            myVideoRef.current.srcObject = stream;
        }
    }, [stream]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md transition-all animate-in fade-in duration-300">
            <div className="relative w-full max-w-5xl aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 mx-4">
                
                {/* Secondary Video (User) */}
                <div className="absolute top-6 right-6 w-1/4 aspect-video bg-black rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10">
                    <video playsInline muted ref={myVideoRef} autoPlay className="w-full h-full object-cover mirror" />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-[10px] text-white rounded font-bold uppercase tracking-widest">You</div>
                </div>

                {/* Primary Video (Peer) */}
                <div className="w-full h-full relative flex items-center justify-center">
                    {callAccepted && !callEnded ? (
                        <video playsInline ref={userVideoRef} autoPlay className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center">
                            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-2xl shadow-blue-500/50">
                                <span className="text-3xl font-bold text-white">{call.name ? call.name.charAt(0) : '...'}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Connecting to {call.name || 'Provider'}...</h2>
                            <p className="text-blue-400 text-sm animate-pulse">Encryption Secured</p>
                        </div>
                    )}
                </div>

                {/* Call Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-5 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
                    <button className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all">
                        <FaMicrophone size={20} />
                    </button>
                    <button className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all">
                        <FaVideo size={20} />
                    </button>
                    <button 
                        onClick={() => {
                            leaveCall();
                            onClose();
                        }}
                        className="p-5 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-110 transition-all shadow-xl shadow-red-500/50"
                    >
                        <FaPhoneSlash size={24} />
                    </button>
                </div>

                {/* Corner Label */}
                <div className="absolute bottom-10 left-10 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">LIVE • {callAccepted ? 'CONNECTED' : 'SIGNALING'}</span>
                </div>
            </div>

            <style jsx="true">{`
                .mirror { transform: rotateY(180deg); }
                .animate-in { animation: zoomIn 0.3s ease-out; }
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default VideoCallModal;
