import { describe, expect, it } from '@jest/globals';
import test from 'node:test';
import retry from '../src/index';

describe('Full test suite', () => {
    it('Should return the correct value', () => {
        test('return value', async () => {
            async function getTwo() {
                return 2;
            }

            const two = await retry(() => getTwo());
            expect(two).toBe(2);
        });
    });

    it('Should retry', () => {
        test('retries', async () => {
            let attempts = 0;
            try {
                await retry(() => fetch('https://9djdj3939.com'), {
                    onError() {
                        attempts++;
                    },
                });
            } catch (e) {}

            // Attempts should be retries + initial attempt
            expect(attempts).toBe(4);
        });
    });

    it('Should bail', () => {
        test('bail', async () => {
            let attempts = 0;
            try {
                await retry(
                    async (bail) => {
                        bail();
                    },
                    {
                        onError: () => attempts++,
                    },
                );
            } catch (e) {}

            expect(attempts).toBe(0);
        });
    });
});
