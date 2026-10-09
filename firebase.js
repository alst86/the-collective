// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhoxK86QrbZWYjUKhdB-KCsvAKHawsd1Y",
  authDomain: "the-collective-97b6e.firebaseapp.com",
  projectId: "the-collective-97b6e",
  storageBucket: "the-collective-97b6e.firebasestorage.app",
  messagingSenderId: "396059061138",
  appId: "1:396059061138:web:67888e52f80727c570af4b",
  measurementId: "G-35ZBLZHZWG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
