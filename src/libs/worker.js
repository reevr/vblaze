const Thread = require('worker_threads').Worker;
const os = require('os');
const EventEmitter = require('events').EventEmitter;
var shortid = require('shortid');

const workerWrapperPath = require.resolve('./worker-job-wrapper.js');
const env = process.env.NODE_ENV || 'development';
const constants = require('../../config/constants');
const saturationPoint = env === 'development' ? os.cpus().length : constants.maxThreadsSaturationPoint;

class Worker extends EventEmitter {

    static count = 0;

    static incrementWorkerCount = () => {
       return ++Worker.count; 
    }

    static decrementWorkerCount = () => {
        return --Worker.count; 
    }
    
    constructor({ task, filePath , queue } = {}) {
        super();

        if ((Worker.count + 1) > saturationPoint)
            throw new Error('MAX_THREAD_SPAWN_LIMIT_REACHED');

        this.__setState('WORKER_SPAWNING');

        task = (!!task) ? task.toString() : task;
        this.thread = new Thread(workerWrapperPath, { workerData: { task, filePath } });
        queue = (!!queue && Array.isArray(queue)) ? queue: [];
        this.queue = queue.length > 0 ? queue.map(data => { 
            data.workId = 1;
            return data;
        }) : [];
        
        Worker.incrementWorkerCount();
        
        /** Default events */

        this.thread.once('online', () => {

            this.threadId = this.thread.threadId;
            this.__setState('WORKER_READY');
            
            process.nextTick(() => this.__nextTick());
        });

        this.thread.once('error', (err) => {

            this.__free();
            Worker.decrementWorkerCount();
            this.__setState('WORKER_OFF');
        });
    }

    enqueue(taskData) {
        
        const { workId, data, callback, taskSource } = taskData;

        if (taskSource)
            if (taskSource.task)
                taskSource.task = taskSource.task.toString();

        this.queue.push({ workId, data, callback, taskSource });
        process.nextTick(() => this.__nextTick());
    }

    __nextTick() {
        
        if (this.state === 'WORKER_READY') {

            const work = this.queue[0];
            
            if (!!work) {
                this.currentWork = work;
                this.__processData(work);
            }
        }
    }

    __processData({ workId = shortid.generate(), data, callback, taskSource }) {

        if (this.state === 'WORKER_READY') {
            
            const newWorkId = workId;
            const onMessage = ({ workId, result, event, err }) => {
                
                if (newWorkId === workId) {
                    this.queue.shift();

                    if (!!callback) {
                        if (event === 'work_done')
                            callback(null, result, workId);
                        else if (event === 'work_error')
                            callback(err, null, workId);
                    }
                    
                    this.__setState('WORKER_READY');
                    process.nextTick(() => this.__nextTick());
                }
            }
            
            this.__setState('WORKER_BUSY');
            
            this.thread.postMessage({ workId: newWorkId, data, taskSource });
            this.thread.once('message', onMessage);

        }
    }

    __free() {
        this.thread.removeAllListeners();
        this.removeAllListeners();
        this.emit('free');
    }

    __setState(state) {
        this.state = state;
        this.emit('state', this.state);
    }

    isFree() {
        return (this.queue.length === 0 && this.state === 'WORKER_READY') ? true : false;
    }

    isDead() {
        return (this.state === 'WORKER_OFF') ? true : false;
    }

    isBusy() {
        return (this.state === 'WORKER_BUSY') ? true : false;
    }

    async kill() {
        this.__free();
        await this.thread.terminate();
        this.emit('kill');
        Worker.decrementWorkerCount();
    }
}


module.exports = Worker;