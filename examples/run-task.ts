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
                console.log('succ:', succ);
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
