// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDciebbgTgl7r68F-0N3L0ZksV-mUJBL28",
  authDomain: "posttech3-6e21d.firebaseapp.com",
  projectId: "posttech3-6e21d",
  storageBucket: "posttech3-6e21d.firebasestorage.app",
  messagingSenderId: "980953652993",
  appId: "1:980953652993:web:65bf66e24c9399da1c8500"
};

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
