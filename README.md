# Urbizzi API

Base inicial para backend da Urbizzi usando Node.js + TypeScript + Express.

## Requisitos

- Node.js 20+
- npm 10+

## Setup

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

## Scripts

- `npm run dev`: sobe a API em modo desenvolvimento com reload
- `npm run build`: compila TypeScript para `dist`
- `npm start`: executa build compilado
- `npm run test`: roda testes com Vitest
- `npm run lint`: valida com ESLint
- `npm run format`: formata com Prettier
- `npm run typecheck`: valida tipagem sem gerar build

## Estrutura

```text
src/
	app.ts
	server.ts
	config/
		env.ts
	controllers/
		health.controller.ts
	routes/
		index.ts
tests/
	health.test.ts
```

## Endpoints iniciais

- `GET /`
- `GET /api/health`