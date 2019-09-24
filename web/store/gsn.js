import Web3 from 'web3'
const { GSNProvider } = require("@openzeppelin/gsn-provider")
import { ephemeral } from '@openzeppelin/network'

// const account = web3.eth.accounts.privateKeyToAccount('0x' + privKey.toString('hex'))
// web3.eth.accounts.wallet.add('0x' + privKey.toString('hex'))
// web3.eth.defaultAccount = account.address
// const gsnProvider = new GSNProvider("http://localhost:8545");
// const web3 = new Web3(gsnProvider);

// import { fromInjected, fromConnection } from '@openzeppelin/network';


const { abi } = require('../../build/contracts/Counter.json')


export const state = () => {
  return {}
}

export const getters = {
}

export const mutations = {
}

export const actions = {
  async increment({ commit, dispatch }) {
    try {
      const account = ephemeral()
      console.log('account', account)
      const provider = new GSNProvider("http://localhost:8545", { signKey: account })
      const web3 = new Web3(provider)
      console.log('web3', web3)
      const myContract = new web3.eth.Contract(abi, '0x2325eDBF750D734A60e15322391b8946E3a1B182')
      const tx = await myContract.methods.increase().send({ from: account.address })
      console.log('tx', tx)

    } catch(e) {
      console.log(e)
    }
  }
}
