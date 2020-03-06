const Mblaze = require("../");
const config = require('./config');



Mblaze(25)
.then(({ WorkerHouse, WorkerPool, getPublisher, nanoJob }) => {
  const workerHouse =  new WorkerHouse(config);
  return Promise.all([
    workerHouse.init(),
    getPublisher('redis', config.consumerGroups.redis.groups[0].options.queueName, config.consumerGroups.redis.brokerUrl),
    getPublisher('redis', config.consumerGroups.redis.groups[1].options.queueName, config.consumerGroups.redis.brokerUrl),
    getPublisher('rabbitmq', config.consumerGroups.rabbitmq.groups[0].options.queueName, config.consumerGroups.rabbitmq.brokerUrl),
    getPublisher('rabbitmq', config.consumerGroups.rabbitmq.groups[1].options.queueName, config.consumerGroups.rabbitmq.brokerUrl),
    nanoJob(require.resolve('./task'), { name: 'reev' })
  ]);
})
.then(([res, redis1, redis2, rabbitmq1, rabbitmq2, nanoJobResult]) => {

  // for (let i = 0; i< 1000000; i++) {
  //   redis1.pushToQueue( 'redis 1')
  //   redis2.pushToQueue( 'redis 2')
  //   rabbitmq1.pushToQueue( 'rabbitmq 1')
  //   rabbitmq2.pushToQueue( 'rabbitmq 2')
  // }
})
.catch(err => console.log(err));

