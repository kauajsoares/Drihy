import { auth, database } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const displayEmail = document.getElementById('displayEmail');
const displayPhone = document.getElementById('displayPhone');
const displayAddress = document.getElementById('displayAddress');
const displayPayment = document.getElementById('displayPayment');
const logoutBtn = document.getElementById('logoutBtn');
const myOrdersBtn = document.getElementById('myOrdersBtn');
const editAddressBtn = document.getElementById('editAddressBtn');
const addCardBtn = document.getElementById('addCardBtn');

onAuthStateChanged(auth, (user) => {
    if (user) {
        displayEmail.value = user.email;

        const userRef = ref(database, "users/" + user.uid);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data.phone) {
                    displayPhone.value = data.phone;
                } else {
                    displayPhone.value = "Não cadastrado";
                }
                
                if (data.address) {
                     const addressText = `${data.address.rua}, ${data.address.numero}\n${data.address.bairro}, ${data.address.cidade} - ${data.address.estado}\nCEP: ${data.address.cep}`;
                     displayAddress.value = addressText;
                } else {
                    const savedAddress = JSON.parse(localStorage.getItem('checkout_address'));
                    if (savedAddress) {
                        displayAddress.value = `${savedAddress.rua}, ${savedAddress.numero}\n${savedAddress.bairro}, ${savedAddress.cidade} - ${savedAddress.estado}\nCEP: ${savedAddress.cep}`;
                    }
                }

                if (data.card) {
                    displayPayment.value = `Cartão final ${data.card.number.slice(-4)}`;
                }
            } else {
                displayPhone.value = "Dados não encontrados";
            }
        }).catch((error) => {
            console.error(error);
            displayPhone.value = "Erro ao carregar";
        });

    } else {
        window.location.href = "login.html";
    }
});

editAddressBtn.addEventListener('click', () => {
    window.location.href = "add-address.html?origin=profile"; 
});

addCardBtn.addEventListener('click', () => {
    window.location.href = "add-card.html?origin=profile";
});

logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    }).catch((error) => {
        alert("Erro ao sair: " + error.message);
    });
});

myOrdersBtn.addEventListener('click', () => {
    window.location.href = "order.html";
});