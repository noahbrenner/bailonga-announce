export function objectFromEntries<
    const T extends readonly Readonly<[PropertyKey, unknown]>[]
>(entries: T) {
    return Object.fromEntries(entries) as {
        [Entry in T[number] as Entry[0]]: Entry[1];
    };
}
