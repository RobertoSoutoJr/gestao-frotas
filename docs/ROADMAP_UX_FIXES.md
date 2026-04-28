# Roadmap de Correções UX/UI — FuelTrack

> Gerado em 24/03/2026 | 29 problemas identificados | Prioridade: Crítico → Maior → Menor

---

## 🔴 CRÍTICOS

### 1. Toast duplo em toda operação CRUD
- **Problema**: `handleRefetch` no App.jsx dispara `success('Dados atualizados')` em cima do toast individual da operação.
- **Solução**: Remover o toast de dentro de `handleRefetch`. Manter apenas o toast da operação específica.
- **Arquivo**: `App.jsx`
- **Esforço**: 5 min

### 2. `alert()` misturado com toasts
- **Problema**: TripsPage e StockPage usam `alert()` nativo para validação. Todo o resto usa `useToast()`.
- **Solução**: Substituir todos os `alert()` por chamadas `error()` do `useToast()`.
- **Arquivos**: `TripsPage.jsx`, `StockPage.jsx`
- **Esforço**: 15 min

### 3. ReportsPage acessa campos inexistentes
- **Problema**: Tabela de abastecimentos usa `record.preco_litro` e `record.km_atual` que não existem. Campos corretos: calcular preço/litro e usar `km_registro`.
- **Solução**: Corrigir os nomes dos campos na tabela de fuel do ReportsPage.
- **Arquivo**: `ReportsPage.jsx`
- **Esforço**: 5 min

### 4. Texto "arraste para reordenar" sem drag-and-drop
- **Problema**: SectionCustomizer diz "arraste para reordenar" mas só tem setas ↑↓.
- **Solução**: Trocar texto para "Use as setas para reordenar".
- **Arquivo**: `SectionCustomizer.jsx`
- **Esforço**: 1 min

### 5. `dark:` hardcoded conflitando com CSS Variables
- **Problema**: Vários componentes usam `dark:bg-zinc-800`, `dark:text-zinc-50` etc. enquanto o tema usa `var(--color-*)`.
- **Solução**: Substituir todas as classes `dark:*` e cores hardcoded (`text-zinc-900`, `bg-zinc-800`) por `var(--color-*)`.
- **Arquivos**: `TrucksPage.jsx`, `TripsPage.jsx`, `StockPage.jsx`, `ClientsPage.jsx`, `SuppliersPage.jsx`
- **Esforço**: 30 min

### 6. Botões de salvar inconsistentes
- **Problema**: Edit modals usam `variant="success"` em Drivers/Clients/Suppliers, mas `variant="primary"` em Trucks/Fuel/Maintenance.
- **Solução**: Padronizar todos para `variant="primary"`. Create forms idem.
- **Arquivos**: `DriversPage.jsx`, `ClientsPage.jsx`, `SuppliersPage.jsx`, `TripsPage.jsx`, `StockPage.jsx`
- **Esforço**: 10 min

### 7. Loading states inconsistentes
- **Problema**: Cada página mostra loading de um jeito diferente. Algumas nem têm.
- **Solução**: Criar componente `LoadingSkeleton` reutilizável (spinner + texto). Usar em todas as páginas.
- **Arquivos**: `FuelPage.jsx`, `MaintenancePage.jsx`, `TripsPage.jsx`, `StockPage.jsx`
- **Esforço**: 20 min

### 8. Botões de ícone sem `aria-label`
- **Problema**: Edit/Delete nas tabelas são botões só com ícone, sem acessibilidade.
- **Solução**: Adicionar `aria-label="Editar"` e `aria-label="Excluir"` em todos os botões de ícone.
- **Arquivos**: `FuelPage.jsx`, `MaintenancePage.jsx`, `TrucksPage.jsx`, `DriversPage.jsx`, `ClientsPage.jsx`, `SuppliersPage.jsx`
- **Esforço**: 15 min

### 9. Sem retry em erro de carregamento
- **Problema**: App.jsx mostra card de erro sem botão de recarregar.
- **Solução**: Adicionar botão "Tentar novamente" que chama `refetch()` no card de erro.
- **Arquivo**: `App.jsx`
- **Esforço**: 5 min

### 10. Cards de Drivers/Clients/Suppliers quebram no mobile
- **Problema**: Layout `flex justify-between` sem breakpoint responsivo. Botões competem com texto.
- **Solução**: Converter para layout de tabela (igual Fuel/Maintenance) ou ajustar com `flex-col sm:flex-row`.
- **Arquivos**: `DriversPage.jsx`, `ClientsPage.jsx`, `SuppliersPage.jsx`
- **Esforço**: 30 min

---

## 🟠 MAIORES

### 11. Constantes duplicadas em múltiplos arquivos
- **Problema**: `MAINTENANCE_TYPES`, `ESTADOS_BR`, `PRODUTOS_OPCOES`, `FORMAS_PAGAMENTO` repetidos.
- **Solução**: Criar `frontend/src/lib/constants.js` centralizado. Importar de lá.
- **Esforço**: 20 min

### 12. `FORMAS_PAGAMENTO` com formato diferente
- **Problema**: Trips usa `{value, label}`, Stock usa strings simples.
- **Solução**: Padronizar como `{value, label}` no constants.js. Ajustar StockPage.
- **Esforço**: 10 min

### 13. Sem aviso ao fechar modal com formulário sujo
- **Problema**: Usuário pode perder dados digitados ao clicar fora do modal.
- **Solução**: Adicionar `onBeforeClose` no Modal que verifica se o form mudou. Mostrar ConfirmDialog.
- **Esforço**: 30 min

