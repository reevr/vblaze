# MBLAZE

This is an in process worker house for doing asynchronous tasks in nodeJs.
Workers can receive task from various brokers like RabbitMq, Redis or a in process queue.

![architecture daigram](https://i.ibb.co/zSjB5Bs/mblaze-architecture.jpg)

This is a complete worker threads utility library for nodeJs.
###### There are following features : 
1. WorkerPool
2. WorkerHouse
3. Publishers for message brokers
4. Nanojob

###### Worker Pool
This is a WorkerPool instance, a group of workers alloted to do tasks in parallel.
It consists of a enqueue method to push in a job and any of the workers will pick it up and execute the job. 
Consists of auto respawning feature , if any worker thread dies , it automatically respawns and if the dead worker was processing a job ,then it will be re-executed with the new worker keeping it reliable.
Worker pool maintains tag for each worker used in reserving workers. By default every worker is set with 'default' tag.

Note : If the NODE_ENV environment variable is not set to 'production' or any other environment other than 'development', then mblaze considers environment to be 'development'.
And in 'development' environment , mblaze allows to create only as many workers as the cpu(s) available.

###### Nanojob
A co-routine for nodeJs.
Allows to run task in seperate thread without blocking the event-loop.
Can be called anywhere in the application by passing a function or task file path and its parametes.
It returns with a promise which executes the code in a seperate thread and resolve with the processed result.

Note : nanoJob accepts only two parameters , one is the task funtion or task file path and one single parameter. In case of passing multiple parameters , use objects;

```js
const result = await nanoJob((data) => {
    
    for (let i = 0; i < 1000; i++) {}
    return `${data.name} is ${data.age} years old`;
}, { name, age });
```

###### WorkerHouse
Used to start a job processing unit consuming messages from message queues.
Allows to create consumer groups for multiple message brokers like RabbitMq and Redis, with each consumer group having multiple workers reserved from the worker pool.
Each consumer group does a certain task.
Consumer group reserves workers using tags.

Note : Always two workers in the worker pool are researved with default tags. Can researve only (maxCount - 2 ) workers for consumer groups in total.

```js
(async () => {
    const workerHouse =  new WorkerHouse(config);
    await workerHouse.init();
})()
```


###### Publisher 
Allows to publish job to a certain message queue.
It can be Redis publisher or RabbitMq publisher.

----------------------------------------------------------------------------------------

Info : There is saturation point for the maxCount you can pass to the worker pool, set as 50 by default. In case you need to increase the saturation count, set the environment variable MAX_THREADS_SATURATION_POINT with a value higher than 50. This allows developer to set the maximum potential of the system used.

```js
MAX_THREADS_SATURATION_POINT=100 node main.js
```

###### This package consists of following methods, objects and object constructor:
1.  WorkerHouse: constructor
2.  WorkerPool: object
3.  getPublisher: function
4.  nanoJob: function

##### How to use this library ?
It is necessary to start the worker pool to use all the available features.
So we initiate it by passing a parameter for the max number of workers to be allotted in the worker pool.

main.js

```js
const mblaze = require('mblaze');
const config = require('./config');

(async () => {
    
    try {
        const { WorkerHouse, WorkerPool, getPublisher, nanoJob } = await mblaze(10);
        
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
        }, { name, age });
        
        console.log(result);
        
        /** Initialise Publishers */
        const redis1 = await getPublisher('redis', config.consumerGroups.redis.groups[0].options.queueName, config.consumerGroups.redis.brokerUrl);
        const redis2 = await getPublisher('redis', config.consumerGroups.redis.groups[1].options.queueName, config.consumerGroups.redis.brokerUrl);
        const rabbitmq1 = await getPublisher('rabbitmq', config.consumerGroups.rabbitmq.groups[0].options.queueName, config.consumerGroups.rabbitmq.brokerUrl);
        const rabbitmq2 = await getPublisher('rabbitmq', config.consumerGroups.rabbitmq.groups[1].options.queueName, config.consumerGroups.rabbitmq.brokerUrl);
        
        /** Publish jobs to queues initialised above */
        for (let i = 0; i< 1000; i++) {
            redis1.pushToQueue( 'redis 1')
            redis2.pushToQueue( 'redis 2')
            rabbitmq1.pushToQueue( 'rabbitmq 1')
            rabbitmq2.pushToQueue( 'rabbitmq 2')
        }
    } catch(err) {
        console.log(err);
    }
})()
```

config.js

```js
const config = {};

config.consumerGroups = {
    rabbitmq: {
        brokerUrl: 'amqp://user:password@0.0.0.0:5672',
        groups: [
            {
                options: {
                    queueName: 'test-queue-1',
                    taskSource: {
                        filePath: require.resolve('./task.js')
                    },
                    tag: 'test-1-tag'
                },
                count: 5
            },
            {
                options: {
                    queueName: 'test-queue-2',
                    taskSource: {
                        task: (data) => {
                            return 'test-queue-2-reev'
                        }
                    },
                    tag: 'test-2-tag'
                },
                count: 5
            },
        ]
    },
    redis: {
        brokerUrl: 'redis://0.0.0.0:6379',
        groups: [
            {
                options: {
                    queueName: 'test-queue-3',
                    taskSource: {
                        filePath: require.resolve('./task.js')
                    },
                    tag: 'test-3-tag'
                },
                count: 5
            },
            {
                options: {
                    queueName: 'test-queue-4',
                    taskSource: {
                        task: (data) => {
                            return 'reev' + Date.now()
                        }
                    },
                    tag: 'test-4-tag'
                },
                count: 5
            }
        ]
    }
};


module.exports = config;
```

task.js

```js
const fs = require('fs');

function wait(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), time)
    });
}

module.exports = async (data) => {
    await wait(100);
    const fileContents = fs.readFileSync(__filename);
    fs.readFileSync(__filename);
    fs.readFileSync(__filename);
    fs.readFileSync(__filename);
    fs.readFileSync(__filename);
    fs.readFileSync(__filename);
    
    return 'task file output ';
};
```

