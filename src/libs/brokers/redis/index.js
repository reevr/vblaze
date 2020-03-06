const redis = require('redis');

const ConsumerGroup = require('../../consumer-group');

class RedisConsumerGroup extends ConsumerGroup {
    
    constructor(options, WorkerPool, count) {
        
        super(options, WorkerPool, count);
        
        this.options = options;
        this.count = count;

    }

    static async connect(brokerUrl) {
        
        if (!RedisConsumerGroup.connection) {
            RedisConsumerGroup.connection = redis.createClient({ url: brokerUrl });

            return new Promise((resolve, reject) => {
                RedisConsumerGroup.connection.once('ready', resolve);
                RedisConsumerGroup.connection.once('error', reject);
            });
        }
    }

    async init() {

        const { queueName } = this.options;

        if (!queueName) 
            throw new Error('Queue name required');

        if (!RedisConsumerGroup.connection)
            throw new Error('Redis connection required');

        this.queueName = queueName;
        RedisConsumerGroup.connection.subscribe(this.queueName);
        this.__consume();

        return this;
    }

    __consume() {
        RedisConsumerGroup.connection.on('message', this.__process.bind(this));
    }

    __process(channel, message) {

        if (channel === this.queueName) {

            this.enqueue(message, (err, result, workId) => {
            
                if (err) {
                    console.error('Error : ', err);
                }

                if (result) {
                    console.log('Result : ', result);
                }
            });
        }
    }
}

module.exports = RedisConsumerGroup;