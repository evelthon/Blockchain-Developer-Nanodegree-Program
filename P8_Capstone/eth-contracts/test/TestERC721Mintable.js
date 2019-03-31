var ERC721MintableComplete = artifacts.require('SolnSquareVerifier');

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];
    const account_three = accounts[3];

    describe('have ownership properties', function () {
        beforeEach(async function () {
            this.contract = await ERC721MintableComplete.new({from: account_one});
        })

        it('should fail when minting when address is not contract owner', async function () {
            let reverted = false;

            try {
                await this.contract.mintVerifiedTokenTo(account_two, 123, {from: account_two})
            } catch (e) {
                reverted = true;
            }

            assert.equal(reverted, true, "Minting should have failed");
        });

        it('should return contract owner', async function () {
            let contract_owner = await this.contract._owner.call({from: account_one});
            assert.equal(contract_owner, account_one, "Error retrieving contract owner");
        });


        it('Verify correct handling of ownership transfer', async function () {
            // verify owner is account_one
            let contract_owner = await this.contract._owner.call({from: account_one});
            assert.equal(contract_owner, account_one, "First account should be contract owner");

            //attempt (but must not allow) transfer of ownership by account_two, to account_two
            let reverted = false;
            try {
                await this.contract.transferOwnership(account_two, {from:account_two});
            } catch (e) {
                reverted = true;
            }

            assert.equal(reverted, true, "Erroneous ownership transfer.")

            //transfer ownership from account_one to
            reverted = false;
            try {
                await this.contract.transferOwnership(account_two, {from:account_one});
            } catch (e) {
                reverted = true;
            }

            assert.equal(reverted, false, "Unable to change owner.");

            contract_owner = await this.contract._owner.call({from: account_one});
            assert.equal(contract_owner, account_two, "Second account should be contract owner");

        });

    });

    describe('check correct approval handling', function () {
        beforeEach(async function () {
            this.contract = await ERC721MintableComplete.new({from: account_one});
            await this.contract.mintVerifiedTokenTo(account_two, 123, {from: account_one})
        });

        it('verify approval for 1 token', async function () {
            const tokenId = 123;
            let approvedAddress = await this.contract.getApproved.call(tokenId, {from:account_one});
            assert.equal(parseInt(approvedAddress), 0, "Should not be able to retrieve an approved token");
            // console.log(parseInt(apprAddress));

            //Test that can approve another address to transfer the given token ID
            //current approved address is address_two. Change it to address_three
            await this.contract.approve(account_three, tokenId, {from:account_two});
            approvedAddress = await this.contract.getApproved.call(tokenId, {from:account_one});
            assert.equal(approvedAddress, account_three, "Approved address should be account_three");

        });

        it('XXX verify approval for all tokens', async function () {

        });


    });


    describe('match erc721 spec', function () {
        beforeEach(async function () {
            this.contract = await ERC721MintableComplete.new({from: account_one});

            // TODO: mint multiple tokens
        })

        it('should return total supply', async function () {

        })

        it('should get token balance', async function () {

        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () {

        })

        it('should transfer token from one owner to another', async function () {

        })
    });


})