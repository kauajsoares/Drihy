const fs = require('fs');
const path = require('path');

/**
 * Carrega um arquivo JS usando o ambiente jsdom embutido do Jest (global.window/global.document).
 * - pathToFile: caminho relativo ao repositório ou absoluto
 * - options.contextProps: propriedades a serem adicionadas ao `global` antes de executar (mocks)
 * - options.beforeEval: função executada antes do eval (para criar elementos etc)
 * Retorna o objeto `global` (onde window/document estão disponíveis pelo ambiente do Jest).
 */
function loadScriptInJSDOM(pathToFile, options = {}) {
	const repoRoot = path.resolve(__dirname, '..', '..');
	const absolutePath = path.isAbsolute(pathToFile) ? pathToFile : path.resolve(repoRoot, pathToFile);
	const code = fs.readFileSync(absolutePath, 'utf8');

	// Remover blocos de import/export (incluindo múltiplas linhas) para permitir execução como script comum
	const lines = code.split('\n');
	const kept = [];
	let skipping = false;
	for (let i = 0; i < lines.length; i++) {
		const raw = lines[i];
		const t = raw.trimStart();
		if (!skipping && t.startsWith('import ')) {
			skipping = true;
			if (raw.includes(';')) {
				skipping = false;
			}
			continue;
		}
		if (skipping) {
			if (raw.includes(';')) {
				skipping = false;
			}
			continue;
		}
		if (!skipping && t.startsWith('export ')) {
			continue;
		}
		kept.push(raw);
	}
	let stripped = kept.join('\n');

	// Detectar nomes de funções e variáveis (const/let/var) declaradas para expô-las ao window após execução
	const exportNames = [];
	const fnRegex = /function\s+([A-Za-z_$][0-9A-Za-z_$]*)\s*\(/g;
	let m;
	while ((m = fnRegex.exec(stripped)) !== null) {
		exportNames.push(m[1]);
	}
	const varRegex = /(?:^|\n)\s*(?:const|let|var)\s+([A-Za-z_$][0-9A-Za-z_$]*)\s*=\s*/g;
	while ((m = varRegex.exec(stripped)) !== null) {
		exportNames.push(m[1]);
	}

	// Garantir que o ambiente JSDOM fornecido pelo Jest exista (jest usa jsdom por padrão)
	if (typeof global.window === 'undefined' || typeof global.document === 'undefined') {
		throw new Error('Ambiente jsdom não encontrado. Execute os testes com Jest (ambiente jsdom).');
	}

	// Adicionar mocks/propriedades ao global
	if (options.contextProps) {
		Object.keys(options.contextProps).forEach((k) => {
			global[k] = options.contextProps[k];
			if (typeof global.window !== 'undefined') {
				try { global.window[k] = options.contextProps[k]; } catch (e) { }
			}
		});
	}

	// Executar beforeEval para criar elementos, definir location, etc
	if (options.beforeEval && typeof options.beforeEval === 'function') {
		options.beforeEval(global.window);
	}

	// Executar o script no contexto do `window`.
	let exportSnippet = '';
	if (exportNames.length > 0) {
		const unique = Array.from(new Set(exportNames));
		const pairs = unique.map((n) => `${JSON.stringify(n)}: typeof ${n} !== 'undefined' ? ${n} : undefined`).join(', ');
		exportSnippet = `\nwindow.__tmp_exports = { ${pairs} };`;
	}

	const wrapped = `with (window) {\n${stripped}\n}${exportSnippet}`;
	const runner = new Function('window', 'document', 'fetch', 'localStorage', 'location', wrapped);

	const fetchArg = global.fetch || undefined;
	const localStorageArg = global.localStorage || undefined;
	const locationArg = global.location || undefined;

	runner(global.window, global.document, fetchArg, localStorageArg, locationArg);

	if (global.window && global.window.__tmp_exports) {
		Object.keys(global.window.__tmp_exports).forEach((k) => {
			if (typeof global.window.__tmp_exports[k] !== 'undefined') {
				global.window[k] = global.window.__tmp_exports[k];
			}
		});
		try { delete global.window.__tmp_exports; } catch (e) {}
	}

	return global.window;
}

module.exports = { loadScriptInJSDOM };

