export interface AnexoEntityProps {
  idAnexo: number;
  tipoArquivo: string;
  caminhoArquivo: string;
  dataUpload: Date;
}

export class AnexoEntity {
  readonly idAnexo: number;
  readonly tipoArquivo: string;
  readonly caminhoArquivo: string;
  readonly dataUpload: Date;

  constructor(props: AnexoEntityProps) {
    this.idAnexo = props.idAnexo;
    this.tipoArquivo = props.tipoArquivo;
    this.caminhoArquivo = props.caminhoArquivo;
    this.dataUpload = props.dataUpload;
  }
}
