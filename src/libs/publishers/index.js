const RedisPublisher = require('./redis');
const RabbitmqPublisher = require('./rabbitmq');

module.exports = async (type, queueName, brokerUrl) => {
    const publishers = {
        redis: RedisPublisher,
        rabbitmq: RabbitmqPublisher
    }

    if (!publishers[type])
        throw new Error('Invalid publisher type');

    await publishers[type].connect(brokerUrl);

    const publisher = new publishers[type](queueName);
    await publisher.init();

    return publisher;
}