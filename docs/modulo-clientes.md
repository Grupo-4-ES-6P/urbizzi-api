# Módulo de clientes

## Objetivo

O módulo registra pessoas físicas e jurídicas atendidas pela Urbizzi. O cadastro comercial existe independentemente de login: um cliente pode consultar o catálogo público sem autenticação e pode, opcionalmente, receber uma conta `Usuario` para acesso futuro.

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
| `usuarioId` | Associação opcional e única com `Usuario` |
| `dataCadastro` | Gerada automaticamente |
| `dataAtualizacao` | Atualizada automaticamente |

O nome exibido é `nome` para CPF. Para CNPJ, é usado `nomeFantasia` quando informado e `razaoSocial` como alternativa.

### Acesso

O email de acesso é independente do email comercial. A conta associada possui um dos estados:

- `PENDENTE_ATIVACAO`: convite enviado, senha ainda não definida;
- `ATIVO`: login permitido;
- `INATIVO`: login bloqueado.

Ao criar acesso, o sistema gera um token aleatório de uso único. Somente o hash SHA-256 é persistido. O link expira em 24 horas. A senha definida pelo cliente é armazenada com bcrypt.

Falhas no SMTP não desfazem o cadastro: a conta permanece pendente e o convite pode ser reenviado. Cada reenvio invalida o token anterior.

## Permissões

| Permissão | Uso |
| --- | --- |
| `CLIENTE_CRIAR` | Cadastrar cliente |
| `CLIENTE_VISUALIZAR` | Listar e consultar cliente |
| `CLIENTE_ATUALIZAR` | Alterar dados comerciais |
| `CLIENTE_DESATIVAR` | Desativar cliente e bloquear seu acesso |
| `CLIENTE_REATIVAR` | Reativar somente o cadastro comercial |
| `CLIENTE_GERENCIAR_ACESSO` | Criar, bloquear, reativar ou reenviar convite |
| `CLIENTE_ACESSAR` | Permissão inicial da conta do cliente |

A reativação do cadastro comercial não reativa automaticamente o login. O acesso deve ser reativado explicitamente.

## Rotas

Todas as rotas exigem JWT e a permissão indicada, exceto a ativação do acesso.

| Método | Rota | Permissão | Descrição |
| --- | --- | --- | --- |
| `POST` | `/clientes` | `CLIENTE_CRIAR` | Cria cliente, opcionalmente com acesso |
| `GET` | `/clientes` | `CLIENTE_VISUALIZAR` | Lista clientes com filtros e paginação |
| `GET` | `/clientes/:id` | `CLIENTE_VISUALIZAR` | Consulta cliente por ID |
| `PATCH` | `/clientes/:id` | `CLIENTE_ATUALIZAR` | Atualiza dados do cliente |
| `PATCH` | `/clientes/:id/desativar` | `CLIENTE_DESATIVAR` | Desativa cliente e usuário associado |
| `PATCH` | `/clientes/:id/reativar` | `CLIENTE_REATIVAR` | Reativa o cadastro comercial |
| `POST` | `/clientes/:id/acesso` | `CLIENTE_GERENCIAR_ACESSO` | Cria acesso posteriormente |
| `PATCH` | `/clientes/:id/acesso/bloquear` | `CLIENTE_GERENCIAR_ACESSO` | Bloqueia somente o login |
| `PATCH` | `/clientes/:id/acesso/reativar` | `CLIENTE_GERENCIAR_ACESSO` | Reativa somente o login |
| `POST` | `/clientes/:id/acesso/reenviar-convite` | `CLIENTE_GERENCIAR_ACESSO` | Gera e envia novo convite |
| `POST` | `/clientes/ativar-acesso` | Pública | Define a senha usando o token |

### Criação

Exemplo de pessoa física sem acesso:

```json
{
  "tipoDocumento": "CPF",
  "documentoIdentificacao": "529.982.247-25",
  "nome": "Maria Silva",
  "telefone": "(45) 99999-9999",
  "email": "maria@example.com",
  "origem": "Indicação",
  "criarAcesso": false
}
```

Exemplo de pessoa jurídica com acesso:

```json
{
  "tipoDocumento": "CNPJ",
  "documentoIdentificacao": "04.252.011/0001-10",
  "razaoSocial": "Empresa Exemplo Ltda",
  "nomeFantasia": "Empresa Exemplo",
  "telefone": "4530303030",
  "origem": "Site",
  "criarAcesso": true,
  "emailAcesso": "acesso@empresa.com"
}
```

Quando `criarAcesso` é verdadeiro, `emailAcesso` é opcional se o email comercial estiver preenchido. A resposta inclui `conviteEnviado`, permitindo identificar falha de configuração ou entrega SMTP.

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

### Ativação

```json
{
  "token": "token-recebido-no-link",
  "senha": "senha-com-no-minimo-8-caracteres"
}
```

Após a ativação, o token é removido e a conta passa para `ATIVO`. O login utiliza `POST /auth/login`.

## Configuração SMTP

```env
CLIENTE_ACTIVATION_URL=http://localhost:3000/ativar-acesso
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=usuario
SMTP_PASS=senha
SMTP_FROM=Urbizzi <nao-responda@urbizzi.com.br>
```

## Migrações

- `0001_spooky_owl.sql`: tabela `cliente`, enums e índices únicos;
- `0002_dapper_sunset_bain.sql`: status de usuário e tokens de ativação.

As migrações são expansivas. Usuários existentes recebem o status `ATIVO` por padrão. O rollback deve remover primeiro `cliente_access_token`, depois a coluna e o enum de status de usuário; a tabela de cliente somente deve ser removida se seus dados puderem ser descartados.
