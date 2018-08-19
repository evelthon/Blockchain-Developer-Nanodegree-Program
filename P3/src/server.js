'use strict';

//Import Blockchain class and instantiate
const bChain = require('../simpleChain');
const chain = new bChain();

//Import Block class and instantiate
const cBlock = require('../block.js');

const Hapi=require('hapi');

// Create a server with a host and port
const server=Hapi.server({
    host:'localhost',
    port:8000
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
 */
server.route({
    method:'GET',
    path:'/block/{block_id?}',
    handler:function(request,h) {

        const bid = request.params.block_id ?
            encodeURIComponent(request.params.block_id) :
            '0';

        console.log(chain.getBlock(0))
        // return `fetching block ${bid}`;
        return chain.getBlock(bid)
    }
});

//POST block (add new block)
server.route({
    method:'POST',
    path:'/block',
    handler:async function(request,h) {
;
        const blockPayload = request.payload;

        //get value from json data
        const payloadBody = blockPayload.body;


        let newBlockHeight = await chain.addBlock(new cBlock(payloadBody));
        console.log("New height is " + newBlockHeight);

        //Separate Block class and import
        //block must be parsed to addBlock
        // chain.addBlock(newBlock(""));

        console.log("POsting!!")
        console.log(blockPayload)
        console.log(request.payload)
        console.log(blockPayload.body)

        //Must returned the added json data
        return `Posting finished`;
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