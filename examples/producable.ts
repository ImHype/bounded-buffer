import { Producable, IConsumer } from "../src";

const sleep = (n: number) => new Promise((resolve) => setTimeout(resolve, n));

interface Task {
    name: string;
    desc: string;
    succ?: boolean;
    callback: {(succ: boolean): void}
}

class MyConsumer implements IConsumer<Task> {
    async consume(tasks: Task[]) {
        tasks.forEach((task) => {
            setTimeout(() => task.callback(true), 1000);
        });
    }
};

const producable = new Producable<Task>({
    consumer: new MyConsumer(),
    bufferSize: 10,
    sizePerRound: 10
});

const addTasks = async() => {
    while (true) {
        await producable.putItem({
            name: 'hello',
            desc: 'world',
            callback(succ) {
                console.log('Recieve the result of the task:', succ);
            }
        });
        await sleep(5);
    }
}

addTasks()
    .catch(e => console.error(e))
    .then(() => producable.destroy());
