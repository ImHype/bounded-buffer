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