### 14. Card hover em todos os cards (inclusive não-clicáveis)
- **Problema**: Efeito hover implica que o card é clicável quando não é.
- **Solução**: Adicionar prop `interactive` no Card. Só aplicar hover/cursor quando `onClick` existe.
- **Arquivo**: `Card.jsx`
- **Esforço**: 10 min

### 15. Sem badge/indicador visual de filtros ativos
- **Problema**: Usuário não percebe que tem filtro ativo (só vê "X de Y" no título).
- **Solução**: Mostrar badge com contagem de filtros ativos no botão "Filtros". Adicionar "Limpar filtros" ao lado.
- **Esforço**: 20 min

### 16. Gráficos sem estado vazio
- **Problema**: Charts mostram eixos vazios quando não há dados.
- **Solução**: Verificar se todos os valores são 0 e mostrar EmptyState no lugar.
- **Arquivo**: `DashboardPage.jsx`
- **Esforço**: 10 min

### 17. `formatCPF` não lida com CPFs já formatados
- **Problema**: Se CPF já vem formatado (xxx.xxx.xxx-xx), a regex falha.
- **Solução**: Stripar não-dígitos antes de formatar.
- **Arquivo**: `utils.js`
- **Esforço**: 5 min

### 18. Cores monetárias inconsistentes
- **Problema**: Cada página usa cores diferentes para valores financeiros.
- **Solução**: Definir padrão: combustível=amber, manutenção=red, frete=emerald, estoque=blue. Documentar e aplicar.
- **Esforço**: 20 min

---

## 🟡 MENORES

### 19. `useMemo` com dependência frágil no Dashboard
- **Problema**: `filterByPeriod` não é memoizada e é usada dentro de `useMemo`.
- **Solução**: Mover `filterByPeriod` para dentro do `useMemo` ou usar `useCallback`.
- **Esforço**: 5 min

### 20. Layout inconsistente entre páginas
- **Problema**: Trucks=grid, Fuel/Maint=tabela, Drivers/Clients/Suppliers=lista.
- **Solução**: Será resolvido no item 10 (converter Drivers/Clients/Suppliers para tabela).
- **Esforço**: Incluído no item 10

### 21. Edit modals não resetam state se React reusar instância
- **Problema**: `useState` initializer não re-executa se componente for reusado.
- **Solução**: Adicionar `key={entity.id}` no componente do modal para forçar remount.
- **Esforço**: 5 min

### 22. Sem `max-width` nos inputs dentro de modais XL
- **Problema**: Inputs ficam muito esticados em telas 4K.
- **Solução**: Adicionar `max-w-4xl mx-auto` no conteúdo interno de modais grandes.
- **Esforço**: 5 min

### 23. Tab navigation sem roles ARIA
- **Problema**: Sem `role="tablist"`, `role="tab"`, `aria-selected`.
- **Solução**: Adicionar roles e atributos ARIA no TabNavigation.
- **Arquivo**: `TabNavigation.jsx`
- **Esforço**: 10 min

### 24. Recharts não respeita `prefers-reduced-motion`
- **Problema**: Animações dos gráficos continuam mesmo com reduced-motion ativo.
- **Solução**: Ler `window.matchMedia('(prefers-reduced-motion: reduce)')` e passar `isAnimationActive={false}`.
- **Esforço**: 10 min

### 25. Campos de data sem `min`/`max`
- **Problema**: Usuário pode inserir datas como 01/01/1900 ou 31/12/2099.
- **Solução**: Adicionar `min="2020-01-01"` e `max={hoje}` nos campos de data relevantes.
- **Esforço**: 10 min

### 26. Bottom nav pode sobrepor conteúdo
- **Problema**: Em viewports curtas, o padding-bottom pode não ser suficiente.
- **Solução**: Usar `env(safe-area-inset-bottom)` e garantir `pb-28` no container principal.
- **Esforço**: 5 min

### 27. Background animado pode drenar bateria
- **Problema**: Animação CSS `float 18s` com backdrop-filter roda continuamente.
- **Solução**: Usar `prefers-reduced-motion: reduce` para desabilitar. Considerar remover blur em mobile.
- **Esforço**: 10 min

### 28. Sem paginação nas listas
- **Problema**: Todas as listas renderizam todos os registros. Com muitos dados, trava.
- **Solução**: Implementar paginação virtual (react-window) ou paginação simples (20 por página) nas tabelas de Fuel, Maintenance, Trips e Stock.
- **Esforço**: 2h (futuro)

### 29. Sem rotas por URL (SPA sem router)
- **Problema**: Refresh perde a aba ativa. Sem deep links, sem back button.
- **Solução**: Adicionar `react-router-dom` com rotas para cada aba. Manter state de navegação na URL.
- **Esforço**: 3h (futuro)

---

## Ordem de Execução

| Fase | Itens | Tempo estimado |
|------|-------|----------------|
| **Fase 1 — Quick wins** | 1, 2, 3, 4, 9, 17, 19 | ~30 min |
| **Fase 2 — Consistência** | 5, 6, 7, 8, 11, 12 | ~1h |
| **Fase 3 — Mobile/Responsividade** | 10, 14, 15, 16, 22, 26 | ~1h |
| **Fase 4 — Polish** | 13, 18, 21, 23, 24, 25, 27 | ~1h |
| **Fase 5 — Infra (futuro)** | 28, 29 | ~5h |
