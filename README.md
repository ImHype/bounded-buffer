bounded-buffer
======

[![travis-ci](https://travis-ci.com/ImHype/bounded-buffer.svg)](https://travis-ci.com/ImHype/bounded-buffer)
[![codecov](https://codecov.io/gh/ImHype/bounded-buffer/branch/master/graph/badge.svg)](https://codecov.io/gh/ImHype/bounded-buffer)


The Node.js SDK for the classic [Producer-Consumer](https://en.wikipedia.org/wiki/Producer%E2%80%93consumer_problem) problem, using the `Record Semaphore` solution.

Installation
------------

```
$ npm install stream
```

Basic usage
-------------

```javascript
import BoundedBuffer from "bounded-buffer";

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
```




Running in background
-------------

Sometimes the producers or consumers need be running in background:

* [Run producer automatically](./examples/consumable)
* [Run consumer automatically](./examples/producable)

License
-------
(MIT)

Copyright (c) 2019 ImHype
