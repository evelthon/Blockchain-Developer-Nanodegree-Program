/*
    Helper function to interact with LevelDB
 */

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

//Store new requests separately
const requestDB = './chaindata/request';
const ldb = level(requestDB);

const bitcoinMessage = require('bitcoinjs-message');

//Ability to define timeout centrally
const MINUTES = 5

// var exports = module.exports = {};
class LevelFunctions {
    constructor(req) {
        this.request = req;
    }



//Add block
    async addBlock(key, value) {
        return new Promise(function (resolve, reject) {
            db.put(key, value, function (err) {
                if (err) reject('Block ' + key + ' submission failed', err);
                resolve('Added block ' + key + ' to the chain');
            })
        });


    };

//get Block height
    async getMaxHeight() {
        return new Promise(function (resolve, reject) {
            let chainLength = 0;
            let keyStream = db.createKeyStream();
            keyStream.on('data', function (data) {
                chainLength += 1;
            })
                .on('error', function (err) {
                    reject(err);
                })
                .on('close', function () {
                    //When the stream is finished, return found max height.
                    resolve(chainLength);
                })
            // .on('unhandledRejection', function (reason, promise) {
            //     //When the stream is finished, return found max height.
            //     console.log('Unhandled Rejection at:', reason.stack || reason);
            // })
        });

    }


//Get block
    async getBlock(key) {
        // key = key.toString()
        return new Promise(function (resolve, reject) {
            db.get(key, function (err, value) {
                // if (err) reject('Block ' + key + ' not found!');
                if (err) {
                    if (err.notFound) {
                        /*  handle a 'NotFoundError' here. The following JSON value is returned
                        if key is not found. Specifically height is -1 and body text is "Not found"
                            {"hash":"","height":-1,"body":"Not found","time":"","previousBlockHash":""}
                         */
                        let notFoundObj = {
                            "hash": "",
                            "height": -1,
                            "body": "Not found",
                            "time": "",
                            "previousBlockHash": ""
                        };
                        // let json = JSON.stringify(notFoundObj);
                        return reject(notFoundObj);
                    }

                    return reject('Block ' + key + ' not found!');
                }

                console.log(value)
                // if (value === undefined){
                //     return reject('Block key not found');
                // }

                value = JSON.parse(value);
                // console.log(value)
                if (parseInt(key) > 0) {
                    value.body.star.storyDecoded = new Buffer(value.body.star.story, 'hex').toString();
                }


                resolve(value);//returns a string
            })
        })

    }

    //Get block by hash
    async getBlockByHash(hash) {
        return new Promise(function (resolve, reject) {
            let block;
            db.createReadStream()
                .on('data', function (data) {
                    console.log(data.key, '=', data.value)
                    block = JSON.parse(data.value);
                    // console.log(block)
                    if (hash === block.hash) {
                        console.log(block)
                        block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString();
                        return resolve(block);
                    }
                })
                .on('error', function (err) {
                    return reject(err);
                })
                .on('close', function () {
                    return reject('Hash not found');
                })
                // .on('end', function () {
                //     console.log('Stream ended')
                // })

        })
    }

    //Get block by address
    async getBlockByAddress(addr) {
        return new Promise(function (resolve, reject) {

            let reply = [];
            let block;
            db.createReadStream()
                .on('data', function (data) {
                    console.log(data.key, '=', data.value)
                    console.log('==================')
                    block = JSON.parse(data.value);
                    console.log(block)

                    if (addr === block.body.address && block.body.address) {
                        console.log('Found block address ' + addr);
                        block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString();
                        // return resolve(block);
                        reply.push(block);
                    }

                    console.log('----------')
                })
                .on('error', function (err) {
                    return reject(err);
                })
                .on('close', function () {
                    console.log(reply.length);
                    return resolve(reply);
                })
            // .on('end', function () {
            //     console.log('Stream ended')
            // })

        })
    }

    async handleUserRequest(addr) {
        return new Promise(function (resolve, reject) {
            /*
            if wallet address already in db:
            - update data if not expired
            - start new request if expired

            if wallet address not in db:
            - start new request
             */
            let timestamp = Date.now();
            let validationWindow = MINUTES * 60; //5 minutes
            let message = `${addr}:${timestamp}:starRegistry`;

            let data = {
                "address": addr,
                "requestTimeStamp": timestamp,
                "message": message,
                "validationWindow": validationWindow
            }
            // stringify data
            console.log('calling put')
            console.log(data.address);
            console.log(data)
            ldb.put(addr, JSON.stringify(data), function (err) {
                if (err) reject('Block ' + key + ' submission failed', err);
                // resolve('Added star ' + addr + ' to the chain');
                resolve(data);
            })
        });
    }

