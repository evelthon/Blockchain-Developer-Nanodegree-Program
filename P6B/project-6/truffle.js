var HDWalletProvider = require('truffle-hdwallet-provider');

var mnemonic = 'ENTER_MNEMONIC_HERE';

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: "*",
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/API_KEY')
      },
      network_id: 4,
      gas: 6700000,
      gasPrice: 10000000000,
    }
  }
};

