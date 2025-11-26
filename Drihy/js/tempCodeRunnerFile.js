import { auth, database } from "./firebase-config.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
                addToCart(product, false);
            });

            document.getElementById('buyNowButton').addEventListener('click', () => {
                addToCart(product, true);
            });
        } else {
            console.error('Product not found');
        }
    } catch (error) {
        console.error('Error fetching product data:', error);
    }
}

function addToCart(product, redirect) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const size = document.getElementById('sizeselect').value;
            const cartRef = ref(database, `users/${user.uid}/cart`);

            get(cartRef).then((snapshot) => {
                let cart = snapshot.exists() ? snapshot.val() : [];
                if (!Array.isArray(cart)) cart = [];
                
                const existingItemIndex = cart.findIndex(item => item.slug === product.slug && item.size === size);
                
                if (existingItemIndex > -1) {
                    cart[existingItemIndex].quantity += 1;
                } else {
                    const cartItem = { ...product, size, quantity: 1 };
                    cart.push(cartItem);
                }

                set(cartRef, cart).then(() => {
                    const addBtn = document.getElementById('addToCartButton');
                    const originalText = addBtn.value;
                    addBtn.value = "Adicionado!";
                    setTimeout(() => { addBtn.value = originalText; }, 1500);

                    if (redirect) {
                        window.location.href = 'cart.html';
                    }
                });
            });
        } else {
            alert("Faça login para adicionar produtos ao carrinho.");
            window.location.href = "login.html";
        }
    });
}

fetchProductData();