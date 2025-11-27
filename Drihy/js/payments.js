import { auth, database } from "./firebase-config.js";
import { ref, push, set, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

(function() {
    emailjs.init("VqbaAuS4xXBkHvLWD"); 
})();

// Elementos do DOM
const paymentForm = document.getElementById('paymentForm');
const subtotalAmountSpan = document.getElementById('subtotalAmount');
const shippingAmountSpan = document.getElementById('shippingAmount');
const totalAmountSpan = document.getElementById('totalAmount');

const creditCardWrapper = document.getElementById('creditCardWrapper');
const savedCardsSection = document.getElementById('savedCardsSection');
const savedCardsContainer = document.getElementById('savedCardsContainer');
const newCardSection = document.getElementById('newCardSection');
const useNewCardBtn = document.getElementById('useNewCardBtn');
const cancelNewCardBtn = document.getElementById('cancelNewCardBtn');
const saveCardCheckbox = document.getElementById('saveCardCheckbox');
const installmentsContainer = document.getElementById('installmentsContainer');
const installmentsSelect = document.getElementById('installmentsSelect');

const pixSection = document.getElementById('pixSection');
const radioButtons = document.querySelectorAll('input[name="paymentMethod"]');
const newCardTypeRadios = document.querySelectorAll('input[name="newCardType"]');
const shippingRadios = document.querySelectorAll('input[name="shippingMethod"]');
const generatePixBtn = document.getElementById('generatePixBtn');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const qrCodeImage = document.getElementById('qrCodeImage');
const payButton = document.getElementById('payButton');

const cardNumber = document.getElementById('cardNumber');
const cardName = document.getElementById('cardName');
const cardExpiry = document.getElementById('cardExpiry');
const cardCvv = document.getElementById('cardCvv');

// Variáveis de Estado
let cartData = [];
let cartSubtotal = 0;
let shippingCost = 15.00; // Padrão Econômico
let finalTotalValue = 0;
let userAddress = null;
let userSavedCards = {};
let selectedCardId = null;

// Função para calcular data de entrega
function calculateDeliveryDates() {
    const today = new Date();
    
    // Express: 4 dias corridos
    const expressDate = new Date(today);
    expressDate.setDate(today.getDate() + 4);
    document.getElementById('dateExpress').textContent = `Chega dia ${expressDate.toLocaleDateString('pt-BR')}`;

    // Economic: 9 dias úteis (simplificado para +12 dias corridos para simulação)
    const economicDate = new Date(today);
    economicDate.setDate(today.getDate() + 12);
    document.getElementById('dateEconomic').textContent = `Chega dia ${economicDate.toLocaleDateString('pt-BR')}`;
}

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
                calculateBaseTotal();
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

    // 3. Cartões Salvos
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

function calculateBaseTotal() {
    cartSubtotal = 0;
    cartData.forEach(item => {
        const priceCleaned = item.productPrice.replace(/[R$\s]/g, '').replace(',', '.').trim();
        const itemPrice = parseFloat(priceCleaned);
        if (!isNaN(itemPrice)) {
            cartSubtotal += itemPrice * item.quantity;
        }
    });
    
    updateTotals();
    updateInstallmentsOptions(); 
}

function updateTotals() {
    // Se houver juros de parcelamento, aplica sobre o TOTAL (Produto + Frete)
    let totalWithShipping = cartSubtotal + shippingCost;
    
    const installments = parseInt(installmentsSelect.value || 1);
    if (installments > 1 && installmentsContainer.style.display !== 'none') {
        finalTotalValue = totalWithShipping * 1.05; // 5% juros
    } else {
        finalTotalValue = totalWithShipping;
    }

    subtotalAmountSpan.textContent = `R$ ${cartSubtotal.toFixed(2).replace('.', ',')}`;
    shippingAmountSpan.textContent = `R$ ${shippingCost.toFixed(2).replace('.', ',')}`;
    totalAmountSpan.textContent = `R$ ${finalTotalValue.toFixed(2).replace('.', ',')}`;
}

// Listener para mudança de frete
shippingRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        shippingCost = parseFloat(e.target.getAttribute('data-price'));
        updateTotals();
        updateInstallmentsOptions(); // Recalcula parcelas com novo total
    });
});

