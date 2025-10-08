import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, StyleSheet, Modal, ActivityIndicator, Text } from 'react-native';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean, message?: string) => void;
  loadingMessage: string;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Carregando...');

  const setLoading = (loading: boolean, message: string = 'Carregando...') => {
    setIsLoading(loading);
    setLoadingMessage(message);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, loadingMessage }}>
      {children}
      
      <Modal
        transparent={true}
        animationType="fade"
        visible={isLoading}
        statusBarTranslucent={true}
      >
        <View style={styles.overlay}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#00b4d8" />
              <Text style={styles.loadingText}>{loadingMessage}</Text>
            </View>
          </View>
        </View>
      </Modal>
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
});
