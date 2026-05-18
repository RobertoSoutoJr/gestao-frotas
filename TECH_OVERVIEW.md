# FuelTrack — Visão Técnica do Projeto

> Sistema SaaS de Gestão Inteligente de Frotas  
> Plataforma completa para controle de caminhões, motoristas, abastecimentos, manutenções e viagens.

---

## Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                              │
│                                                             │
│   ┌──────────────────┐         ┌───────────────────────┐   │
│   │   Web (Browser)  │         │   App Mobile (Expo)   │   │
│   │  React 19 + Vite │         │  React Native 0.81    │   │
│   │  PWA + Offline   │         │  iOS & Android        │   │
│   └────────┬─────────┘         └──────────┬────────────┘   │
│            │  HTTPS                        │  HTTPS         │
└────────────┼─────────────────────────────-┼────────────────┘
             │                               │
┌────────────▼───────────────────────────────▼────────────────┐
│                        Nginx (Reverse Proxy)                │
│                     frotapro.rfrota.com.br                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   Backend (Node.js + Express 5)             │
│              REST API  ·  JWT Auth  ·  Zod Validation       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Supabase (PostgreSQL)                     │
│          Row Level Security  ·  Storage  ·  Realtime        │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Web

### Stack Principal

| Tecnologia | Versão | Papel |
|---|---|---|
| **React** | 19.2 | Framework UI — componentes, estado, context |
| **Vite** | 7.3 | Build tool e dev server ultrarrápido |
| **React Router** | 7.13 | Roteamento SPA com lazy loading por página |
| **Tailwind CSS** | 4.1 | Estilização utility-first com design system via CSS vars |

### Bibliotecas de Funcionalidade

| Biblioteca | Versão | Uso |
|---|---|---|
| **Axios** | 1.13 | Cliente HTTP com interceptors (refresh token automático) |
| **Recharts** | 3.7 | Gráficos de linha, barra, pizza no dashboard |
| **Leaflet + React Leaflet** | 1.9 / 5.0 | Mapas interativos para geolocalização de fornecedores |
| **jsPDF + jspdf-autotable** | 4.2 / 5.0 | Exportação de relatórios em PDF |
| **XLSX** | 0.18 | Exportação de dados em planilhas Excel |
| **Lucide React** | 0.563 | Biblioteca de ícones SVG |
| **clsx + tailwind-merge** | — | Composição condicional de classes CSS |

### Padrões e Arquitetura Web

- **Code Splitting** — todas as 20 páginas carregadas com `React.lazy()` + `Suspense`
- **Context API** — `AuthContext`, `ThemeContext`, `ToastContext`, `PlanLimitContext`
- **Service Layer** — abstração de todas as chamadas API em serviços isolados
- **PWA** — `manifest.json` + Service Worker com estratégia network-first/cache-first
- **Offline Queue** — fila de sincronização automática de GPS ao recuperar conexão
- **Dark/Light Theme** — sistema de variáveis CSS globais, sem flash no carregamento
- **Responsive Design** — breakpoints `sm/md/lg`, bottom navigation mobile, sidebar desktop

### Telas (20 páginas)

```
Autenticação          Gestão Operacional       Auxiliares
─────────────         ──────────────────       ──────────
Login                 Dashboard (admin)        Oficinas
Cadastro              Dashboard (motorista)    Postos
Verificação e-mail    Caminhões                Relatórios
                      Motoristas               Configurações
                      Clientes
                      Fornecedores
                      Viagens
                      Abastecimentos
                      Manutenções
                      Estoque
```

---

## Backend

### Stack Principal

| Tecnologia | Versão | Papel |
|---|---|---|
| **Node.js** | LTS | Runtime JavaScript server-side |
| **Express** | 5.2 | Framework HTTP — rotas, middlewares |
| **Supabase JS SDK** | 2.95 | Client do banco de dados (PostgreSQL) |
| **Zod** | 4.3 | Validação e tipagem dos dados de entrada |
| **jsonwebtoken** | 9.0 | Geração e verificação de tokens JWT |
| **bcryptjs** | 3.0 | Hash seguro de senhas (salt rounds: 10) |
| **Multer** | 2.1 | Upload de arquivos (fotos de caminhões) |
| **Nodemailer** | 8.0 | Envio de e-mails (verificação de conta) |
| **PM2** | — | Gerenciador de processos em produção |

