# Módulo de clientes

## Objetivo

O módulo registra pessoas físicas e jurídicas atendidas pela Urbizzi. Cliente é exclusivamente um cadastro comercial, sem relação com usuário. Cadastrar, editar, desativar ou reativar um cliente não cria nem modifica contas. Autenticação continua no módulo de usuário; as rotas administrativas de clientes exigem JWT e permissões.

## Modelo de dados

### Cliente

| Campo | Regra |
| --- | --- |
| `id` | Identificador `bigint` gerado pelo banco |
| `tipoDocumento` | `CPF` ou `CNPJ` |
| `documentoIdentificacao` | Somente dígitos, validado e único |
| `nome` | Obrigatório para CPF |
| `razaoSocial` | Obrigatória para CNPJ |
| `nomeFantasia` | Opcional para CNPJ |
| `telefone` | Obrigatório, somente dígitos, entre 10 e 13 caracteres |
| `email` | Email comercial opcional |
| `origem` | Texto livre opcional |
| `status` | `ATIVO` ou `INATIVO` |
| `dataCadastro` | Gerada automaticamente |
| `dataAtualizacao` | Atualizada automaticamente |

O nome exibido é `nome` para CPF. Para CNPJ, é usado `nomeFantasia` quando informado e `razaoSocial` como alternativa.

## Permissões

| Permissão | Uso |
| --- | --- |
| `CLIENTE_CRIAR` | Cadastrar cliente |
| `CLIENTE_VISUALIZAR` | Listar e consultar cliente |
| `CLIENTE_ATUALIZAR` | Alterar dados comerciais |
| `CLIENTE_DESATIVAR` | Desativar o cadastro comercial |
| `CLIENTE_REATIVAR` | Reativar somente o cadastro comercial |

Não existe login, senha ou convite associado ao cliente.

## Rotas

Todas as rotas exigem JWT e a permissão indicada.

| Método | Rota | Permissão | Descrição |
| --- | --- | --- | --- |
| `POST` | `/clientes` | `CLIENTE_CRIAR` | Cria cadastro comercial |
| `GET` | `/clientes` | `CLIENTE_VISUALIZAR` | Lista clientes com filtros e paginação |
| `GET` | `/clientes/:id` | `CLIENTE_VISUALIZAR` | Consulta cliente por ID |
| `PATCH` | `/clientes/:id` | `CLIENTE_ATUALIZAR` | Atualiza dados do cliente |
| `PATCH` | `/clientes/:id/desativar` | `CLIENTE_DESATIVAR` | Desativa somente o cliente |
| `PATCH` | `/clientes/:id/reativar` | `CLIENTE_REATIVAR` | Reativa o cadastro comercial |

### Criação

Exemplo de pessoa física:

```json
{
  "tipoDocumento": "CPF",
  "documentoIdentificacao": "529.982.247-25",
  "nome": "Maria Silva",
  "telefone": "(45) 99999-9999",
  "email": "maria@example.com",
  "origem": "Indicação"
}
```

Exemplo de pessoa jurídica:

```json
{
  "tipoDocumento": "CNPJ",
  "documentoIdentificacao": "04.252.011/0001-10",
  "razaoSocial": "Empresa Exemplo Ltda",
  "nomeFantasia": "Empresa Exemplo",
  "telefone": "4530303030",
  "origem": "Site"
}
```

A criação retorna `{ "cliente": { ... } }`. Não retorna `conviteEnviado`, `usuarioId` ou `acesso`. Os antigos campos `criarAcesso` e `emailAcesso` são rejeitados com HTTP 400.

### Filtros e paginação

`GET /clientes` aceita:

- `nome`
- `documentoIdentificacao`
- `tipoDocumento`
- `email`
- `telefone`
- `origem`
- `status`
- `page` — padrão `1`
- `perPage` — padrão `10`, máximo `100`

## Migrações

- `0001_spooky_owl.sql` e `0002_dapper_sunset_bain.sql`: histórico original, mantido intacto.
- `0003_desvincula_cliente_usuario.sql`: remove a FK, índice e coluna `cliente.id_usuario` e a tabela `cliente_access_token`.

Aplicar com `npm run db:migrate` antes de iniciar a versão atual. Funciona em banco novo (histórico completo) ou com as duas migrations anteriores já aplicadas.

Clientes e usuários existentes são preservados, inclusive credenciais, permissões e status de usuário. A migration descarta as associações antigas e tokens de convite; faça backup antes de aplicá-la em banco com dados. Restaurar os vínculos exige recuperar esse backup, além de reverter código/schema. Um simples revert de commit não restaura os dados removidos.

As rotas de acesso/convite foram removidas e o login não retorna mais `idCliente`. O status de usuário existente é mantido; não há mais alteração desse status por operações em clientes. Contas pendentes antigas, se houver, precisam ser avaliadas pela equipe no módulo de usuário.

## Testes

`npm test -- --runInBand --no-watchman` executa os testes unitários.

O teste de migração exige um PostgreSQL descartável vazio, com nome do banco terminado em `_test`:

```sh
CLIENTE_MIGRATION_TEST_URL=postgresql://usuario@localhost:55433/urbizzi_unlink_test npm test -- --runInBand --no-watchman
```

Ele aplica as migrations antigas, insere cliente vinculado, usuário e convite, aplica a nova migration e verifica preservação de dados e independência do cadastro. As operações são revertidas ao final da transação.
