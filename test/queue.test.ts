import 'jest'
import { queue } from '../src'

describe('queue', () => {
    it('executes given function immediately.', async () => {
        let executed = 0
        await queue(() => executed += 1).untilEmpty()
        expect(executed).toBe(1) // times given job was executed
    })

    it('executes two given functions consecutively.',  () => {
        let results = [];
        queue(async () => { await new Promise((resolve) => { setTimeout(() => resolve(results.push(1))) }) })
            .queue(() => results.push(2))
            .queue(() => expect(results).toEqual([1, 2])) // second job waited for first one to finish
    })
});
