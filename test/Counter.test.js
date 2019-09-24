/* global artifacts, web3, contract, assert */
require('chai')
  .use(require('bn-chai')(web3.utils.BN))
  .use(require('chai-as-promised'))
  .should()

const Counter = artifacts.require('./Counter.sol')
const { GSNDevProvider } = require("@openzeppelin/gsn-provider")
const { registerRelay, deployRelayHub, fundRecipient, balance, withdraw } = require('@openzeppelin/gsn-helpers')
const { toBN, toChecksumAddress } = require('web3-utils')
const { ephemeral } = require('@openzeppelin/network')
const Web3 = require('web3')
const { takeSnapshot, revertSnapshot } = require('../lib/ganacheHelper')

contract('Counter', accounts => {
    let counter
    const owner = accounts[0]
    let relayHubAddress
    let snapshotId
  
    before(async () => {
        counter = await Counter.new()
        await counter.initialize()
        relayHubAddress = toChecksumAddress(await deployRelayHub(web3, {
            from: owner
        }))
        await fundRecipient(web3, { recipient: counter.address, relayHubAddress })
        snapshotId = await takeSnapshot()
    })
  
    describe('#constructor', () => {
      it('should initialize', async () => {
        const value = await counter.value()
        value.should.be.eq.BN(0)
        const hub = await counter.getHubAddr()
        hub.should.be.equal(relayHubAddress)
      })
    })

    describe('#increase', () => {
        it('should increase directly', async () => {
            const value = await counter.value()
            await counter.increase()
            const newValue = await counter.value()
            newValue.should.be.eq.BN(value.add(toBN(1)))
        })
    })

    describe('#increase', () => {
        it('should increase via relayer', async () => {
            const account = ephemeral()
            const value = await counter.value()
            const provider = new GSNDevProvider("http://localhost:8545", { 
                signKey: account, 
                ownerAddress: accounts[8],
                relayerAddress: accounts[9],
                verbose: true
            })
            const web3 = new Web3(provider)
            counter = new web3.eth.Contract(counter.abi, counter.address)  
            await counter.methods.increase().send({ from: account.address })
            const newValue = await counter.methods.value().call()
            newValue.should.be.eq.BN(value.add(toBN(1)))
        })
    })

    afterEach(async () => {
        await revertSnapshot(snapshotId.result)
        // eslint-disable-next-line require-atomic-updates
        snapshotId = await takeSnapshot()
      })
})