const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => {
    const name = 'Star power 103!'
    const story = 'A star story'
    const ra = 'ra_032.155'
    const dec = 'dec_121.874'
    const mag = 'mag_245.978'
    const tokenId = 1

    let defaultAccount = accounts[0];
    let user1 = accounts[1];
    let user2 = accounts[2];

    beforeEach(async function() {
        this.contract = await StarNotary.new({from: defaultAccount})
    })


    //create star
    describe('can create a star ', () => {
        it('can create a star and get its meta-data', async function () {

            await this.contract.createStar(name, story, ra, dec, mag, {from: user1})
            assert.deepEqual(await this.contract.tokenIdToStarInfo(tokenId), [name, story, ra, dec, mag]);

        })
    })

    //buy and sell stars
    describe('buying and selling stars', () => {
        let user1 = accounts[1]
        let user2 = accounts[2]
        let randomMaliciousUser = accounts[3]

        let starId = 1
        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () {
            await this.contract.createStar(name, story, ra, dec, mag, {from: user1})
        })

        it('user1 can put up their star for sale', async function () {
            assert.equal(await this.contract.ownerOf(starId), user1);
            await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            assert.equal(await this.contract.starsForSale(starId), starPrice)
        })

        describe('user2 can buy a star that was put up for sale', () => {
            beforeEach(async function () {
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            })

            it('user2 is the owner of the star after they buy it', async function() {
                await this.contract.buyStar(starId, {from: user2, value: starPrice, gasPrice: 0})
                assert.equal(await this.contract.ownerOf(starId), user2)
            })

            it('user2 ether balance changed correctly', async function () {
                let overpaidAmount = web3.toWei(.05, 'ether')
                const balanceBeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(starId, {from: user2, value: overpaidAmount, gasPrice: 0})
                const balanceAfterTransaction = web3.eth.getBalance(user2)

                assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice)
            })
        })
    })

    //Check if added star exists, and another star does not.
    describe('check if star exist', () => {
        it('star already exist', async function () {
            await this.contract.createStar(name, story, ra, dec, mag, {from: defaultAccount})
            assert.equal(await this.contract.checkIfStarExist(ra, dec, mag), true);
        })
        it('verified star does not exist', async function () {
            assert.equal(await this.contract.checkIfStarExist('ra_032.177', dec, mag), false);
        })
    })

    //test ownerOf
    describe('star has correct owner', () => {
        it('ownerOf: verified star has correct owner', async function () {
            await this.contract.createStar(name, story, ra, dec, mag, {from: defaultAccount})
            assert.equal(await this.contract.ownerOf(tokenId, {from: defaultAccount}), defaultAccount)
        })
    })

    //test mint method
    describe('mint method test', () => {
        let tx;
        beforeEach(async function () {
            tx = await this.contract.mint(tokenId, {from: defaultAccount})
        })
        it('verified minted token belongs to correct owner', async function () {
            assert.equal(await this.contract.ownerOf(tokenId), defaultAccount)
        })
    })

    describe('approval tests', () => {
        //verify we can set another user as approved to handle a token

        it('a user is approved to handle another user\'s token', async function () {
            await this.contract.createStar(name, story, ra, dec, mag, {from: defaultAccount})
            await this.contract.approve(user1, tokenId, {from: defaultAccount});
            assert.equal(await this.contract.getApproved(tokenId), user1)
        })

        it('setApprovalForAll is validated', async function () {
            await this.contract.createStar(name, story, ra, dec, mag, {from: defaultAccount})
            await this.contract.setApprovalForAll(user1, true)
            assert.equal(await this.contract.isApprovedForAll(defaultAccount, user1), true);
        })
    })

    describe('test safeTransferFrom', () => {
        beforeEach(async function () {
            await this.contract.createStar(name, story, ra, dec, mag, {from: defaultAccount})
            await this.contract.safeTransferFrom(defaultAccount, user1, tokenId)
        })

        it('user1 is not the owner of the token', async function () {
            assert.equal(await this.contract.ownerOf(tokenId), user1)
        })
        it('defaultAccount is no longer the owner of the token', async function () {
            assert.notEqual(await this.contract.ownerOf(tokenId), defaultAccount)
        })
    })
})