# Cobertura de Testes - Projeto Drihy

Este documento apresenta a estratégia utilizada para obtenção da
cobertura de testes no projeto **Drihy**, incluindo a configuração do
Jest, execução dos testes e geração dos relatórios de cobertura.

------------------------------------------------------------------------

## 📌 Configuração do Jest

Para evitar conflitos entre múltiplas configurações, o bloco `jest` foi
removido do `package.json` e um arquivo dedicado `jest.config.js` foi
criado.

### **jest.config.js**

``` js
module.exports = {
  testEnvironment: "jsdom",
  collectCoverage: true,
  collectCoverageFrom: [
    "js/**/*.js"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "tests/"
  ]
};
```

------------------------------------------------------------------------

## 📊 Como gerar a cobertura

Execute:

    npm run test:coverage

Isso gerará a pasta:

    /coverage

Dentro dela, você encontrará: - **coverage-final.json** -
**lcov-report/index.html** (relatório visual) - **text report no
terminal**

------------------------------------------------------------------------

## 📝 Interpretação da cobertura

A cobertura exibe: - **Statements (%)** - **Branches (%)** - **Functions
(%)** - **Lines (%)**

Quanto maior a porcentagem, maior a quantidade de código testado.

------------------------------------------------------------------------

## 📂 Estrutura recomendada de testes

    tests/
      unit/
      integration/
      e2e/

------------------------------------------------------------------------

## ✔ Status

Configuração concluída com sucesso e pronta para apresentação.