function updateInstallmentsOptions() {
    const currentSelection = installmentsSelect.value;
    installmentsSelect.innerHTML = '';
    
    const totalBase = cartSubtotal + shippingCost;

    // Opção 1x
    const option1 = document.createElement('option');
    option1.value = 1;
    option1.text = `1x de R$ ${totalBase.toFixed(2).replace('.', ',')} (Sem juros)`;
    installmentsSelect.appendChild(option1);

    // Opções com Juros (2x até 12x)
    const interestRate = 0.05; 
    const totalWithInterest = totalBase * (1 + interestRate);

    for (let i = 2; i <= 12; i++) {
        const installmentValue = totalWithInterest / i;
        const option = document.createElement('option');
        option.value = i;
        option.text = `${i}x de R$ ${installmentValue.toFixed(2).replace('.', ',')} (Total: R$ ${totalWithInterest.toFixed(2).replace('.', ',')})`;
        installmentsSelect.appendChild(option);
    }
    
    if(currentSelection) installmentsSelect.value = currentSelection;
}

installmentsSelect.addEventListener('change', (e) => {
    updateTotals();
});

// ... (Funções renderSavedCards, showNewCardUI, toggleCardInputsRequired, formatters IGUAIS AO ANTERIOR) ...
// Vou omitir para brevidade, mas mantenha as funções de cartão que já funcionam
// Apenas certifique-se de que elas estão lá.
// (Abaixo, incluí o bloco completo para copiar e colar)

function renderSavedCards() {
    savedCardsContainer.innerHTML = '';
    let isFirst = true;

    Object.entries(userSavedCards).forEach(([key, card]) => {
        const last4 = card.number ? card.number.slice(-4) : '****';
        const type = card.type || 'Crédito'; 
        
        const cardItem = document.createElement('div');
        cardItem.className = 'saved-card-item';
        cardItem.innerHTML = `
            <label style="display: flex; align-items: center; cursor: pointer; width: 100%;">
                <input type="radio" name="savedCardOption" value="${key}" ${isFirst ? 'checked' : ''} style="margin-right: 10px;" data-type="${type}">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 600;">${type} - Final ${last4}</span>
                    <span style="font-size: 12px; color: #666;">${card.name}</span>
                </div>
            </label>
        `;
        savedCardsContainer.appendChild(cardItem);
        
        if(isFirst) {
            selectedCardId = key;
            checkCardTypeForInstallments(type);
        }
        isFirst = false;
    });

    const options = document.querySelectorAll('input[name="savedCardOption"]');
    options.forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedCardId = e.target.value;
            const type = e.target.getAttribute('data-type');
            checkCardTypeForInstallments(type);
        });
    });

    savedCardsSection.style.display = 'block';
    newCardSection.style.display = 'none';
    useNewCardBtn.style.display = 'block';
    toggleCardInputsRequired(false);
}

function checkCardTypeForInstallments(type) {
    if (type && type.toLowerCase() === 'débito') {
        installmentsContainer.style.display = 'none';
        installmentsSelect.value = 1; // Força à vista
        updateTotals(); // Recalcula sem juros
    } else {
        installmentsContainer.style.display = 'block';
    }
}

function showNewCardUI(canCancel) {
    savedCardsSection.style.display = 'none';
    newCardSection.style.display = 'block';
    if (canCancel) cancelNewCardBtn.style.display = 'block';
    else cancelNewCardBtn.style.display = 'none';
    
    toggleCardInputsRequired(true);
    selectedCardId = 'NEW';
    
    const newType = document.querySelector('input[name="newCardType"]:checked').value;
    checkCardTypeForInstallments(newType);
}