### Arquitetura de Camadas

```
Request
   │
   ▼
[ Auth Middleware ]  — valida JWT, extrai userId
   │
   ▼
[ Plan Limit Middleware ]  — verifica limites do plano (free/pro/enterprise)
   │
   ▼
[ Controller ]  — recebe req, chama validator + service
   │
   ▼
[ Zod Validator ]  — valida e sanitiza o body
   │
   ▼
[ Service ]  — lógica de negócio, queries ao Supabase
   │
   ▼
[ Supabase / PostgreSQL ]
```

### Módulos da API (15 rotas)

```
/auth          — login, registro, verificação e-mail, refresh token
/caminhoes     — CRUD caminhões + upload de foto
/motoristas    — CRUD motoristas
/viagens       — CRUD viagens com limites mensais por plano
/abastecimentos — CRUD abastecimentos
/manutencoes   — CRUD manutenções
/fornecedores  — CRUD fornecedores (locais de carregamento)
/clientes      — CRUD clientes (destinatários de carga)
/estoque       — Controle de estoque (sacas)
/oficinas      — Cadastro de oficinas
/postos        — Cadastro de postos de combustível
/produtos      — Tipos de produto transportado
/documentos    — Gestão de documentos
/custos-viagem — Registro de custos por viagem
```

### Segurança

- **JWT com refresh token** — access token curto + refresh token 30 dias em banco
- **Fila de retry** — requisições paralelas aguardam token renovado sem duplicar chamadas
- **Row Level Security (RLS)** — PostgreSQL garante isolamento de dados por `user_id`
- **Multi-tenancy** — cada empresa vê apenas seus próprios dados
- **RBAC** — roles `admin` e `motorista` com acesso restrito por rota
- **Verificação de e-mail** — código de 6 dígitos com expiração de 10 minutos

### Modelo de Planos (SaaS)

| Recurso | Gratuito | Profissional | Empresarial |
|---|---|---|---|
| Preço | R$ 0 | R$ 49,90/mês | R$ 149,90/mês |
| Caminhões | 3 | 20 | Ilimitado |
| Motoristas | 3 | 20 | Ilimitado |
| Viagens/mês | 30 | 500 | Ilimitado |
| Contas de motorista | 1 | 10 | Ilimitado |

---

## Mobile (App Nativo)

### Stack Principal

| Tecnologia | Versão | Papel |
|---|---|---|
| **React Native** | 0.81.5 | Framework mobile nativo (iOS + Android) |
| **Expo** | 54.0 | Plataforma de desenvolvimento e build |
| **Expo Router** | 6.0 | Navegação file-based (estrutura de pastas = rotas) |
| **TypeScript** | 5.9 | Tipagem estática em todo o app |
| **TanStack React Query** | 5.96 | Cache, sincronização e fetching de dados |
| **Axios** | 1.15 | Chamadas à mesma API REST do backend |

### Bibliotecas Nativas

| Biblioteca | Uso |
|---|---|
| **expo-haptics** | Feedback tátil em ações (tap, sucesso, erro, aviso) |
| **expo-location** | Captura de GPS para localização em viagens |
| **expo-image-picker** | Câmera e galeria para foto de caminhões |
| **expo-secure-store** | Armazenamento seguro de credenciais |
| **react-native-safe-area-context** | Margens seguras (notch, home indicator) |
| **@expo/vector-icons (Ionicons)** | Ícones nativos |

### Navegação e Telas

```
(auth)/
  login.tsx          — Autenticação com JWT
  register.tsx       — Cadastro de nova empresa
  verify-email.tsx   — Verificação de código por e-mail

(app)/
  dashboard.tsx      — Resumo operacional (admin e motorista)
  viagens/           — Listagem, criação, edição, detalhe
  abastecer/         — Registro de abastecimentos
  manutencoes/       — Registro de manutenções
  frota/             — Gestão de caminhões (admin)
  relatorios.tsx     — Relatórios analíticos (admin)
  motoristas/        — Cadastro de motoristas (admin)
  perfil.tsx         — Configurações do usuário
```

