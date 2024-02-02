type RetryOptions = {
    retries?: number;
    delay?: number;
    factor?: number;
    // minTimeout?: number;
    // maxTimeout?: number;
};

const waitFor = (milliseconds: number) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

function loadOptions(options?: RetryOptions) {
    const defaults: RetryOptions = {
        retries: 3,
        delay: 0,
        factor: 1,
    };

    if (!options) {
        return defaults;
    }

    options.retries = options?.retries ?? 3;
    options.delay = options?.delay ?? 0;
    options.factor = options?.factor ?? 1;
    // options.minTimeout = options?.minTimeout ?? null;
    // options.maxTimeout = options?.maxTimeout ?? null;

    return options;
}

export default async function retry<T>(
    operation: () => Promise<T>,
    opts?: RetryOptions,
) {
    const options = loadOptions(opts);

    const maxRetries = options.retries;
    let { delay } = options;
    let retries = 0;
    let returnError: Error;

    while (retries < maxRetries) {
        try {
            const result = await operation();
            return result;
        } catch (err) {
            returnError = err;
            retries++;

            if (retries < maxRetries) {
                if (delay > 0) {
                    if (retries !== 1) {
                        delay = delay * options.factor;
                    }

                    await waitFor(delay);
                }
            }
        }
    }

    throw returnError;
}
