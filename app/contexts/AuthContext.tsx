import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 AuthProvider: Initializing...');
    
    if (!auth) {
      console.log('❌ Auth not available, stopping loading');
      setLoading(false);
      return;
    }

    // Verificar estado inicial imediatamente
    const initialUser = auth.currentUser;
    console.log('🔍 Initial user check:', initialUser?.email || 'No user');
    
    setUser(initialUser);
    setLoading(false);
    
    console.log('✅ Initial state set - Loading: false, User:', initialUser?.email || 'null');

    // Configurar listener para mudanças futuras
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔥 Auth state changed:', firebaseUser?.email || 'No user');
      setUser(firebaseUser);
      // Não alterar loading aqui, pois já foi definido como false
    });

    return () => {
      console.log('🧹 Cleaning up auth listener');
      unsubscribe();
    };
  }, [])

  // Add additional logging for debugging
  useEffect(() => {
    console.log('AuthProvider state:', { 
      hasUser: !!user, 
      loading,
      userEmail: user?.email 
    });
  }, [user, loading]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
