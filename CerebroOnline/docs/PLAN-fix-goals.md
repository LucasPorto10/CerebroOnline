# Plano de Correção: Bug na Criação de Metas e Visual

## Contexto
O usuário reportou que a tela de metas está "bugada" e não consegue criar novos itens. Também solicitou o uso do Supabase MCP para sincronizar alterações e execução de testes.

## Diagnóstico Inicial
1.  **Bug Visual:** A tela pode estar com contraste ruim ou layout quebrado após a remoção dos gradientes.
2.  **Erro na Criação:** Possível falha na mutação `createGoal` ou incompatibilidade com o schema do banco de dados (ex: campo `user_id` faltando ou RLS bloqueando).

## Tarefas
1.  **Verificação de Banco de Dados (Supabase MCP)**
    - [x] Verificar colunas da tabela `goals`. (Tabela validada, colunas corretas)
    - [x] Confirmar se `period_start` e outros campos obrigatórios estão corretos. (Schemas validados)
2.  **Correção de Código (Frontend)**
    - [x] Revisar `Goals.tsx`: Garantir check de user e logs. (Erro agora é logado)
    - [x] Revisar `AddGoalDialog.tsx`: Verificar validação. (Testes unitários cobrem isso)
    - [x] Ajustar CSS para garantir legibilidade. (Z-Index fix para Overlay bugado)
3.  **Testes Automated (Workflow `test`)**
    - [x] Instalar Framework (Vitest).
    - [x] Gerar testes unitários para `AddGoalDialog`.
    - [x] Executar testes.

## Agentes Envolvidos
- `frontend-specialist`: Ajustes visuais e React.
- `backend-specialist`: Verificação de banco de dados.
- `tester`: Geração e execução de testes.
