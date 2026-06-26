import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FirebaseAuth from '@firebase/auth';
import type { Auth, Persistence, User } from '@firebase/auth';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';

declare const process: {
  env: Record<string, string | undefined>;
};

type FirebaseClients = {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
};

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const firebaseStorageEnabled = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_ENABLED === 'true';

export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId
  );
};

export const isFirebaseStorageConfigured = () => {
  return Boolean(
    isFirebaseConfigured() &&
      firebaseConfig.storageBucket &&
      firebaseStorageEnabled
  );
};

let clients: FirebaseClients | null = null;

const getReactNativePersistence = (
  FirebaseAuth as typeof FirebaseAuth & {
    getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
  }
).getReactNativePersistence;

const getPersistentAuth = (app: FirebaseApp) => {
  try {
    return FirebaseAuth.initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error) {
    if ((error as { code?: string }).code === 'auth/already-initialized') {
      return FirebaseAuth.getAuth(app);
    }
    throw error;
  }
};

export const getFirebaseClients = (): FirebaseClients => {
  if (clients) return clients;

  if (!isFirebaseConfigured()) {
    clients = { app: null, auth: null, db: null, storage: null };
    return clients;
  }

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  clients = {
    app,
    auth: getPersistentAuth(app),
    db: getFirestore(app),
    storage: isFirebaseStorageConfigured() ? getStorage(app) : null
  };

  return clients;
};

export const ensureAnonymousUser = async (): Promise<User> => {
  const { auth } = getFirebaseClients();
  if (!auth) {
    throw new Error('Firebaseが未設定です。.envを確認してください。');
  }

  if (auth.currentUser) return auth.currentUser;
  const credential = await FirebaseAuth.signInAnonymously(auth);
  return credential.user;
};
