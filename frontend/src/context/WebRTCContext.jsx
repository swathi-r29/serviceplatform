import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { useAuth } from './AuthContext'; // Assuming you have AuthContext for user details
import { toast } from 'react-hot-toast';

const WebRTCContext = createContext();

export const useWebRTC = () => useContext(WebRTCContext);

export const WebRTCProvider = ({ children }) => {
    const { user, socket } = useAuth();
    const [call, setCall] = useState({});
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [stream, setStream] = useState(null);
    const [name, setName] = useState('');
    const [myVideo, setMyVideo] = useState(null);
    const [userVideo, setUserVideo] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);

    const connectionRef = useRef();

    useEffect(() => {
        if (!socket) return;

        socket.on('incoming-call', ({ from, name: callerName, signal }) => {
            setReceivingCall(true);
            setCall({ isReceivingCall: true, from, name: callerName, signal });
        });

        return () => {
            socket.off('incoming-call');
        };
    }, [socket]);

    const answerCall = async (options = { video: true, audio: true }) => {
        setCallAccepted(true);
        
        let currentStream = stream;
        if (!currentStream) {
            try {
                currentStream = await navigator.mediaDevices.getUserMedia(options);
                setStream(currentStream);
                if (myVideo) myVideo.srcObject = currentStream;
            } catch (err) {
                console.error("Failed to get stream during answer:", err);
                return;
            }
        }

        const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });

        peer.on('signal', (data) => {
            socket.emit('answer-call', { signal: data, to: call.from });
        });

        peer.on('stream', (recvStream) => {
            setRemoteStream(recvStream);
            if (userVideo) userVideo.srcObject = recvStream;
        });

        peer.signal(call.signal);
        connectionRef.current = peer;
    };

    const callUser = async (id, options = { video: true, audio: true }) => {
        let currentStream = stream;
        if (!currentStream) {
            try {
                currentStream = await navigator.mediaDevices.getUserMedia(options);
                setStream(currentStream);
                if (myVideo) myVideo.srcObject = currentStream;
            } catch (err) {
                console.error("Failed to get stream during callUser:", err);
                return;
            }
        }

        const peer = new Peer({ initiator: true, trickle: false, stream: currentStream });

        peer.on('signal', (data) => {
            socket.emit('call-user', { userToCall: id, signalData: data, from: user._id, name: user.name });
        });

        peer.on('stream', (recvStream) => {
            setRemoteStream(recvStream);
            if (userVideo) userVideo.srcObject = recvStream;
        });

        socket.on('call-accepted', (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) connectionRef.current.destroy();
        window.location.reload(); // Hard reset for stream cleanup
    };

    const startStream = async (options = { video: true, audio: true }) => {
        try {
            const currentStream = await navigator.mediaDevices.getUserMedia(options);
            setStream(currentStream);
            if (myVideo) myVideo.srcObject = currentStream;
        } catch (error) {
            console.error("Failed to get media devices:", error);
            toast.error("Please allow camera and microphone access");
        }
    };

    return (
        <WebRTCContext.Provider value={{
            call,
            callAccepted,
            myVideo,
            userVideo,
            setMyVideo,
            setUserVideo,
            remoteStream,
            stream,
            name,
            setName,
            callEnded,
            receivingCall,
            setReceivingCall,
            isCallModalOpen,
            setIsCallModalOpen,
            callUser,
            leaveCall,
            answerCall,
            startStream,
            socket
        }}>
            {children}
        </WebRTCContext.Provider>
    );
};