    async verifyAddedData(addr) {
        return new Promise(function (resolve, reject) {
            db.get(addr, function (err, value) {
                if (err) {
                    reject('Wallet address ' + addr + ' not found!');
                }
                if(value === undefined) {
                    reject ('Value undefined')
                }
                console.log('Got: ' + value);
                resolve(value);
            })
        });
    }



    //Get outstanding request
    async getExistingRequest(addr) {
        return new Promise(function (resolve, reject) {
            ldb.get(addr, function (err, value) {
                if (err) {
                    // if (err.notFound) {
                    //     /*  handle a 'NotFoundError' here. The following JSON value is returned
                    //     if key is not found. Specifically height is -1 and body text is "Not found"
                    //         {"hash":"","height":-1,"body":"Not found","time":"","previousBlockHash":""}
                    //      */
                    //     let notFoundObj = {"hash":"","height":-1,"body":"Not found","time":"","previousBlockHash":""};
                    //     let json = JSON.stringify(notFoundObj);
                    //     resolve(json);
                    // }
                    console.log('Rejecting');
                    return reject('Wallet address ' + addr + ' not found!');
                }

                value = JSON.parse(value);

                let xMinutes = MINUTES * 60 * 1000;
                let xMinutesBeforeNow = Date.now() - xMinutes;

                const isExpired = value.requestTimeStamp < xMinutesBeforeNow

                console.log(value.requestTimeStamp)
                console.log(xMinutesBeforeNow)
                console.log(value.requestTimeStamp - xMinutesBeforeNow);

                if (isExpired) {
                    //if expired, delete junk data and restart process
                    console.log('Got expired, save new request');

                    ldb.del(addr, function (err) {
                        if(err) {
                            console.log('Error while deleting junk data')
                        }
                    })

                    reject('User session expired after 5 minutes');
                    return;
                } else {
                    console.log('Not expired');
                    let valWindow = value.requestTimeStamp - xMinutesBeforeNow
                    console.log(valWindow)
                    //update data
                    let dataObj = {
                        "address": addr,
                        "requestTimeStamp": value.requestTimeStamp,
                        "message": value.message,
                        "validationWindow": Math.floor((value.requestTimeStamp - xMinutesBeforeNow) / 1000)
                    }
                    console.log(dataObj)
                    resolve(dataObj);
                }


            })
        });
    }


    //Validate signature
    /*

JSON response format
{
  "registerStar": true,
  "status": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "requestTimeStamp": "1532296090",
    "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
    "validationWindow": 193,
    "messageSignature": "valid"
  }
}
     */
    async validateSignature(addr, signature) {
        return new Promise(function (resolve, reject) {
            ldb.get(addr, function (err, value) {
                if (err) {
                    if (err.notFound) {
                        return reject('Address not found')
                    }
                    // console.log('Rejecting');
                    return reject('Error: ' + err);
                }

                value = JSON.parse(value);

                let xMinutes = MINUTES * 60 * 1000;
                let xMinutesBeforeNow = Date.now() - xMinutes;

                const isExpired = value.requestTimeStamp < xMinutesBeforeNow

                let isValidMessage = false;

                if (isExpired) {
                    //if expired, restart process
                    value.validationWindow = 0
                    value.messageSignature = 'invalid'
                    console.log('Unable to verify signature. Session expired after ' + MINUTES + 'minutes.');

                    //delete junk data
                    ldb.del(addr, function (err) {
                        if(err) {
                            console.log('Error while deleting junk data')
                        }
                    });

                    return reject('User session expired after 5 minutes');
                    // return;
                } else {
                    console.log('Message signature is not expired.');
                    value.validationWindow = Math.floor((value.requestTimeStamp - xMinutesBeforeNow) / 1000)

                    if (bitcoinMessage.verify(value.message, addr, signature)) {
                        isValidMessage = true;
                    }

                    value.messageSignature = isValidMessage ? 'valid' : 'invalid';

                    ldb.put(addr, JSON.stringify(value));

                    // construct successful return message
                    const returnData = {
                        registerStar : !isExpired && isValidMessage,
                        status: value
                    }
                    return resolve(returnData);
                }
            })
        });
    }

    async isValidatedAddress(addr) {
        return new Promise(function (resolve, reject) {
            ldb.get(addr, function (err, value) {
                if(err) {
                    return reject('Invalid address');
                }

                value = JSON.parse(value);

                if(value.messageSignature === 'valid') {
                    return resolve('Validated Address');
                } else {
                    return reject('Non Validated Address');
                }

            })
        });
    }

    async invalidateRequest(addr) {
        return new Promise(function (resolve, reject) {

            //Invalidate initial request
            console.log('Invalidating request for ' + addr);
            ldb.del(addr, function (err) {
                if(err) {
                    console.log('Error while deleting junk data')
                    return reject('Unable to invalidate request');
                }
                console.log('Record with address ' + addr + ' was deleted');
                return resolve("Request invalidated");
            })


        });
    }
}

//Export the class
module.exports = LevelFunctions
