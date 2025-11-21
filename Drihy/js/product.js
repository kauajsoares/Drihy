async function fetchProductData() {
    try {
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('slug');

        const response = await fetch("https://graphql.datocms.com/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer b5c82608889cf13b3dbfb84fd48019`,
            },
            body: JSON.stringify({
                query: `
                {
                    allProducts {
                        slug
                        productName
                        productPrice
                        productType
                        productImage {
                            responsiveImage(imgixParams: {auto: [compress, format]}) {
                                src
                            }
                        }
                    }
                }
                `,
            }),
        });

        const json = await response.json();
        const data = json.data.allProducts;

        const product = data.find(p => p.slug === slug);

        if (product) {
            document.getElementById('productImage').src = product.productImage.responsiveImage.src;
            document.getElementById('productName').textContent = product.productName;
            document.getElementById('productPrice').textContent = product.productPrice;

            document.getElementById('addToCartButton').addEventListener('click', () => {
                addToCart(product);
            });

            document.getElementById('buyNowButton').addEventListener('click', () => {
                addToCart(product);
                window.location.href = 'cart.html';
            });
        } else {
            console.error('Product not found');
        }
    } catch (error) {
        console.error('Error fetching product data:', error);
    }
}

function addToCart(product) {
    const size = document.getElementById('sizeselect').value;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItem = { ...product, size, quantity: 1 };

    const existingItemIndex = cart.findIndex(item => item.slug === product.slug && item.size === size);
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Produto adicionado ao carrinho!');
}

fetchProductData();
