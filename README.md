# 🧠 MindSync

> **Esvazie sua mente. Deixe a IA organizar tudo para você.**

MindSync é um aplicativo SaaS pessoal de captura de pensamentos com classificação automática por IA. Digite qualquer coisa no Magic Input e a inteligência artificial organiza automaticamente em categorias.

![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![Gemini](https://img.shields.io/badge/Gemini-3_Flash-purple)

---

## ✨ Features

- 🎯 **Magic Input** - Digite qualquer texto e a IA classifica automaticamente
- 📊 **Dashboard** - Estatísticas em tempo real das suas entradas
- 📁 **4 Categorias** - Doméstico, Trabalho, Faculdade, Ideias
- ✏️ **Edição completa** - Edite e exclua entradas
- 📦 **Exportação** - JSON e CSV para backup
- 📱 **Responsivo** - Funciona perfeitamente no mobile
- 🎨 **Animações** - Interface fluida com Framer Motion

---

## 🚀 Tech Stack

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 19, Vite, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **State** | React Query (TanStack) |
| **Auth** | Supabase Auth |
| **Database** | Supabase PostgreSQL |
| **AI** | Google Gemini 3 Flash (Edge Function) |
| **Animations** | Framer Motion |

---

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- NPM ou Yarn
- Conta no [Supabase](https://supabase.com)

### Setup

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/mindsync.git
   cd mindsync
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   Edite o `.env` com suas credenciais do Supabase:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. Acesse `http://localhost:5173`

---

## 🗄️ Configuração do Supabase

### Banco de Dados
Execute as migrations na ordem correta no SQL Editor do Supabase:
- `supabase/migrations/20240207000000_init_schema.sql`

### Edge Functions
A Edge Function `classify-entry` já está deployada no projeto. Se precisar redeployar:
```bash
supabase functions deploy classify-entry
```

### Variáveis de Ambiente (Edge Functions)
Configure no Dashboard do Supabase → Edge Functions → Secrets:
- `GEMINI_API_KEY`: Sua chave da API do Google AI Studio

---

## 🔒 Segurança

- ✅ RLS (Row Level Security) ativo em todas as tabelas
- ✅ Autenticação via Supabase Auth
- ✅ Chaves de API protegidas via variáveis de ambiente
- ✅ `.env` no `.gitignore`

Veja a análise completa em: `docs/SECURITY-ANALYSIS.md`

---

## 🌐 Deploy na Vercel

1. **Conecte seu repositório GitHub à Vercel**

2. **Configure as variáveis de ambiente**:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key
   ```

3. **Deploy automático** a cada push na branch `main`

---

## 📄 Licença

MIT © 2026

---

Feito com ❤️ e ☕ por [Lucas Porto]
