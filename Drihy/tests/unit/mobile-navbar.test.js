const path = 'js/mobile-navbar.js';
const { loadScriptInJSDOM } = require('./_loadScript');

test('mobile-navbar toggles classes on click', () => {
  const window = loadScriptInJSDOM(path, {
    beforeEval: (win) => {
      const mobile = win.document.createElement('div');
      mobile.className = 'mobile-menu';
      win.document.body.appendChild(mobile);

      const navList = win.document.createElement('div');
      navList.className = 'nav-list';
      win.document.body.appendChild(navList);

      const li = win.document.createElement('li');
      navList.appendChild(li);
    }
  });

  const mobile = window.document.querySelector('.mobile-menu');
  // disparar click
  mobile.click();
  const navList = window.document.querySelector('.nav-list');
  expect(navList.classList.contains('active')).toBe(true);
});
