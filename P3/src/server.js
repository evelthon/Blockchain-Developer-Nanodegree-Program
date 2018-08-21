'use strict';

//Import Blockchain class and instantiate
const bChain = require('../simpleChain');
const chain = new bChain();

//Import Block class and instantiate
const cBlock = require('../block.js');

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
server.route({
    method:'POST',
    path:'/block',
    handler:async function(request,h) {
;
        const blockPayload = request.payload;

        //get value from json data
        const payloadBody = blockPayload.body;

        let newBlockHeight = await chain.addBlock(new cBlock(payloadBody));
        // console.log("New height is " + newBlockHeight);
        return chain.getBlock(newBlockHeight);

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