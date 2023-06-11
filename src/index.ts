interface QueueConfiguration {
    maxConcurrent: number
}

class Queue {
    static defaultConfiguration: QueueConfiguration = {
        maxConcurrent: 1
    }
    private configuration: QueueConfiguration
    private waiting: Function[] = []
    private running: {
        callable: Function
        promise: Promise<unknown>
    }[] = []
    private allJobsDone: null | {
        resolve: Function
        promise: Promise<unknown>
    } = null

    constructor(configuration?: Partial<QueueConfiguration>) {
        this.configuration = { ...Queue.defaultConfiguration }
        if (configuration) {
            this.configure(configuration)
        }
    }

    configure (configurationChanges: Partial<QueueConfiguration>) {
        this.configuration = { ...this.configuration, ...configurationChanges }
    }

    append(job: Function) {
        this.waiting.push(job)
        this.start()
        return this
    }

    prepend(job: Function) {
        this.waiting.unshift(job)
        this.start()
        return this
    }

    start () {
        while (this.waiting.length && this.running.length < this.configuration.maxConcurrent) {
            this.runNextJob()
        }
        return this
    }

    allDone (): Promise<unknown> {
        this.start()
        return this.allJobsDone?.promise ?? Promise.resolve()
    }

    private runNextJob () {
        const callable = this.waiting.shift()
        if (callable) {
            this.createAllJobsDonePromise()
            const runner = {
                callable,
                promise: new Promise(async (resolve) => {
                    const result: unknown = await callable()
                    const runnerIndex = this.running.indexOf(runner)
                    if (runnerIndex > -1) {
                        this.running.splice(runnerIndex, 1)
                        if (!(this.running.length || this.waiting.length)) {
                            this.allJobsDone?.resolve()
                            this.allJobsDone = null
                        }
                    }
                    this.runNextJob()
                    resolve(result)
                })
            }
            this.running.push(runner)
        }
    }

    private createAllJobsDonePromise () {
        if (!this.allJobsDone) {
            let resolve: null | Function = null
            const promise = new Promise((resolver) => resolve = resolver)
            this.allJobsDone = {
                resolve,
                promise
            }
        }
    }
}

export function queue(job: Function, configuration?: Partial<QueueConfiguration>) {
    return new Queue(configuration).append(job)
}
