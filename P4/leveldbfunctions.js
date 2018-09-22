/*
    Helper function to interact with LevelDB
 */

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

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
                        let json = JSON.stringify(notFoundObj);
                        resolve(json);
                    }

                    reject('Block ' + key + ' not found!');
                }

                // console.log('LEVEL Value = ' + value);
                // console.log("LEVEL " + typeof  value);
                // console.log("LEVEL " + typeof JSON.parse(value));
                resolve(value);//returns a string
            })
        })

    }

    //Get block by hash
    async getBlockByHash(hash) {
        return new Promise(function (resolve, reject) {
            db.createReadStream()
                .on('data', function (data) {
                    console.log(data.key, '=', data.value)
                })
                .on('error', function (err) {
                    console.log('Oh my!', err)
                })
                .on('close', function () {
                    console.log('Stream closed')
                })
                .on('end', function () {
                    console.log('Stream ended')
                })

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
            db.put(addr, JSON.stringify(data), function (err) {
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
            db.get(addr, function (err, value) {
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

                // console.log('Date now is ' + Date.now());
                // console.log('Value is' + value);
                // console.log('xMinutes= ' + xMinutes/1000);
                // console.log("xMinutesBefore " + xMinutesBeforeNow/1000);
                console.log(value.requestTimeStamp)
                console.log(xMinutesBeforeNow)
                console.log(value.requestTimeStamp - xMinutesBeforeNow);
                // console.log("isExpired " + isExpired);

                // var lastTime = 0;

                // if ( Math.floor((new Date() - lastTime)/60000) < 2 ) {
                //     // get from variable
                // } else {
                //     // get from url
                //     lastTime =  new Date();
                // }

                if (isExpired) {
                    //if expired, delete junk data and restart process
                    console.log('Got expired, save new request');

                    db.del(addr, function (err) {
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
    let address = '142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ'
let signature = 'IJtpSFiOJrw/xYeucFxsHvIRFJ85YSGP8S1AEZxM4/obS3xr9iz7H0ffD7aM2vugrRaCi/zxaPtkflNzt5ykbc0='
let message = '142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532330740:starRegistry'

console.log(bitcoinMessage.verify(message, address, signature))

JSON response
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
            db.get(addr, function (err, value) {
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
                    db.del(addr, function (err) {
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

                    db.put(addr, JSON.stringify(value));

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
            db.get(addr, function (err, value) {
                if(err) {
                    return reject('Invalid address');
                }

                if(value.messageSignature === 'valid') {
                    return resolve('Validated Address');
                } else {
                    return reject('Non Validated Address');
                }

            })
        });
    }
}

//Export the class
module.exports = LevelFunctions
