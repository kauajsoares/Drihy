const path = 'js/acessories.js';
const { loadScriptInJSDOM } = require('./_loadScript');

test('acessories.renderProducts adiciona um item ao #shopitems', async () => {
  const fakeResponse = {
    json: async () => ({ data: { allProducts: [
      { slug: 'p1', productName: 'Produto 1', productPrice: 'R$10', productImage: { responsiveImage: { src: 'img.jpg' } } }
    ] } })
  };

  const window = loadScriptInJSDOM(path, {
    contextProps: {
      fetch: () => Promise.resolve(fakeResponse)
    },
    beforeEval: (win) => {
      const ul = win.document.createElement('ul');
      ul.id = 'shopitems';
      win.document.body.appendChild(ul);
    }
  });

  // Aguarda microtasks caso fetchData seja async
  await new Promise((r) => setTimeout(r, 0));

  const shopitems = window.document.getElementById('shopitems');
  expect(shopitems.children.length).toBeGreaterThan(0);
  expect(shopitems.innerHTML).toMatch('Produto 1');
});
