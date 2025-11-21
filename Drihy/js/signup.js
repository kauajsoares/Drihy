import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
    update,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDIF0F6kfrjBsGNPGcy5ZCOICELNUIuKeo",
    authDomain: "drihymode-e8a85.firebaseapp.com",
    projectId: "drihymode-e8a85",
    storageBucket: "drihymode-e8a85.appspot.com",
    messagingSenderId: "420389069070",
    appId: "1:420389069070:web:2bd2a6a191790d940af75f",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const phoneInput = document.getElementById("phone");

function formatPhone(value) {
    let cleaned = value.replace(/\D/g, ''); 
    let formatted = '';

    cleaned = cleaned.substring(0, 11);

    if (cleaned.length > 0) {
        formatted += '(' + cleaned.substring(0, 2);
    }
    if (cleaned.length > 2) {
        formatted += ') ' + cleaned.substring(2, 3);
    }
    if (cleaned.length > 3) {
        formatted += ' ' + cleaned.substring(3, 7);
    }
    if (cleaned.length > 7) {
        formatted += '-' + cleaned.substring(7, 11);
    }

    return formatted;
}

phoneInput.addEventListener('input', (event) => {
    event.target.value = formatPhone(event.target.value);
});

window.checkPasswordMatch = function() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    if (password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity('As senhas digitadas não são idênticas.');
    } else {
        confirmPassword.setCustomValidity('');
    }
};

window.validatePhoneCompletion = function() {
    const phone = document.getElementById('phone');
    const phoneRegex = /^\(\d{2}\)\s\d\s\d{4}-\d{4}$/; 

    if (!phoneRegex.test(phone.value)) {
        phone.setCustomValidity("O telefone não está completo. Por favor, digite (DD) 9XXXX-XXXX.");
    } else {
        phone.setCustomValidity('');
    }
};


function register(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const phone = document.getElementById("phone").value;

    if (!validate_phone(phone)) {
        return;
    }
    
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            const user_data = {
                email: email,
                phone: phone, 
                last_login: Date.now(),
            };

            set(ref(database, "users/" + user.uid), user_data)
                .then(() => {
                    // REDIRECIONAMENTO APÓS SUCESSO DO CADASTRO E SALVAMENTO DE DADOS
                    window.location.href = 'shop.html'; 
                })
                .catch((error) => {
                    alert("Erro ao gravar dados do usuário: " + error.message);
                });
        })
        .catch((error) => {
             let errorMessage = error.message;
             if (error.code === 'auth/email-already-in-use') {
                 errorMessage = 'Este e-mail já está em uso.';
             }
            alert(errorMessage);
        });
}

function login(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!validate_email(email) || !validate_password(password)) {
        alert("Email ou Senha fora de linha");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            const user_data = {
                last_login: Date.now(),
            };

            update(ref(database, "users/" + user.uid), user_data)
                .then(() => {
                    alert("Usuário logado com sucesso!");
                })
                .catch((error) => {
                    alert("Erro ao atualizar dados do usuário: " + error.message);
                });
        })
        .catch((error) => {
            alert(error.message);
        });
}

function validate_email(email) {
    const expression = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!expression.test(String(email).toLowerCase())) {
        return false;
    }
    return true;
}

function validate_password(password) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    
    if (!passwordRegex.test(password)) {
        return false;
    }
    return true; 
}

function validate_phone(phone) {
    const phoneRegex = /^\(\d{2}\)\s\d\s\d{4}-\d{4}$/; 

    if (!phoneRegex.test(phone)) {
        return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", register);
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }
});