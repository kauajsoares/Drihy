import { auth, database } from "./firebase-config.js";
import { ref, push, set, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

(function() {
    emailjs.init("VqbaAuS4xXBkHvLWD"); 
})();

const paymentForm = document.getElementById('paymentForm');
const totalAmountSpan = document.getElementById('totalAmount');
const creditCardWrapper = document.getElementById('creditCardWrapper');
const savedCardsSection = document.getElementById('savedCardsSection');
const savedCardsContainer = document.getElementById('savedCardsContainer');
const newCardSection = document.getElementById('newCardSection');
const useNewCardBtn = document.getElementById('useNewCardBtn');
const cancelNewCardBtn = document.getElementById('cancelNewCardBtn');
const saveCardCheckbox = document.getElementById('saveCardCheckbox');

const pixSection = document.getElementById('pixSection');
const radioButtons = document.querySelectorAll('input[name="paymentMethod"]');
const generatePixBtn = document.getElementById('generatePixBtn');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const qrCodeImage = document.getElementById('qrCodeImage');
const payButton = document.getElementById('payButton');

const cardNumber = document.getElementById('cardNumber');
const cardName = document.getElementById('cardName');
const cardExpiry = document.getElementById('cardExpiry');
const cardCvv = document.getElementById('cardCvv');

let cartData = [];
let totalValue = 0;
let userAddress = null;
let userSavedCards = {}; // Objeto para guardar todos os cartões
let selectedCardId = null;

function loadDataFromFirebase(user) {
    // 1. Carrinho
    const cartRef = ref(database, `users/${user.uid}/cart`);
    get(cartRef).then((snapshot) => {
        if (snapshot.exists()) {
            const val = snapshot.val();
            cartData = Array.isArray(val) ? val : Object.values(val);
            cartData = cartData.filter(item => item);
            if (cartData.length === 0) {
                alert("Seu carrinho está vazio.");
                window.location.href = 'shop.html';
            } else {
                calculateTotal();
            }
        } else {
            alert("Seu carrinho está vazio.");
            window.location.href = 'shop.html';
        }
    });

    // 2. Endereço
    const addressRef = ref(database, `users/${user.uid}/address`);
    get(addressRef).then((snapshot) => {
        if (snapshot.exists()) userAddress = snapshot.val();
    });

    // 3. Cartões Salvos (Lê da pasta 'cards' no plural)
    const cardsRef = ref(database, `users/${user.uid}/cards`);
    get(cardsRef).then((snapshot) => {
        if (snapshot.exists()) {
            userSavedCards = snapshot.val(); 
            renderSavedCards();
        } else {
            showNewCardUI(false);
        }
    });
}

function renderSavedCards() {
    savedCardsContainer.innerHTML = '';
    let isFirst = true;

    // Itera sobre todos os cartões retornados
    for (const key in userSavedCards) {
        const card = userSavedCards[key];
        const last4 = card.number ? card.number.slice(-4) : '****';
        
        const cardItem = document.createElement('div');
        cardItem.className = 'saved-card-item';
        // Cria um radio button para cada cartão
        cardItem.innerHTML = `
            <label style="display: flex; align-items: center; cursor: pointer; width: 100%;">
                <input type="radio" name="savedCardOption" value="${key}" ${isFirst ? 'checked' : ''} style="margin-right: 10px;">
                <span>Cartão final ${last4} | ${card.name}</span>
            </label>
        `;
        savedCardsContainer.appendChild(cardItem);
        
        if(isFirst) selectedCardId = key;
        isFirst = false;
    }

    // Atualiza o ID selecionado quando o usuário clica
    const options = document.querySelectorAll('input[name="savedCardOption"]');
    options.forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedCardId = e.target.value;
        });
    });

    savedCardsSection.style.display = 'block';
    newCardSection.style.display = 'none';
    
    // Mostra botão para adicionar novo cartão
    useNewCardBtn.style.display = 'block'; 
    
    toggleCardInputsRequired(false);
}

function showNewCardUI(canCancel) {
    savedCardsSection.style.display = 'none';
    newCardSection.style.display = 'block';
    
    if (canCancel) {
        cancelNewCardBtn.style.display = 'block';
    } else {
        cancelNewCardBtn.style.display = 'none';
    }

    toggleCardInputsRequired(true);
    selectedCardId = 'NEW'; // Marca que o usuário quer usar um novo
}

function toggleCardInputsRequired(isRequired) {
    cardNumber.required = isRequired;
    cardName.required = isRequired;
    cardExpiry.required = isRequired;
    cardCvv.required = isRequired;
}

useNewCardBtn.addEventListener('click', () => {
    showNewCardUI(true);
});

