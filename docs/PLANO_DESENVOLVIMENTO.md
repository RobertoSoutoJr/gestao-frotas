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
- [ ] TruckDetailModal: clicar no card do caminhao abre detalhamento
- [ ] Abastecimentos e Manutencoes em formato lista
- [ ] Paginacao simples nas listas

---

*(documento original preservado; mantido em docs/ para não poluir a raiz do repositório)*

Ver histórico git completo do plano para sprints 1-9.
