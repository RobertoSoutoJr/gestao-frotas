# 🚛 FrotaPro v1.0

> Sistema completo de gestão de frotas com autenticação, dashboard interativo e controle total de operações.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933.svg)](https://nodejs.org/)

## 🎯 Visão Geral

FrotaPro é uma plataforma profissional para gestão completa de frotas de caminhões. Controle caminhões, motoristas, abastecimentos, manutenções e tenha acesso a relatórios detalhados em tempo real.

### ✨ Principais Recursos

- 🔐 **Autenticação completa** - Login, registro e gestão de usuários
- 👥 **Multi-tenancy** - Cada usuário gerencia apenas seus dados
- 📊 **Dashboard interativo** - Estatísticas e gráficos em tempo real
- 🚚 **Gestão de caminhões** - CRUD completo com busca e filtros
- 👤 **Gestão de motoristas** - Cadastro e controle de equipe
- ⛽ **Controle de abastecimentos** - Histórico completo com análises
- 🔧 **Gestão de manutenções** - 8 tipos de manutenção com badges coloridos
- 📈 **Relatórios avançados** - Gráficos de custos, distribuição e evolução
- 🔍 **Busca e filtros** - Em todas as páginas com múltiplos critérios
- 🌓 **Modo escuro** - Toggle suave entre temas claro e escuro
- ✏️ **Edição inline** - Modais para editar qualquer registro
- 🗑️ **Exclusão segura** - Confirmação antes de deletar
- 📱 **Design responsivo** - Funciona perfeitamente em mobile e desktop
- 🎨 **Interface moderna** - Design profissional sem aparência genérica

## 🏗️ Arquitetura

### Backend (Node.js + Express)

```
backend/
├── src/
│   ├── config/           # Configurações (Supabase, ambiente)
│   ├── middlewares/      # Auth JWT, error handling, async wrapper
│   ├── validators/       # Schemas Zod para validação
│   ├── services/         # Lógica de negócio
│   ├── controllers/      # Handlers de requisições
│   └── routes/           # Definição de rotas REST
├── migrations/           # Migrações de banco de dados
└── server.js            # Entry point
```

**Tecnologias:**
- Express 5.2 - Framework web
- Supabase - PostgreSQL gerenciado
- Zod - Validação de schemas
- bcryptjs - Hash de senhas
- jsonwebtoken - Autenticação JWT
- pg - Driver PostgreSQL nativo

### Frontend (React + Vite)

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/          # Componentes reutilizáveis (Button, Input, Modal)
│   │   ├── forms/       # Formulários especializados
│   │   └── layout/      # Header, TabNavigation
│   ├── pages/           # Páginas principais (Dashboard, Trucks, etc.)
│   ├── contexts/        # React Context (Auth, Theme)
│   ├── hooks/           # Custom hooks (useAuth, useTheme, useFleet)
│   ├── services/        # API clients
│   └── lib/             # Utilitários (cn, formatters)
└── index.html
```

**Tecnologias:**
- React 19.2 - UI library
- Vite 7.3 - Build tool
- Tailwind CSS 4.1 - Styling
- Recharts - Gráficos interativos
- Lucide React - Ícones modernos
- Axios - Cliente HTTP

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase (gratuita)

### 1. Clone o repositório

```bash
git clone https://github.com/RobertoSoutoJr/gestao-frotas.git
cd gestao-frotas
```

### 2. Configure o Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env`:

```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_public_key
SUPABASE_SERVICE_KEY=sua_service_role_key
DATABASE_PASSWORD=sua_senha_postgres
PORT=3001
NODE_ENV=development
```

Execute as migrações:

```bash
node migrations/001-create-auth-system.js
```

Inicie o servidor:

```bash
npm run dev
```

### 3. Configure o Frontend

```bash
cd ../frontend
npm install
```

Crie o arquivo `.env`:

```env
VITE_API_URL=http://localhost:3001
```

Inicie o app:

```bash
npm run dev
```

Acesse: **http://localhost:5173**

## 📖 Uso

### Primeiro Acesso

1. Abra a aplicação no navegador
2. Clique em **"Criar conta gratuita"**
3. Preencha seus dados (nome, email, senha)
4. Faça login com suas credenciais

### Navegação

- **Dashboard** - Visão geral com estatísticas e gráficos
- **Caminhões** - Cadastre e gerencie sua frota
- **Motoristas** - Controle sua equipe
- **Abastecimentos** - Registre e analise consumo
- **Manutenções** - Histórico completo de manutenções
- **Relatórios** - Análises detalhadas com filtros

### Funcionalidades CRUD

Todas as entidades suportam:
- ✅ **Criar** - Formulários validados
- 📖 **Listar** - Com busca e filtros
- ✏️ **Editar** - Modais de edição
- 🗑️ **Excluir** - Com confirmação

## 🔒 Segurança

- Senhas com hash bcrypt (salt rounds: 10)
- JWT tokens (access + refresh)
- Multi-tenancy com RLS (Row Level Security)
- Service Role Key para operações admin
- Validação de inputs com Zod
- Proteção contra SQL injection
- CORS configurado

## 🎨 Design System

### Cores Principais

- **Blue 600** - Primary actions
- **Indigo 600** - Secondary actions
- **Green 600** - Success states
- **Red 600** - Danger/Delete
- **Zinc scales** - Neutrals

### Componentes UI

- Button (5 variantes)
- Input (com ícones e máscaras)
- Select
- Card
- Modal
- ConfirmDialog
- Badge
- Toast
- Spinner
- EmptyState

## 📊 Banco de Dados

### Tabelas

- `users` - Usuários do sistema
- `user_sessions` - Sessões JWT
- `caminhoes` - Frota de caminhões
- `motoristas` - Equipe de motoristas
- `abastecimentos` - Registros de abastecimento
- `manutencoes` - Histórico de manutenções

Todas as tabelas possuem:
- RLS habilitado
- Índices otimizados
- Foreign keys com CASCADE
- Campo `user_id` para multi-tenancy

## 🛠️ Scripts Disponíveis

### Backend

```bash
npm run dev     # Inicia servidor em modo desenvolvimento
npm start       # Inicia servidor em produção
```

### Frontend

```bash
npm run dev     # Inicia Vite dev server
npm run build   # Build para produção
npm run preview # Preview do build
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Desenvolvido com

- ❤️ Paixão por código limpo
- ☕ Muito café
- 🤖 Assistência de Claude Code (Anthropic)

## 🔗 Links

- [Documentação do Supabase](https://supabase.com/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

---

<p align="center">
  Feito com 💙 por Roberto Souto Jr<br>
  © 2026 FrotaPro - Gestão Profissional de Frotas
</p>
