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
            try {
                let testing = await l_DB.verifyAddedData(walletAddress);
                console.log('---------');
                console.log(testing);
            } catch (e) {
                console.log(e)

            }

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
    handler:function(request,h) {

        const bid = request.params.block_id ?
            encodeURIComponent(request.params.block_id) :
            '0';

        // console.log(chain.getBlock(0))
        // return `fetching block ${bid}`;
        return chain.getBlock(bid)
    }
});

//POST block (add new block) w/ request body
/*
@param address (wallet address)
@param star ( star details including coordinates and story)

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
        // console.log(request)
        const blockPayload = request.payload;
        console.log(blockPayload)

        let pdata =  JSON.parse(blockPayload);
        //get value from json data
        // const payloadBody = blockPayload.body;
        const address = pdata.address;
        const star = pdata.star;
        // console.log(payloadBody);
        // console.log(address);
        // console.log(star);
        try{
            l_Help.validStarData(star);

            console.log(pdata.star.story)

            //encode story to hex
            pdata.star.story = new Buffer(pdata.star.story).toString('hex');

            //TODO: save block only if signature validated
            let newBlockHeight = await chain.addBlock(new cBlock(pdata));

            //TODO: after saving block, delete junk data w/ wallet address as key

            return h.response(await chain.getBlock(newBlockHeight)).code(201)
        } catch (e) {
            console.log(e);

            return h.response(e).code(404)
        }




    }
});


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