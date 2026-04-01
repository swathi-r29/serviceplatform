import { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const Chat = () => {
  const { bookingId, userId } = useParams();
  const { user } = useContext(AuthContext);
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChat();
  }, [bookingId, userId]);

  useEffect(() => {
    if (!chat) return;

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    if (bookingId) {
      newSocket.emit('joinBooking', bookingId);
    } else if (userId) {
      newSocket.emit('joinUserChat', userId);
    }

    newSocket.on('newMessage', (data) => {
      if (data.chatId === chat._id && data.message.sender._id !== user._id) {
        setChat(prev => ({
          ...prev,
          messages: [...prev.messages, data.message]
        }));
      }
    });

    return () => newSocket.close();
  }, [chat]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const fetchChat = async () => {
    try {
      let url;
      if (bookingId) {
        url = `/chat/booking/${bookingId}`;
      } else if (userId) {
        url = `/chat/user/${userId}`;
      }
      const { data } = await axios.get(url);
      setChat(data);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      let url;
      if (bookingId) {
        url = `/chat/booking/${bookingId}/message`;
      } else if (userId) {
        url = `/chat/user/${userId}/message`;
      }
      const { data } = await axios.post(url, {
        content: message,
        type: 'text'
      });
      setChat(data);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!chat) return <div className="flex justify-center items-center min-h-screen">Loading chat...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-4">
          <h2 className="text-xl font-bold">
            {bookingId ? `Chat - Booking #${bookingId.slice(-8)}` : 'Chat with Admin'}
          </h2>
          <p className="text-sm opacity-90">
            {chat.participants.find(p => p._id !== user._id)?.name}
          </p>
        </div>

        <div className="h-96 overflow-y-auto p-4 bg-gray-50">
          {chat.messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender._id === user._id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300'
                }`}
              >
                <p className="text-sm font-semibold mb-1">{msg.sender.name}</p>
                <p>{msg.content}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;