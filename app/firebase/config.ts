// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// Usando variáveis de ambiente do Expo
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Validar se todas as variáveis de ambiente estão configuradas
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error(
    '❌ Configuração do Firebase incompleta! Verifique se o arquivo .env está configurado corretamente.'
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configurar Firestore para melhor conectividade
import { connectFirestoreEmulator, enableNetwork, disableNetwork } from "firebase/firestore";

// Configurações para melhorar conectividade
try {
  // Habilitar persistência offline (apenas uma vez)
  console.log('🔥 Configurando Firestore...');
  
  // Tentar reconectar se houver problemas
  enableNetwork(db).catch((error) => {
    console.warn('⚠️ Erro ao habilitar rede Firestore:', error);
  });
  
  console.log('✅ Firestore configurado com sucesso');
} catch (error) {
  console.error('❌ Erro ao configurar Firestore:', error);
}

export { app };

// Export default para evitar warning do Expo Router
export default app;
