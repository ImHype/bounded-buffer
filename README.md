# bounded-buffer

![](https://travis-ci.com/ImHype/bounded-buffer.svg?branch=master)


## 描述
使用 `Record Semaphore` 的方案，解决经典 `Producer-Consumer` 问题。

## API

### BoundedBuffer
这是普通的生产消费者模式，`produce` 与 `consume` 的操作全有自己处理，且没有批量接口。

#### 例子

```ts
import { BoundedBuffer } from 'bounded-buffer';

const boundedBuffer = new BoundedBuffer<number>({
    bufferSize: 1000
});

await boundedBuffer.putItem(1);
await boundedBuffer.putItem(2);
await boundedBuffer.putItem(3);

const res = await boundedBuffer.getItem();
```

### ProducerRuner
传入 `producer`，由 `BoundedBuffer` 后台运行 `producer.produce`。可以批量操作，配置 `options.sizePerRound` 设置每次 `produce` 动作的次数上限。

#### 适用场景
生产资源。

#### 例子
```ts
import { RunProducer } from 'bounded-buffer';

const producer = new class implements IProducer<number> {
    public async produce(size = 1) {
        const res: Array<IResult<number>> = [];
        for (let i = 0; i < size; i++) {
            res.push({
                data: i
            });
        }
        return res;
    }
}();

const boundedBuffer = new RunProducer<number>({
    producer,
    bufferSize: 10,
    sizePerRound: 10
});
const res1 = await boundedBuffer.getItem();
const res2 = await boundedBuffer.getItem();
const res3 = await boundedBuffer.getItem();
```

### ConsumerRuner
传入 `consumer`，由 `BoundedBuffer` 后台运行 `consumer.consume`。可以批量操作，配置 `options.sizePerRound` 设置每次 `consume` 动作的次数上限。

#### 适用场景
发布与消费任务。

#### 例子

```ts
import { RunConsumer } from 'bounded-buffer';

interface Task {
    name: string;
    callback: (succ: boolean) => void;
}

const consumer = new class implements IConsumer<Task> {
    public async consume(tasks: Task[]) {
        tasks.forEach(task => {
            task.callback && task.callback(true);
        });
    }
}();

const boundedBuffer = new RunConsumer<Task>({
    consumer,
    bufferSize: 10,
    sizePerRound: 10
});

await boundedBuffer.putItem({
    name: 'clearLog'
});

await boundedBuffer.putItem({
    name: 'doRequest'
});

```

## LICENSE
MIT