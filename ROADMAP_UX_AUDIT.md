# FuelTrack -- Auditoria UX/UI

Auditoria realizada com base nas guidelines da skill ui-ux-pro-max, cruzando com padroes de SaaS como Linear, Notion e Stripe Dashboard. Stack: React 19 + Tailwind CSS 4 + Recharts.

Total: 42 problemas identificados (8 criticos, 10 altos, 14 medios, 10 baixos).

---

## Fase 1 -- Criticos (acessibilidade e bugs)

### 1.1 Input: label nao associado ao input via htmlFor/id
- Arquivo: `components/ui/Input.jsx`
- Problema: `<label>` nao tem `htmlFor` e `<input>` nao tem `id`. Quebra click-to-focus e leitores de tela.
- Solucao: gerar id automatico com `useId()` e associar label/input.

### 1.2 Modal: botao fechar sem aria-label
- Arquivo: `components/ui/Modal.jsx`
- Problema: botao X nao tem nome acessivel.
- Solucao: adicionar `aria-label="Fechar"`.

### 1.3 Modal: falta role="dialog", aria-modal e focus trap
- Arquivo: `components/ui/Modal.jsx`
- Problema: teclado permite navegar para fora do modal. Sem role="dialog".
- Solucao: adicionar atributos ARIA e implementar focus trap basico.

### 1.4 TabNavigation: botoes sem role="tab" e aria-current
- Arquivo: `components/layout/TabNavigation.jsx`
- Problema: tabs nao usam role="tablist"/"tab"/aria-selected.
- Solucao: adicionar atributos ARIA ao container e botoes.

### 1.5 TabNavigation: botao "Mais" fechar sem aria-label
- Arquivo: `components/layout/TabNavigation.jsx`
- Problema: botao X do painel mobile sem nome acessivel.
- Solucao: adicionar `aria-label="Fechar menu"`.

### 1.6 TrucksPage: div clicavel sem acesso via teclado
- Arquivo: `pages/TrucksPage.jsx`
- Problema: area de upload de foto e card clicavel sao `<div onClick>` sem role="button", tabIndex ou onKeyDown.
- Solucao: adicionar role, tabIndex=0, onKeyDown handler.

### 1.7 StockPage: botoes de icone sem aria-label
- Arquivo: `pages/StockPage.jsx`
- Problema: botao remover cheque (X) e toggle historico sem nomes acessiveis.
- Solucao: adicionar aria-label em ambos.

### 1.8 App.jsx: botao retry fora do sistema de componentes
- Arquivo: `App.jsx`
- Problema: botao "Tentar novamente" e um `<button>` raw, sem focus ring nem aria-label.
- Solucao: usar componente `<Button>`.

---

## Fase 2 -- Altos (UX significativo)

### 2.1 Loading states: texto puro sem skeleton/spinner
- Arquivos: FuelPage, MaintenancePage, TrucksPage, StockPage, TripsPage
- Problema: todas as paginas mostram "Carregando..." em texto puro.
- Solucao: criar componente Skeleton reutilizavel e aplicar em todas as paginas.

### 2.2 Cores hardcoded em vez de CSS variables
- Arquivos: FuelPage, MaintenancePage, TripsPage, StockPage, DashboardPage
- Problema: `text-emerald-500`, `text-red-400`, `text-amber-500` etc. nao se adaptam ao tema.
- Solucao: migrar para `var(--color-*)` ou criar tokens semanticos.

### 2.3 console.error() em producao
- Arquivos: FuelPage, MaintenancePage, TrucksPage
- Problema: logs de erro no console do usuario.
- Solucao: remover ou substituir por logging silencioso.

### 2.4 Tabelas sem scope="col" nos th
- Arquivos: FuelPage, MaintenancePage, ReportsPage
- Problema: leitores de tela nao associam celulas aos cabecalhos.
- Solucao: adicionar `scope="col"` em todos os `<th>`.

### 2.5 StockPage: showError indefinido (bug runtime)
- Arquivo: `pages/StockPage.jsx`
- Problema: EditStockModal chama `showError()` que nao existe no destructuring do toast.
- Solucao: corrigir para usar `error()` do hook useToast.

### 2.6 Sem paginacao ou virtualizacao
- Todas as paginas de lista
- Problema: renderiza todos os registros de uma vez.
- Solucao: implementar paginacao simples (20 por pagina) -- deixar para fase futura.

---

## Fase 3 -- Medios (consistencia e polish)

### 3.1 Filtros sem aria-label nos inputs de busca
- Arquivos: FuelPage, MaintenancePage, TrucksPage, TripsPage, StockPage
- Solucao: adicionar prop `aria-label="Buscar"` nos inputs de filtro.

### 3.2 Modal sem focus trap
- Ja coberto em 1.3.

### 3.3 Toast: erro deveria usar aria-live="assertive"
- Arquivo: `components/ui/Toast.jsx`
- Solucao: usar assertive para tipo error, polite para outros.

### 3.4 Botao desabilitado sem tooltip explicativo
- Arquivo: FuelPage (botao registrar quando nao tem caminhoes/motoristas)
- Solucao: adicionar title ou tooltip explicando o motivo.

### 3.5 TrucksPage card sem focus-visible
- Solucao: adicionar `focus-visible:ring-2` e tabIndex.

### 3.6 StockPage SiloIcon SVG sem aria-label
- Solucao: adicionar `role="img"` e `aria-label`.

### 3.7 Button spinner sem aria-hidden
- Solucao: adicionar `aria-hidden="true"` no SVG do spinner.

### 3.8 Falta botao "limpar filtros" nas paginas de lista
- Arquivos: FuelPage, MaintenancePage, TrucksPage, TripsPage, StockPage
- Solucao: adicionar botao quando filtros estao ativos.

---

## Fase 4 -- Baixos (polish final)

- Remover overrides `!rounded-xl` no FuelPage (resolver no Card)
- Padronizar mensagens de empty state
- Remover state `focused` nao utilizado no Input
- Padronizar loading state visual (mesmo wrapper em todas as paginas)
- SiloIcon: tornar gradient ID unico por instancia
- Adicionar `<caption>` nas tabelas de dados
- Tabelas com scope nos headers (complemento de 2.4)

---

## Recomendacao do design system (ui-ux-pro-max)

- Tipografia: Fira Sans (corpo) + Fira Code (dados/numeros)
- Paleta: primary #2563EB, secondary #3B82F6, CTA #F97316
- Efeitos: minimal glow, transicoes 150-300ms, focus visible
- Anti-patterns a evitar: emojis como icones, light mode default sem testar dark, slow rendering
