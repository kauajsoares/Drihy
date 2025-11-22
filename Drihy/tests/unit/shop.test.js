const path = 'js/shop.js';
const { loadScriptInJSDOM } = require('./_loadScript');

test('shop.renderProducts adiciona um item ao #shopitems', async () => {
  const fakeResponse = {
    json: async () => ({ data: { allProducts: [
      { slug: 's1', productName: 'Shop Prod', productPrice: 'R$20', productImage: { responsiveImage: { src: 'img.jpg' } } }
    ] } })
  };

  const window = loadScriptInJSDOM(path, {
    contextProps: { fetch: () => Promise.resolve(fakeResponse) },
    beforeEval: (win) => {
      const ul = win.document.createElement('ul');
      ul.id = 'shopitems';
      win.document.body.appendChild(ul);
    }
  });

  await new Promise((r) => setTimeout(r, 0));

  const shopitems = window.document.getElementById('shopitems');
  expect(shopitems.children.length).toBeGreaterThan(0);
  expect(shopitems.innerHTML).toMatch('Shop Prod');
});
