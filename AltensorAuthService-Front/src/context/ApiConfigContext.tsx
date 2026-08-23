import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { wellKnownApi } from '../api/wellKnownApi';

export type ConnectionStatus = 'checking' | 'connected' | 'disconnected';

interface ApiConfigContextType {
  apiUrl: string;
  setApiUrl: (url: string) => void;
  status: ConnectionStatus;
  checkConnection: () => Promise<boolean>;
  lastChecked: Date | null;
}

const ApiConfigContext = createContext<ApiConfigContextType | undefined>(undefined);

export const ApiConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiUrl, setApiUrlState] = useState<string>(storage.getApiUrl());
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = useCallback(async () => {
    setStatus('checking');
    try {
      await wellKnownApi.getJwks();
      setStatus('connected');
      setLastChecked(new Date());
      return true;
    } catch {
      setStatus('disconnected');
      setLastChecked(new Date());
      return false;
    }
  }, []);

  const setApiUrl = (newUrl: string) => {
    const trimmed = newUrl.trim();
    storage.setApiUrl(trimmed);
    setApiUrlState(trimmed);
  };

  useEffect(() => {
    checkConnection();
  }, [apiUrl, checkConnection]);

  return (
    <ApiConfigContext.Provider
      value={{
        apiUrl,
        setApiUrl,
        status,
        checkConnection,
        lastChecked
      }}
    >
      {children}
    </ApiConfigContext.Provider>
  );
};

export const useApiConfig = () => {
  const context = useContext(ApiConfigContext);
  if (!context) {
    throw new Error('useApiConfig must be used within an ApiConfigProvider');
  }
  return context;
};
