/**
 * TODO: Add "minTimeout" & "maxTimeout" options
 */
type RetryOptions = {
    retries?: number;
    delay?: number;
    factor?: number;
    onError?: (err: Error, attempt: number) => unknown;
};

const waitFor = (milliseconds: number) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

function loadOptions(options?: RetryOptions) {
    const defaults: RetryOptions = {
        retries: 3,
        delay: 0,
        factor: 1,
        onError: null,
    };

    if (!options) {
        return defaults;
    }

    for (let opt in defaults) {
        if (!options[opt]) {
            options[opt] = defaults[opt];
        }
    }

    return options;
}

export default async function retry<T>(
    operation: () => Promise<T>,
    opts?: RetryOptions,
) {
    const options = loadOptions(opts);

    const maxRetries = options.retries;
    let { delay } = options;
    let attempts = 0;
    let returnError: Error;

    if (maxRetries === 0) {
        return operation;
    }

    while (attempts < maxRetries) {
        try {
            const result = await operation();
            return result;
        } catch (err) {
            returnError = err;
            attempts++;

            if (options.onError) {
                options.onError(err, attempts);
            }

            if (attempts < maxRetries) {
                if (delay > 0) {
                    if (attempts !== 1) {
                        delay = delay * options.factor;
                    }

                    await waitFor(delay);
                }
            }
        }
    }

    throw returnError;
}
