import _ from 'lodash'

export class Bulk<T> {
    private batch: T[] = []
    private throttledFunc: _.DebouncedFunc<any>

    constructor(
        private readonly size: number,
        private readonly timeout: number,
        private readonly handleBatch: (batch: T[], ...args: any[]) => any
    ) {
        this.throttledFunc = _.throttle(
            async () => {
                const tmp = this.batch
                this.batch = []
                await this.handleBatch(tmp)
            },
            timeout,
            {
                leading: false,
                trailing: true
            }
        )
    }


    push(item: T) {
        this.batch.push(item)
        if (this.batch.length >= this.size) {
            this.throttledFunc.flush()
        } else {
            this.throttledFunc()
        }
    }
}