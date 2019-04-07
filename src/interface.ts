export interface Callback {
    (error: Error | null, data: void): void
}
export interface IProducer<T> {
    produce: {
        (max: number): Promise<Array<IResult<T>>>
    }
}

export interface IConsumer<T> {
    consume: {
        (items: Array<T>): void
    }
}

export interface IOptions {
    bufferSize: number;
    sizePerRound?: number;
}

export interface IResult<T> {
    error?: Error, data?: T
}