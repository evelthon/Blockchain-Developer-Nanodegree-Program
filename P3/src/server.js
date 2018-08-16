'use strict';

//Import Blockchain class and instantiate
const bChain = require('../simpleChain');
const chain = new bChain();

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
    handler:function(request,h) {

        const {block} = request.payload;

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