### UX Mobile

- **Pull-to-refresh** — `RefreshControl` em todas as listas
- **Skeleton Loading** — shimmer animado substituindo `ActivityIndicator`
- **Haptic Feedback** — `light` em taps, `success`/`error`/`warning` em mutações
- **Safe Areas** — suporte a notch, ilha dinâmica e home indicator
- **Orientação** — portrait only (ideal para uso no caminhão)
- **Tema escuro** — padrão dark, design tokens sincronizados com o web
- **RBAC Visual** — tabs e seções exibidas conforme o role do usuário

---

## Infraestrutura e Deploy

### Componentes

| Componente | Tecnologia |
|---|---|
| **Servidor** | VPS própria |
| **Orquestração** | Docker Compose |
| **Proxy reverso** | Nginx (HTTPS, roteamento /api vs /) |
| **Processo Node** | PM2 (restart automático, logs) |
| **Banco de dados** | Supabase (PostgreSQL gerenciado na nuvem) |
| **Storage** | Supabase Storage (fotos dos caminhões) |
| **Domínio** | `frotapro.rfrota.com.br` |

### Diagrama Docker

```
docker-compose.prod.yml
│
├── nginx (porta 80/443)
│     ├── / → frontend (build estático)
│     └── /api → backend:3001
│
└── backend (Node.js + PM2, porta 3001)
      └── conecta ao Supabase via HTTPS
```

---

## Banco de Dados (PostgreSQL via Supabase)

### Principais tabelas

```
users              — contas de usuário (admin e motorista)
caminhoes          — frota de veículos
motoristas         — cadastro de motoristas
viagens            — registro de viagens com custos e lucro
abastecimentos     — histórico de abastecimentos por caminhão
manutencoes        — manutenções preventivas e corretivas
fornecedores       — locais de carregamento (com GPS)
clientes           — destinatários de carga
estoque            — controle de sacas por viagem
oficinas           — cadastro de oficinas mecânicas
postos             — postos de combustível
produtos           — tipos de produto transportado
documentos         — documentos anexados
user_sessions      — refresh tokens ativos
email_verifications — códigos de verificação por e-mail
```

### Isolamento Multi-tenant

Todas as tabelas possuem `user_id` (referência ao dono dos dados). O RLS do PostgreSQL garante que **nenhuma consulta, mesmo com erro de código, exponha dados de outro cliente**.

---

## Funcionalidades Destaque

### Para o Gestor (Admin)
- Dashboard com gráficos de gastos, distribuição por caminhão e ranking de motoristas
- Controle completo de frota, motoristas, viagens e finanças
- Relatórios exportáveis em PDF e Excel
- Mapa interativo para geolocalizar pontos de carregamento
- Gestão de estoque vinculada às viagens
- Criação de contas de acesso para motoristas

### Para o Motorista
- Dashboard simplificado com suas viagens e abastecimentos
- Registro de abastecimentos com captura de localização GPS
- Histórico de manutenções do caminhão
- Acesso via app mobile ou navegador

### Experiência do Usuário
- Sistema de notificações (toasts) em todas as ações
- Modal de upgrade ao atingir limites de plano
- Feedback tátil (haptic) no app mobile
- Skeleton loading nas listas (sem telas em branco)
- Suporte offline com sincronização automática
- Onboarding wizard para novos usuários

---

## Números do Projeto

| Métrica | Quantidade |
|---|---|
| Páginas web | 20 |
| Telas mobile | ~30 |
| Rotas de API | 15 módulos / ~60 endpoints |
| Tabelas no banco | 15 |
| Componentes UI reutilizáveis | ~25 |
| Planos SaaS | 3 (Free, Pro, Enterprise) |

---

*FuelTrack — Desenvolvido com foco em usabilidade para o setor de transporte de grãos.*
