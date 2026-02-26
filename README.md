# FLOWA - Gestão de Projetos

Sistema de gestão de projetos com apontamento de horas. Arquitetura separada para escalabilidade.

## Estrutura

```
wps-time-sheet/
├── backend/     → API Express + Prisma (deploy: Railway)
├── frontend/    → Next.js (deploy: Firebase Hosting)
└── (legado)     → app monolítica original em src/
```

## Tecnologias

| Camada    | Stack                        |
|-----------|------------------------------|
| Backend   | Express, Prisma, PostgreSQL (Supabase/Railway) |
| Frontend  | Next.js, React, Tailwind     |
| Auth      | JWT (Bearer token)           |

## Multi-tenant

O sistema é **multi-tenant**: cada organização (tenant) tem seus próprios usuários, clientes, projetos, chamados e apontamentos. O isolamento é feito pelo `tenantId` em todas as consultas. Ao fazer login, o usuário recebe um token com o `tenantId` da sua organização; todas as requisições à API são automaticamente filtradas por esse tenant.

## Deploy planejado

- **Backend** → Railway (com Supabase Postgres ou Railway Postgres)
- **Frontend** → Firebase Hosting
- **Banco**   → Supabase (PostgreSQL) ou Railway Postgres

---

## Desenvolvimento local (pronto para testar)

### 1. Instalar e configurar

```bash
# Backend
cd backend
npm install
npm run db:generate
npm run db:push   # ou: npx prisma migrate dev (para migrações nomeadas)
npm run db:seed   # cria o tenant "WPS Consult" e usuários de teste

# Frontend (em outro terminal)
cd ../frontend
npm install
```

Arquivos `.env` e `.env.local` já existem com valores para local.

### 2. Rodar

**Terminal 1 – Backend (porta 4000):**
```bash
cd backend && npm run dev
```

**Terminal 2 – Frontend (porta 3000):**
```bash
cd frontend && npm run dev
```

Acesse: **http://localhost:3000**

### Usuários de teste (senha: 123456)

| E-mail | Perfil |
|--------|--------|
| admin@wpsconsult.com.br | Admin |
| gestor@wpsconsult.com.br | Gestor de Projetos |
| andre.nunes@wpsconsult.com.br | Consultor |
| almir@dellamed.com.br | Cliente |

---

## Variáveis de ambiente

### Backend (.env)

| Variável | Descrição |
|----------|-----------|
| DATABASE_URL | URL do PostgreSQL (Supabase pooler ou Railway) |
| DIRECT_URL | URL direta (Supabase: porta 5432; Railway: pode ser igual ao DATABASE_URL) |
| JWT_SECRET | Segredo para assinar tokens |
| CORS_ORIGIN | Origens permitidas (ex: `http://localhost:3000,https://seu-app.web.app`) |
| PORT | Porta do servidor (padrão: 4000) |

### Frontend (.env.local)

| Variável | Descrição |
|----------|-----------|
| NEXT_PUBLIC_API_URL | URL do backend (ex: `http://localhost:4000` ou `https://sua-api.railway.app`) |

---

## Visões do sistema

- **Consultor**: Home, Projetos, Apontamento de horas, Banco de horas
- **Admin**: Tudo do consultor + Configurações (Usuários)
- **Cliente**: Home, Consumo de horas, Abrir chamado
