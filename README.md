# ts-work-queue

Hopefully easily usable configurable work queues for Typescript.

- Ideas are listed in [doc/goals.md](doc/goals.md)
- Tests verify use cases.

## Use

```typescript
import queue from 'ts-work-queue'

const results: string[] = []
const q = queue(() => results.push('this will run first'))
q.queue(() => results.push('this will run after first'))
await q.untilEmpty()
// results = ['this will run first', 'this will run after first']
```

### `queue(callable): Queue`

Returns a new `Queue` object that runs `callable` as its first job.

### `class Queue`

Jobs added to a `Queue` object will be run one after the other.

#### `new Queue(): Queue`

Returns a new `Queue` that does nothing by itself.

#### `append(callable): Queue`

Adds given `callable` as a job to the end of the queue.
Starts running it if the queue is currently not running anything.
Otherwise, each queued job will be run one after the other.

#### `prepend(callable): Queue`

Adds given `callable` as a job to the beginning of the queue.
Starts running it if the queue is currently not running anything.
Otherwise, each queued job will be run one after the other.

#### `async allDone(): Promise<unknown>`

Returns a promise that resolves as soon as there are no more jobs running in the queue.
