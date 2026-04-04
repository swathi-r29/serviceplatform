import { createContext, useState, useContext } from 'react';

const AssistantContext = createContext();

export const AssistantProvider = ({ children }) => {
  const [pageContext, setPageContext] = useState({ type: 'general' });

  return (
    <AssistantContext.Provider value={{ pageContext, setPageContext }}>
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistantContext = () => useContext(AssistantContext);
