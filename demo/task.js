const fs = require('fs');

function wait(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), time)
    });
}

module.exports = async (data) => {
    const fileContents = fs.readFileSync(__filename);
    fs.readFileSync(__filename);
    
    fs.readFileSync(__filename);
    fs.readFileSync(__filename);
    fs.readFileSync(__filename);
    fs.readFileSync(__filename);
    fs.readFileSync(__filename);
    fs.readFileSync(__filename);
    fs.readFileSync(__filename);
    fs.readFileSync(__filename);
    fs.readFileSync(__filename);
    fs.readFileSync(__filename);
    fs.readFileSync(__filename);
    fs.readFileSync(__filename);
    return 'task file ';
};