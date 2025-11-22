const path = 'js/login.js';
const fs = require('fs');
const { loadScriptInJSDOM } = require('./_loadScript');

// Para login.js (ESM imports), _loadScript já remove linhas "import" e "export".
// Precisamos prover mocks para validate_email, signInWithEmailAndPassword, update, ref, database, auth.

test('login exibe mensagem de erro ao email inválido', () => {
  const window = loadScriptInJSDOM(path, {
    contextProps: {
      validate_email: (e) => false,
      // mocks apenas para não falhar se forem usados
      signInWithEmailAndPassword: () => Promise.reject({ code: 'auth/wrong-password' }),
      update: () => Promise.resolve(),
      ref: () => {},
      database: {},
      auth: {}
    },
    beforeEval: (win) => {
      const form = win.document.createElement('form');
      form.id = 'loginForm';

      const email = win.document.createElement('input');
      email.id = 'email';
      email.value = 'invalid';

      const password = win.document.createElement('input');
      password.id = 'password';
      password.value = 'abc12345';

      const errorDiv = win.document.createElement('div');
      errorDiv.id = 'loginError';

      form.appendChild(email);
      form.appendChild(password);
      win.document.body.appendChild(form);
      win.document.body.appendChild(errorDiv);
    }
  });

  // Disparar DOMContentLoaded para que listeners sejam registrados
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  const loginForm = window.document.getElementById('loginForm');
  // submit do form irá chamar a validação montada no script
  const submitEvent = new window.Event('submit');
  loginForm.dispatchEvent(submitEvent);

  const errorDiv = window.document.getElementById('loginError');
  expect(errorDiv.textContent).toMatch(/formato do e-mail/i);
});
