import { auth, database } from "./firebase-config.js";
import { ref, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const cardNumber = document.getElementById('cardNumber');
const cardExpiry = document.getElementById('cardExpiry');
const cardCvv = document.getElementById('cardCvv');
const cardName = document.getElementById('cardName');
const cardForm = document.getElementById('cardForm');

function formatCardNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    let formatted = value.match(/.{1,4}/g);
    if (formatted) {
        e.target.value = formatted.join(' ');
    } else {
        e.target.value = value;
    }
}

function formatExpiry(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    if (value.length >= 3) {
        e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
    } else {
        e.target.value = value;
    }
}

function onlyNumbers(e) {
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value.substring(0, 3);
}

if (cardNumber) cardNumber.addEventListener('input', formatCardNumber);
if (cardExpiry) cardExpiry.addEventListener('input', formatExpiry);
if (cardCvv) cardCvv.addEventListener('input', onlyNumbers);

cardForm.addEventListener('submit', (e) => {
    e.preventDefault();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const cardData = {
                number: cardNumber.value,
                name: cardName.value,
                expiry: cardExpiry.value,
                cvv: cardCvv.value
            };

            update(ref(database, "users/" + user.uid + "/card"), cardData)
                .then(() => {
                    window.location.href = 'profile.html';
                })
                .catch((error) => {
                    alert("Erro ao salvar cartão: " + error.message);
                });
        } else {
            window.location.href = 'login.html';
        }
    });
});

document.getElementById('cancelButton').addEventListener('click', () => {
    window.location.href = 'profile.html';
});