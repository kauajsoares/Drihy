const path = 'js/endereco.js';
const { loadScriptInJSDOM } = require('./_loadScript');

test('endereco.maskCEP formata corretamente o CEP', () => {
  const window = loadScriptInJSDOM(path, {
    beforeEval: (win) => {
      const form = win.document.createElement('form');
      form.id = 'addressForm';
      const input = win.document.createElement('input');
      input.id = 'cep';
      form.appendChild(input);
      win.document.body.appendChild(form);
    }
  });

  const input = window.document.getElementById('cep');
  input.value = '12345678';
  // maskCEP deve estar disponível no escopo do window
  expect(typeof window.maskCEP === 'function').toBe(true);
  window.maskCEP(input);
  expect(input.value).toBe('12345-678');
});
