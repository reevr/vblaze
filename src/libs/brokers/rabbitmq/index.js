const amqplib = require('amqplib');

const ConsumerGroup = require('../../consumer-group');

class RabbitmqConsumerGroup extends ConsumerGroup {

    constructor(options, WorkerPool, count) {
    
        super(options, WorkerPool, count);
        
        this.options = options;
        this.count = count;
        
    }

    static async connect(brokerUrl) {
        
        RabbitmqConsumerGroup.connection = await amqplib.connect(brokerUrl);
    }

    async init() {

        const { queueName } = this.options;
        
        if (!queueName) 
            throw new Error('Queue name required');

        if (!RabbitmqConsumerGroup.connection)
            throw new Error('AMQP connection required');

        this.queueName = queueName;
        this.channel = await RabbitmqConsumerGroup.connection.createChannel();
        await this.channel.prefetch(this.count);
        await this.channel.assertQueue(this.queueName, { durable: true });
        await this.__consume();

        return this;
    }
    
    async pushToQueue(data, persistent = true) {
        
        data = JSON.stringify(data);
        return this.channel.sendToQueue(this.queueName, Buffer.from(data), { persistent })
    }
    
    __consume() {
        
        return this.channel.consume(this.queueName, this.__process.bind(this));
    }

    __process(data) {

        const message = JSON.parse(data.content.toString());
        console.log(message)

        const currentWorkId = this.enqueue(message, (err, result, workId) => {
           
            console.log('Work ID : ', workId);

            if (err) {
                console.error('Error : ', err);
            }

            if (result) {
                console.log('Result : ', result);
            }


            if (currentWorkId === workId)
                this.channel.ack(data);
        });
    }
}

module.exports = RabbitmqConsumerGroup;