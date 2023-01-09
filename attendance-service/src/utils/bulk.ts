// const _ = require('lodash');

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

// module.exports = function (size, timeout, batchFunc) {
//     let batch = [];
//     let counter = 0;

//     // Create an executor function
//     const execBatchFunc = async () => {
//         // Reset the batch
//         const tmp = batch;
//         batch = [];

//         // Process the batch
//         await batchFunc(tmp);
//         counter += tmp.length;
//         console.log(`Processed ${tmp.length} records`);
//     };

//     // Create a throttled executor function
//     const throttledFunc = _.throttle(execBatchFunc, timeout, {
//         leading: false,
//         trailing: true,
//     });

//     return {
//         /**
//          * Push item to batch
//          * @param {any} item
//          */
//         push(item) {
//             batch.push(item);
//             if (batch.length >= size) {
//                 // Flush the batch when the batch is full
//                 this.flush();
//             } else {
//                 // Run the throttled function when the batch is not full
//                 throttledFunc();
//             }
//         },

//         async flush() {
//             return throttledFunc.flush();
//         },

//         getCounter() {
//             return counter;
//         },
//     };
// };