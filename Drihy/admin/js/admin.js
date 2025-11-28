import { auth, database } from "../../js/firebase-config.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const ordersList = document.getElementById('adminOrdersList');
const totalSalesElem = document.getElementById('totalSales');
const totalOrdersElem = document.getElementById('totalOrders');

onAuthStateChanged(auth, (user) => {
    if (user) {
        const adminRef = ref(database, `users/${user.uid}/isAdmin`);
        get(adminRef).then((snapshot) => {
            if (snapshot.exists() && snapshot.val() === true) {
                loadAllOrders();
            } else {
                alert("Acesso Negado.");
                window.location.href = "../../index.html";
            }
        });
    } else {
        window.location.href = "../../login.html";
    }
});

function loadAllOrders() {
    const ordersRef = ref(database, 'orders');
    
    get(ordersRef).then((snapshot) => {
        if (snapshot.exists()) {
            const ordersObj = snapshot.val();
            renderOrdersTable(ordersObj);
        } else {
            ordersList.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Nenhum pedido encontrado.</td></tr>';
        }
    });
}

function renderOrdersTable(ordersObj) {
    const orders = Object.entries(ordersObj).sort((a, b) => {
        return new Date(b[1].date) - new Date(a[1].date);
    });

    ordersList.innerHTML = '';
    
    let totalMoney = 0;
    let totalCount = 0;

    orders.forEach(([key, order]) => {
        totalCount++;
        const orderTotal = parseFloat(order.total) || 0;
        totalMoney += orderTotal;

        const date = new Date(order.date).toLocaleDateString('pt-BR');
        const tr = document.createElement('tr');
        
        let statusClass = 'status-aprovado';
        if (order.status === 'Enviado') statusClass = 'status-enviado';
        if (order.status === 'Entregue') statusClass = 'status-entregue';

        tr.innerHTML = `
            <td>#${key.slice(-6)}</td>
            <td>
                ${order.email}<br>
                <small style="color:#888;">${order.address ? order.address.cidade : ''}</small>
            </td>
            <td>${date}</td>
            <td>R$ ${orderTotal.toFixed(2).replace('.', ',')}</td>
            <td><span class="status-badge ${statusClass}">${order.status}</span></td>
            <td style="display: flex; gap: 5px;">
                <a href="order-details.html?id=${key}" class="action-btn view-btn">Ver Detalhes</a>
                <button class="action-btn" onclick="updateStatus('${key}', '${order.status}')">Status</button>
            </td>
        `;

        ordersList.appendChild(tr);
    });

    totalSalesElem.textContent = `R$ ${totalMoney.toFixed(2).replace('.', ',')}`;
    totalOrdersElem.textContent = totalCount;
    
    window.updateStatus = updateStatus;
}

window.updateStatus = function(orderId, currentStatus) {
    const newStatus = prompt("Novo Status (Aprovado / Enviado / Entregue):", currentStatus);
    
    if (newStatus && newStatus !== currentStatus) {
        const orderRef = ref(database, `orders/${orderId}`);
        update(orderRef, { status: newStatus })
            .then(() => {
                loadAllOrders();
            })
            .catch((error) => {
                alert("Erro ao atualizar: " + error.message);
            });
    }
};