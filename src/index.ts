type RetryOptions = {
    retries?: number;
    delay?: number;
    minTimeout?: number;
    maxTimeout?: number;
};

const wait = (milliseconds: number) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

export default async function retry<T>(
    operation: () => Promise<T>,
    options?: RetryOptions,
) {
    const maxRetries = options?.retries ?? 3;
    const delay = options?.delay ?? 0;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            const result = await operation();
            return result;
        } catch (err) {
            retries++;

            if (retries < maxRetries) {
                if (delay > 0) {
                    await wait(delay);
                }
            }
        }
    }

    throw new Error(`Failed after ${maxRetries} attempts`);
}
