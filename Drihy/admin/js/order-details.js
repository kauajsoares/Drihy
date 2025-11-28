import { auth, database } from "../../js/firebase-config.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const params = new URLSearchParams(window.location.search);
const orderId = params.get('id');

if (!orderId) {
    window.location.href = "dashboard.html";
}

const orderIdDisplay = document.getElementById('orderIdDisplay');
const orderDateDisplay = document.getElementById('orderDateDisplay');
const orderStatusDisplay = document.getElementById('orderStatusDisplay');
const customerEmail = document.getElementById('customerEmail');
const customerId = document.getElementById('customerId');
const shippingAddress = document.getElementById('shippingAddress');
const shippingMethod = document.getElementById('shippingMethod');
const paymentMethodInfo = document.getElementById('paymentMethodInfo');
const paymentTotal = document.getElementById('paymentTotal');
const orderItemsList = document.getElementById('orderItemsList');
const changeStatusBtn = document.getElementById('changeStatusBtn');

let currentOrderStatus = '';

onAuthStateChanged(auth, (user) => {
    if (user) {
        const adminRef = ref(database, `users/${user.uid}/isAdmin`);
        get(adminRef).then((snapshot) => {
            if (snapshot.exists() && snapshot.val() === true) {
                loadOrderDetails();
            } else {
                window.location.href = "../../index.html";
            }
        });
    } else {
        window.location.href = "../../login.html";
    }
});

function loadOrderDetails() {
    const orderRef = ref(database, `orders/${orderId}`);
    get(orderRef).then((snapshot) => {
        if (snapshot.exists()) {
            const order = snapshot.val();
            renderDetails(order);
        } else {
            alert("Pedido não encontrado.");
            window.location.href = "dashboard.html";
        }
    });
}

function renderDetails(order) {
    currentOrderStatus = order.status;
    
    orderIdDisplay.textContent = `#${orderId}`;
    orderDateDisplay.textContent = new Date(order.date).toLocaleString('pt-BR');
    
    orderStatusDisplay.textContent = order.status;
    orderStatusDisplay.className = `status-badge status-${order.status.toLowerCase()}`;

    customerEmail.textContent = order.email;
    customerId.textContent = `UID: ${order.userId}`;

    if (order.address) {
        shippingAddress.innerHTML = `
            ${order.address.rua}, ${order.address.numero} ${order.address.complemento || ''}<br>
            ${order.address.bairro}, ${order.address.cidade} - ${order.address.estado}<br>
            CEP: ${order.address.cep}
        `;
    }
    
    shippingMethod.textContent = `Entrega: ${order.shippingMethod || 'Padrão'} - R$ ${parseFloat(order.shipping || 0).toFixed(2).replace('.', ',')}`;

    paymentMethodInfo.textContent = order.paymentMethod;
    paymentTotal.textContent = `R$ ${order.total.toFixed(2).replace('.', ',')}`;

    renderItems(order.items);
}

function renderItems(itemsData) {
    const items = Array.isArray(itemsData) ? itemsData : Object.values(itemsData || {});
    orderItemsList.innerHTML = '';

    items.forEach(item => {
        if(!item) return;
        const tr = document.createElement('tr');
        const price = parseFloat(item.productPrice.replace(/[R$\s]/g, '').replace(',', '.'));
        const total = price * item.quantity;

        tr.innerHTML = `
            <td style="display: flex; align-items: center; gap: 10px;">
                <img src="${item.productImage.responsiveImage.src}" style="width: 40px; height: 40px; object-fit: cover; border: 1px solid #eee;">
                ${item.productName}
            </td>
            <td>${item.size}</td>
            <td>R$ ${price.toFixed(2).replace('.', ',')}</td>
            <td>${item.quantity}</td>
            <td>R$ ${total.toFixed(2).replace('.', ',')}</td>
        `;
        orderItemsList.appendChild(tr);
    });
}

changeStatusBtn.addEventListener('click', () => {
    const newStatus = prompt("Novo Status (Aprovado / Enviado / Entregue):", currentOrderStatus);
    if (newStatus && newStatus !== currentOrderStatus) {
        update(ref(database, `orders/${orderId}`), { status: newStatus })
            .then(() => {
                alert("Status atualizado!");
                loadOrderDetails();
            });
    }
});