const redis = require('redis');

class RedisPublisher {
    
    constructor(queueName) {
        
        this.queueName = queueName;
    }

    static async connect(brokerUrl) {
        
        if (!RedisPublisher.connection) {
            RedisPublisher.connection = redis.createClient({ url: brokerUrl });

            return new Promise((resolve, reject) => {
                RedisPublisher.connection.once('ready', resolve);
                RedisPublisher.connection.once('error', reject);
            });
        }
    }

    async init() {

        if (!this.queueName) 
            throw new Error('Queue name required');

        if (!RedisPublisher.connection)
            throw new Error('Redis connection required');

        return this;
    }

    pushToQueue(message) {

        RedisPublisher.connection.publish(this.queueName, message);
    }

}

module.exports = RedisPublisher;