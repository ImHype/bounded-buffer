import { Semaphore } from "./semaphore";
import { IOptions, IResult } from "./interface";


export class BoundedBuffer<T> {
    protected options: IOptions;

    protected full: Semaphore = new Semaphore(0);

    protected empty: Semaphore;

    constructor(options: IOptions) {
        this.options = options;
        
        this.empty = new Semaphore(this.bufferSize);
    }

    get bufferSize() {
        return this.options.bufferSize;
    }
}