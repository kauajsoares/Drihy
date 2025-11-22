import { auth, database, validate_email, validate_password } from "./firebase-config.js";
import {
    update,
    ref,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
    signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


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


function login(event) {
    event.preventDefault();

    clearLoginError();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // A validação de senha foi removida. Checamos apenas o formato rigoroso do e-mail.
    if (!validate_email(email)) {
        displayLoginError("Erro: O formato do e-mail está incorreto.");
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

            // Mapeia erros do Firebase para mensagem amigável:
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                 userMessage = 'Usuário ou senha inválido.'; 
            } else if (error.code === 'auth/invalid-email') {
                userMessage = 'O e-mail fornecido não é válido.';
            }

            displayLoginError(userMessage); 
        });
}


document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }
});