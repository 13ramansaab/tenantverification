import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const policeStationsConfig = {
  apiKey: "AIzaSyCsaG3xKpS2yp6Qk8QL0X9PvDBPr-_sSxA",
  authDomain: "policestations-6d62c.firebaseapp.com",
  databaseURL: "https://policestations-6d62c-default-rtdb.firebaseio.com",
  projectId: "policestations-6d62c",
  storageBucket: "policestations-6d62c.firebasestorage.app",
  messagingSenderId: "584483092607",
  appId: "1:584483092607:web:bcfe60f7dd5b883520274a",
  measurementId: "G-37PZSDCC7V"
};

const pgVerificationsConfig = {
  apiKey: "AIzaSyB-wLzuo8KZY34rLjdcXBrHRxJUv1adW_E",
  authDomain: "pg-verifications.firebaseapp.com",
  databaseURL: "https://pg-verifications-default-rtdb.firebaseio.com",
  projectId: "pg-verifications",
  storageBucket: "pg-verifications.firebasestorage.app",
  messagingSenderId: "466334550830",
  appId: "1:466334550830:web:398790ef6d43db418108bf",
  measurementId: "G-VWB2D9SLHZ"
};

// Initialize apps with explicit names to avoid conflicts
const policeStationsApp = initializeApp(policeStationsConfig, 'policeStations');
const pgVerificationsApp = initializeApp(pgVerificationsConfig, 'pgVerifications');

// Get database and storage instances
export const policeStationsDb = getDatabase(policeStationsApp);
export const pgVerificationsDb = getDatabase(pgVerificationsApp);
export const storage = getStorage(pgVerificationsApp);