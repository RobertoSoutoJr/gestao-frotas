# FuelTrack -- Plano de Desenvolvimento

Plano completo de evolucao do sistema, organizado em sprints de trabalho.
Cada sprint pode ser executada em 1-2 sessoes de desenvolvimento.

Status: [ ] Pendente | [x] Concluido | [~] Em andamento

---

## Sprint 0 -- Infraestrutura (pre-requisito para tudo)

### 0.1 React Router
- [ ] Instalar react-router-dom
- [ ] Criar estrutura de rotas: /dashboard, /trucks, /trucks/:id, /drivers, /clients, /suppliers, /trips, /stock, /fuel, /maintenance, /reports, /settings
- [ ] Migrar navegacao por estado (activeTab) para rotas reais
- [ ] Adaptar TabNavigation para usar NavLink/useLocation
- [ ] Adaptar Header para funcionar com router
- [ ] Botao voltar do navegador funcionando
- [ ] URLs compartilhaveis (copiar link leva direto a pagina)
- [ ] Redirect para /dashboard apos login
- [ ] Rota 404

**Impacto:** Resolve o maior problema estrutural. Todas as features futuras dependem de rotas funcionais.

### 0.2 Pagina de perfil/configuracoes
- [ ] Rota /settings
- [ ] Exibir dados do usuario (nome, email, empresa, telefone)
- [ ] Formulario de edicao de perfil
- [ ] Troca de senha (senha atual + nova senha)
- [ ] Backend: PUT /auth/profile, PUT /auth/password
- [ ] Upload de foto de perfil (Supabase Storage)

**Impacto:** Basico para qualquer sistema com autenticacao.

### 0.3 Pendencias anteriores
- [ ] TruckDetailModal: clicar no card do caminhao abre detalhamento (corrigir useState->useEffect, adicionar state, click handler)
- [ ] Abastecimentos e Manutencoes em formato lista (trocar cards por tabelas)
- [ ] Paginacao simples nas listas (20 por pagina, com botoes anterior/proximo)

---

## Sprint 1 -- KPIs e Metricas Inteligentes

### 1.1 Indicadores calculados por caminhao
- [ ] Custo por km rodado (total gasto / km rodado)
- [ ] Consumo medio (km/litro) baseado nos abastecimentos
- [ ] Custo medio por abastecimento
- [ ] Frequencia de manutencao (dias entre manutencoes)
- [ ] Comparativo com media da frota (acima/abaixo)

### 1.2 Indicadores gerais da frota
- [ ] Taxa de disponibilidade (% caminhoes sem manutencao pendente)
- [ ] Custo operacional por saca transportada
- [ ] Frete medio por viagem
- [ ] Lucro bruto estimado (frete total - custos totais)
- [ ] Tendencia mes a mes (subiu/desceu X%)

### 1.3 Componente KPI Card
- [ ] Criar componente reutilizavel com: valor, comparativo, seta tendencia, sparkline mini
- [ ] Integrar no Dashboard como secao personalizavel
- [ ] Integrar na pagina de Relatorios

**Impacto:** Transforma o sistema de "registro de dados" para "ferramenta de decisao". Alto valor percebido.

---

## Sprint 2 -- Mapa de Viagens

### 2.1 Integracao com Leaflet (gratuito, sem API key)
- [ ] Instalar react-leaflet + leaflet
- [ ] Componente MapView reutilizavel
- [ ] Geocodificacao de enderecos (origem/destino das viagens) via Nominatim (gratuito)

### 2.2 Mapa na pagina de Viagens
- [ ] Exibir mapa com marcadores de origem e destino de cada viagem
- [ ] Ao clicar na viagem, centralizar no mapa
- [ ] Cores diferentes para viagens ativas vs finalizadas
- [ ] Linha conectando origem-destino

### 2.3 Mapa resumo no Dashboard
- [ ] Mini mapa mostrando todas as viagens ativas
- [ ] Secao personalizavel no dashboard
- [ ] Cluster de marcadores quando muitos pontos

### 2.4 Ajuste no banco de dados
- [ ] Adicionar campos latitude/longitude em viagens (ou geocodificar sob demanda)
- [ ] Considerar cache de geocodificacao para nao repetir chamadas

