import { auth, database, validate_email, validate_password } from "./firebase-config.js";
import {
    ref,
    set,
    update,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const phoneInput = document.getElementById("phone");

function formatPhone(value) {
    let cleaned = value.replace(/\D/g, ''); 
    let formatted = '';

    cleaned = cleaned.substring(0, 12);

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

if (phoneInput) {
    phoneInput.addEventListener('input', (event) => {
        event.target.value = formatPhone(event.target.value);
    });
}

window.checkPasswordMatch = function() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    if (password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity('As senhas digitadas não são idênticas.');
    } else {
        confirmPassword.setCustomValidity('');
    }
};

function validate_phone(phone) {
    const digits = phone.replace(/\D/g, ''); 
    if (digits.length == 10) {
        return false;
    }
    return true;
}

window.validatePhoneCompletion = function() {
    const phone = document.getElementById('phone');
    
    if (!validate_phone(phone.value)) {
        phone.setCustomValidity("O telefone não está completo. Por favor, digite (DD) 9XXXX-XXXX.");
    } else {
        phone.setCustomValidity('');
    }
};

window.validateEmailFormat = function() {
    const emailInput = document.getElementById('email');
    
    if (!validate_email(emailInput.value)) {
        emailInput.setCustomValidity("O e-mail deve ser um formato válido, como exemplo@dominio.com.");
    } else {
        emailInput.setCustomValidity('');
    }
};


function displayLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block'; 
    }
}
function clearLoginError() {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.style.display = 'none'; 
        errorDiv.textContent = '';
    }
}

function displayRegisterError(message) {
    const errorDiv = document.getElementById('registerError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block'; 
    } else {
        // Fallback caso a div não exista (para debug)
        console.error("Elemento registerError não encontrado para exibir: " + message);
        alert(message); 
    }
}
function clearRegisterError() {
    const errorDiv = document.getElementById('registerError');
    if (errorDiv) {
        errorDiv.style.display = 'none'; 
        errorDiv.textContent = '';
    }
}


function register(event) {
    event.preventDefault();
    clearRegisterError();

    localStorage.removeItem('checkout_address');
    localStorage.removeItem('checkout_payment');

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const phone = document.getElementById("phone").value;

    if (!validate_email(email) || !validate_password(password) || !validate_phone(phone)) {
        displayRegisterError("Erro no formato: Verifique Email, Senha e Telefone.");
        return;
    }
    
    if (password !== confirmPassword) {
        displayRegisterError("Erro: As senhas digitadas não são idênticas.");
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
                    window.location.href = 'shop.html'; 
                })
                .catch((error) => {
                    displayRegisterError("Erro ao gravar dados do usuário: " + error.message);
                });
        })
        .catch((error) => {
            let errorMessage = "Ocorreu um erro desconhecido.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este e-mail já está em uso.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'A senha é muito fraca.';
            } else {
                errorMessage = error.message;
            }
            displayRegisterError(errorMessage);
        });
}

function login(event) {
    event.preventDefault();
    clearLoginError();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!validate_email(email) || !validate_password(password)) {
        displayLoginError("Erro: O formato do e-mail ou senha está incorreto.");
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
                    window.location.href = 'shop.html';
                })
                .catch((error) => {
                    displayLoginError("Erro ao atualizar dados: " + error.message);
                });
        })
        .catch((error) => {
            let userMessage = "Ocorreu um erro desconhecido. Tente novamente.";
            
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                userMessage = 'Usuário ou senha inválido.'; 
            } else if (error.code === 'auth/invalid-email') {
                userMessage = 'O e-mail fornecido não é válido.';
            }

            displayLoginError(userMessage);
        });
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