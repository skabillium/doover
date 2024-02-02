import { describe, expect, it } from '@jest/globals';
import retry from '../src/index';
import test from 'node:test';

describe('Full test suite', () => {
    it('Should throw after retries', () => {
        test('throw test', async () => {
            try {
                await retry(() => Promise.reject(new Error('Error')));
            } catch (error) {
                console.log(typeof error);
                expect(error.message).toMatch('Failed');
            }
        });
    });
});
