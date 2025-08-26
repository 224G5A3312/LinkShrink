// Import the functions you need from the SDKs using the full URL
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAETwB5rF3kUAkspDVc-UijfZF0nGmAuTU",
  authDomain: "linkshrink-f36fc.firebaseapp.com",
  projectId: "linkshrink-f36fc",
  storageBucket: "linkshrink-f36fc.appspot.com", // Corrected storage bucket name
  messagingSenderId: "410472805917",
  appId: "1:410472805917:web:aaf70b2334d55785ed38f4",
  measurementId: "G-DY6BQ6YLL3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export the services your other files need
export const db = getFirestore(app);
export const auth = getAuth(app);
