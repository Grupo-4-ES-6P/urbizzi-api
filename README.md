# Urbizzi

Projeto base em NestJS.

## Pré-requisitos

- Node.js >= 20
- npm >= 10

## Instalação

```bash
npm install
```

## Ambiente

Crie um `.env` com:

```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/urbizzi
```

## Rodar em desenvolvimento

```bash
npm run start:dev
```

A rota de verificação inicial está disponível em:

- `GET /health`

## Estrutura

```txt
src/
  app.controller.ts
  app.module.ts
  app.service.ts
  main.ts
  modules/
  shared/
```

## Scripts

- `npm run start:dev`: inicia com hot reload
- `npm run build`: gera `dist/`
- `npm run start:prod`: executa build
- `npm run db:generate`: gera migrations com Drizzle
- `npm run db:migrate`: aplica migrations
- `npm run db:push`: sincroniza schema direto no banco
- `npm run db:studio`: abre Drizzle Studio
- `npm run lint`: executa lint
- `npm run check`: executa validações do Biome
