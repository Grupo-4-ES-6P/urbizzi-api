export interface LoteProps {
    id?: bigint;
    matricula?: string | null;
    numeroLote?: number;
    tipo?: string;
    areaQuadrada?: number;
    valor?: number;
    estado?: string;
    informacoesComplementares?: string | null;
    latitude?: number;
    longitude?: number;
    publicado?: boolean;
    idQuadra: bigint;
    idLogradouro: bigint;
    idAnexo?: bigint;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Lote {
    private _id?: bigint;
    private _matricula?: string;
    private _numeroLote?: number;
    private _tipo?: string;
    private _areaQuadrada?: number;
    private _valor?: number;
    private _estado?: string;
    private _informacoesComplementares?: string;
    private _latitude?: number;
    private _longitude?: number;
    private _publicado?: boolean;
    private _idQuadra: bigint;
    private _idLogradouro: bigint;
    private _idAnexo?: bigint;
    private _createdAt?: Date;
    private _updatedAt?: Date;

    constructor(idQuadra: bigint, idlogradouro: bigint, id?: bigint, publicado?: boolean, createdAt?: Date, updatedAt?: Date) {
        this._idQuadra = idQuadra;
        this._idLogradouro = idlogradouro;
        this._id = id;
        this._publicado = publicado ?? false;
        this._createdAt = createdAt ?? new Date();
        this._updatedAt = updatedAt ?? new Date();
    }

    // getters
    get id() {
        return this._id;
    }
    get matricula() {
        return this._matricula;
    }
    get numeroLote() {
        return this._numeroLote;
    }
    get tipo() {
        return this._tipo;
    }
    get areaQuadrada() {
        return this._areaQuadrada;
    }
    get valor() {
        return this._valor;
    }
    get estado() {
        return this._estado;
    }
    get informacoesComplementares() {
        return this._informacoesComplementares;
    }
    get latitude() {
        return this._latitude;
    }
    get longitude() {
        return this._longitude;
    }
    get publicado() {
        return this._publicado;
    }
    get idQuadra() {
        return this._idQuadra;
    }
    get idLogradouro() {
        return this._idLogradouro;
    }
    get idAnexo() {
        return this._idAnexo;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }

    // setters
    set id(id: bigint | undefined) {
        this._id = id;
    }
    set matricula(matricula: string | undefined) {
        this._matricula = matricula;
    }
    set numeroLote(numeroLote: number | undefined) {
        this._numeroLote = numeroLote;
    }
    set tipo(tipo: string | undefined) {
        this._tipo = tipo;
    }
    set areaQuadrada(areaQuadrada: number | undefined) {
        this._areaQuadrada = areaQuadrada;
    }
    set valor(valor: number | undefined) {
        this._valor = valor;
    }
    set estado(estado: string | undefined) {
        this._estado = estado;
    }
    set informacoesComplementares(informacoesComplementares: string | undefined) {
        this._informacoesComplementares = informacoesComplementares;
    }
    set latitude(latitude: number | undefined) {
        this._latitude = latitude;
    }
    set longitude(longitude: number | undefined) {
        this._longitude = longitude;
    }
    set publicado(publicado: boolean | undefined) {
        this._publicado = publicado ?? false;
    }
    set idQuadra(idQuadra: bigint) {
        this._idQuadra = idQuadra;
    }
    set idLogradouro(idLogradouro: bigint) {
        this._idLogradouro = idLogradouro;
    }
    set idAnexo(idAnexo: bigint | undefined) {
        this._idAnexo = idAnexo;
    }
    set createdAt(createdAt: Date | undefined) {
        this._createdAt = createdAt ?? new Date();
    }
    set updatedAt(updatedAt: Date | undefined) {
        this._updatedAt =  updatedAt ?? new Date();
    }

}