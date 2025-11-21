function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cartItems');
    cartItemsContainer.innerHTML = '';

    let total = 0;

    cart.forEach((item, index) => {
        const itemPrice = parseFloat(item.productPrice.replace('R$', '').replace('.', '').replace(',', '.').trim()); // Limpeza e conversão
        console.log('Product Price:', item.productPrice);
        console.log('Parsed Price:', itemPrice);

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

    console.log('Total:', total);
    document.getElementById('cartTotal').textContent = total.toFixed(2);
}

function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

document.getElementById('checkoutButton').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Compra finalizada!');
    localStorage.removeItem('cart');
    loadCart();
});

loadCart();
