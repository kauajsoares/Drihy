function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cartItems');
    cartItemsContainer.innerHTML = '';

    let total = 0;

    cart.forEach((item, index) => {
        // Garantindo que a limpeza do preço seja feita de forma robusta
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
            <td>${item.quantity}</td>
            <td>R$${itemTotal.toFixed(2)}</td>
            <td><button id="buttonremove" onclick="removeFromCart(${index})">X</button></td>
        `;

        cartItemsContainer.appendChild(cartItem);
    });

    document.getElementById('cartTotal').textContent = total.toFixed(2);
}

function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}



loadCart();