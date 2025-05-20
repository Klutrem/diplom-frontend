"use client"
import getConfig from '@/config';
import { createContext, useState, useEffect, useContext } from 'react';

interface NamespaceContextType {
  namespaces: string[];
  selectedNamespace: string;
  setSelectedNamespace: (namespace: string) => void;
}

const NamespaceContext = createContext<NamespaceContextType | undefined>(undefined);

export const NamespaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string>('default');

  useEffect(() => {
    const fetchNamespaces = async () => {
      try {
        const response = await fetch(`${getConfig().backendBaseUrl}/api/namespaces`);
        if (!response.ok) {
          throw new Error('Failed to fetch namespaces');
        }
        const data: string[] = await response.json();
        setNamespaces(data);
        if (data.length > 0) {
          setSelectedNamespace(data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchNamespaces();
  }, []);

  return (
    <NamespaceContext.Provider value={{ namespaces, selectedNamespace, setSelectedNamespace }}>
      {children}
    </NamespaceContext.Provider>
  );
};

export const useNamespace = () => {
  const context = useContext(NamespaceContext);
  if (context === undefined) {
    throw new Error('useNamespace must be used within a NamespaceProvider');
  }
  return context;
};