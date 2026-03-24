# FuelTrack — Sistema de Gestao de Frotas

Projeto academico de gestao de frotas desenvolvido como trabalho de faculdade. Permite controlar caminhoes, motoristas, abastecimentos, manutencoes, viagens, estoque e clientes/fornecedores, com dashboard de acompanhamento e relatorios.

## Sobre o projeto

O FuelTrack nasceu como um trabalho de faculdade com o objetivo de resolver um problema real: o controle operacional de uma pequena frota de caminhoes. O sistema permite que o usuario cadastre seus veiculos, registre abastecimentos e manutencoes, acompanhe viagens e controle estoque de produtos (sacas de milho, sorgo, etc.).

Cada usuario tem seus proprios dados isolados (multi-tenancy por `user_id`), entao o sistema ja esta preparado para atender mais de um usuario simultaneamente.

**Acesso em producao:** [frotapro.rfrota.com.br](https://frotapro.rfrota.com.br)

## Stack

**Frontend:** React 19, Vite, Tailwind CSS 4, Recharts, Lucide Icons, Axios

**Backend:** Node.js, Express, Supabase (PostgreSQL), Zod, JWT (jsonwebtoken + bcryptjs)

**Infra:** Docker Compose, Nginx, VPS proprio

## Funcionalidades

- Autenticacao com JWT (login, registro, refresh token)
- Dashboard com graficos de gastos, distribuicao de custos e ranking de veiculos
- Cadastro de caminhoes, motoristas, clientes e fornecedores
- Registro de abastecimentos e manutencoes com filtros e busca
- Controle de viagens (cadastro, finalizacao com desconto do estoque)
- Gestao de estoque com pagamentos parciais e cheques
- Relatorios com tabelas detalhadas e graficos comparativos
- Personalizacao de layout (reordenar e ocultar secoes no dashboard e relatorios)
- Tema claro e escuro
- Layout responsivo (mobile-first com bottom navigation)

## Estrutura do projeto

```
gestao-frotas/
├── backend/
│   ├── src/
│   │   ├── config/          # Supabase, variaveis de ambiente
│   │   ├── middlewares/     # Auth JWT, error handler
│   │   ├── validators/     # Schemas Zod
│   │   ├── services/       # Logica de negocio
│   │   ├── controllers/    # Handlers das rotas
│   │   └── routes/         # Rotas REST
│   ├── migrations/          # Scripts SQL e JS
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/     # UI (Button, Modal, Card...), forms, layout
│   │   ├── pages/          # Dashboard, Trucks, Fuel, Maintenance, Reports...
│   │   ├── contexts/       # Auth, Theme
│   │   ├── hooks/          # useAuth, useFleet, useToast
│   │   ├── services/       # Chamadas API (axios)
│   │   └── lib/            # Utilitarios (formatters, cn)
│   └── index.html
├── docker-compose.prod.yml
└── README.md
```

## Como rodar localmente

### Pre-requisitos

- Node.js 18+
- Conta no Supabase (plano gratuito funciona)

### Backend

```bash
cd backend
npm install
```

Crie o `.env`:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_anon_key
SUPABASE_SERVICE_KEY=sua_service_role_key
DATABASE_PASSWORD=sua_senha
JWT_SECRET=um_segredo_qualquer
PORT=3001
NODE_ENV=development
```

Rode as migracoes e inicie:

```bash
node migrations/001-create-auth-system.js
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Crie o `.env`:

```env
VITE_API_URL=http://localhost:3001
```

Inicie:

```bash
npm run dev
```

Acesse `http://localhost:5173`, crie uma conta e comece a usar.

## Deploy (producao)

O projeto roda em uma VPS com Docker Compose. O fluxo de deploy e:

```bash
git pull
cd frontend && npm run build
cd .. && docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

O Nginx serve o frontend estatico e faz proxy reverso do `/api/` para o container do backend na porta 3001.

## Banco de dados

Tabelas principais: `users`, `user_sessions`, `caminhoes`, `motoristas`, `abastecimentos`, `manutencoes`, `viagens`, `estoque`, `estoque_pagamentos`, `estoque_cheques`, `clientes`, `fornecedores`, `produtos`.

Todas as tabelas possuem:
- Coluna `user_id` com foreign key para isolamento de dados
- Indices compostos nas FKs mais consultadas
- CHECK constraints para validacao no banco (status, tipos, valores)
- RLS habilitado (Row Level Security)

## Limitacoes conhecidas

- Sem paginacao nas listas (pode ficar lento com muitos registros)
- Navegacao por estado React, sem rotas na URL (refresh volta ao dashboard)
- Sem upload real de fotos dos caminhoes (apenas placeholder)
- Sem notificacoes push ou email

## Licenca

MIT

---

Desenvolvido por Roberto Souto Jr — Projeto academico, 2025/2026
