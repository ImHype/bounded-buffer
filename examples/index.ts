import { BoundedBuffer, IProducer } from "../src/";

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
    auto: true
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
    consume();
    produce();
} catch(e) {
    console.error(e);
}
