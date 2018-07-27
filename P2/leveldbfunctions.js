/*
    Helper function to interact with LevelDB
 */

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

var exports = module.exports = {};
exports.addBlock = function (key, value) {
    return new Promise(function (resolve, reject) {
        db.put(key, value, function (err) {
            if (err) reject('Block ' + key + ' submission failed', err);
            resolve('Added block ' + key + ' to the chain');
        })
    });


};

exports.getMaxHeight = function () {
    // var options = {start:'key1', end: 'key9'};
    // var readStream = db.createKeyStream(options);
    return new Promise(function (resolve, reject) {
        let maxHeight = 0;
        let keyStream = db.createKeyStream();
        keyStream.on('data', function (data) {
            // When new data arrive compare value to locate max value.
            // KeyStream returns string type. Convert to int to compare.
            // console.log(typeof data);
            data = parseInt(data);
            // console.log(typeof data);
            if (data > maxHeight)
                maxHeight = data;
            // console.log('Key is = ' + data);
        })
            .on('error', function(err) {
                reject(err);
            })
            .on('close', function () {
                //When the stream is finished, return found max height.
                console.log('Type of maxHeight: ' + typeof maxHeight);
                console.log('returning maxHeight as ' + typeof maxHeight + ' ' + maxHeight);
                resolve(maxHeight);
            });
    });

}

exports.getBlock = function (key) {
    return new Promise(function (resolve, reject) {
        db.get(key, function (err, value) {
            if (err) reject('Block ' + key + ' not found!');
            // console.log('Value = ' + value);
            // console.log(typeof  value);
            // console.log(typeof JSON.parse(value));
            resolve(value);
        })
    })

}

function getBlockHeight() {
}

exports.getChain = function () {
    let readStream = db.createReadStream();
    readStream.on('data', function (data) {
        console.log('Key = ' + data.key + ' Value = ' + data.value);
    })
}