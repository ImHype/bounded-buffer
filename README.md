# bounded-buffer

## Description
The `Record Semaphore` way's solution for the classic `Producer-Consumer` problem.

## Example

### Make Resource
```ts
import { IProducer, ProduceInBackground } from "../src";

const sleep = (n: number) => new Promise((resolve) => setTimeout(resolve, n));

const producer = new class implements IProducer<number> {
    async produce( size = 1 ) {
        let res = [];

        for (var i = 0 ; i < size; i++) {
            res.push({
                data: i
            });
        }

        return res;
    }
}();

const boundedBuffer = new ProduceInBackground<number>({
    producer,
    bufferSize: 10,
    sizePerRound: 9
});

const consume = async() => {
    while (true) {
        const res = await boundedBuffer.getItem();
        console.log('getItem', res);
        await sleep(100);
    }
}


try {
    consume();
} catch(e) {
    console.error(e);
}
```

### Run Tasks
```ts
import { ConsumeInBackground, IConsumer } from "../src";

const sleep = (n: number) => new Promise((resolve) => setTimeout(resolve, n));

interface Task {
    name: string;
    desc: string;
    succ?: boolean;
    callback: {(succ: boolean): void}
}
const consumer = new class implements IConsumer<Task> {
    async consume(tasks: Task[]) {
        tasks.forEach((task) => {
            setTimeout(() => task.callback(true), 1000);
        });
    }
}();

const boundedBuffer = new ConsumeInBackground<Task>({
    consumer,
    bufferSize: 10,
    sizePerRound: 10
});

const addTasks = async() => {
    while (true) {
        await boundedBuffer.putItem({
            name: 'hello',
            desc: 'world',
            callback(succ) {
                console.log('succ', succ);
            }
        });
        await sleep(5);
    }
}

try {
    addTasks();
} catch(e) {
    console.error(e);
}
```

## LICENSE
MIT