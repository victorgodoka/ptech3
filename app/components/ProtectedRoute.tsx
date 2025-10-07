import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    console.log('🛡️ ProtectedRoute - User:', user?.email || 'None', 'Loading:', loading);
    
    if (!loading && !user && !redirecting) {
      console.log('🛡️ No user found, redirecting to login');
      setRedirecting(true);
      router.push('/');
    }
  }, [user, loading, redirecting]);

  console.log('🛡️ ProtectedRoute render - Loading:', loading, 'User:', !!user, 'Redirecting:', redirecting);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#3b82f6" style={styles.spinner} />
          <Text style={styles.title}>Verificando autenticação...</Text>
          <Text style={styles.subtitle}>
            User: {user?.email || 'None'} | Loading: {loading.toString()}
          </Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Redirecionando para login...</Text>
        </View>
      </View>
    );
  }

  console.log('🛡️ User authenticated, rendering children');
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // bg-gray-900 equivalent
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  spinner: {
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9ca3af', // text-gray-400 equivalent
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ProtectedRoute;
