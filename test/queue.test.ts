import 'jest'
import { queue } from '../src'


describe('queue with default configuration', () => {
    let results = []
    const slowJob = (result) => async () => {
        await new Promise((resolve) => {
            setTimeout(() => resolve(results.push(result)), 50) })
    }

    it('executes given function immediately.', async () => {
        let executed = 0
        await queue(() => executed += 1).untilEmpty()
        expect(executed).toBe(1) // times given job was executed
    })

    it('executes two given functions consecutively.', async  () => {
        results = [];
        await queue(slowJob(1))
            .append(() => results.push(2))
            .untilEmpty()
        expect(results).toEqual([1, 2]) // second job waited for first one to finish
    })

    it('executes prepended job before appended one.',  async () => {
        results = [];
        await queue(slowJob(1))
          .append(() => results.push(2))
          .prepend(() => results.push(3))
          .untilEmpty()
        expect(results).toEqual([1, 3, 2]) // prepended job executed before rest of queue.
    })
});

describe('queue running two jobs simultaneously', () => {
    let results = []
    const slowJob = (result) => async () => {
        await new Promise((resolve) => {
            setTimeout(() => resolve(results.push(result)), 50) })
    }

    it('Runs two first jobs immediately, before prepended one.',  async () => {
        results = [];
        await queue(slowJob(1), { maxConcurrent: 2 })
          .append(() => results.push(2))
          .prepend(() => results.push(3))
          .untilEmpty()
        expect(results).toEqual([2, 3, 1]) // Fast second job finishes first, then third one; slow first one finishes last.
    })
});
