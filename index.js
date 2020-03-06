const WorkerHouse = require('./src/libs/worker-house');
const getWorkerPool = require('./src/libs/worker-pool');
const getPublisher = require('./src/libs/publishers');

function nanoJob(WorkerPool, task, data) {
    
    taskSource = ((task instanceof Function) === true) ? { task } : { filePath: task };

    return new Promise((resolve, reject) => {

        WorkerPool.enqueue({
            data,
            taskSource,
            callback: (err, result) => {
    
                if (err)
                    return reject(err);
    
                if (result)
                    resolve(result);
            }
        });
    })
}

module.exports = async (maxCount) => {
    
    if (typeof maxCount !== 'number')
        throw new Error('Invalid Max worker count');

    const workerPool = await getWorkerPool(maxCount);
    
    return {
        WorkerHouse,
        WorkerPool: workerPool,
        getPublisher,
        nanoJob: nanoJob.bind(null, workerPool)
    }
}