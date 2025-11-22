import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDIF0F6kfrjBsGNPGcy5ZCOICELNUIuKeo",
    authDomain: "drihymode-e8a85.firebaseapp.com",
    projectId: "drihymode-e8a85",
    storageBucket: "drihymode-e8a85.appspot.com",
    messagingSenderId: "420389069070",
    appId: "1:420389069070:web:2bd2a6a191790d940af75f",
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