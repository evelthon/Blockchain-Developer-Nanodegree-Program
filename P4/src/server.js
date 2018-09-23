'use strict';

//Import Blockchain class and instantiate
const bChain = require('../blockChain');
const chain = new bChain();

//Import Block class and instantiate
const cBlock = require('../block.js');

//Include LevelDB helper functions
const levelDB = require('../leveldbfunctions.js');
const l_DB =  new levelDB();

//Include general helper fuctions
const helperFunctions = require('../helperfunctions');
const l_Help = new helperFunctions();

const Hapi=require('hapi');

//define server creation constants
const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = 8000;
const RADIX = 10;

/*
 Create a server with a host and port using environment variables
 P3_HOST and P3_PORT. If not found, default to DEFAULT_HOST and DEFAULT_PORT.
  */
const server = Hapi.server({
    host: process.env.P3_HOST || DEFAULT_HOST,
    port: parseInt(process.env.P3_PORT, RADIX) || DEFAULT_PORT
    // app: {}
});

// Add the route
server.route({
    method:'GET',
    path:'/hello',
    handler:function(request,h) {

        return'hello world';

    }
});

/*
Validate User request /requestValidation
@request wallet address
@response wallet address, request timestamp, message, validation window
 */
server.route({
    method:'POST',
    path:'/requestValidation',
    handler:async function(request,h) {
        const payload = request.payload;
        console.log(payload);

        //get wallet address
        const walletAddress = payload.address;
        console.log(walletAddress);

        // let responseData = await chain.createRequest(walletAddress)


        let requestData = null;
        try {
            requestData = await l_DB.getExistingRequest(walletAddress);
        } catch (e) {
            console.log('Caught exception - Wallet address not found')
            requestData = await l_DB.handleUserRequest(walletAddress);
        }

        return h.response(requestData).code(200)



        //get value from json data
        // const payloadBody = blockPayload.body;
        // const wallet_address =
        // return responseData

    }
})

/*
Allow User Message Signature
@request walletAddress, messageSignature
@response

-- test message --
1CSDLKAsvNgVKNYKkoWn8vNkGcZq7A6XH:1537521536184:starRegistry
-- test address --
1CSDLKAsvNgVKNYKkoWn8vNkGcZq7A6XH
-- test signature --
IFDKOa8IOi7rdZs8LAC4xZaeiZy+CN43cj/A06a0gyvDIHN/evVbzJYSTs5qUzWEponv9d5qh8OPAbAVUKm+t2M=

 */
server.route({
    method:'POST',
    path:'/message-signature/validate',
    handler:async function(request,h) {
        const payload = request.payload;
        console.log(payload);

        //get wallet address and message signature
        const walletAddress = payload.address;
        const signature = payload.signature;
        console.log(walletAddress);

        // let responseData = l_DB.validateSignature(walletAddress, signature);
        // console.log('Route response:' + responseData);

        let requestData = null;
        try {
            requestData = await  l_DB.validateSignature(walletAddress, signature);
            //just for testing
            // let testing = await l_DB.verifyAddedData(walletAddress);
            // console.log('---------');
            // console.log(testing);

            return h.response(requestData).code(200)
        } catch (e) {
            requestData = 'Unable to verify signature. Session expired after 5 minutes. Re-start the process.'

            //just for testing
            // try {
            //     let testing = await l_DB.verifyAddedData(walletAddress);
            //     console.log('---------');
            //     console.log(testing);
            // } catch (e) {
            //     console.log(e)
            //
            // }

            return h.response(requestData).code(404)
        }

    }
})

/*
Request block with block ID
If the block ID is omitted, return genesis block.
If block ID does not exist, return error message to user.
 */
server.route({
    method:'GET',
    path:'/block/{block_id?}',
    handler:async function(request,h) {

        const bid = request.params.block_id ?
            encodeURIComponent(request.params.block_id) :
            '0';

        // console.log(chain.getBlock(0))
        // return `fetching block ${bid}`;
        // return chain.getBlock(bid)

        try{
            return h.response(await chain.getBlock(bid)).code(200)
        } catch (e) {
            return h.response(e).code(404)
        }
    }
});

