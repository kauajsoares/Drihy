async function fetchData() {
    try {
        const response = await fetch("https://graphql.datocms.com/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: "Bearer b5c82608889cf13b3dbfb84fd48019",
            },
            body: JSON.stringify({
                query: `query{
                    allProducts(filter: { productType: { eq: "shorts" } }) {
                        productImage {
                            responsiveImage(imgixParams: {auto: [compress, format]}) {
                                src
                            }
                        }
                        slug
                        productName
                        productPrice
                    }
                }`,
            }),
        });

        const json = await response.json();
        const data = json.data.allProducts;
        renderProducts(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function renderProducts(products) {
    const shopitems = document.getElementById("shopitems");
    products.forEach((product) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <a href="productpage.html?slug=${product.slug}">
                <img src="${product.productImage.responsiveImage.src}" alt="${product.productName}" width="200" height="200" />
                <h3>${product.productName}</h3>
                <span>${product.productPrice}</span>
            </a>
        `;
        shopitems.appendChild(listItem);
    });
}

fetchData();
