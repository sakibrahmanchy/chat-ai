import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyB8p390KsthgPI42TLlKsRHTbFfm4c4dTc",
    authDomain: "chat-ai-6b60c.firebaseapp.com",
    projectId: "chat-ai-6b60c",
    storageBucket: "chat-ai-6b60c.firebasestorage.app",
    messagingSenderId: "568768904673",
    appId: "1:568768904673:web:bde659974382ea9e9d26a0",
    measurementId: "G-CF739P0DZV"
};

const existingApps = getApps()
console.log(existingApps)
const app =  existingApps && existingApps.length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage }