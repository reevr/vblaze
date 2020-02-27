const Joi = require('@hapi/joi');

class OptionsValidator {
    constructor(data) {
        
        this.data = data;
    }

    validateKeys(data) {
        const schema = Joi.object({
            brokerUrl: Joi.string()
                .alpha()
                .required(),
        
            taskRunners: Joi.array({
                filePath: Joi.string().required(),
                queueName: Joi.string().required(),
                customOptions: Joi.object({
                    durable: Joi.string().default(true),
                    persistent: Joi.string().default(true),
                    workers: Joi.number().default(1)
                }).default({ durable: true, persistent: true, workers: 1 })
            }),
            cluster: Joi.number().default(1)
        });

        return schema.validate(data);
    }

    validate(callback) {

        const result = this.validateKeys(data)
        if (result.error)
            throw Error(this.validateKeys(data).error);
    

        return callback(result.value);
    }

}

module.exports = OptionsValidator;