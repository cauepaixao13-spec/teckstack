# ⚡ TechStack Manager — com Supabase

## 🚀 Setup em 3 passos

### 1. Criar a tabela no Supabase
- Acesse **supabase.com → seu projeto → SQL Editor**
- Clique em **New Query**
- Cole o conteúdo do arquivo `schema.sql`
- Clique em **Run**

### 2. Instalar e rodar
```bash
npm install
npm run dev
# → http://localhost:5173
```

### 3. Deploy no Vercel
```bash
# Framework: Vite
# Build Command: npm run build
# Output Directory: dist
```

---

## 📁 Estrutura

```
techstack-manager/
├── schema.sql              ← Execute no Supabase SQL Editor
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx
    ├── supabase.js         ← Configuração do cliente Supabase
    └── App.jsx             ← Aplicação completa
```

---

## 🔮 Próximos passos

### Autenticação (multi-usuário)
```js
// src/supabase.js — adicionar auth
const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
```

### Exportação para PDF
```bash
npm install jspdf jspdf-autotable
```

Expanda a função `exportCSV` em `App.jsx` para usar jsPDF.
