
**UNIVERSIDADE CBYK**

**LUCAS PORTO**

**MINDSYNC: SISTEMA DE GESTÃO DE PRODUTIVIDADE E METAS**

**Documentação Técnica**

**São Paulo**
**2026**

---

**1. INTRODUÇÃO**

**1.1. Objetivo**
O presente documento tem como objetivo descrever a arquitetura, funcionalidades e especificações técnicas do sistema MindSync, uma plataforma web desenvolvida para auxiliar na gestão de produtividade pessoal, acadêmica e profissional.

**1.2. Escopo**
O sistema abrange funcionalidades de Kanban para gestão de tarefas, calendário de eventos, sistema de metas (semanais e mensais), categorização de atividades (Doméstico, Trabalho, Faculdade, Ideias) e um dashboard centralizado para visualização de progresso.

---

**2. TECNOLOGIAS UTILIZADAS**

Para o desenvolvimento do sistema MindSync, foram selecionadas tecnologias modernas visando performance, escalabilidade e manutenibilidade.

**2.1. Frontend**
*   **React (v18):** Biblioteca JavaScript para construção de interfaces de usuário reativas.
*   **Vite:** Ferramenta de build e servidor de desenvolvimento de alta performance.
*   **TypeScript:** Superset do JavaScript que adiciona tipagem estática, aumentando a segurança do código.
*   **Tailwind CSS:** Framework CSS utilitário para estilização rápida e responsiva.
*   **Framer Motion:** Biblioteca para animações fluidas e interações complexas.
*   **React Query (TanStack Query):** Gerenciamento de estado servidor e cache de dados.
*   **React Router DOM:** Roteamento client-side.
*   **Lucide React:** Biblioteca de ícones vetoriais.

**2.2. Backend e Banco de Dados**
*   **Supabase:** Plataforma Backend-as-a-Service (BaaS) baseada em PostgreSQL.
*   **PostgreSQL:** Sistema gerenciador de banco de dados relacional objeto.
*   **Supabase Auth:** Sistema de autenticação e gestão de usuários.
*   **Edge Functions:** Funções serverless para lógica de backend (Deno runtime).

---

**3. ARQUITETURA DO SISTEMA**

O sistema segue uma arquitetura orientada a componentes no frontend, comunicando-se diretamente com o backend (Supabase) via API REST e WebSocket (Realtime). A segurança é garantida através de Row Level Security (RLS) no banco de dados.

**3.1. Estrutura de Diretórios (Frontend)**
*   `src/api`: Configuração do cliente Supabase.
*   `src/components`: Componentes reutilizáveis (UI) e específicos (Features/Views).
*   `src/lib`: Utilitários e funções auxiliares.
*   `src/pages`: Componentes de página (rotas).
*   `src/providers`: Contextos globais (Autenticação, Tema).
*   `src/types`: Definições de tipos TypeScript.

---

**4. MODELAGEM DE DADOS**

O banco de dados PostgreSQL foi modelado com as seguintes tabelas principais:

**4.1. Tabela `profiles`**
Armazena informações públicas dos usuários.
*   `id` (UUID, PK, FK -> auth.users): Identificador único do usuário.
*   `full_name` (Text): Nome completo.
*   `avatar_url` (Text): URL da imagem de perfil.
*   `updated_at` (Timestamp): Data de atualização.

**4.2. Tabela `categories`**
Categorias para organização das tarefas (ex: Trabalho, Faculdade).
*   `id` (UUID, PK): Identificador único.
*   `user_id` (UUID, FK -> auth.users): Dono da categoria.
*   `name` (Text): Nome da categoria.
*   `slug` (Text): Identificador amigável para URLs.
*   `icon` (Text): Nome do ícone.
*   `color` (Text): Classe de cor (Tailwind).

**4.3. Tabela `entries`**
Armazena tarefas, notas, insights e bookmarks.
*   `id` (UUID, PK): Identificador único.
*   `user_id` (UUID, FK -> auth.users): Dono do item.
*   `category_id` (UUID, FK -> categories): Categoria associada.
*   `content` (Text): Conteúdo textual.
*   `entry_type` (Text): Tipo ('task', 'note', 'insight', 'bookmark').
*   `status` (Text): Status ('pending', 'in_progress', 'done', 'archived').
*   `start_date` (Date): Data de início da tarefa.
*   `due_date` (Date): Prazo final da tarefa.
*   `metadata` (JSONB): Dados flexíveis (tags, prioridade, emoji).

**4.4. Tabela `goals`**
Gerencia as metas semanais e mensais dos usuários.
*   `id` (UUID, PK): Identificador único.
*   `user_id` (UUID): Dono da meta.
*   `title` (Text): Título da meta.
*   `emoji` (Text): Ícone representativo.
*   `target` (Int): Valor alvo.
*   `current` (Int): Progresso atual.
*   `unit` (Text): Unidade de medida (dias, vezes, km).
*   `period_type` (Text): 'weekly' ou 'monthly'.
*   `period_start` (Date): Início do período da meta.

---

**5. SEGURANÇA**

A segurança do sistema é estruturada em múltiplas camadas.

**5.1. Autenticação**
Utiliza-se o Supabase Auth para gestão de sessões e integridade de usuários. O sistema suporta login por e-mail e senha.

**5.2. Autorização (RLS)**
O acesso aos dados é controlado por Row Level Security (RLS) no PostgreSQL. Políticas estritas garantem que:
*   Usuários só podem visualizar (`SELECT`), criar (`INSERT`), atualizar (`UPDATE`) e deletar (`DELETE`) seus próprios dados (`auth.uid() = user_id`).
*   Perfis públicos podem ser visualizados por todos, mas editados apenas pelo proprietário.

**5.3. Auditoria de Código**
Realizada varredura automatizada para identificar vulnerabilidades comuns (OWASP Top 10), garantindo:
*   Ausência de segredos (API Keys) expostos no código client-side.
*   Correção de vulnerabilidades em funções de banco de dados (`security definer` com `search_path` seguro).

---

**6. GUIA DE INSTALAÇÃO E DEPLOY**

**6.1. Requisitos**
*   Node.js v18+
*   NPM ou Yarn
*   Conta no Supabase

**6.2. Instalação Local**
1.  Clonar o repositório.
2.  Instalar dependências: `npm install`.
3.  Configurar variáveis de ambiente em `.env`:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
4.  Iniciar servidor de desenvolvimento: `npm run dev`.

**6.3. Deploy em Produção**
O frontend é implantado na plataforma Vercel, com integração contínua (CI/CD) via GitHub. O banco de dados e backend permanecem hospedados no Supabase.

---

**7. CONCLUSÃO**

O sistema MindSync apresenta uma arquitetura robusta e escalável, atendendo aos requisitos funcionais de gestão de produtividade com segurança e performance. A utilização de tecnologias modernas e boas práticas de desenvolvimento (Clean Code, Componentização) garante a manutenibilidade e evolução futura do software.

**REFERÊNCIAS**

SUPABASE. Documentation. Disponível em: <https://supabase.com/docs>. Acesso em: 08 fev. 2026.
REACT. React Documentation. Disponível em: <https://react.dev/>. Acesso em: 08 fev. 2026.
TAILWIND CSS. Documentation. Disponível em: <https://tailwindcss.com/docs>. Acesso em: 08 fev. 2026.