**Impacto:** Visualmente o mais impressionante. Diferencial forte em apresentacao.

---

## Sprint 3 -- Centro de Custo por Viagem

### 3.1 Modelo de dados expandido
- [ ] Tabela viagem_custos: viagem_id, tipo (combustivel, pedagio, alimentacao, outros), descricao, valor
- [ ] Vincular abastecimentos a viagens (campo viagem_id em abastecimentos)
- [ ] Vincular manutencoes a viagens quando aplicavel

### 3.2 Registro de custos na viagem
- [ ] Formulario de adicionar custo a uma viagem (tipo, descricao, valor)
- [ ] Permitir vincular abastecimento existente a viagem
- [ ] Registrar pedagios, alimentacao, hospedagem

### 3.3 Calculo de rentabilidade
- [ ] Ao finalizar viagem: frete recebido - soma de custos = lucro/prejuizo
- [ ] Badge visual: verde (lucro), vermelho (prejuizo), amarelo (margem baixa)
- [ ] Historico de rentabilidade por viagem

### 3.4 Relatorio de rentabilidade
- [ ] Tabela com todas as viagens e seus custos detalhados
- [ ] Filtro por periodo, caminhao, cliente
- [ ] Grafico de rentabilidade ao longo do tempo

**Impacto:** Dado mais valioso para o transportador. Mostra resolucao de problema real.

---

## Sprint 4 -- Alertas Inteligentes

### 4.1 Motor de alertas
- [ ] Tabela alert_rules: tipo, parametros, ativo
- [ ] Service que verifica regras e gera alertas
- [ ] Tabela alerts: tipo, mensagem, entidade_id, lido, created_at

### 4.2 Tipos de alerta
- [ ] Manutencao preventiva vencendo (baseado em km ou dias desde ultima)
- [ ] CNH do motorista perto de vencer (campo vencimento_cnh em motoristas)
- [ ] Consumo anomalo (caminhao gastou X% mais que a media)
- [ ] Pagamento de estoque vencido
- [ ] Seguro/licenciamento vencendo (campos em caminhoes)

### 4.3 Interface de alertas
- [ ] Icone de sino no Header com badge de contagem
- [ ] Dropdown/pagina de alertas com lista
- [ ] Marcar como lido / dispensar
- [ ] Configurar quais alertas quer receber (na pagina de settings)

### 4.4 Campos novos no banco
- [ ] motoristas: vencimento_cnh, categoria_cnh
- [ ] caminhoes: vencimento_seguro, vencimento_licenciamento, km_proxima_revisao
- [ ] Migracoes para adicionar os campos

**Impacto:** Mostra que o sistema "pensa" e antecipa problemas. Diferencial tecnico.

---

## Sprint 5 -- Modulo de Documentos

### 5.1 Supabase Storage
- [ ] Configurar bucket "documents" no Supabase
- [ ] Service de upload/download no backend
- [ ] Validacao de tipo de arquivo (PDF, imagem) e tamanho max (5MB)

### 5.2 Upload vinculado a entidades
- [ ] Caminhoes: CRLV, foto, seguro
- [ ] Motoristas: CNH (frente/verso), foto
- [ ] Manutencoes: nota fiscal, fotos do servico
- [ ] Estoque: notas fiscais de compra, comprovantes de pagamento
- [ ] Viagens: comprovante de entrega, canhotos

### 5.3 Visualizacao
- [ ] Galeria de documentos por entidade
- [ ] Preview de imagens inline
- [ ] Download de PDFs
- [ ] Icone indicando quais entidades tem documentos anexados

**Impacto:** Substitui a pasta de papeis do escritorio. Valor pratico real.

---

## Sprint 6 -- Rentabilidade por Cliente

### 6.1 Calculos
- [ ] Para cada cliente: total de frete gerado
- [ ] Para cada cliente: custos associados (combustivel + manutencao das viagens dele)
- [ ] Margem por cliente = frete - custos
- [ ] Ranking de clientes por rentabilidade

### 6.2 Interface
- [ ] Secao na pagina de Relatorios
- [ ] Tabela: cliente, viagens, frete total, custo total, margem, %
- [ ] Grafico de barras comparativo
- [ ] Indicador visual: verde/amarelo/vermelho por margem
- [ ] Secao personalizavel no dashboard

