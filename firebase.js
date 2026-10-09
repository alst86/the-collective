// Import the required functions
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your specific web app configuration
const firebaseConfig = {
apiKey: "AIzaSyAhoxK86QrbZWYjUKhdB-KCsvAKHawsd1Y",
authDomain: "the-collective-97b6e.firebaseapp.com",
projectId: "the-collective-97b6e",
databaseURL: "https://the-collective-97b6e-default-rtdb.asia-southeast1.firebasedatabase.app",
storageBucket: "the-collective-97b6e.firebasestorage.app",
messagingSenderId: "396059061138",
appId: "1:396059061138:web:67888e52f80727c570af4b",
measurementId: "G-35ZBLZHZWG"
};

// Initialize the app and EXPORT the database connection
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
