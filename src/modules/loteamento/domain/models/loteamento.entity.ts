export interface LoteamentoDetalhes {
  codigo: string | null;
  dataAprovacao: string | null;
  cep: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  matriculaMae: string | null;
  areaTotal: number | null;
  areaLoteavel: number | null;
  latitude: number | null;
  longitude: number | null;
  cartorio: string | null;
  numeroRegistro: string | null;
  licencaAmbiental: string | null;
  validadeLicenca: string | null;
}

export const CAMPOS_DETALHES: (keyof LoteamentoDetalhes)[] = [
  "codigo",
  "dataAprovacao",
  "cep",
  "endereco",
  "bairro",
  "cidade",
  "uf",
  "matriculaMae",
  "areaTotal",
  "areaLoteavel",
  "latitude",
  "longitude",
  "cartorio",
  "numeroRegistro",
  "licencaAmbiental",
  "validadeLicenca",
];

export interface LoteamentoEntityProps extends Partial<LoteamentoDetalhes> {
  idLoteamento?: number;
  nome: string;
  descricao: string;
  situacao: string;
  publicado: boolean;
  idBairro: number | null;
}

export class LoteamentoEntity {
  readonly idLoteamento?: number;
  readonly nome: string;
  readonly descricao: string;
  readonly situacao: string;
  readonly publicado: boolean;
  readonly idBairro: number | null;
  readonly detalhes: LoteamentoDetalhes;

  constructor(props: LoteamentoEntityProps) {
    this.idLoteamento = props.idLoteamento;
    this.nome = props.nome;
    this.descricao = props.descricao;
    this.situacao = props.situacao;
    this.publicado = props.publicado;
    this.idBairro = props.idBairro ?? null;
    this.detalhes = Object.fromEntries(
      CAMPOS_DETALHES.map((campo) => [campo, props[campo] ?? null]),
    ) as unknown as LoteamentoDetalhes;
  }
}
