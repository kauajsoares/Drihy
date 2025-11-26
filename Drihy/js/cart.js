import { auth, database } from "./firebase-config.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Função principal que verifica o login e carrega o carrinho
function loadCart() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const cartRef = ref(database, `users/${user.uid}/cart`);
            
            get(cartRef).then((snapshot) => {
                // Se existir carrinho no banco, pega os dados. Se não, cria lista vazia.
                const cart = snapshot.exists() ? snapshot.val() : [];
                renderCart(cart, user.uid);
            });
        } else {
            // Se não estiver logado, manda para o login
            window.location.href = 'login.html';
        }
    });
}

// Função responsável por desenhar o HTML na tela (Mantendo sua estrutura)
function renderCart(cart, uid) {
    const cartItemsContainer = document.getElementById('cartItems');
    const checkoutButton = document.getElementById('checkoutButton');
    const totalElement = document.getElementById('cartTotal');
    
    cartItemsContainer.innerHTML = '';
    let total = 0;

    // LÓGICA DO BOTÃO (Se vazio, desabilita)
    if (!cart || cart.length === 0) {
        checkoutButton.classList.add('disabled');
        checkoutButton.style.pointerEvents = 'none';
        checkoutButton.style.opacity = '0.5';
        cartItemsContainer.innerHTML = '<tr><td colspan="7">Seu carrinho está vazio.</td></tr>';
        totalElement.textContent = "0.00";
    } else {
        checkoutButton.classList.remove('disabled');
        checkoutButton.style.pointerEvents = 'auto';
        checkoutButton.style.opacity = '1';

        cart.forEach((item, index) => {
            // Limpeza e cálculo do preço (Igual ao seu código)
            const priceCleaned = item.productPrice.replace(/[R$\s]/g, '').replace(',', '.').trim();
            const itemPrice = parseFloat(priceCleaned);
    
            if (isNaN(itemPrice)) return;
    
            const itemTotal = itemPrice * item.quantity;
            total += itemTotal;
    
            const cartItem = document.createElement('tr');
            
            // HTML idêntico ao seu, mas usando classes para os botões ao invés de onclick direto
            // (Isso é necessário porque em módulos JS, funções não são globais)
            cartItem.innerHTML = `
                <td><img src="${item.productImage.responsiveImage.src}" alt="${item.productName}" width="100" height="100" /></td>
                <td>${item.productName}</td>
                <td>${item.size}</td>
                <td>R$${itemPrice.toFixed(2)}</td>
                <td>
                    <div class="quantity-controls">
                        <button class="qty-btn up-btn" data-index="${index}">▲</button>
                        <span class="qty-number">${item.quantity}</span>
                        <button class="qty-btn down-btn" data-index="${index}">▼</button>
                    </div>
                </td>
                <td>R$${itemTotal.toFixed(2)}</td>
                <td><button id="buttonremove" class="remove-btn" data-index="${index}">X</button></td>
            `;
    
            cartItemsContainer.appendChild(cartItem);
        });
    
        totalElement.textContent = total.toFixed(2);
        
        // Adiciona os eventos de clique nos botões que acabamos de criar
        attachEventListeners(cart, uid);
    }
}

// Função para conectar os cliques dos botões às funções de lógica
function attachEventListeners(cart, uid) {
    // Botão Aumentar (▲)
    document.querySelectorAll('.up-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            updateQuantity(index, 1, cart, uid);
        });
    });

    // Botão Diminuir (▼)
    document.querySelectorAll('.down-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            updateQuantity(index, -1, cart, uid);
        });
    });

    // Botão Remover (X)
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            removeFromCart(index, cart, uid);
        });
    });
}

// Lógica de atualização de quantidade
function updateQuantity(index, change, cart, uid) {
    cart[index].quantity += change;

    // Impede quantidade menor que 1
    if (cart[index].quantity < 1) {
        cart[index].quantity = 1;
    }

    saveCartToFirebase(cart, uid);
}

// Lógica de remoção
function removeFromCart(index, cart, uid) {
    cart.splice(index, 1);
    saveCartToFirebase(cart, uid);
}

// Função que salva no Firebase e recarrega a tela
function saveCartToFirebase(cart, uid) {
    const cartRef = ref(database, `users/${uid}/cart`);
    set(cartRef, cart).then(() => {
        renderCart(cart, uid); // Redesenha a tela com os dados novos
    });
}

// Prevenção extra no botão de checkout
document.getElementById('checkoutButton').addEventListener('click', (e) => {
    if (e.target.classList.contains('disabled')) {
        e.preventDefault();
    }
});

// Inicia o script
loadCart();