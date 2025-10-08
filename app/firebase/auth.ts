import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { app } from './config';

let auth: any;

try {
  console.log('Initializing Firebase Auth...');
  auth = getAuth(app);
  console.log('Firebase Auth initialized successfully');
  
  if (auth) {
    console.log('Auth object created:', { 
      currentUser: auth.currentUser?.email || 'No user',
      app: !!auth.app 
    });
  }
} catch (error) {
  console.error('Error initializing Firebase Auth:', error);
  throw new Error('Failed to initialize Firebase Auth');
}

export const createUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signInUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export { auth };

export default auth;
