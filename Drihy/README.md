# 🛒 Drihy — E‑commerce

O **Drihy** é uma aplicação web de e‑commerce desenvolvida com foco em **navegação simples**, **velocidade**, **componentização** e **boa arquitetura de desenvolvimento**.  
O projeto foi construído seguindo princípios modernos de organização, testes, documentação e boas práticas gerais — ideal para crescimento futuro e escalabilidade.

---

## 🚀 Objetivo do Projeto

Criar um e‑commerce funcional que permita:

- Exibir produtos
- Criar e gerenciar carrinho
- Autenticar usuários
- Registrar compras
- Oferecer uma experiência leve e responsiva

---

## 🧱 Arquitetura e Tecnologias

O projeto utiliza uma arquitetura limpa dividida em camadas:

```
/Drihy
 ├── assets/         -> imagens e logo do site
 ├── css/            -> arquivos de estilo
 ├── js/             -> lógica da aplicação e configs do Firebase
 ├── cart.html       -> tela do carrinho de compras
 ├── index.html      -> página inicial
 ├── login.html      -> tela de login
 ├── profile.html    -> tela de perfil do usuário
 ├── shop.html       -> vitrine de produtos
 ├── signup.html     -> tela de cadastro
 └── ... (outros htmls)
```

### 🔧 Principais ferramentas

- **JavaScript ES6+**
- **HTML5 + CSS3**
- **Jest** para testes unitários e de integração
- **Babel** para compatibilidade de código
- **Node.js + npm**
- **Fetch API / Axios**

---

## 🧪 Testes Implementados

- **10+ testes unitários:**  
  Lógica de negócio, funções puras, validação de dados e componentes.

- **5+ testes de integração:**  
  Testando rotas e comunicação entre módulos.

- **Cobertura de testes:**  
  Geração automática via:

```
npm test -- --coverage
```

Saídas geradas:
- `/coverage/lcov-report/index.html`
- Relatório em texto
- Relatório HTML

---

## 📦 Funcionalidades do E‑commerce

- Cadastro e login de usuários  
- Listagem de produtos  
- Página de detalhes  
- Carrinho completo  
- Confirmação da Compra via Email
- Validação
- Responsividade  
- Design Minimalista  

---

## 🧰 Instalação dos Testes

```
npm install
```

### Rodar servidor
```
npm start
```

### Rodar testes
```
npm test
```

### Cobertura
```
npm test -- --coverage
```

## 🧰 Instalação para DEV pelo VSCode
- Instalar a Extensão Live Server
- Abrir o arquivo Pelo VSCode 
- - Botão direito no Index.html
- - Open With Live Server


---

## 📁 Estrutura Completa

```
Drihy/
├── assets/              (imagens e logo)
├── css/                 (arquivos .css)
│   ├── header.css
│   ├── cart.css
│   └── ...
├── js/                  (arquivos .js e configs)
│   ├── firebase-config.js
│   ├── mobile-navbar.js
│   ├── cart.js
│   └── ...
├── .firebaserc          (Config do Firebase)
├── firebase.json        (Config do Firebase)
├── index.html
├── cart.html
├── login.html
├── profile.html
└── ... (outros htmls)
```

---

## 🔗 Repositório

➡️ **GitHub:** https://github.com/kauajsoares/drihy

---

## 🏁 Conclusão

O Drihy representa um e‑commerce com designe minimalista, modular e pronto para evolução.  
Projeto documentado, testado e estruturado para apresentar ou publicar.

