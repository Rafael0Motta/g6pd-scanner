# G6PD Scanner

App multiplataforma (Android/iOS/PWA) que ajuda pessoas com deficiência de G6PD a identificar produtos
inseguros: fotografa o rótulo, extrai ingredientes via IA (Claude com visão) e compara contra uma base
curada de contraindicações.

> **Ferramenta de apoio — não substitui orientação médica ou farmacêutica.**

## Estrutura do monorepo

```
/apps
  /mobile        -> app React + TypeScript + Capacitor (Android/iOS/PWA) — usuário final, sem login
  /api            -> backend Express + TypeScript + Prisma
  /admin          -> painel administrativo web (React), rota oculta, único ponto de login do sistema
/packages
  /shared-types   -> tipos TypeScript compartilhados entre os três apps
```

Sem autenticação de usuário final: o app mobile identifica o histórico por um `device_id` (UUID gerado
localmente e salvo via Capacitor Preferences), enviado no header `x-device-id`. O único login de todo o
sistema é o do painel admin.

## Pré-requisitos

- Node.js 20+
- npm 10+
- Uma instância PostgreSQL acessível (na sua VPS)
- Chave de API da Anthropic ([console.anthropic.com](https://console.anthropic.com/))
- Para build nativo: Android Studio (Android) e/ou Xcode (iOS, requer macOS)

## 1. Instalar dependências

Na raiz do monorepo:

```bash
npm install
```

Isso instala as dependências dos três apps e do pacote `shared-types` via npm workspaces.

## 2. Configurar variáveis de ambiente

Copie os `.env.example` e preencha:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
cp apps/admin/.env.example apps/admin/.env
```

**`apps/api/.env`**
- `DATABASE_URL`: string de conexão da sua VPS Postgres, ex. `postgresql://usuario:senha@seu-ip:5432/g6pd_db`
- `ANTHROPIC_API_KEY`: sua chave da API Anthropic
- `JWT_SECRET`: valor aleatório longo (assina os tokens do painel admin)
- `ADMIN_ROUTE_SLUG`: prefixo secreto das rotas admin. Já foi gerado um valor aleatório de exemplo
  (`adm-fa9f7fddea46`) — **troque por um valor seu antes de ir para produção** e nunca reutilize um slug óbvio.
- `CORS_ORIGINS`: origens permitidas (URLs do app mobile/admin em dev e produção)

**`apps/mobile/.env`** e **`apps/admin/.env`**
- `VITE_API_URL`: URL da API (`http://localhost:3333` em dev)
- `apps/admin/.env` também precisa de `VITE_ADMIN_ROUTE_SLUG`, que **deve ser idêntico** ao
  `ADMIN_ROUTE_SLUG` da API.

## 3. Banco de dados (Prisma)

O schema já está definido em `apps/api/prisma/schema.prisma`, mas **as migrations não foram rodadas** —
isso só deve ser feito depois de configurar a `DATABASE_URL` real da sua VPS.

```bash
# gera o client Prisma
npm run prisma:generate

# cria as tabelas no banco (roda a partir de apps/api)
npm run prisma:migrate --workspace=apps/api

# popula alguns EXEMPLOS PARA REVISÃO na base de contraindicações
# (não é uma base clínica validada — revise pelo painel admin antes de confiar nela)
npm run prisma:seed --workspace=apps/api
```

### Criar o admin (obrigatório para acessar o painel)

Não existe tela de cadastro de admin. Use o script:

```bash
cd apps/api
npx tsx prisma/create-admin.ts "seu-email@exemplo.com" "SenhaForte123!" "Seu Nome"
```

## 4. Rodar em desenvolvimento

Em terminais separados:

```bash
# API (porta 3333)
npm run dev:api

# App mobile / PWA (porta 5173)
npm run dev:mobile

# Painel admin (porta 5174)
npm run dev:admin
```

Acesse o painel admin em `http://localhost:5174` e faça login com o admin criado no passo anterior.
Lembre-se: essa URL **não é linkada em nenhum lugar do app mobile** — é para uso interno.

## 5. Build nativo (Android/iOS) via Capacitor

O app mobile é uma base web (React + Vite) empacotada com Capacitor. Fluxo:

```bash
cd apps/mobile

# 1. build da versão web de produção
npm run build

# 2. adiciona as plataformas nativas (só na primeira vez)
npx cap add android
npx cap add ios      # requer macOS/Xcode

# 3. sincroniza o build web + plugins nativos para os projetos nativos
npx cap sync

# 4. abre no Android Studio / Xcode para rodar em dispositivo/emulador ou gerar o build de loja
npx cap open android
npx cap open ios
```

Sempre que alterar código web, repita `npm run build && npx cap sync` antes de abrir o projeto nativo.

### PWA ("Adicionar à tela inicial")

- `apps/mobile/public/manifest.json` já está configurado (`display: standalone`, ícones 192/512 +
  maskable, `theme_color`/`background_color`).
- `index.html` inclui as meta tags do iOS Safari (`apple-mobile-web-app-capable`, `apple-touch-icon`) e o
  `<link rel="manifest">` para Android Chrome.
- **Os ícones em `apps/mobile/public/icons/` são placeholders sólidos gerados automaticamente** (cor verde
  da marca) — substitua por artes reais antes de publicar.

## Painel admin — segurança

O painel fica em `/api/<ADMIN_ROUTE_SLUG>-admin/*` na API e é servido como um app web separado
(`apps/admin`), sem qualquer link a partir do app mobile. Mesmo assim:

- A rota oculta **não é o mecanismo de segurança principal** — o CRUD da base clínica só funciona com um
  JWT válido, emitido após login com senha (hash bcrypt).
- Recomendado, em produção na sua VPS: colocar `apps/admin` (e o prefixo admin da API) atrás de HTTP Basic
  Auth ou allowlist de IP no Nginx, como camada extra.

## Endpoints principais da API

Públicos (requerem header `x-device-id`):
- `POST /api/scan`
- `GET/PATCH/DELETE /api/products` e `/api/products/:id`
- `GET /api/substances`

Admin (requerem `Authorization: Bearer <token>`, prefixo `/api/<ADMIN_ROUTE_SLUG>-admin`):
- `POST /login`
- CRUD completo em `/substances`
- `GET /products` (todos os devices, para auditoria)
- `GET /stats`

## Decisões e suposições assumidas

- Idioma: apenas PT-BR por enquanto (sem camada de i18n) — confirmado com o usuário.
- Nome do app: "G6PD Scanner" (padrão da spec original).
- Paleta: verde/âmbar/vermelho/cinza para SEGURO/CAUTELA/CONTRAINDICADO/NÃO_IDENTIFICADO.
- Mapeamento nível de risco → classificação (não especificado na spec original, definido de forma
  conservadora): qualquer substância com risco `ALTO` encontrada ⇒ `CONTRAINDICADO`; `MODERADO` ou `BAIXO`
  ⇒ `CAUTELA`; nenhum match (com confiança ≥ 0.7) ⇒ `SEGURO`. **Revise essa regra com um profissional de
  saúde antes de usar em produção.**
- Rotas nativas não foram geradas (`android/`, `ios/`) — são criadas ao rodar `npx cap add`, pois dependem
  do ambiente de build local (Android Studio/Xcode) e não devem ficar versionadas como texto gerado aqui.
