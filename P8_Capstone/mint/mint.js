const dotenv = require('dotenv');
dotenv.config();

const contract = require('../eth-contracts/build/contracts/SolnSquareVerifier');
const ABI = contract.abi


const proofs = [
    require('../eth-contracts/test/proofs/proof'),
    require('../eth-contracts/test/proofs/proof2'),
    require('../eth-contracts/test/proofs/proof3'),
    require('../eth-contracts/test/proofs/proof4'),
    require('../eth-contracts/test/proofs/proof5'),
    require('../eth-contracts/test/proofs/proof6'),
    require('../eth-contracts/test/proofs/proof7'),
    require('../eth-contracts/test/proofs/proof8'),
    require('../eth-contracts/test/proofs/proof9'),
    require('../eth-contracts/test/proofs/proof10')
];


//load env variables
const MNEMONIC = process.env.MNEMONIC;
const INFURA_KEY = process.env.INFURA_KEY;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;


console.log("mnemonic:" + MNEMONIC);
console.log("infura key:" + INFURA_KEY);
console.log("owner address:" + OWNER_ADDRESS);
console.log("contract address:" + CONTRACT_ADDRESS);


const HDWalletProvider = require("truffle-hdwallet-provider");
const web3 = require('web3');


async function mintTokens() {
    const provider = new HDWalletProvider(MNEMONIC, `https://rinkeby.infura.io/v3/${INFURA_KEY}`);
    const web3Instance = new web3(
        provider
    );

    const contract = new web3Instance.eth.Contract(ABI, CONTRACT_ADDRESS, {gasLimit: "1000000"});
    proofs.forEach(async function (proof, index) {
        console.log(index);
        // index = index+10;
        // console.log(proof.proof);
        // index = 0;
        try {
            const result = await contract.methods.mintVerifiedTokenTo(
                OWNER_ADDRESS,
                index,
                proof.proof.A,
                proof.proof.A_p,
                proof.proof.B,
                proof.proof.B_p,
                proof.proof.C,
                proof.proof.C_p,
                proof.proof.H,
                proof.proof.K,
                proof.input).send({
                from: OWNER_ADDRESS,
                gas: 3900000
                // gas: 4993538
            });
            console.log("Mint Transaction: " + result.transactionHash);
        } catch (e) {
            console.log(e);
        }

    });
}

mintTokens();