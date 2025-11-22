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

// O clique no botão AGORA APENAS REDIRECIONA (O HTML já foi alterado para 'endereco.html')
document.getElementById('checkoutButton').addEventListener('click', (e) => {
    // A única função do JS aqui é garantir que o clique no link leve ao destino, 
    // mas a navegação real é feita pelo HTML <a href="endereco.html">
    // Se precisar de alguma lógica JS antes de navegar, ela seria colocada aqui.
    // Como não há lógica, o preventDefault e o redirecionamento foram removidos/simplificados.
    // Se você estiver usando o <a>, pode remover todo este bloco JS e deixar o HTML fazer o trabalho.
    
    // Vou remover o preventDefault e o código de alert, deixando o link funcionar.
    
    // Deixo o bloco vazio ou o removo, dependendo da necessidade de intervenção JS.
    // Para limpar, vamos apenas garantir que a navegação ocorra se o carrinho não estiver vazio (lógica futura).
    // Por enquanto, o link HTML (a href="endereco.html") fará a navegação.
});

loadCart();