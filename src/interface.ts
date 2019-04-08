export type Callback = (error: Error | null, data: void) => void;

export interface IProducer<T> {
    produce: (max: number) => Promise<Array<IResult<T>>>;
}

export interface IConsumer<T> {
    consume: (items: T[]) => void;
}

export interface Logger {
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    log: (...args: any[]) => void;
}

export interface IOptions {
    bufferSize: number;
    logger?: Logger;
}

export interface IResult<T> {
    error?: Error;
    data?: T;
}
