const os = require('os');

const Worker = require('./worker');
const env = process.env.NODE_ENV || 'development';
const constants = require('../../config/constants');
const saturationPoint = env === 'development' ? os.cpus().length : constants.maxThreadsSaturationPoint;


class WorkerPool {
    
    constructor(maxCount) {
        this.queue = { default: [] };
        maxCount = process.env.MAX_THREADS_COUNT || maxCount;
        this.maxCount = (maxCount > saturationPoint) ? saturationPoint : maxCount;
        this.workers = [];
    }

    start() {

        for (let i = 0; i < this.maxCount; i++) {

            const worker = new Worker();
            const workerData = { worker, tag: 'default' };
            this.workers.push(workerData);
            this.__attachWorkerEventListeners(workerData);
        }
    }

    __reSpawn(workerData) {
        workerData.worker = new Worker({ queue: workerData.worker.queue});
        this.__attachWorkerEventListeners(workerData);
        
        return workerData;
    }

    __attachWorkerEventListeners(workerData) {
        workerData.worker.on('state', (state) => {
            if (state === 'WORKER_READY') {
                this.__nextTick(workerData.tag);
            }
        })
    }

    enqueue(taskData, tag = 'default') {

        const self = this;
        
        if (this.queue[tag]) {
            const callback = taskData.callback;
            taskData.callback = (err, result, workerId) => {
                setImmediate(() => this.__nextTick.call(self, tag));
                return callback(err, result, workerId);
            }

            this.queue[tag].push(taskData);
            
            return this.__nextTick(tag);
        } 

        throw new Error(`No workers allotetd for tag : ${tag}`);
    }

    __nextTick(tag) {

        /** Respawn dead workers */

        const deadWorkers = this.workers
            .filter(workerData => workerData.worker.isDead())
            .map(workerData => this.__reSpawn(workerData))


        /** Allot task to workers */
        
        const workerData = this.getFreeWorker(tag);
        
        if (!!workerData) {
            const taskData = this.queue[tag].shift();
            if (!!taskData)
                workerData.worker.enqueue(taskData);
        }
            
    }

    tagWorkers(tag, count) {
        
        const workers = this.workers.filter(workerData => workerData.tag === 'default');
        
        if (this.workers.length === 0)
            throw new Error('WORKER_POOL_NOT_ACTIVE');

        if (count > workers.length - 1)
            throw new Error('INSUFFICIENT_WORKERS');

        for (let i = 0; i < count; i++) {
            workers[i].tag = tag;
        }
        
        if (!this.queue[tag]) 
            this.queue[tag] = [];
    }

    getFreeWorker(tag = 'default') {
        return this.workers.find(workerData => workerData.tag === tag && workerData.worker.isFree());
    }

    async terminate() {
        
        const list = [];
        let workerData;

        while (workerData = this.workers.pop()) {
            list.push(workerData.worker.kill());
        }

        return Promise.all(list);
    }
    
}

/** Export with single instantiation globally */

let workerPool;

module.exports = async (maxCount) => {
    if (!workerPool) {
        workerPool = new WorkerPool(maxCount);
        await workerPool.start();
    }

    return workerPool;
}