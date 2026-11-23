# Alterações no modelo de dados (atualizar o DER)

Mudanças feitas na branch `feat/integracao-docker` para o banco cobrir o que as telas do front usam.
Tudo é aplicado pela migration `0014_integracao_front` (depois da `0013` do módulo de lote).

## usuarios
| Coluna | Tipo | Observação | Migration |
|---|---|---|---|
| `anexo_id` | `bigint` (era `bigserial`), nulo | FK opcional para `anexo`; o autoincremento impedia cadastrar usuário sem anexo | 0014 |
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
| `telefone` | passa a aceitar nulo (basta telefone, celular ou e-mail) | 0014 |
| `celular` | `varchar(13)` | 0014 |
| `rg` | `varchar(20)` | 0014 |
| `data_nascimento` | `date` | 0014 |
| `estado_civil` | `varchar(30)` | 0014 |
| `profissao` | `varchar(120)` | 0014 |
| `responsavel` | `varchar(256)` | 0014 |
| `imovel_interesse_id` | `varchar(64)` — vira FK quando o módulo de lote existir | 0014 |
| `endereco_cep`, `endereco_logradouro`, `endereco_numero`, `endereco_complemento`, `endereco_bairro`, `endereco_cidade`, `endereco_uf`, `endereco_pais` | `varchar` | 0014 |

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
| `descricao` | padrão `''` | 0014 |
| `id_bairro` | passa a aceitar nulo (o endereço fica em texto, abaixo) | 0014 |
| `codigo` | `varchar(20)` — prefixo dos lotes, ex.: UNI-I | 0014 |
| `data_aprovacao`, `validade_licenca` | `date` | 0014 |
| `cep`, `endereco`, `bairro`, `cidade`, `uf` | `varchar` | 0014 |
| `matricula_mae`, `cartorio`, `numero_registro`, `licenca_ambiental` | `varchar` | 0014 |
| `area_total`, `area_loteavel`, `latitude`, `longitude` | `double precision` | 0014 |

## quadras
| Mudança | Migration |
|---|---|
| `id_loteamento` passa de `bigserial` para `bigint` (FK sem autoincremento) | 0014 |
| `area` `double precision` e `testada_para` `varchar(120)` | 0014 |
| Índice único (`id_loteamento`, `identificacao`): a identificação é única dentro do loteamento, não no sistema todo | 0014 |

## lote
| Mudança | Migration |
|---|---|
| `id_quadra`, `id_logradouro` e `id_anexo` passam de `bigserial` para `bigint`; `id_anexo` aceita nulo (lote sem anexo dava erro de FK) | 0014 |
| `id_quadra`, `id_logradouro`, `area_quadrada`, `valor`, `latitude` e `longitude` aceitam nulo (imóvel avulso ou em rascunho) | 0015 |
| `detalhes` `jsonb`: dados de tela do imóvel (código, título, frente/fundo, valor mínimo, fotos, bloqueio, destaque…) | 0015 |

## Pendente
Reservas, vendas, documentos, histórico do imóvel, interesses do catálogo público, notificações e relatórios
ainda não existem na API; o front usa dados de demonstração nessas telas.
