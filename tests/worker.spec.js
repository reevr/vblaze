const Worker = require('../src/libs/worker');

describe('Test worker pool', () => {

    let worker;

    beforeAll(() => {
        worker = new Worker({ task, filePath , queue });
    });

});