cancelNewCardBtn.addEventListener('click', () => {
    savedCardsSection.style.display = 'block';
    newCardSection.style.display = 'none';
    toggleCardInputsRequired(false);
    
    // Restaura a seleção para o cartão que estava marcado
    const checked = document.querySelector('input[name="savedCardOption"]:checked');
    if(checked) {
        selectedCardId = checked.value;
    } else {
        // Se nenhum estiver marcado (raro), marca o primeiro
        const firstRadio = document.querySelector('input[name="savedCardOption"]');
        if(firstRadio) {
            firstRadio.checked = true;
            selectedCardId = firstRadio.value;
        }
    }
});

function calculateTotal() {
    totalValue = 0;
    cartData.forEach(item => {
        const priceCleaned = item.productPrice.replace(/[R$\s]/g, '').replace(',', '.').trim();
        const itemPrice = parseFloat(priceCleaned);
        if (!isNaN(itemPrice)) {
            totalValue += itemPrice * item.quantity;
        }
    });
    totalAmountSpan.textContent = `R$ ${totalValue.toFixed(2).replace('.', ',')}`;
}

function formatCardNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    let formatted = value.match(/.{1,4}/g);
    if (formatted) e.target.value = formatted.join(' ');
    else e.target.value = value;
}
function formatExpiry(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    if (value.length >= 3) e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
    else e.target.value = value;
}
function onlyNumbers(e) { 
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value.substring(0, 3);
}

if (cardNumber) cardNumber.addEventListener('input', formatCardNumber);
if (cardExpiry) cardExpiry.addEventListener('input', formatExpiry);
if (cardCvv) cardCvv.addEventListener('input', onlyNumbers);

radioButtons.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'credit_card') {
            creditCardWrapper.style.display = 'block';
            pixSection.style.display = 'none';
            
            // Se escolheu cartão, verifica se vai usar Novo ou Salvo
            if (selectedCardId === 'NEW' || Object.keys(userSavedCards).length === 0) {
                toggleCardInputsRequired(true);
            } else {
                toggleCardInputsRequired(false);
            }
        } else {
            creditCardWrapper.style.display = 'none';
            pixSection.style.display = 'flex';
            toggleCardInputsRequired(false);
        }
    });
});

generatePixBtn.addEventListener('click', () => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PagamentoDrihyR$${totalValue.toFixed(2)}`;
    qrCodeImage.src = qrCodeUrl;
    generatePixBtn.style.display = 'none';
    qrCodeContainer.style.display = 'flex';
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadDataFromFirebase(user);
    } else {
        window.location.href = 'login.html';
    }
});

paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return;

    const addressData = userAddress || JSON.parse(localStorage.getItem('checkout_address'));
    if (!addressData) {
        alert("Endereço não encontrado.");
        return;
    }

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    if (paymentMethod === 'pix' && qrCodeContainer.style.display === 'none') {
        alert("Por favor, gere o QR Code do Pix antes de finalizar.");
        return;
    }

    let finalPaymentDetails = paymentMethod;
    
    if (paymentMethod === 'credit_card') {
        // Se o usuário escolheu usar um NOVO cartão
        if (selectedCardId === 'NEW' || !selectedCardId) {
            finalPaymentDetails = `Cartão Novo (Final ${cardNumber.value.slice(-4)})`;
            
            // Salva o novo cartão na lista de cartões
            if (saveCardCheckbox && saveCardCheckbox.checked) {
                const newCard = {
                    number: cardNumber.value,
                    name: cardName.value,
                    expiry: cardExpiry.value,
                    cvv: cardCvv.value
                };
                // USA PUSH PARA ADICIONAR À LISTA, NÃO SUBSTITUIR
                push(ref(database, `users/${user.uid}/cards`), newCard);
            }
        } else {
            // Se o usuário escolheu um CARTÃO SALVO
            const card = userSavedCards[selectedCardId];
            finalPaymentDetails = `Cartão Salvo (Final ${card.number.slice(-4)})`;
        }
    }

    payButton.disabled = true;
    payButton.value = "Processando...";

    const orderData = {
        userId: user.uid,
        email: user.email,
        items: cartData,
        total: totalValue,
        address: addressData,
        paymentMethod: finalPaymentDetails,
        status: 'Aprovado',
        date: new Date().toISOString()
    };

    const newOrderRef = push(ref(database, 'orders'));
    
    set(newOrderRef, orderData)
        .then(() => {
            return set(ref(database, `users/${user.uid}/cart`), []);
        })
        .then(() => {
            const templateParams = {
                to_email: user.email,
                order_id: newOrderRef.key,
                total_value: totalValue.toFixed(2).replace('.', ','),
                payment_method: finalPaymentDetails
            };
            return emailjs.send('service_x8guuda', 'template_fe1rk2a', templateParams);
        })
        .then(() => {
            finishOrder();
        })
        .catch((error) => {
            console.error('Erro:', error);
            finishOrder(); 
        });
});

function finishOrder() {
    localStorage.removeItem('cart'); 
    window.location.href = 'compra-concluida.html';
}