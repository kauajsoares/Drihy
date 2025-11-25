import { auth, database } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const loadingMessage = document.getElementById('loadingMessage');
const addressCard = document.getElementById('addressCard');
const noAddressMessage = document.getElementById('noAddressMessage');
const btnContinue = document.getElementById('btnContinue');
const btnAddEdit = document.getElementById('btnAddEdit');

const addrStreet = document.getElementById('addrStreet');
const addrCity = document.getElementById('addrCity');
const addrCep = document.getElementById('addrCep');

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userAddressRef = ref(database, "users/" + user.uid + "/address");
        
        get(userAddressRef).then((snapshot) => {
            loadingMessage.style.display = 'none';

            if (snapshot.exists()) {
                const data = snapshot.val();
                
                addrStreet.textContent = `${data.rua}, ${data.numero} ${data.complemento ? '- ' + data.complemento : ''}`;
                addrCity.textContent = `${data.bairro}, ${data.cidade} - ${data.estado}`;
                addrCep.textContent = `CEP: ${data.cep}`;

                addressCard.style.display = 'block';
                btnContinue.style.display = 'block';
                
                localStorage.setItem('checkout_address', JSON.stringify(data));
            } else {
                noAddressMessage.style.display = 'block';
                btnAddEdit.textContent = "Adicionar Endereço";
            }
        }).catch((error) => {
            loadingMessage.textContent = "Erro ao carregar endereço.";
            console.error(error);
        });

    } else {
        window.location.href = "login.html";
    }
});

btnContinue.addEventListener('click', () => {
    window.location.href = "payments.html";
});

btnAddEdit.addEventListener('click', () => {
    window.location.href = "add-address.html?origin=checkout";
});