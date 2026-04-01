import { useState, useEffect, useRef, useContext } from 'react';
import { FiMessageSquare, FiX, FiSend, FiTrash2 } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const Chatbot = () => {
  const { user, token } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hello! 👋 Welcome to ServiceHub. I'm here to help you find and book the perfect service. What do you need today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickOptions = ['Book Service', 'Check Prices', 'How it Works'];

  useEffect(() => {
    if (user && token && isOpen && messages.length === 1) {
      fetchHistory();
    }
  }, [user, token, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/chatbot/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.messages.length > 0) {
        setMessages([
          { role: 'model', content: "Welcome back! Here's your previous conversation." },
          ...res.data.messages
        ]);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const payload = { message: text, userId: user ? user._id : null };
      
      const res = await axios.post('http://localhost:5000/api/chatbot/chat', payload, config);
      
      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'model', content: res.data.response.text }]);
      } else {
        throw new Error('API returned failure');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I'm having trouble connecting to the server. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([{ role: 'model', content: "Hello! 👋 Welcome to ServiceHub. How can I help you today?" }]);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center w-14 h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-lg transition-transform hover:scale-105"
          >
            <FiMessageSquare size={24} />
          </button>
        ) : (
          <div className="w-80 sm:w-96 h-[500px] max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <h3 className="font-semibold">ServiceHub Assistant</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleClear} title="Clear Chat" className="p-1 hover:bg-white/20 rounded-md transition-colors">
                  <FiTrash2 size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} title="Close Chat" className="p-1 hover:bg-white/20 rounded-md transition-colors">
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-amber-600 text-white rounded-br-sm'
                        : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 shadow-sm text-gray-500 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Options */}
            {messages.length <= 2 && !isLoading && (
              <div className="px-4 py-2 flex flex-wrap gap-2 bg-gray-50 border-t border-gray-100">
                {quickOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(opt)}
                    className="text-xs bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full hover:bg-amber-50 transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all bg-gray-50 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-amber-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-700 transition-colors"
                >
                  <FiSend size={16} className="-ml-0.5 mt-0.5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Chatbot;
