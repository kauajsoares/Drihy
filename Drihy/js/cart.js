function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cartItems');
    cartItemsContainer.innerHTML = '';

    let total = 0;

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

document.getElementById('checkoutButton').addEventListener('click', (e) => {
});

loadCart();