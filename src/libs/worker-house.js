const WorkerHouseValidator = require('./worker-house-validator');
const Brokers = require('./brokers');

class WorkerHouse {

    constructor(config) {

        const validator = new WorkerHouseValidator(config);

        validator.validate((result) => this.config = config);
    }

    async init() {
        
        if (!this.config)
            throw new Error('Config required');

        const WorkerPool = await require('./worker-pool')(this.config.maxCount);
        const consumerGroups = await this.__getConsumerGroups(WorkerPool);
    
        return Promise.all(consumerGroups.map(consumerGroup => consumerGroup.init()))
    }

    async __getConsumerGroups(WorkerPool) {
        
        await Promise.all(Object.keys(this.config.consumerGroups).map(async type => {
            if (this.config.consumerGroups[type].groups.length > 0)
                return Brokers[type].connect(this.config.consumerGroups[type].brokerUrl);
        }));
        
        return Object.keys(this.config.consumerGroups).map(type => {
            return this.config.consumerGroups[type].groups.map(consumerGroupData => new Brokers[type]({ type: type, ...consumerGroupData.options }, WorkerPool, consumerGroupData.count));
        }).reduce((list, consumerGroup) => [ ...list, ...consumerGroup], []);

    }
}

module.exports = WorkerHouse;