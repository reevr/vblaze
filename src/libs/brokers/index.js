const RabbitmqConsumerGroup = require('./rabbitmq');
const RedisConsumerGroup = require('./redis');

module.exports = {
    rabbitmq: RabbitmqConsumerGroup,
    redis: RedisConsumerGroup
}