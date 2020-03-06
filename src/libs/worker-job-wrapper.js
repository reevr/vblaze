const {  parentPort, workerData = {} } = require('worker_threads');
const fs = require('fs');
const path = require('path');


function setTaskPRocessor(task, filePath) {
    
    if (!!task  || !!filePath || !!workerData.task || !!workerData.filePath) {

        if (filePath) {
    
            return require(path.resolve(filePath));
        } else if (task) {
        
            return eval(task);     
        } else if (workerData.filePath) {
         
            return require(path.resolve(workerData.filePath));
        } else if (workerData.task) {

            return eval(workerData.task);
        }
    }

    return (data) => data;
            
}

function processData(workId, data, { task, filePath }) {
    
    this.workId = workId;
    
    let taskProcessor = setTaskPRocessor(task, filePath);

    try {
    
        const result = taskProcessor.call(this, data);
    
        return Promise.resolve(result);

    } catch(err) {

        return Promise.reject(err);
    }
}


parentPort.on('message', ({ workId, data, taskSource = {} }) => {
        
        processData(workId, data, taskSource)
            .then(result => parentPort.postMessage({ workId, result, event: 'work_done' }))
            .catch(err => parentPort.postMessage({ workId, event: 'work_error', err }));
    
});