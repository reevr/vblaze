const Joi = require('@hapi/joi');

class BootLoaderValidator {

    constructor(data) {
        this.data = data;
    }

    validateKeys(data) {
        
        const consumerGroupsTaskValidator = Joi.object({
            filePath: Joi.any(),
            task: Joi.string()
        }).required().xor('filePath', 'task');

        const consumerGroupsOptionsValidator = Joi.object({
            queueName: Joi.string().required(),
            taskSource: consumerGroupsTaskValidator,
            tag: Joi.string().required()
        }).required();

        const consumerGroupsBrokerValidator = Joi.object({
            brokerUrl: Joi.string().required(),
            groups: Joi.array().items(Joi.object({
                options: consumerGroupsOptionsValidator,
                count: Joi.number().default(1)
            }).required().with('options', 'count')).required()
        }).with('brokerUrl', 'groups');

        const schema = Joi.object({
            maxCount: Joi.number().required(),
            consumerGroups: Joi.object({
                rabbitmq: consumerGroupsBrokerValidator,
                redis: consumerGroupsBrokerValidator
            }).required()
        }).required().with('maxCount', 'consumerGroups');

        return schema.validate(data);
    }

    validate(callback) {

        const result = this.validateKeys(this.data)
        
        if (result.error)
            throw Error(result.error);
    

        return callback(result.value);
    }

}

module.exports = BootLoaderValidator;