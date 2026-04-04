import { useState, useCallback } from 'react';

export const useClaudeAssistant = (systemContext) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return;

    const newMessageList = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessageList);
    setIsLoading(true);
    setError('');

    try {
      // Direct call to Anthropic API as requested
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true' // Required when calling directly from browsers
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemContext,
          messages: newMessageList
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'Failed to fetch from Claude API');
      }

      const data = await response.json();
      
      const assistantMessage = {
        role: 'assistant',
        content: data.content[0].text
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Claude API Error:', err);
      setError(err.message || 'An error occurred while talking to the assistant.');
    } finally {
      setIsLoading(false);
    }
  }, [messages, systemContext]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError('');
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    clearMessages
  };
};
