import { BoundedBuffer, IProducer } from "../src/";

const sleep = (n: number) => new Promise((resolve) => setTimeout(resolve, n));

const producer = new class implements IProducer<number> {
    async produce(size = 1) {
        let res = [];

        for (var i = 0 ; i < size; i++) {
            res.push({
                data: i
            });
        }

        return res;
    }
}();

const boundedBuffer = new BoundedBuffer<number>({
    producer,
    size: 10,
});


const consume = async() => {
    while (true) {
        const res = await boundedBuffer.get();
        console.log('consumed', boundedBuffer['buffer'].length);
        await sleep(100);
    }
}

const produce = async() => {
    while (true) {
        await boundedBuffer.produce(9);
        console.log('produced', boundedBuffer['buffer'].length);
    }
}

try {
    produce();
    consume();
} catch(e) {
    console.error(e);
}
