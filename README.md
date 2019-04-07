# bounded-buffer

## Description
The `Record Semaphore` solution for the classic `Producer-Consumer` problem.

## Example
```ts
import { BoundedBuffer, IProducer } from "../src/bounded-buffer";

class MyProducer implements IProducer<number> {
    async produce(size = 1) {
        let res = [];

        for (var i = 0 ; i < size; i++) {
            res.push({
                data: i
            });
        }

        return res;
    }
}

const producer = new MyProducer();

const boundedBuffer = new BoundedBuffer<number>({
    producer,
    size: 50,
});

const consume = async() => {
    while (true) {
        const res = await boundedBuffer.get();
        console.log(res);
    }
}

const produce = async() => {
    while (true) {
        await boundedBuffer.produce(3);
    }
}

try {
    consume().catch(e => console.log(e));
    produce().catch(e => console.log(e));
} catch(e) {
    console.error(e);
}
```

## LICENSE
MIT