/*
    Helper function to interact with LevelDB
 */

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

var exports = module.exports = {};
exports.addBlock = function(key, value){
    db.put(key, value, function(err) {
        if (err) return console.log('Block ' + key + ' submission failed', err);
    })
};

exports.getMaxHeight = function () {
    // var options = {start:'key1', end: 'key9'};
    // var readStream = db.createKeyStream(options);
    let maxHeight = 0;
    let keyStream = db.createKeyStream();
    keyStream.on('data', function(data) {
        // each key/value is returned as a 'data' event
        data = parseInt(data);
        if(data > maxHeight)
                maxHeight = data;
        console.log('Key is = ' + data);
    });

    return maxHeight;
}

exports.getBlock function (k){
    db.get(key, function(err, value) {
        if (err) return console.log('Not found!', err);
        console.log('Value = ' + value);

        return value;
    })
}

function getBlockHeight(){}

exports.getChain = function(){
    let readStream = db.createReadStream();
    readStream.on('data', function(data) {
        console.log('Key = ' + data.key + ' Value = ' + data.value);
    })
}