//POST block (add new block) w/ request body
/*
@param address (wallet address)
@param star ( star details including coordinates and story)
:
payload:
{"address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ","star": {
		"dec": "-26° 29' 24.9",
		"ra": "16h 29m 1.0s",
		"story": "Found star using https://www.google.com/sky/"
	}
}

body data include both address and star details.
 */
server.route({
    method:'POST',
    path:'/block',
    handler:async function(request,h) {

        console.log('POST add block');
        const blockPayload = request.payload;
        console.log(blockPayload)

        let pdata =  blockPayload;
        //get value from json data
        const address = pdata.address;
        const star = pdata.star;
        // console.log(payloadBody);
        console.log(address);
        console.log(star);
        //Check whether this address has validated signature

        try {
            const validated = await l_DB.isValidatedAddress(address)
            // return h.response(e).code(404)
        } catch (e) {
            const data = {
                response: e
            }
            return h.response(data).code(404)
        }


        console.log('Before validation of star data')
        try{
            l_Help.validStarData(star);

            console.log('Story: ' + pdata.star.story)

            //encode story to hex
            pdata.star.story = new Buffer(pdata.star.story).toString('hex');
            console.log('PDATA: ' + pdata.star.story)

            //TODO: save block only if signature validated
            console.log*('Before addBlock()')
            let newBlockHeight = await chain.addBlock(new cBlock(pdata));

            console.log('The newly added block got height ' + newBlockHeight)

            //after saving block, delete junk data w/ wallet address as key
            // try {
            //     await l_DB.invalidateRequest(address);
            // } catch (e) {
            //     console.log(e)
            // }

            return h.response(await chain.getBlock(newBlockHeight)).code(201)
        } catch (e) {
            console.log(e);

            return h.response(e).code(404)
        }




    }
});

//Get Block by hash
/*
Block hash for testing
dff19581634c1e0db70144554d81acc3f3f071acd0b008449476c846a358d9bd
 */
server.route({
    method:'GET',
    path:'/stars/hash:{hash}',
    handler:async function(request,h) {
        const hash = request.params.hash ?
            encodeURIComponent(request.params.hash) :
            '0';
        console.log(hash);
        try{
            const response = await chain.getBlockByHash(hash);
            return h.response(response).code(200)
        } catch (e) {
            console.log('Block not found')
            return h.response(e).code(404)
        }

    }
});


/*
Get Block by address
142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ

 */
server.route({
    method:'GET',
    path:'/stars/address:{address}',
    handler:async function(request,h) {
        const address = request.params.address ?
            encodeURIComponent(request.params.address) :
            '0';

        try{
            const response = await chain.getBlockByAddress(address);
            return h.response(response).code(200)
        } catch (e) {
            console.log('Block not found')
            return h.response(e).code(404)
        }

    }
});

/*
Get all data (for testing)
 */
// server.route({
//     method:'GET',
//     path:'/all',
//     handler:async function(request,h) {
//         //
//         // try{
//         //     const response = await chain.getBlockByAddress(address);
//         //     return h.response(response).code(200)
//         // } catch (e) {
//         //     console.log('Block not found')
//         //     return h.response(e).code(404)
//         // }
//
//         const level = require('level');
//         const chainDB = '../chaindata';
//         const db = level(chainDB);
//
//         db.createReadStream()
//             .on('data', function (data) {
//                 console.log(data.key, '=', data.value)
//             })
//             .on('error', function (err) {
//                 console.log('Oh my!', err)
//             })
//             .on('close', function () {
//                 console.log('Stream closed')
//             })
//             .on('end', function () {
//                 console.log('Stream ended')
//             })
//
//         return 'Finished all data';
//
//     }
// });

// Start the server
async function start() {

    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};

start();