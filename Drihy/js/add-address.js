import { auth, database } from "./firebase-config.js";
import { ref, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

function onlyNumbers(event) {
    const key = event.key;
    const isControlKey = event.metaKey || event.ctrlKey || event.altKey;
    const isAllowedKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key);

    if (isControlKey || isAllowedKey) {
        return;
    }
    
    if (key.length === 1 && !/\d/.test(key)) {
        event.preventDefault();
    }
}

function maskCEP(input) {
    let value = input.value.replace(/\D/g, ""); 
    value = value.substring(0, 8);

    if (value.length > 5) {
        value = value.replace(/^(\d{5})(\d{1,3})$/, "$1-$2");
    } else if (value.length > 0) {
        value = value.replace(/^(\d{1,5})$/, "$1");
    }
    
    input.value = value;
    validateCEPCompletion(input); 
}

function validateCEPCompletion(input) {
    const cepRegex = /^\d{5}-\d{3}$/; 
    
    if (!cepRegex.test(input.value)) {
        input.setCustomValidity("O CEP deve estar completo no formato 00000-000.");
    } else {
        input.setCustomValidity('');
    }
}

document.getElementById('addressForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const cepInput = document.getElementById('cep');
    validateCEPCompletion(cepInput); 
    
    const form = e.target;
    if (form.checkValidity() === false) {
        return;
    }
    
    const addressData = {
        cep: document.getElementById('cep').value,
        rua: document.getElementById('rua').value,
        numero: document.getElementById('numero').value,
        complemento: document.getElementById('complemento').value,
        bairro: document.getElementById('bairro').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value
    };

    localStorage.setItem('checkout_address', JSON.stringify(addressData));

    onAuthStateChanged(auth, (user) => {
        if (user) {
            update(ref(database, "users/" + user.uid + "/address"), addressData)
                .then(() => {
                    window.location.href = 'profile.html'; 
                })
                .catch((error) => {
                    alert("Erro ao salvar endereço: " + error.message);
                });
        } else {
            window.location.href = 'login.html';
        }
    });
});

document.getElementById('cancelButton').addEventListener('click', () => {
    window.location.href = 'profile.html';
});

document.addEventListener('DOMContentLoaded', () => {
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('keydown', onlyNumbers); 
        cepInput.addEventListener('input', (event) => maskCEP(event.target));
    }
});