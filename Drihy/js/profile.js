import { auth, database } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const displayEmail = document.getElementById('displayEmail');
const displayPhone = document.getElementById('displayPhone');
const displayAddress = document.getElementById('displayAddress');
const displayPayment = document.getElementById('displayPayment');
const logoutBtn = document.getElementById('logoutBtn');
const myOrdersBtn = document.getElementById('myOrdersBtn');
const editAddressBtn = document.getElementById('editAddressBtn'); // Novo botão

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
                
                // Tenta carregar endereço do Firebase se não tiver no localStorage
                if (data.address && !localStorage.getItem('checkout_address')) {
                     const addressText = `${data.address.rua}, ${data.address.numero}\n${data.address.bairro}, ${data.address.cidade} - ${data.address.estado}\nCEP: ${data.address.cep}`;
                     displayAddress.value = addressText;
                }
            } else {
                displayPhone.value = "Dados não encontrados";
            }
        }).catch((error) => {
            console.error(error);
            displayPhone.value = "Erro ao carregar";
        });

        // Prioriza o LocalStorage (sessão atual)
        const savedAddress = JSON.parse(localStorage.getItem('checkout_address'));
        if (savedAddress) {
            displayAddress.value = `${savedAddress.rua}, ${savedAddress.numero}\n${savedAddress.bairro}, ${savedAddress.cidade} - ${savedAddress.estado}\nCEP: ${savedAddress.cep}`;
        }

        const savedPayment = JSON.parse(localStorage.getItem('checkout_payment'));
        if (savedPayment) {
            displayPayment.value = savedPayment.method; 
        }

    } else {
        window.location.href = "login.html";
    }
});

// Ação do botão de editar endereço
editAddressBtn.addEventListener('click', () => {
    // Redireciona para a página de cadastro de endereço
    window.location.href = "add-address.html"; 
});

logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    }).catch((error) => {
        alert("Erro ao sair: " + error.message);
    });
});

myOrdersBtn.addEventListener('click', () => {
    alert("Funcionalidade de pedidos em desenvolvimento.");
});