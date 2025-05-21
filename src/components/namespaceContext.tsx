"use client"
import { createContext, useState, useEffect, useContext } from 'react';
import { getNamespaces } from '@/app/actions/namespaces';

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
      const result = await getNamespaces();
      if (result.error) {
        console.error(result.error);
        return;
      }
      setNamespaces(result.namespaces);
      if (result.namespaces.length > 0) {
        setSelectedNamespace(result.namespaces[0]);
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