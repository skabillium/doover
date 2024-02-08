type RetryOptions = {
    retries?: number;
    delay?: number;
    factor?: number;
    onError?: (err: Error, attempt: number) => unknown;
};

type RetryFunction<T> = (bail: (e?: Error) => void) => Promise<T>;

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

export default function retry<T>(
    operation: RetryFunction<T>,
    opts?: RetryOptions,
) {
    const options = loadOptions(opts);

    const maxAttempts = options.retries + 1;
    let { delay } = options;
    let attempts = 0;
    let returnError: Error;

    // No need for running any extra logic if retries are set to 0
    if (options.retries === 0) {
        return operation;
    }

    return new Promise(async (resolve, reject) => {
        function bail(err?: Error) {
            reject(err || new Error('Abort'));
        }

        while (attempts < maxAttempts) {
            try {
                const result = await operation(bail);
                return resolve(result);
            } catch (err) {
                returnError = err;
                attempts++;

                if (options.onError) {
                    options.onError(err, attempts);
                }

                if (attempts < maxAttempts) {
                    if (delay > 0) {
                        if (attempts !== 1) {
                            delay = delay * options.factor;
                        }

                        await waitFor(delay);
                    }
                }
            }
        }

        reject(returnError);
    });
}