function toggleCardInputsRequired(isRequired) {
    cardNumber.required = isRequired;
    cardName.required = isRequired;
    cardExpiry.required = isRequired;
    cardCvv.required = isRequired;
}

newCardTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (selectedCardId === 'NEW') {
            checkCardTypeForInstallments(e.target.value);
        }
    });
});

useNewCardBtn.addEventListener('click', () => showNewCardUI(true));

cancelNewCardBtn.addEventListener('click', () => {
    savedCardsSection.style.display = 'block';
    newCardSection.style.display = 'none';
    toggleCardInputsRequired(false);
    
    const checked = document.querySelector('input[name="savedCardOption"]:checked');
    if(checked) {
        selectedCardId = checked.value;
        checkCardTypeForInstallments(checked.getAttribute('data-type'));
    }
});

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
            if (selectedCardId === 'NEW' || Object.keys(userSavedCards).length === 0) {
                const newType = document.querySelector('input[name="newCardType"]:checked').value;
                checkCardTypeForInstallments(newType);
            } else {
                const checked = document.querySelector('input[name="savedCardOption"]:checked');
                if(checked) checkCardTypeForInstallments(checked.getAttribute('data-type'));
            }
        } else {
            creditCardWrapper.style.display = 'none';
            pixSection.style.display = 'flex';
            installmentsContainer.style.display = 'none'; 
            // Reseta juros
            installmentsSelect.value = 1;
            updateTotals();
        }
    });
});

generatePixBtn.addEventListener('click', () => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PagamentoDrihyR$${finalTotalValue.toFixed(2)}`;
    qrCodeImage.src = qrCodeUrl;
    generatePixBtn.style.display = 'none';
    qrCodeContainer.style.display = 'flex';
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        calculateDeliveryDates(); // Calcula as datas ao carregar
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
    const shippingMethod = document.querySelector('input[name="shippingMethod"]:checked').value;

    if (paymentMethod === 'pix' && qrCodeContainer.style.display === 'none') {
        alert("Por favor, gere o QR Code do Pix antes de finalizar.");
        return;
    }

    let finalPaymentDetails = paymentMethod;
    
    if (paymentMethod === 'credit_card') {
        const installments = installmentsSelect.value;
        const installmentText = (installmentsContainer.style.display !== 'none' && installments > 1) ? ` (${installments}x)` : ' (À vista)';
        
        if (selectedCardId === 'NEW' || !selectedCardId) {
            const newCardType = document.querySelector('input[name="newCardType"]:checked').value;
            finalPaymentDetails = `${newCardType} Novo (Final ${cardNumber.value.slice(-4)})${newCardType === 'Crédito' ? installmentText : ''}`;
            
            if (saveCardCheckbox && saveCardCheckbox.checked) {
                const newCard = {
                    number: cardNumber.value,
                    name: cardName.value,
                    expiry: cardExpiry.value,
                    cvv: cardCvv.value,
                    type: newCardType
                };
                push(ref(database, `users/${user.uid}/cards`), newCard);
            }
        } else {
            const card = userSavedCards[selectedCardId];
            const type = card.type || 'Crédito';
            finalPaymentDetails = `${type} Salvo (Final ${card.number.slice(-4)})${type === 'Crédito' ? installmentText : ''}`;
        }
    } else {
        finalPaymentDetails += ' (À vista)';
    }

    payButton.disabled = true;
    payButton.value = "Processando...";

    const orderData = {
        userId: user.uid,
        email: user.email,
        items: cartData,
        subtotal: cartSubtotal,
        shipping: shippingCost,
        shippingMethod: shippingMethod === 'express' ? 'Express' : 'Econômico',
        total: finalTotalValue,
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
                total_value: finalTotalValue.toFixed(2).replace('.', ','),
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