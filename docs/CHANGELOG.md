# FuelTrack — Changelog

Historico das alteracoes mais relevantes, em ordem cronologica reversa.

---

## 2026-05-14 — Sidebar + Oficinas/Postos

### Navegacao
- **Sidebar lateral fixa** no desktop substituindo as tabs horizontais
- Submenu **Cadastros** agrupando: Caminhoes, Motoristas, Clientes, Fornecedores, Oficinas, Postos
- Mobile: bottom bar mantida com menu "Mais" para itens secundarios

### Oficinas e Postos (novo)
- Tabelas `oficinas` e `postos` no banco com campos: nome, endereco, telefone, cnpj
- CRUD completo no backend: validator Zod, service, controller, rotas REST
- Paginas web com lista, busca, criar/editar/excluir
- Dropdown de oficina no formulario de manutencao (web)
- Dropdown de posto no formulario de abastecimento (web)
- FK `oficina_id` em manutencoes, `posto_id` em abastecimentos (ON DELETE SET NULL)

### Mobile — Edit/Delete
- Abastecimentos: tela de edicao + botao excluir com confirmacao
- Manutencoes: tela de edicao + botao excluir com confirmacao
- Viagens: tela de edicao com auto-calculo de frete (sacas x preco)

### Infra
- Nova VPS configurada: 2.24.94.247 (srv1665848.hstgr.cloud)
- Ubuntu 24.04, Docker 29, Nginx 1.24, Node 22, SSL Let's Encrypt
- URLs atualizadas em frontend, mobile e docker-compose

---

## 2026-05-12 — Mobile Features v2 (parcial)

- Tela Frota: lista de caminhoes + detalhe com stats e historico
- Tela Relatorios: dashboard KPI completo para gestor
- APIs mobile: getById, update, delete para abastecimentos, manutencoes, viagens

---

## 2026-04 — Mobile MVP Completo (6 etapas)

1. Scaffold + auth flow (login, registro, verificacao email)
2. Dashboard adaptativo (admin vs motorista) + tab navigation
3. Formulario de abastecimento com Picker + calculo preco/litro
4. Viagens com GPS capture (origem/destino) + finalizacao
5. Manutencao com upload de foto (camera/galeria)
6. Toast notifications + splash screen + EAS config

---

## 2026-03 — Web MVP + SaaS

- Sistema completo web: Dashboard, Caminhoes, Motoristas, Viagens, Abastecimentos, Manutencoes
- Clientes, Fornecedores, Estoque com silos animados
- Relatorios com graficos Recharts + export CSV/PDF
- Mapas com Google Maps tiles + Valhalla routing
- Auth JWT com refresh token + verificacao email via SMTP
- Theme dark/light + design system completo
- Deploy VPS com Docker + Nginx
