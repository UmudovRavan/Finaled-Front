import React, { createContext, useContext, useState, useEffect } from 'react';
import { HttpLogEntry } from '../types/log.types';
import { registerLogListener } from '../api/client';

interface LogContextType {
  logs: HttpLogEntry[];
  clearLogs: () => void;
  selectedLog: HttpLogEntry | null;
  setSelectedLog: (log: HttpLogEntry | null) => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export const LogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<HttpLogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<HttpLogEntry | null>(null);

  useEffect(() => {
    const unsubscribe = registerLogListener((entry) => {
      setLogs((prev) => [entry, ...prev.slice(0, 99)]);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
    setSelectedLog(null);
  };

  return (
    <LogContext.Provider value={{ logs, clearLogs, selectedLog, setSelectedLog }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLogs = () => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error('useLogs must be used within a LogProvider');
  }
  return context;
};
