function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cartItems');
    const checkoutButton = document.getElementById('checkoutButton');
    cartItemsContainer.innerHTML = '';

    let total = 0;

    // LÓGICA PARA DESABILITAR O BOTÃO SE O CARRINHO ESTIVER VAZIO
    if (cart.length === 0) {
        checkoutButton.classList.add('disabled'); // Adiciona classe CSS para estilo visual
        checkoutButton.style.pointerEvents = 'none'; // Desabilita o clique
        checkoutButton.style.opacity = '0.5'; // Deixa o botão "apagado"
        
        // Opcional: Mensagem de carrinho vazio na tabela
        cartItemsContainer.innerHTML = '<tr><td colspan="7">Seu carrinho está vazio.</td></tr>';
    } else {
        checkoutButton.classList.remove('disabled');
        checkoutButton.style.pointerEvents = 'auto';
        checkoutButton.style.opacity = '1';
    }

    cart.forEach((item, index) => {
        const priceCleaned = item.productPrice.replace(/[R$\s]/g, '').replace(',', '.').trim();
        const itemPrice = parseFloat(priceCleaned);

        if (isNaN(itemPrice)) {
            console.error('Preço inválido para o item:', item.productName);
            return;
        }

        const itemTotal = itemPrice * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('tr');
        
        cartItem.innerHTML = `
            <td><img src="${item.productImage.responsiveImage.src}" alt="${item.productName}" width="100" height="100" /></td>
            <td>${item.productName}</td>
            <td>${item.size}</td>
            <td>R$${itemPrice.toFixed(2)}</td>
            <td>
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">▲</button>
                    <span class="qty-number">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">▼</button>
                </div>
            </td>
            <td>R$${itemTotal.toFixed(2)}</td>
            <td><button id="buttonremove" onclick="removeFromCart(${index})">X</button></td>
        `;

        cartItemsContainer.appendChild(cartItem);
    });

    document.getElementById('cartTotal').textContent = total.toFixed(2);
}

function updateQuantity(index, change) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    cart[index].quantity += change;

    if (cart[index].quantity < 1) {
        cart[index].quantity = 1;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    loadCart();
    window.dispatchEvent(new Event('storage'));
}

function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    loadCart();
    window.dispatchEvent(new Event('storage'));
}

// Prevenção extra no clique (caso o usuário tente forçar ou remover a classe via inspeção)
document.getElementById('checkoutButton').addEventListener('click', (e) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        e.preventDefault();
        alert("Seu carrinho está vazio!");
    }
});

loadCart();