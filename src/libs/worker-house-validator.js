const Joi = require('@hapi/joi');

class WorkerHouseValidator {

    constructor(data) {
        this.data = data;
    }

    validateKeys(data) {
        
        const consumerGroupsTaskValidator = Joi.object({
            filePath: Joi.any(),
            task: Joi.any()
        }).required().xor('filePath', 'task');

        const consumerGroupsOptionsValidator = Joi.object({
            queueName: Joi.string().required(),
            taskSource: consumerGroupsTaskValidator
        }).required();

        const consumerGroupsBrokerValidator = Joi.object({
            brokerUrl: Joi.string().required(),
            groups: Joi.array().items(Joi.object({
                options: consumerGroupsOptionsValidator,
                count: Joi.number().default(1)
            }).with('options', 'count'))
        }).with('brokerUrl', 'groups');

        const schema = Joi.object({
            consumerGroups: Joi.object({
                rabbitmq: consumerGroupsBrokerValidator,
                redis: consumerGroupsBrokerValidator
            }).required()
        }).required();

        return schema.validate(data);
    }

    validate(callback) {

        const result = this.validateKeys(this.data)
        
        if (result.error)
            throw Error(result.error);
    

        return callback(result.value);
    }

}

module.exports = WorkerHouseValidator;