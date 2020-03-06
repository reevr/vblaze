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
                    }
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
                    }
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

                },
                count: 5
            }
        ]
    }
};


module.exports = config;