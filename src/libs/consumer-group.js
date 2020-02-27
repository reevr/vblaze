var shortid = require('shortid');

const ConsumerGroupValidator = require('./consumer-group-validator');

class ConsumerGroup {
    
    constructor(options, WorkerPool, count) {

        const validator = new ConsumerGroupValidator({ options, count, WorkerPool });

        validator.validate((result) => {
            this.taskSource = result.options.taskSource;
            this.tag = result.options.tag;
            this.WorkerPool = WorkerPool;
            process.nextTick(() => this.__reserveWorker(count));
        });
    }

    __reserveWorker(count) {
        
        this.WorkerPool.tagWorkers(this.tag, count);
    }

    enqueue(data, callback) {

        const workId = shortid.generate(); 
        this.WorkerPool.enqueue({ workId, data, callback, taskSource: this.taskSource }, this.tag);

        return workId;
    }
}

module.exports = ConsumerGroup;