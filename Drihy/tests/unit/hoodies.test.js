const path = 'js/hoodies.js';
const { loadScriptInJSDOM } = require('./_loadScript');

test('hoodies.renderProducts adiciona um item ao #shopitems', async () => {
  const fakeResponse = {
    json: async () => ({ data: { allProducts: [
      { slug: 'h1', productName: 'Hoodie 1', productPrice: 'R$50', productImage: { responsiveImage: { src: 'img.jpg' } } }
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
  expect(shopitems.innerHTML).toMatch('Hoodie 1');
});
