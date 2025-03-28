import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCayZufgYz74rD5bHgVOuPI8dOFp1D2wvM",
    authDomain: "ems-app-50d22.firebaseapp.com",
    projectId: "ems-app-50d22",
    storageBucket: "ems-app-50d22.appspot.com",
    messagingSenderId: "9892898412",
    appId: "1:9892898412:android:b30c732387022d56685a49"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const messaging = getMessaging(app);