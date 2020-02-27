const fs = require('fs');

function wait(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), time)
    });
}

module.exports = async (data) => {
    // await wait(1000);
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
    return fileContents.toString().replace("module.exports", "jsbdsvjhsbdvbsiuvbsuivbiusbviubviusdbviubsdiuvbsdiuvbsidubviusdbvisdbviubsdivubsdiuvbsdiuvbisduvbisdbvisdi");
};