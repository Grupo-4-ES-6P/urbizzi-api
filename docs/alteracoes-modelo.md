# Alterações no modelo de dados (atualizar o DER)

Mudanças feitas na branch `feat/integracao-docker` para o banco cobrir o que as telas do front usam.
Cada item aponta a migration que aplica a mudança.

## usuarios
| Coluna | Tipo | Observação | Migration |
|---|---|---|---|
| `anexo_id` | `bigint` (era `bigserial`), nulo | FK opcional para `anexo`; o autoincremento impedia cadastrar usuário sem anexo | 0013 |
| `perfil` | enum `perfil_usuario`, padrão `CORRETOR` | ADMINISTRADOR, GERENTE_COMERCIAL, CORRETOR, COLETOR | 0014 |
| `ultimo_acesso` | `timestamptz`, nulo | Atualizado a cada login | 0014 |

## perfil_permissao (nova)
Matriz de permissões por perfil (RF34). Chave primária: (`perfil`, `permissao`).

| Coluna | Tipo |
|---|---|
| `perfil` | enum `perfil_usuario` |
| `permissao` | `varchar(64)` — ex.: `CRIAR_PROPOSTA`, `GERENCIAR_USUARIOS` |

## cliente
| Coluna | Tipo | Migration |
|---|---|---|
| `telefone` | passa a aceitar nulo (basta telefone, celular ou e-mail) | 0015 |
| `celular` | `varchar(13)` | 0015 |
| `rg` | `varchar(20)` | 0015 |
| `data_nascimento` | `date` | 0015 |
| `estado_civil` | `varchar(30)` | 0015 |
| `profissao` | `varchar(120)` | 0015 |
| `responsavel` | `varchar(256)` | 0015 |
| `imovel_interesse_id` | `varchar(64)` — vira FK quando o módulo de lote existir | 0015 |
| `endereco_cep`, `endereco_logradouro`, `endereco_numero`, `endereco_complemento`, `endereco_bairro`, `endereco_cidade`, `endereco_uf`, `endereco_pais` | `varchar` | 0015 |

## cliente_contato (nova)
Contatos comerciais do cliente (RF12). `id_cliente` → `cliente` com `ON DELETE CASCADE`.

| Coluna | Tipo |
|---|---|
| `id_contato` | `bigserial` PK |
| `id_cliente` | `bigint` FK |
| `data` | `date` |
| `canal` | `varchar(40)` |
| `responsavel` | `varchar(256)` |
| `imovel_id` | `varchar(64)`, nulo |
| `assunto` | `text` |
| `resultado` | `varchar(20)` — em_andamento, positivo, sem_retorno, negativo, novo |

## loteamento
| Coluna | Tipo | Migration |
|---|---|---|
| `descricao` | padrão `''` | 0016 |
| `id_bairro` | passa a aceitar nulo (o endereço fica em texto, abaixo) | 0016 |
| `codigo` | `varchar(20)` — prefixo dos lotes, ex.: UNI-I | 0016 |
| `data_aprovacao`, `validade_licenca` | `date` | 0016 |
| `cep`, `endereco`, `bairro`, `cidade`, `uf` | `varchar` | 0016 |
| `matricula_mae`, `cartorio`, `numero_registro`, `licenca_ambiental` | `varchar` | 0016 |
| `area_total`, `area_loteavel`, `latitude`, `longitude` | `double precision` | 0016 |

## quadras
| Mudança | Migration |
|---|---|
| `id_loteamento` passa de `bigserial` para `bigint` (FK sem autoincremento) | 0017 |
| `area` `double precision` e `testada_para` `varchar(120)` | 0017 |
| Índice único (`id_loteamento`, `identificacao`): a identificação é única dentro do loteamento, não no sistema todo | 0017 |

## Pendente (depende do módulo de lote)
Reservas, vendas, documentos, histórico do imóvel, interesses do catálogo público, notificações e relatórios
ainda não existem na API; o front usa dados de demonstração nessas telas.
