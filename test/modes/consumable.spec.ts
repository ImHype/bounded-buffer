import { Consumable, IConsumer } from '../../src';

const utils = {
    sleep: (n: number) => new Promise(resolve => setTimeout(resolve, n))
};
describe('bounded-buffer#Consumable, such as run-task', () => {
    interface Task {
        name: string;
        desc: string;
        succ?: boolean;
        callback: (succ: boolean) => void;
    }

    // tslint:disable-next-line
    const consumer = new class implements IConsumer<Task> {
        public async consume(tasks: Task[]) {
            tasks.forEach(task => {
                task.callback(true);
            });
        }
    }();

    const addTasks = async (boundedBuffer: Consumable<Task>, n: number) => {
        let i = 0;
        const results: boolean[] = [];

        while (i < n) {
            boundedBuffer.putItem({
                name: 'hello',
                desc: 'world',
                callback(succ: boolean) {
                    results.push(succ);
                }
            });
            i++;
        }

        await utils.sleep(10);

        return results;
    };

    it('#run-task, put 10 tasks', async () => {
        const boundedBuffer = new Consumable<Task>({
            consumer,
            bufferSize: 10,
            sizePerRound: 10
        });
        let results: boolean[] = [];

        try {
            results = await addTasks(boundedBuffer, 10);
        } catch (e) {
            console.error(e);
        }

        // tslint:disable-next-line
        expect(results.length).toBe(10);
        boundedBuffer.destroy();
    });

    it('#run-task, put 20 tasks', async () => {
        const boundedBuffer = new Consumable<Task>({
            consumer,
            bufferSize: 10,
            sizePerRound: 10
        });
        let results: boolean[] = [];

        try {
            results = await addTasks(boundedBuffer, 20);
        } catch (e) {
            console.error(e);
        }

        // tslint:disable-next-line
        expect(results.length).toBe(20);
        boundedBuffer.destroy();
    });
});
