export class Bulk<T> {
    private batch: T[] = []

    constructor(
        private readonly size: number,
        // private readonly timeout: number,
        private readonly handleBatch: (batch: T[], ...args: any[]) => any
    ) { }

    push(item: T) {
        this.batch.push(item)
        if (this.batch.length >= this.size) {
            const tmp = this.batch
            this.batch = []
            this.handleBatch(tmp)
        }
    }
}