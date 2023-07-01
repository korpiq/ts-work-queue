export interface QueueConfiguration<InputType, OutputType> {
    maxConcurrent: number;
    processor: (item: InputType) => OutputType;
}

export interface Processing<InputType, OutputType> {
    item: InputType
    promise: Promise<OutputType>
}

interface Done {
    resolve: () => void
    promise: Promise<void>
}

export class Queue<InputType, OutputType> {
    private configuration: QueueConfiguration<InputType, OutputType>
    private waiting: InputType[] = []
    private processing: Processing<InputType, OutputType>[] = []
    private completionTracker: null | Done = null

    private getTypeDependentDefaultConfiguration (): QueueConfiguration<InputType, OutputType> {
        return {
            maxConcurrent: 1,
            processor: (item: InputType) => {
                return (typeof item === 'function' ? item() : item) as OutputType
            },
        }
    }

    constructor(configuration?: Partial<QueueConfiguration<InputType, OutputType>>) {
        this.configuration = this.getTypeDependentDefaultConfiguration()
        if (configuration) {
            this.configure(configuration)
        }
    }

    configure (configurationChanges: Partial<QueueConfiguration<InputType, OutputType>>) {
        this.configuration = { ...this.configuration, ...configurationChanges }
    }

    append(item: InputType) {
        this.waiting.push(item)
        this.start()
        return this
    }

    prepend(item: InputType) {
        this.waiting.unshift(item)
        this.start()
        return this
    }

    start () {
        while (this.waiting.length && this.processing.length < this.configuration.maxConcurrent) {
            this.startNextJob()
        }
        return this
    }

    isAllDone() {
        return !(this.processing.length || this.waiting.length);
    }

    allDone (): Promise<void> {
        this.start()
        return this.completionTracker?.promise ?? Promise.resolve()
    }

    private async process (item: InputType) {
        return this.configuration.processor(item);
    }

    private processedAllItems() {
        this.completionTracker?.resolve()
        this.completionTracker = null
    }

    private checkAllDone() {
        if (this.isAllDone()) {
            this.processedAllItems()
        }
    }

    private processed(processor: Processing<InputType, OutputType>) {
        const processingIndex = this.processing.indexOf(processor)
        if (processingIndex > -1) {
            this.processing.splice(processingIndex, 1)
        }
        this.checkAllDone()
        this.startNextJob()
    }

    private startNextJob () {
        const { processor } = this.configuration;
        const item = this.waiting.shift()
        if (item) {
            this.createCompletionTracker()
            const processing: Processing<InputType, OutputType> = {
                item,
                promise: new Promise( (resolve) => resolve(processor(item)))
            }
            this.processing.push(processing)
            processing.promise.finally(() => this.processed(processing))
        }
    }

    private createCompletionTracker () {
        if (!this.completionTracker) {
            let resolve;
            const promise = new Promise<void>((resolver) => {
                resolve = resolver
            })
            this.completionTracker = {
                resolve,
                promise
            }
        }
    }
}

export function queue<InputType, OutputType>(item: InputType, configuration?: Partial<QueueConfiguration<InputType, OutputType>>) {
    return new Queue(configuration).append(item)
}
