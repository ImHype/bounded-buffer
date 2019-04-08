import { BoundedBuffer } from "../src";

const sleep = (n: number) => new Promise((resolve) => setTimeout(resolve, n));

const boundedBuffer = new BoundedBuffer<number>({
    bufferSize: 10,
});

const put = async(n: number) => {
    let i = 0;
    while (i < n) {
        await boundedBuffer.putItem(123);
        i++;
        await sleep(5);
    }
}

const get = async(n: number) => {
    let i = 0;
    while (i < n) {
        await boundedBuffer.getItem();
        i++;
        await sleep(5);
    }
}


Promise.all(
    [
        put(100)
            .catch(e => console.error(e)),
        get(100)
            .catch(e => console.error(e))
    ]
).then(() => {
    boundedBuffer.destroy();
    console.log('bufferSize', boundedBuffer['buffer'].length)
})
