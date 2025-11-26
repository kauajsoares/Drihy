import { auth, database } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { ref, get, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const displayEmail = document.getElementById('displayEmail');
const displayPhone = document.getElementById('displayPhone');
const displayAddress = document.getElementById('displayAddress');
const cardsListContainer = document.getElementById('cardsListContainer');
const logoutBtn = document.getElementById('logoutBtn');
const myOrdersBtn = document.getElementById('myOrdersBtn');
const editAddressBtn = document.getElementById('editAddressBtn');
const addCardBtn = document.getElementById('addCardBtn');

const cardModal = document.getElementById('cardModal');
const closeModalBtn = document.querySelector('.close-modal');
const deleteCardBtn = document.getElementById('deleteCardBtn');
const modalCardNumber = document.getElementById('modalCardNumber');
const modalCardName = document.getElementById('modalCardName');
const modalCardExpiry = document.getElementById('modalCardExpiry');
const modalCardType = document.getElementById('modalCardType'); // Novo elemento

let currentCardKey = null;
let currentUid = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUid = user.uid;
        displayEmail.value = user.email;
        loadUserData(user.uid);
    } else {
        window.location.href = "login.html";
    }
});

function loadUserData(uid) {
    const userRef = ref(database, "users/" + uid);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            
            if (data.phone) displayPhone.value = data.phone;
            else displayPhone.value = "Não cadastrado";
            
            if (data.address) {
                 const addressText = `${data.address.rua}, ${data.address.numero}\n${data.address.bairro}, ${data.address.cidade} - ${data.address.estado}\nCEP: ${data.address.cep}`;
                 displayAddress.value = addressText;
            } else {
                const savedAddress = JSON.parse(localStorage.getItem('checkout_address'));
                if (savedAddress) {
                    displayAddress.value = `${savedAddress.rua}, ${savedAddress.numero}\n${savedAddress.bairro}, ${savedAddress.cidade} - ${savedAddress.estado}\nCEP: ${savedAddress.cep}`;
                }
            }

            cardsListContainer.innerHTML = '';
            if (data.cards) {
                Object.entries(data.cards).forEach(([key, card]) => {
                    createCardItem(key, card);
                });
            } else if (data.card) {
                 createCardItem('card', data.card);
            } else {
                cardsListContainer.innerHTML = '<input type="text" disabled value="Nenhum cartão salvo" style="background-color: #f9f9f9; border: 1px solid #e0e0e0; cursor: not-allowed;" />';
            }

        } else {
            displayPhone.value = "Dados não encontrados";
        }
    }).catch((error) => {
        console.error(error);
        displayPhone.value = "Erro ao carregar";
    });
}

function createCardItem(key, card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card-item';
    const last4 = card.number ? card.number.slice(-4) : '****';
    const cardType = card.type || 'Crédito'; // Fallback para cartões antigos
    
    cardDiv.innerHTML = `
        <span>${cardType} - Final ${last4}</span>
        <span style="font-size: 10px; color: #666;">Ver detalhes ></span>
    `;
    
    cardDiv.addEventListener('click', () => {
        openCardModal(key, card);
    });

    cardsListContainer.appendChild(cardDiv);
}

function openCardModal(key, card) {
    currentCardKey = key;
    const last4 = card.number ? card.number.slice(-4) : '0000';
    
    modalCardNumber.textContent = `**** **** **** ${last4}`;
    modalCardName.textContent = card.name || 'NOME DO TITULAR';
    modalCardExpiry.textContent = card.expiry || 'MM/AA';
    modalCardType.textContent = card.type ? card.type.toUpperCase() : 'CRÉDITO';
    
    cardModal.style.display = "flex";
}

closeModalBtn.addEventListener('click', () => {
    cardModal.style.display = "none";
});

window.addEventListener('click', (event) => {
    if (event.target === cardModal) {
        cardModal.style.display = "none";
    }
});

deleteCardBtn.addEventListener('click', () => {
    if (confirm("Tem certeza que deseja remover este cartão?")) {
        const path = currentCardKey === 'card' ? `users/${currentUid}/card` : `users/${currentUid}/cards/${currentCardKey}`;
        
        remove(ref(database, path))
            .then(() => {
                cardModal.style.display = "none";
                loadUserData(currentUid); 
            })
            .catch((error) => {
                alert("Erro ao remover cartão: " + error.message);
            });
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
        localStorage.removeItem('cart');
        localStorage.removeItem('checkout_address');
        localStorage.removeItem('checkout_payment');
        window.location.href = "login.html";
    }).catch((error) => {
        alert("Erro ao sair: " + error.message);
    });
});

myOrdersBtn.addEventListener('click', () => {
    window.location.href = "order.html";
});