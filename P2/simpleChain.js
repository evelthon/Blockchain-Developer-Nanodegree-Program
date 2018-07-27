//Include LevelDB helper functions
const l_DB = require('./leveldbfunctions.js');

/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');


/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
    constructor(data) {
        this.hash = "",
            this.height = 0,
            this.body = data,
            this.time = 0,
            this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
    constructor() {
        this.chain = [];
        // this.addBlock(new Block("First block in the chain - Genesis block"));
        // l_DB.getMaxHeight();
        // console.log(mHeight);

        // l_DB.getChain();
    }

    // Add new block
    async addBlock(newBlock) {

        //get max height
        let mHeight = 0;
        let mHeightPromise = await l_DB.getMaxHeight();
        // mHeightPromise.then(function (result) {
        //     console.log('Got promise height: ' + result);
        //     mHeight = result;
        // }, function(err) {
        //     console.log(err);
        // })
        mHeight = mHeightPromise;

        console.log('got mHeight as ' + typeof mHeight + ' ' + mHeight);
        // Block height
        newBlock.height = parseInt(mHeight,10) + parseInt(1, 10);
        console.log('New block HEIGHT is: ' + newBlock.height);
        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0, -3);
        // previous block hash (Do not look for hash if Genesis block
        if (mHeight>0) {
            console.log('HASH');
            const previousBlock = JSON.parse(await l_DB.getBlock(mHeight));
            console.log(previousBlock);
            console.log(previousBlock.hash);
            newBlock.previousBlockHash = previousBlock.hash;
        }
        // if(this.chain.length>0){
        //   newBlock.previousBlockHash = this.chain[this.chain.length-1].hash;
        // }
        // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        // Adding block object to chain
        // this.chain.push(newBlock);
        await l_DB.addBlock(newBlock.height, JSON.stringify(newBlock));

        l_DB.getChain();
    }

    // Get block height
    getBlockHeight() {
        return this.chain.length - 1;
    }

    // get block
    async getBlock(blockHeight) {
        // return object as a single string
        return JSON.parse(await l_DB.getBlock(blockHeight));
    }

    // validate block
    validateBlock(blockHeight) {
        // get block object
        let block = this.getBlock(blockHeight);
        // get block hash
        let blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        if (blockHash === validBlockHash) {
            return true;
        } else {
            console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
            return false;
        }
    }

    // Validate blockchain
    validateChain() {
        let errorLog = [];
        for (var i = 0; i < this.chain.length - 1; i++) {
            // validate block
            if (!this.validateBlock(i)) errorLog.push(i);
            // compare blocks hash link
            let blockHash = this.chain[i].hash;
            let previousHash = this.chain[i + 1].previousBlockHash;
            if (blockHash !== previousHash) {
                errorLog.push(i);
            }
        }
        if (errorLog.length > 0) {
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: ' + errorLog);
        } else {
            console.log('No errors detected');
        }
    }
}

(function autoExec () {
    b = new Blockchain();
    b.addBlock(new Block('test' ))
});
