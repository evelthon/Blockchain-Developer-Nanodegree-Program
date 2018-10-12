/*
 truffle exposes an artifacts object containing information like the ABI and other info.
 It uses the mocha javascript testing framework with additional functions to help us test our solidity code.
*/
const starDefinition = artifacts.require('StarNotary')


contract('StarNotary', accounts => {
    var owner = accounts[0]
    var contractInstance

    /*
We instantiate our asynchronous contact with beforeEach clause.

Remember, whenever interacting with any blockchain contract operation, it will be asynchronous.
    */
    beforeEach(async function () {
        contractInstance = await starDefinition.new({from: owner})
    })

    //We can group tests in a dfescribe clause
    describe('StarNotary basics', () => {
        //test
        it('has correct name', async function () {
            assert.equal(await contractInstance.starName(), 'Awesome Udacity Star!')
        })

        //test it can be claimed
        it('it can be claimed', async function () {
            assert.equal(await contractInstance.starOwner(), 0)
            await contractInstance.claimStar({from: owner})
            assert.equal(await contractInstance.starOwner(), owner)
        })
    })

    describe('Star can change owners', () => {
        beforeEach(async function() {
            assert.equal(await contractInstance.starOwner(), 0)
            await contractInstance.claimStar({from: owner})
        })

        it('Can be claimed by a second user', async function () {
            var secondUser = accounts[1]
            await contractInstance.claimStar({from: secondUser})
            assert.equal(await contractInstance.starOwner(), secondUser)
        })
    })
})