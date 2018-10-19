var HDWalletProvider = require('truffle-hdwallet-provider');

var mnemonic = 'repeat bomb body law sand square pupil leave silent owner garment urban';

module.exports = {
    networks: {
        development: {
            host: '127.0.0.1',
            port: 8545,
            network_id: "*",
        },
        rinkeby: {
            provider: function() {
                return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/92248c392535476b9186759d8b1ffb10')
            },
            network_id: 4,
            gas: 6700000,
            gasPrice: 10000000000,
        }
    }
};