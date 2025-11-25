import { auth, database } from "./firebase-config.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

(function() {
    emailjs.init("VqbaAuS4xXBkHvLWD"); 
})();

const cardNumber = document.getElementById('cardNumber');
const cardExpiry = document.getElementById('cardExpiry');
const cardCvv = document.getElementById('cardCvv');
const paymentForm = document.getElementById('paymentForm');
const totalAmountSpan = document.getElementById('totalAmount');
const creditCardSection = document.getElementById('creditCardSection');
const pixSection = document.getElementById('pixSection');
const radioButtons = document.querySelectorAll('input[name="paymentMethod"]');
const generatePixBtn = document.getElementById('generatePixBtn');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const qrCodeImage = document.getElementById('qrCodeImage');
const payButton = document.getElementById('payButton');

let cartData = [];
let totalValue = 0;

function loadCartTotal() {
    cartData = JSON.parse(localStorage.getItem('cart')) || [];
    totalValue = 0;

    if (cartData.length === 0) {
        alert("Seu carrinho está vazio.");
        window.location.href = 'shop.html';
        return;
    }

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
    e.target.value = e.target.value.replace(/\D/g, '');
}

radioButtons.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'credit_card') {
            creditCardSection.style.display = 'block';
            pixSection.style.display = 'none';
            document.getElementById('cardNumber').required = true;
            document.getElementById('cardName').required = true;
            document.getElementById('cardExpiry').required = true;
            document.getElementById('cardCvv').required = true;
        } else {
            creditCardSection.style.display = 'none';
            pixSection.style.display = 'flex';
            document.getElementById('cardNumber').required = false;
            document.getElementById('cardName').required = false;
            document.getElementById('cardExpiry').required = false;
            document.getElementById('cardCvv').required = false;
        }
    });
});

generatePixBtn.addEventListener('click', () => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PagamentoDrihyR$${totalValue.toFixed(2)}`;
    
    qrCodeImage.src = qrCodeUrl;
    
    generatePixBtn.style.display = 'none';
    qrCodeContainer.style.display = 'flex';
});

if (cardNumber) cardNumber.addEventListener('input', formatCardNumber);
if (cardExpiry) cardExpiry.addEventListener('input', formatExpiry);
if (cardCvv) cardCvv.addEventListener('input', onlyNumbers);

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadCartTotal();
    } else {
        window.location.href = 'login.html';
    }
});

paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return;

    const addressData = JSON.parse(localStorage.getItem('checkout_address'));
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    if (paymentMethod === 'pix' && qrCodeContainer.style.display === 'none') {
        alert("Por favor, gere o QR Code do Pix antes de finalizar.");
        return;
    }

    payButton.disabled = true;
    payButton.value = "Processando...";

    const orderData = {
        userId: user.uid,
        email: user.email,
        items: cartData,
        total: totalValue,
        address: addressData,
        paymentMethod: paymentMethod,
        status: 'Aprovado',
        date: new Date().toISOString()
    };

    const newOrderRef = push(ref(database, 'orders'));
    
    set(newOrderRef, orderData)
        .then(() => {
            console.log("Pedido salvo no Firebase. ID:", newOrderRef.key);

            const templateParams = {
                to_email: user.email,
                order_id: newOrderRef.key,
                total_value: totalValue.toFixed(2).replace('.', ','),
                payment_method: paymentMethod === 'pix' ? 'Pix' : 'Cartão de Crédito'
            };

            return emailjs.send('service_x8guuda', 'template_fe1rk2a', templateParams);
        })
        .then((response) => {
            console.log('SUCESSO! Email enviado.', response.status, response.text);
            finishOrder();
        })
        .catch((error) => {
            console.error('FALHA CRÍTICA:', error);
            finishOrder(); 
        });
});

function finishOrder() {
    localStorage.removeItem('cart');
    window.location.href = 'compra-concluida.html';
}