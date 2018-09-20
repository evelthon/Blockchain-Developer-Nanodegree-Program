/*
    Helper function to interact with LevelDB
 */

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

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
            let validationWindow = 300; //5 minutes
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
                resolve('Added star ' + addr + ' to the chain');
            })
        });
    }

    async verifyAddedData(addr) {
        return new Promise(function (resolve, reject) {
            db.get(addr, function (err, value) {
                if (err) {
                    reject('Wallet address ' + addr + ' not found!');
                }
                // console.log('Got: ' + value);
                resolve(value);
            })
        });
    }

    //create new request
  /*  async createNewRequest(addr) {
        let timestamp = Date.now();
        let validationWindow = 300; //5 minutes
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
        db.put(data.address, data, function (err) {
            // if (err) reject('Block ' + key + ' submission failed', err);
            // resolve('Added block ' + key + ' to the chain');
        })

        console.log('getting back');
        db.get(addr, function (err, value) {
            console.log(value.address)
        })
    }
    */

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
                let minutes = 1;
                let xMinutes = minutes * 60 * 1000;
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
                    //if expired, restart process
                    console.log('Got expired, save new request');
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




}

//Export the class
module.exports = LevelFunctions
