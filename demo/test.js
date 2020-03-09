const vblaze = require('../index');
const config = require('./config');

(async () => {
    
    try {
        const { WorkerHouse, WorkerPool, getPublisher, nanoJob } = await vblaze(30);
        
        /** Start a worker house by passing the config object to WorkerHouse constructor */
        const workerHouse =  new WorkerHouse(config);
        await workerHouse.init();
        /** Now all the consumers will start processing messages in the queue */
        
        /** To see the contents WorkerPool */
        console.log(WorkerPool);
        
        /** Attach nanoJob to global variable to use it anywhere in the application */
        global.nanoJob = nanoJob;
        
        /** Execute tasks in seperate thread using nanoJob */
        const result = await nanoJob((data) => {
            
            for (let i = 0; i < 1000; i++) {}
            return `${data.name} is ${data.age} years old`;
        }, { name: 'reev', age: '25' });
        
        console.log(result);
        
        /** Initialise Publishers */
        const redis1 = await getPublisher('redis', config.consumerGroups.redis.groups[0].options.queueName, config.consumerGroups.redis.brokerUrl);
        const redis2 = await getPublisher('redis', config.consumerGroups.redis.groups[1].options.queueName, config.consumerGroups.redis.brokerUrl);
        const rabbitmq1 = await getPublisher('rabbitmq', config.consumerGroups.rabbitmq.groups[0].options.queueName, config.consumerGroups.rabbitmq.brokerUrl);
        const rabbitmq2 = await getPublisher('rabbitmq', config.consumerGroups.rabbitmq.groups[1].options.queueName, config.consumerGroups.rabbitmq.brokerUrl);
        
        /** Publish jobs to queues initialised above */
        for (let i = 0; i< 1; i++) {
            redis1.pushToQueue( 'redis 1')
            redis2.pushToQueue( 'redis 2')
            rabbitmq1.pushToQueue( 'rabbitmq 1')
            rabbitmq2.pushToQueue( 'rabbitmq 2')
        }
    } catch(err) {
        console.log(err);
    }
})()