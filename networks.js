const HDWalletProvider = require('truffle-hdwallet-provider')
const utils = require('web3-utils')

module.exports = {
  networks: {
    development: {
      protocol: 'http',
      host: 'localhost',
      port: 8545,
      gas: 5000000,
      gasPrice: 5e9,
      networkId: '*',
    },
    rinkeby: {
      provider: () => new HDWalletProvider('10B7AB296ED83672814225DDF8C8BE1339756660440AC039E6720DCF25148F04', 'https://rinkeby.infura.io/v3/c7463beadf2144e68646ff049917b716'),
      network_id: 4,
      gas: 6000000,
      gasPrice: utils.toWei('1', 'gwei'),
      // confirmations: 0,
      // timeoutBlocks: 200,
      skipDryRun: true
    }
  },
};
