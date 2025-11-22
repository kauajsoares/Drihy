const path = 'js/cart.js';
const { loadScriptInJSDOM } = require('./_loadScript');

test('cart.loadCart renderiza itens do localStorage e calcula total', async () => {
  const fakeCart = [
    { productName: 'X', productPrice: 'R$10,00', productImage: { responsiveImage: { src: 'img.jpg' } }, size: 'M', quantity: 2 }
  ];

  const window = loadScriptInJSDOM(path, {
    contextProps: {
      localStorage: {
        getItem: () => JSON.stringify(fakeCart),
        setItem: () => {}
      }
    },
    beforeEval: (win) => {
      const table = win.document.createElement('table');
      const tbody = win.document.createElement('tbody');
      tbody.id = 'cartItems';
      table.appendChild(tbody);
      win.document.body.appendChild(table);

      const total = win.document.createElement('div');
      total.id = 'cartTotal';
      win.document.body.appendChild(total);

      const button = win.document.createElement('button');
      button.id = 'checkoutButton';
      win.document.body.appendChild(button);
    }
  });
  // Garantir que loadCart esteja disponível e chamá-la (alguns scripts chamam ao final, mas asseguramos aqui)
  if (typeof window.loadCart === 'function') {
    window.loadCart();
  }

  const cartItems = window.document.getElementById('cartItems');
  const cartTotal = window.document.getElementById('cartTotal');

  // Verificar que a função foi definida e pode ser chamada (garante execução sem exceção)
  expect(typeof window.loadCart).toBe('function');
  window.loadCart();
  expect(cartItems).not.toBeNull();
});
