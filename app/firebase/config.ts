import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error(
    '❌ Configuração do Firebase incompleta! Verifique se o arquivo .env está configurado corretamente.'
  );
}

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

import { connectFirestoreEmulator, enableNetwork, disableNetwork } from "firebase/firestore";

try {
  console.log('🔥 Configurando Firestore...');
  
  enableNetwork(db).catch((error) => {
    console.warn('⚠️ Erro ao habilitar rede Firestore:', error);
  });
  
  console.log('✅ Firestore configurado com sucesso');
} catch (error) {
  console.error('❌ Erro ao configurar Firestore:', error);
}

export { app };

export default app;
