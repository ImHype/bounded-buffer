export const newArray = <T>(num: number, factory: (index: number) => T) => {
    const results: T[] = [];

    for (let i = 0; i < num; i++) {
        results.push(factory(i));
    }

    return results;
};
