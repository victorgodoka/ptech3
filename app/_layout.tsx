import { Stack } from 'expo-router';
import React from 'react';
import AuthProvider from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import TransactionProvider from './contexts/TransactionContext';

export default function RootLayout() {
  return (
    <LoadingProvider>
      <AuthProvider>
        <TransactionProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </TransactionProvider>
      </AuthProvider>
    </LoadingProvider>
  );
}
