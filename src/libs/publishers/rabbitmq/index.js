const amqplib = require('amqplib');

class RabbitmqPublisher {

    constructor(queueName) {

        this.queueName = queueName;
    }

    static async connect(brokerUrl) {
        
        if (!RabbitmqPublisher.connection)
            RabbitmqPublisher.connection = await amqplib.connect(brokerUrl);
    }

    async init() {
        
        if (!this.queueName) 
            throw new Error('Queue name required');

        if (!RabbitmqPublisher.connection)
            throw new Error('AMQP connection required');

        this.channel = await RabbitmqPublisher.connection.createChannel();

        return this;
    }
    
    async pushToQueue(data, persistent = true) {
        
        data = JSON.stringify(data);
        return this.channel.sendToQueue(this.queueName, Buffer.from(data), { persistent })
    }
    
}

module.exports = RabbitmqPublisher;