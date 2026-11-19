export interface QuadraEntityProps {
    id?: bigint;
    identificacao?: string;
    idLoteamento?: bigint;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Quadra {
    private _id?: bigint;
    private _identificacao?: string;
    private _idLoteamento?: bigint;
    private _createdAt: Date;
    private _updatedAt: Date;

    // constutor
    constructor(createdAt?: Date, updatedAt?: Date) {
        this._createdAt = createdAt ?? new Date();
        this._updatedAt = updatedAt ?? new Date();
    }

    // getters
    get id(): bigint | null {
        return this.id === undefined ? null : this._id!;
    }
    get identificacao(): string | null {
        return this._identificacao === undefined ? null : this._identificacao!;
    }
    get idLoteamento(): bigint | null {
        return this.idLoteamento === undefined ? null : this._idLoteamento!;
    }
    get createdAt(): Date {
        return this._createdAt;
    }
    get updatedAt(): Date {
        return this._updatedAt;
    }

    // setters
    set id(id: bigint | undefined) {
        this._id = id;
    }
    set identificacao(identificacao: string | undefined) {
        this._identificacao = identificacao;
    }
    set idLoteamento(idLoteamento: bigint | undefined) {
        this._idLoteamento = idLoteamento;
    }
    set createdAt(createdAt: Date) {
        this._createdAt = createdAt;
    }
    set updatedAt(updatedAt: Date) {
        this._updatedAt = updatedAt;
    } 
}