# ts-work-queue

Hopefully easily usable configurable work queues for Typescript.

- Ideas are listed in [doc/goals.md](doc/goals.md)
- Tests verify use cases.

## Use

```typescript
import queue from 'ts-work-queue'

const results: string[] = []
const q = queue().append(() => results.push('this will run first'))
q.append(() => results.push('this will run after first'))
await q.allDone()
// results = ['this will run first', 'this will run after first']
```

### `queue<InputType, OutputType>([QueueConfiguration<InputType, OutputType>]): Queue`

Returns a new `Queue` object with optional custom configuration.

### `class Queue`

Jobs added to a `Queue` object will be run one after the other.

#### `new Queue<InputType, OutputType>([QueueConfiguration<InputType, OutputType>]): Queue`

Returns a new `Queue` object with optional custom configuration.

#### QueueConfiguration

- `maxConcurrent` how many jobs may run concurrently; default is 1.
- `processor` a function that takes an `InputType` parameter and returns `OutputType`. Will be run for each item added to the queue.

#### `append(item: InputType): Queue`

Adds given item to the end of the queue.
Starts running it if the queue is currently not running anything.
Otherwise, each queued job will be run one after the other.

#### `prepend(item: InputType): Queue`

Adds given item as a job to the beginning of the queue.
Starts running it if the queue is currently not running anything.
Otherwise, each queued job will be run one after the other.

#### `isAllDone(): boolean`

Returns a boolean indicating whether the queue is empty.

#### `async allDone(): Promise<unknown>`

Returns a promise that resolves as soon as there are no more jobs running in the queue.
