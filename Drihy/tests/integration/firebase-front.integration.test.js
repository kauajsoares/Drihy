const admin = require('firebase-admin');
const { loadScriptInJSDOM } = require('../unit/_loadScript');
const net = require('net');

const EMULATOR_HOST = process.env.FIREBASE_DATABASE_EMULATOR_HOST || 'localhost:9000';
const PROJECT_ID = 'drihy-integration-test-frontend';

jest.setTimeout(20000);

function checkPort(host, port, timeoutMs = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => {
      settled = true;
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      if (!settled) { settled = true; socket.destroy(); resolve(false); }
    });
    socket.once('error', () => { if (!settled) { settled = true; socket.destroy(); resolve(false); } });
    socket.connect(port, host);
  });
}

test('Frontend firebase-config.js connects to emulator and database operations succeed', async () => {
  const [host, portStr] = EMULATOR_HOST.split(':');
  const port = parseInt(portStr, 10) || 9000;

  const available = await checkPort(host, port, 1000);
  if (!available) {
    console.warn(`Realtime Database emulator not reachable at ${EMULATOR_HOST} — skipping frontend integration test.`);
    return;
  }

  // Inicializa Admin SDK para usar o emulator
  const adminApp = admin.initializeApp({ projectId: PROJECT_ID, databaseURL: `http://localhost:${port}?ns=${PROJECT_ID}` }, 'adminTestApp');

  try {
    // Criar wrappers que simulam as funções do SDK cliente usadas no arquivo `js/firebase-config.js`.
    const contextProps = {
      // initializeApp deve retornar algum objeto de app; aqui retornamos o admin app para que possamos reusar
      initializeApp: (cfg) => {
        return admin.app('adminTestApp');
      },
      // getAuth não é usado pelo teste diretamente, mas deve existir
      getAuth: (app) => ({ mockedAuth: true }),
      // getDatabase deve retornar um objeto com método `ref` que retorne o Reference compatível com admin
      getDatabase: (app) => ({
        ref: (path) => {
          const db = admin.database(admin.app('adminTestApp'));
          return db.ref(path);
        }
      })
    };

    // Carregar o arquivo original do projeto (ele usa imports CDN; o helper vai remover imports/exports e executar)
    const win = loadScriptInJSDOM('js/firebase-config.js', { contextProps });

    // Após carregar, `database` deve estar exposto no window (helper expõe const/let/var e funções)
    expect(win.database).toBeDefined();
    expect(typeof win.validate_email).toBe('function');

    // Usar a referência que o arquivo exportou para gravar um valor
    const testRef = win.database.ref('/integration/front');
    await testRef.set({ from: 'front', ts: Date.now() });

    // Ler diretamente via admin SDK para verificar
    const snap = await admin.database(admin.app('adminTestApp')).ref('/integration/front').once('value');
    const val = snap.val();
    expect(val).toBeTruthy();
    expect(val.from).toBe('front');
  } finally {
    try { await admin.app('adminTestApp').delete(); } catch (e) {}
  }
});
