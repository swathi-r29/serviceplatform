import { useState, useRef, useEffect, useMemo } from 'react';
import { useClaudeAssistant } from '../../hooks/useClaudeAssistant';
import { SYSTEM_PROMPTS } from './systemPrompts';
import { useAssistantContext } from '../../context/AssistantContext';
import { FaComments, FaTimes, FaMinus, FaPaperPlane, FaMagic } from 'react-icons/fa';

const AssistantWidget = () => {
  const { pageContext } = useAssistantContext();
  const [isOpen, setIsOpen] = useState(() => {
    return localStorage.getItem('assistant_open') === 'true';
  });
  const [inputValue, setInputValue] = useState('');
  
  const messagesEndRef = useRef(null);

  // Determine system context based on pageContext from global state
  const systemContext = useMemo(() => {
    if (!pageContext) return SYSTEM_PROMPTS.user_general;
    
    if (pageContext.type === 'booking') {
      return SYSTEM_PROMPTS.booking_advisor(
        pageContext.service?.name, 
        pageContext.service?.price, 
        pageContext.worker?.name, 
        pageContext.worker?.rating
      );
    }
    
    if (pageContext.type === 'worker') {
      return SYSTEM_PROMPTS.worker_guide(
        pageContext.name,
        pageContext.skills,
        pageContext.rate
      );
    }
    
    return SYSTEM_PROMPTS.user_general;
  }, [pageContext]);

  const { messages, sendMessage, isLoading, error, clearMessages } = useClaudeAssistant(systemContext);
  
  // Track context changes to clear conversation when navigating across major zones
  useEffect(() => {
    // We clear conversation only if the "type" of page changes
    const lastType = sessionStorage.getItem('last_assistant_type') || 'general';
    const currentType = pageContext?.type || 'general';
    
    if (lastType !== currentType) {
      clearMessages();
      sessionStorage.setItem('last_assistant_type', currentType);
    }
  }, [pageContext?.type, clearMessages]);

  useEffect(() => {
    localStorage.setItem('assistant_open', isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const renderSuggestions = () => {
    const suggestions = {
      booking: [
        "Is this good value?",
        "What should I include in notes?",
        "How does payment work?"
      ],
      worker: [
        "Help me set my pricing",
        "How do I get more bookings?",
        "Explain the match score"
      ],
      general: [
        "What services do you offer?",
        "How does booking work?",
        "What if I need to cancel?"
      ]
    };

    const currentSuggestions = suggestions[pageContext?.type] || suggestions.general;

    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {currentSuggestions.map((text, i) => (
          <button
            key={i}
            className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full py-1.5 px-3 hover:bg-indigo-100 transition-colors text-left"
            onClick={() => {
              setInputValue(text);
              sendMessage(text);
            }}
            disabled={isLoading}
          >
            {text}
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all group flex mt-auto animate-pulse-first"
        title="Ask AI Assistant"
      >
        <FaMagic className="text-xl" />
        <div className="absolute opacity-0 group-hover:opacity-100 right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap transition-opacity pointer-events-none font-medium">
          Ask AI Assistant
          <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-gray-900"></div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden font-lato transition-all">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 shrink-0 flex items-center justify-between text-white">
        <div>
          <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
            ServiceHub AI
          </h3>
          <p className="text-[10px] text-blue-100 font-medium tracking-wide uppercase mt-0.5">Powered by Claude</p>
        </div>
        <div className="flex gap-3 text-blue-100">
          <button onClick={() => setIsOpen(false)} className="hover:text-white transition-colors">
            <FaMinus size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="my-auto text-center px-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaMagic className="text-indigo-600 text-xl" />
            </div>
            <h4 className="font-bold text-gray-800 mb-1">How can I help today?</h4>
            <p className="text-xs text-gray-500 mb-6">Ask me anything about our services, pricing, or your bookings.</p>
            {renderSuggestions()}
          </div>
        ) : (
          messages.map((ms, idx) => (
            <div key={idx} className={`flex max-w-[85%] ${ms.role === 'user' ? 'self-end' : 'self-start'}`}>
              <div
                className={`p-3 rounded-2xl text-sm ${ms.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'}`}
              >
                {ms.content}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex self-start max-w-[85%]">
            <div className="p-4 bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        {error && (
          <div className="text-xs text-red-500 text-center bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 bg-white border-t border-gray-200 p-3">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="Ask anything..."
            className="flex-1 bg-gray-100 text-sm px-4 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-blue-500 transition-shadow disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            <FaPaperPlane size={12} className="mr-0.5" />
          </button>
        </form>
        <p className="text-center text-[9px] text-gray-400 mt-2 font-medium">
          AI can make mistakes. Verify important details.
        </p>
      </div>
    </div>
  );
};

export default AssistantWidget;
