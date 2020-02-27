const config = {};

config.maxCount = 8;
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
                count: 2
            },
            {
                options: {
                    queueName: 'test-queue-2',
                    taskSource: {
                        filePath: require.resolve('./task.js')
                    },
                    tag: 'test-2-tag'
                },
                count: 2
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
                count: 2
            }
        ]
    }
};


module.exports = config;