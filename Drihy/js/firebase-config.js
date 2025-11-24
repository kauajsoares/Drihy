import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAR0UHnCnP2xlOzEOeiQfbIA22DiMCkZ_0",
  authDomain: "drihy-b016a.firebaseapp.com",
  databaseURL: "https://drihy-b016a-default-rtdb.firebaseio.com",
  projectId: "drihy-b016a",
  storageBucket: "drihy-b016a.firebasestorage.app",
  messagingSenderId: "287591768676",
  appId: "1:287591768676:web:87cef73d215f6667403571",
  measurementId: "G-9K7HEXTR0E"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

export function validate_email(email) {
    const expression = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    if (!expression.test(String(email).toLowerCase())) {
        return false;
    }
    return true;
}

export function validate_password(password) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    
    if (!passwordRegex.test(password)) {
        return false;
    }
    return true; 
}