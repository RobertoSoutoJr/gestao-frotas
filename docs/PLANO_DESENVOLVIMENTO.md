# FuelTrack — Plano de Desenvolvimento

> Atualizado em: 2026-05-14
> Status: [x] Concluido | [~] Em andamento | [ ] Pendente

---

## Sprints Concluidas

### Sprint 0 — Infraestrutura
- [x] React Router (rotas reais, deep links, back button)
- [x] Pagina de configuracoes/perfil
- [x] Paginacao em todas as listas
- [x] Tabelas em formato tabular (Fuel, Maintenance)

### Sprint 1 — KPIs e Metricas
- [x] Dashboard admin com stats da frota
- [x] Dashboard motorista com stats pessoais
- [x] ReportsPage com graficos e detalhamento por caminhao
- [x] Mobile: tela de relatorios com KPIs

### Sprint 2 — Mapa de Viagens
- [x] Leaflet/Google Maps tiles no web
- [x] Rotas reais via Valhalla
- [x] Cards de viagem expansiveis com mapa inline
- [x] GPS capture no mobile (expo-location)

### Sprint 3 — Centro de Custo por Viagem
- [x] Tabela viagem_custos
- [x] Formulario de custos na finalizacao (combustivel, pedagio, manutencao, outros)
- [x] Calculo de lucro/prejuizo por viagem
- [x] Badge visual verde/vermelho

### Sprint 5 — Modulo de Documentos
- [x] Supabase Storage configurado
- [x] Upload de fotos em manutencoes (camera + galeria no mobile)
- [x] DocumentGallery no web (vinculado a manutencoes)

### Sprint 7 — RBAC (Perfis de Acesso)
- [x] Roles admin/motorista no banco
- [x] Dashboard diferente por role
- [x] Tabs filtradas por role (mobile e web)
- [x] Middleware de permissao no backend

### Sprint 8 — Exportacao
- [x] Export CSV/PDF nos relatorios web

---

## Sprint Atual — Fornecedores de Servico (concluida 2026-05-14)

### Oficinas e Postos
- [x] Tabelas `oficinas` e `postos` no banco (Supabase)
- [x] Backend: CRUD completo (validator, service, controller, routes)
- [x] Frontend: paginas OficinasPage e PostosPage com lista/criar/editar/excluir
- [x] Frontend: dropdown de oficina nos formularios de manutencao
- [x] Frontend: dropdown de posto nos formularios de abastecimento
- [x] FK `oficina_id` em manutencoes e `posto_id` em abastecimentos

### Sidebar Lateral
- [x] Substituir TabNavigation horizontal por Sidebar fixa lateral (desktop)
- [x] Submenu "Cadastros" agrupando: Caminhoes, Motoristas, Clientes, Fornecedores, Oficinas, Postos
- [x] Bottom bar mantida no mobile/tablet com menu "Mais"

### Edit/Delete Mobile (3D.1)
- [x] Abastecimentos: edit/delete com formulario completo
- [x] Manutencoes: edit/delete com formulario completo
- [x] Viagens: edit/delete com auto-calculo de frete

---

## Proximos Passos

### Fase 1 — Teste no Dispositivo Real (prioridade imediata)
- [ ] Instalar Expo Go no celular Android
- [ ] `cd mobile && npm install && npx expo start`
- [ ] Testar: login, dashboard, abastecimento, viagens, manutencao
- [ ] Listar bugs/ajustes encontrados

### Fase 2 — Gerar APK
- [ ] Instalar EAS CLI: `npm install -g eas-cli`
- [ ] Configurar: `eas login && eas build:configure`
- [ ] Build: `eas build --profile preview --platform android`
- [ ] Instalar APK no celular e testar

### Fase 3 — Levar Oficinas/Postos para o Mobile
- [ ] API modules: `oficinas.ts` e `postos.ts`
- [ ] Atualizar types: Oficina, Posto, oficina_id, posto_id
- [ ] Picker de oficina nos forms de manutencao (new/edit)
- [ ] Picker de posto nos forms de abastecimento (new/edit)
- [ ] Telas de gestao: oficinas/ e postos/ (lista + cadastro)

### Fase 4 — Melhorias Pendentes
- [ ] Gestao de motoristas no mobile (3A.3)
- [ ] Busca e filtros no mobile (3D.2)
- [ ] Skeleton loading no mobile (3D.3)
- [ ] Modo offline com fila de sync (3B.1-3)
- [ ] Push notifications (3C.1-2)

### Fase 5 — Melhorias Web
- [ ] Graficos melhorados no dashboard
- [ ] Alertas inteligentes (manutencao vencida, consumo anomalo)
- [ ] Rentabilidade por cliente
- [ ] Mapa de viagens no web com GPS capturado

---

## Sprints Futuras (backlog)

### Sprint 4 — Alertas Inteligentes
- [ ] Motor de alertas com regras configuraveis
- [ ] Manutencao preventiva vencendo
- [ ] CNH perto de vencer
- [ ] Consumo anomalo
- [ ] Interface de sino no header

### Sprint 6 — Rentabilidade por Cliente
- [ ] Margem por cliente (frete - custos)
- [ ] Ranking de rentabilidade
- [ ] Grafico comparativo

### Sprint 9 — Polish Final
- [ ] Resolver itens do ROADMAP_UX_FIXES.md
- [ ] Code splitting e performance
- [ ] Testes automatizados