**Impacto:** Nenhum sistema basico de frotas faz isso. Diferencial de negocio.
**Depende de:** Sprint 3 (centro de custo por viagem).

---

## Sprint 7 -- Dashboard do Motorista (RBAC)

### 7.1 Controle de acesso por perfil
- [ ] Campo role em users: 'admin' (dono) ou 'motorista'
- [ ] Admin pode criar contas de motorista vinculadas a ele
- [ ] Middleware de permissao no backend
- [ ] Frontend: renderizar interface diferente baseado no role

### 7.2 Interface do motorista
- [ ] Dashboard simplificado: viagens atribuidas, resumo de abastecimentos
- [ ] Registrar abastecimento pelo celular (formulario simplificado)
- [ ] Registrar ocorrencia na estrada (tipo, descricao, foto)
- [ ] Ver historico proprio (so dele, nao da frota inteira)

### 7.3 Interface do admin
- [ ] Gerenciar contas de motorista (criar, desativar)
- [ ] Ver registros feitos pelos motoristas
- [ ] Aprovar/rejeitar registros se necessario

**Impacto:** Demonstra RBAC (controle de acesso baseado em perfil). Diferencial tecnico e academico.

---

## Sprint 8 -- Exportacao e Integracao

### 8.1 Exportar dados
- [ ] CSV: exportar qualquer tabela/relatorio
- [ ] PDF: relatorio formatado com logo e periodo (usar jsPDF ou react-pdf)
- [ ] Botao de exportar em todas as paginas de lista e relatorios

### 8.2 Tabela ANTT (opcional, diferencial regulatorio)
- [ ] Consultar piso minimo de frete por eixo/distancia
- [ ] Validar se o valor de frete cadastrado esta acima do piso
- [ ] Alerta quando frete abaixo do minimo legal

### 8.3 PWA (opcional, diferencial tecnico)
- [ ] manifest.json + service worker
- [ ] Cache de dados para consulta offline
- [ ] Fila de sincronizacao para registros feitos offline
- [ ] Icone na tela inicial do celular

**Impacto:** Exportacao e basico e esperado. ANTT mostra conhecimento do dominio. PWA e diferencial tecnico.

---

## Sprint 9 -- Polish Final

### 9.1 UX Audit restante
- [ ] Fase 3 do ROADMAP_UX_AUDIT.md (medios)
- [ ] Fase 4 do ROADMAP_UX_AUDIT.md (baixos)
- [ ] Cores hardcoded -> CSS variables
- [ ] Remover console.error em producao
- [ ] Skeleton loading em todas as paginas

### 9.2 Performance
- [ ] Code splitting por rota (React.lazy + Suspense)
- [ ] Virtualizacao de listas longas (react-window)
- [ ] Otimizar bundle (separar recharts, leaflet em chunks)

### 9.3 Testes
- [ ] Testes unitarios nos validators (Zod)
- [ ] Testes de integracao nas rotas da API
- [ ] Testes E2E no fluxo critico (login -> cadastrar caminhao -> registrar abastecimento)

---

## Resumo visual

```
Sprint 0  [Infraestrutura]     Router + Perfil + Pendencias
Sprint 1  [KPIs]               Metricas inteligentes
Sprint 2  [Mapa]               Leaflet + viagens no mapa
Sprint 3  [Centro de Custo]    Custos por viagem + rentabilidade
Sprint 4  [Alertas]            Motor de alertas + notificacoes
Sprint 5  [Documentos]         Upload de arquivos via Supabase Storage
Sprint 6  [Rentabilidade]      Analise por cliente (depende de Sprint 3)
Sprint 7  [RBAC]               Perfil motorista vs admin
Sprint 8  [Exportacao]         CSV/PDF + ANTT + PWA
Sprint 9  [Polish]             UX final + performance + testes
```

Ordem recomendada: 0 -> 1 -> 3 -> 4 -> 2 -> 6 -> 5 -> 8 -> 7 -> 9

A Sprint 2 (Mapa) pode ser feita a qualquer momento pois nao tem dependencias fortes.
A Sprint 6 depende da Sprint 3.
A Sprint 9 deve ser a ultima.
