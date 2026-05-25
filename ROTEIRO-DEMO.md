# Roteiro de Demonstracao — FuelTrack
## Apresentacao para disciplina | ~8 minutos

**URL Web:** https://srv1665848.hstgr.cloud
**URL API:** https://srv1665848.hstgr.cloud/api/health
**Mobile:** APK instalado no celular (ou emulador)

---

## 1. ABERTURA (1 min)
> "O FuelTrack e um sistema completo de gestao de frotas para transportadoras. 
> Ele resolve o problema de controlar combustivel, manutencao, viagens e custos 
> de uma frota de caminhoes — tudo num unico lugar, acessivel via web e mobile."

**Mostrar na tela:** Landing page do FuelTrack (https://srv1665848.hstgr.cloud)

**Mencionar a stack:**
- **Frontend:** React + Vite + TailwindCSS (SPA com PWA)
- **Mobile:** React Native + Expo (Android)
- **Backend:** Node.js + Express (API REST)
- **Banco:** Supabase (PostgreSQL gerenciado com RLS)
- **Infra:** VPS Hostinger, Docker, JWT auth

---

## 2. LOGIN + DASHBOARD (1 min)
> "O sistema e multi-tenant — cada empresa tem seus dados isolados via 
> Row Level Security no Supabase. Vou logar como gestor."

1. Fazer login com credenciais de demo
2. Mostrar o **Dashboard** — destacar:
   - KPIs em tempo real (total gasto, litros, km)
   - Graficos Recharts (pizza, barras, linha)
   - Mini-mapa Leaflet com postos/oficinas
   - Alertas inteligentes (CNH vencendo, manutencao atrasada)

> "Tudo isso e calculado em tempo real a partir dos dados cadastrados."

---

## 3. CRUD PRINCIPAL — Abastecimento (1.5 min)
> "Vou mostrar o fluxo mais importante: registrar um abastecimento."

1. Ir em **Abastecimentos** — mostrar listagem com paginacao server-side
2. Clicar **+ Novo** — mostrar formulario
3. Destacar:
   - **NFC-e Scanner:** clicar no botao de scan, mostrar que usa OCR (Claude Vision) pra ler cupom fiscal automaticamente
   - **Validacao de KM:** digitar KM menor que o atual e mostrar o warning amarelo
   - Salvar o registro
4. Mostrar que o registro aparece na lista

> "O OCR extrai CNPJ, valor, litros e preco/litro direto da nota fiscal. 
> Isso elimina digitacao manual e erros."

---

## 4. FEATURE DESTAQUE — Viagens com GPS (1 min)
> "O motorista usa o app mobile pra acompanhar viagens."

1. Abrir **Viagens** no web — mostrar lista com status (cadastrada, em andamento, finalizada)
2. **No celular** (ou print): mostrar tela de viagem ativa com:
   - Origem/destino
   - GPS tracking em tempo real
   - Botao de finalizar

> "O motorista ve so as viagens dele. O gestor ve tudo. 
> Isso e controlado por RBAC — Role Based Access Control."

---

## 5. SEGURANCA E ARQUITETURA (1.5 min)
> "Agora vou mostrar as decisoes tecnicas."

1. Abrir outra aba: **https://srv1665848.hstgr.cloud/api/health**
   - Mostrar health check (status, DB latency, memory, uptime)

2. Mencionar (sem precisar abrir tudo):
   - **Helmet** — headers de seguranca (HSTS, CSP, X-Frame-Options)
   - **Rate limiting** — 100 req/min global, 10/min no login (anti brute-force)
   - **Zod validation** — validacao de schema em todos os inputs
   - **Soft delete** — registros nunca sao deletados de verdade
   - **Auditoria** — log de quem fez o que, quando, com dados antes/depois
   - **JWT + Refresh Token** — sessao segura com renovacao automatica
   - **Pino** — logs estruturados em JSON pra depuracao

3. Mostrar rapidamente a tela de **Historico de Acoes** (Auditoria)

> "Cada acao de criar, editar ou excluir e registrada com usuario, IP e timestamp."

---

## 6. RELATORIOS (1 min)
> "O sistema gera relatorios avancados automaticamente."

1. Abrir **Relatorios** — mostrar:
   - DRE simplificado (receita x despesas x lucro)
   - Grafico de custo/km por caminhao
   - Projecao de gastos (trend line com forecast de 3 meses)
   - Ranking de motoristas por eficiencia
2. Mostrar **Export PDF/Excel** — clicar num dos botoes

> "O gestor consegue comparar performance entre veiculos 
> e prever gastos futuros com base no historico."

---

## 7. APP MOBILE (1 min)
> "O motorista usa o app pra registrar abastecimentos e manutencoes em campo."

1. **No celular:** mostrar rapidamente:
   - Dashboard do motorista (simplificado)
   - Formulario de abastecimento com NFC-e scan pela camera
   - Fila offline — mostrar o banner "X lancamentos offline"
   
> "Se nao tiver internet, o registro fica salvo localmente 
> e sincroniza automaticamente quando voltar a conexao."

2. Mencionar: **tema dark/light**, **haptic feedback**, **push notifications**

---

## 8. ENCERRAMENTO (30s)
> "Resumindo: o FuelTrack e um sistema fullstack completo com web, mobile e API, 
> que resolve o problema real de gestao de frotas. Tem autenticacao segura, 
> multi-tenancy, OCR pra notas fiscais, GPS tracking, modo offline, 
> relatorios com projecao e auditoria completa."

**Se houver perguntas, estar preparado para:**
- Mostrar o codigo no GitHub
- Explicar RLS (Row Level Security) do Supabase
- Falar sobre o deploy (Docker na VPS)
- Demonstrar o soft delete
- Mostrar a paginacao server-side

---

## CHECKLIST PRE-APRESENTACAO

- [ ] Logar no sistema antes e deixar a sessao ativa
- [ ] Ter o celular com o APK instalado e logado
- [ ] Ter pelo menos 3-5 registros de cada tipo (caminhoes, motoristas, abastecimentos, manutencoes, viagens)
- [ ] Verificar que o health check esta respondendo
- [ ] Ter o GitHub aberto numa aba (caso o professor peca pra ver codigo)
- [ ] Testar o NFC-e scanner com uma foto de cupom fiscal
- [ ] Verificar tema dark (mais bonito pra projetar na sala)

---

## DADOS DE DEMO SUGERIDOS

Cadastrar antes da apresentacao:
- **3 caminhoes:** ABC-1234 (Scania R450), DEF-5678 (Volvo FH540), GHI-9012 (MB Actros)
- **2 motoristas:** Joao Silva, Pedro Santos
- **5+ abastecimentos** distribuidos nos ultimos 3 meses
- **3+ manutencoes** (Preventiva, Corretiva, Pneus)
- **2+ viagens** (1 finalizada com custos, 1 em andamento)
- **1 cliente e 1 fornecedor** com endereco completo (pra mostrar CEP auto-fill)
