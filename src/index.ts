class Queue {
    private waiting: Function[] = []
    private running: null | {
        callable: Function
        promise: Promise<unknown>
    } = null
    private emptying: null | {
        resolve: Function
        promise: Promise<unknown>
    } = null

    start () {
        if (! this.running) {
            this.next()
        }
        return this
    }

    private next () {
        const callable = this.waiting.shift()
        if (callable) {
            if (!this.emptying) {
                let resolve: null | Function = null
                const promise = new Promise((resolver) => resolve = resolver)
                this.emptying = {
                    resolve,
                    promise
                }
            }
            this.running = {
                callable,
                promise: new Promise(async (resolve) => {
                    const result: unknown = await callable()
                    this.next()
                    resolve(result)
                })
            }
        } else {
            this.running = null
            this.emptying?.resolve()
            this.emptying = null
        }
    }

    untilEmpty (): Promise<unknown> {
        this.start()
        return this.emptying?.promise ?? Promise.resolve()
    }

    queue(job: Function) {
        this.waiting.push(job)
        this.start()
        return this
    }
}

export function queue(job: Function) {
    return new Queue().queue(job)
}
