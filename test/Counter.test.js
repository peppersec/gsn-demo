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
            gsnCounter = new web3.eth.Contract(counter.abi, counter.address)  
            await gsnCounter.methods.increase().send({ from: account.address })
            const newValue = await counter.value()
            newValue.should.be.eq.BN(value.add(toBN(1)))
        })
    })

    describe('#withdrawViaRelayer', () => {
        it('should work', async () => {
            const account = ephemeral()
            const provider = new GSNDevProvider("http://localhost:8545", { 
                signKey: account, 
                ownerAddress: accounts[8],
                relayerAddress: accounts[9],
                verbose: true
            })
            const web3 = new Web3(provider)
            gsnCounter = new web3.eth.Contract(counter.abi, counter.address)
            const { pi_a, pi_b, pi_c, publicSignals } = { pi_a:
                [ '0x25ab09606599b84787eff63bbcc7fa091de5b5e724ded92909c7507b940a0b01',
                  '0x0fe3c2a5c1af4b68de7fb89e6b7d7bbe8d4624f5dbe41f25a1bc1b649666f548' ],
               pi_b:
                [ [ '0x1151b1c499d0237e41c4be108d25aea9d63ce3fd2f0ff728cf1d901dc955374c',
                    '0x0c8e0bbfe6864dd682c670e0c18a00c082bd45c2b82c3fb84de782f09a29c87f' ],
                  [ '0x238d84dc3686977a4efcb7aa76d3410da5cf13d198347e3fc5e9407dde6b6614',
                    '0x1dc676a135cecf39accb0138120aecb2de51f715c5abd94ef0fcc39c3b2a953d' ] ],
               pi_c:
                [ '0x21e3ea378f13ca7413df425348a0c71d7081d0f2f42bce8e19ff56e44d958507',
                  '0x1c559a568f288cad1a5a6f9b4ef1ccda3adae40a490253b83a358f429dd2f695' ],
               publicSignals:
                [ '0x15163f70d3c051ca52c44727793f2110f0fb032c62558bb97dc4d806203e39c2',
                  '0x2f9ca4dbaa092015f21cf0625eb46fbf4a00dff94f8a2988287567560eb0f5f0',
                  '0x000000000000000000000000972c2188db25a0ca95e2d000a129fb9d2bba4e2c' ] }
            const tx = await gsnCounter.methods.withdrawViaRelayer(pi_a, pi_b, pi_c, publicSignals).send({ from: account.address })
            console.log('tx', tx)
        })
    })

    afterEach(async () => {
        await revertSnapshot(snapshotId.result)
        // eslint-disable-next-line require-atomic-updates
        snapshotId = await takeSnapshot()
      })
})