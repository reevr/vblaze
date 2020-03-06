const Joi = require('@hapi/joi');

class ConsumerGroupValidator {

    constructor(data) {
        this.data = data;
    }

    validateKeys(data) {
        const schema = Joi.object({
            options: Joi.object({
                queueName: Joi.string(),
                type: Joi.string().valid('local', 'rabbitmq', 'redis').default('local'),
                taskSource: Joi.object({
                    filePath: Joi.string(),
                    task: Joi.any()
                }).default({ task: (data) => data }),
            }).required().with('brokerUrl', 'queueName'),
            count: Joi.number().default(1),
            WorkerPool: Joi.any().required()
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

module.exports = ConsumerGroupValidator;