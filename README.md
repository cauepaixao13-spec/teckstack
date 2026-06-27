# ⚡ TechStack Manager

Aplicação web para gestão de hardware e periféricos, com controle de preços e acompanhamento de status de compra.

## 🚀 Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Abrir no navegador
# http://localhost:5173
```

## 📦 Build para produção

```bash
npm run build
npm run preview
```

---

## ✨ Funcionalidades

| Feature | Descrição |
|---|---|
| **CRUD Completo** | Adicionar, editar e excluir peças/periféricos |
| **14 Categorias** | CPU, GPU, RAM, Placa-mãe, Armazenamento, Fonte, Gabinete, Refrigeração, Monitor, Teclado, Mouse, Headset, Periférico, Outros |
| **Gestão de Preços** | Preço Atual, Preço Desejado e cálculo automático do Delta (Δ) |
| **3 Status** | 🛒 Quero Comprar · ✅ Comprado · 👁 Observando |
| **Dashboard** | Valor total atual, meta de preço, economia potencial, já investido |
| **Filtros** | Busca por texto, filtro por categoria e status |
| **Ordenação** | 8 critérios de ordenação |
| **Persistência** | Dados salvos no localStorage do navegador |
| **Exportação CSV** | Exportar lista completa para planilha |
| **Responsivo** | Funciona em desktop e mobile |

---

## 🎨 Stack

- **React 18** com Hooks (`useState`, `useEffect`, `useMemo`)
- **Vite** como bundler
- **Inline Styles** com design system próprio (Dark Mode profissional)
- **localStorage** para persistência local

---

## 🔮 Próximos Passos

### Migração para Angular (via Claude Code)
Este projeto React é a versão demo. Para a versão Angular com Signals:
```bash
# No terminal com Claude Code instalado:
claude "Implemente o TechStack Manager em Angular 18+ usando Signals..."
```

### Migração para Supabase
O storage está isolado em `src/App.jsx` no objeto `db`:
```js
const db = {
  async load() { /* trocar por supabase.from('items').select() */ },
  async save(data) { /* trocar por supabase.from('items').upsert(data) */ }
}
```

### Exportação para PDF
Expandir a função `exportCSV` em `src/App.jsx` usando:
```bash
npm install jspdf jspdf-autotable
# ou
npm install @react-pdf/renderer
```

---

## 📁 Estrutura do Projeto

```
techstack-manager/
├── index.html              # Entry point HTML
├── package.json            # Dependências
├── vite.config.js          # Configuração do Vite
├── public/
│   └── favicon.svg         # Ícone da aplicação
└── src/
    ├── main.jsx            # Bootstrap React
    └── App.jsx             # Aplicação completa
                            # (componentes, storage, lógica)
```

---

## 🏗️ Decisões Arquiteturais

**Estado reativo** — O helper `mutate(fn)` centraliza toda escrita de dados e persiste automaticamente, equivalente ao `effect` do Angular Signals.

**Computed values** — Todos os valores derivados (totais, deltas, lista filtrada) vivem em `useMemo`, que mapeia diretamente para `computed` signals do Angular.

**Assinatura visual** — O glow esmeralda radial em itens *Comprado* é o diferencial de UX: representa a peça conquistada brilhando no setup.

---

Feito com ⚡ e muita vontade de montar o setup dos sonhos.
