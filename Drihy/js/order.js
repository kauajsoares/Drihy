import { auth, database } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { ref, query, orderByChild, equalTo, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const ordersList = document.getElementById('ordersList');
const loadingOrders = document.getElementById('loadingOrders');
const noOrdersMessage = document.getElementById('noOrdersMessage');

onAuthStateChanged(auth, (user) => {
    if (user) {
        const ordersRef = ref(database, 'orders');
        const userOrdersQuery = query(ordersRef, orderByChild('userId'), equalTo(user.uid));

        get(userOrdersQuery).then((snapshot) => {
            loadingOrders.style.display = 'none';

            if (snapshot.exists()) {
                const orders = snapshot.val();
                renderOrders(orders);
            } else {
                noOrdersMessage.style.display = 'block';
            }
        }).catch((error) => {
            console.error(error);
            loadingOrders.textContent = "Erro ao carregar pedidos.";
        });
    } else {
        window.location.href = "login.html";
    }
});

function renderOrders(ordersObj) {
    const ordersArray = Object.values(ordersObj).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    ordersArray.forEach(order => {
        const date = new Date(order.date).toLocaleDateString('pt-BR');
        const time = new Date(order.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';

        let itemsHtml = '';
        order.items.forEach(item => {
            const priceCleaned = item.productPrice.replace(/[R$\s]/g, '').replace(',', '.').trim();
            const itemPrice = parseFloat(priceCleaned).toFixed(2).replace('.', ',');
            
            itemsHtml += `
                <div class="order-item">
                    <img src="${item.productImage.responsiveImage.src}" alt="${item.productName}" class="item-img">
                    <div class="item-details">
                        <span class="item-name">${item.productName}</span>
                        <span class="item-meta">Tam: ${item.size} | Qtd: ${item.quantity} | R$ ${itemPrice}</span>
                    </div>
                </div>
            `;
        });

        const paymentLabel = order.paymentMethod === 'credit_card' ? 'Cartão de Crédito' : 'Pix';

        orderCard.innerHTML = `
            <div class="order-header">
                <span class="order-date">${date} às ${time}</span>
                <span class="order-status">${order.status}</span>
            </div>
            <div class="order-items">
                ${itemsHtml}
            </div>
            <div class="order-footer">
                <span class="payment-method">Pagamento: ${paymentLabel}</span>
                <span class="order-total">Total: R$ ${order.total.toFixed(2).replace('.', ',')}</span>
            </div>
        `;

        ordersList.appendChild(orderCard);
    });
}