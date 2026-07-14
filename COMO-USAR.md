# Como usar o FuelTrack no seu computador (Windows)

Guia simples para rodar o sistema na sua própria máquina. Você só precisa de
**internet** (os dados ficam guardados no Supabase, na nuvem).

---

## 1. Instalar o Node.js (só uma vez)

O Node.js é o "motor" que faz o sistema funcionar.

1. Acesse **https://nodejs.org**
2. Clique no botão grande **"LTS"** para baixar.
3. Abra o arquivo baixado e clique em **Next / Avançar** até o fim (pode deixar tudo no padrão).
4. Pronto. Não precisa mexer em mais nada.

---

## 2. Baixar o sistema (só uma vez)

1. Acesse o repositório no GitHub: **https://github.com/RobertoSoutoJr/gestao-frotas**
2. Clique no botão verde **"Code"** → **"Download ZIP"**.
3. Salve e **extraia** o ZIP numa pasta fácil de achar (ex: `Documentos\FuelTrack`).

---

## 3. Ligar o sistema (toda vez que for usar)

Dentro da pasta do projeto, dê **duplo-clique em `iniciar.bat`**.

- **Na primeira vez**, ele vai pedir 3 informações do Supabase. Você pega em
  [supabase.com](https://supabase.com) → seu projeto → **Settings → API**:
  - a **URL do projeto** (`https://xxxx.supabase.co`)
  - a **publishable key** (`sb_publishable_...`)
  - a **secret key** (`sb_secret_...`)

  Cole cada uma quando ele pedir. **Isso só acontece uma vez** — ele guarda e não pergunta de novo.

- Depois disso, ele liga sozinho e **abre o sistema no seu navegador** em
  `http://localhost:5173`. É só usar.

> **Atenção (plano grátis do Supabase):** se você ficar mais de ~1 semana sem usar,
> o Supabase "pausa" o projeto. Se ao abrir o sistema não aparecerem seus dados,
> entre no [supabase.com](https://supabase.com), abra o projeto e clique em
> **"Restore"** (espere ~2 min). Depois é só recarregar a página.

---

## 4. Desligar

Quando terminar, **feche as duas janelas pretas** que abriram
("FuelTrack API" e "FuelTrack Web"), ou dê duplo-clique em **`parar.bat`**.

---

## 5. Backup dos seus dados (recomendado!)

Seus dados ficam no Supabase (nuvem). Para ter uma **cópia de segurança no seu PC**,
dê duplo-clique em **`backup.bat`** de vez em quando.

- Ele salva TUDO numa pasta chamada `backups` dentro do projeto.
- **Dica:** copie essa pasta para um pen-drive ou Google Drive.
- Assim, mesmo que algo aconteça com o Supabase, você tem seus dados guardados.

---

## Problemas comuns

| Situação | O que fazer |
|---|---|
| "Node.js nao esta instalado" | Faça o passo 1 acima. |
| Abriu mas os dados não aparecem | Supabase pausado → faça o "Restore" (veja o aviso no passo 3). |
| O navegador não abriu sozinho | Abra manualmente: `http://localhost:5173` |
| Digitei as chaves erradas na 1ª vez | Apague o arquivo `backend\.env` e rode o `iniciar.bat` de novo. |
| Quero mudar de computador | Copie a pasta inteira (ou baixe o ZIP de novo) e rode o `iniciar.bat`. |
