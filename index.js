/**
const Broker = require('./libs/brokers');
const OptionsValidator = require('./libs/options-validator');
const Helper = require('./helpers/main');


 * options  => 
 *  brokerUrl: string,
 *  cluster: number
 *  taskRunners: Array [
 *      filePath: string,
 *      customOptions:
 *        durable: string,
 *        persistent: string,
 *        workers: string
 *  ]
 *
 

module.exports.consumer = async (options) => {
    
    options = new OptionsValidator(options);

    if (options.taskRunners.length === 0)
        throw new Error('No task runners set');

    const consumerGroups = {};

    Helper.setConsumerGroups(consumerGroups, Broker);


}
*/
