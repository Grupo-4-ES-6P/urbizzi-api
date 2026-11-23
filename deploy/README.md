# Rodando o Urbizzi com Docker

Sobe banco (PostgreSQL), API e front com um comando. Só precisa do [Docker](https://docs.docker.com/get-docker/) instalado.

## Usando as imagens publicadas (qualquer computador)

```bash
cd deploy
cp .env.example .env      # edite as senhas antes de subir
docker compose up -d
```

- Sistema: http://localhost:8080
- API / Swagger: http://localhost:3001/docs
- Login inicial: `ADMIN_EMAIL` / `ADMIN_PASSWORD` do `.env`

As imagens vêm de `ghcr.io/grupo-4-es-6p/urbizzi-api` e `ghcr.io/grupo-4-es-6p/urbizzi-web`.
Use `URBIZZI_TAG=dev` no `.env` para a versão da branch `dev`.

## Construindo a partir do código (desenvolvimento)

Com os dois repositórios clonados lado a lado (`urbizzi-api/` e `urbizzi-web/`):

```bash
cd urbizzi-api/deploy
docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --build
```

Se o front estiver em outro lugar, ajuste `WEB_PATH` no `.env`.

## Comandos úteis

```bash
docker compose ps              # status
docker compose logs -f api     # logs da API
docker compose pull            # baixa a versão mais nova das imagens
docker compose down            # para tudo (mantém os dados)
docker compose down -v         # para tudo e APAGA o banco
```

## Como funciona

- A API aplica as migrations sozinha ao iniciar e cria o administrador na primeira vez.
- O front (Nginx) repassa `/api/*` para a API, então o navegador fala só com `localhost:8080`.
- Banco e arquivos enviados ficam nos volumes `db-data` e `uploads`.
- A cada push na `main` ou `dev`, o GitHub Actions publica imagens novas (amd64 e arm64).
