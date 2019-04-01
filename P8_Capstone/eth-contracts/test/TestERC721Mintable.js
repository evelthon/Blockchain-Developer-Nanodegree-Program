var ERC721MintableComplete = artifacts.require('SolnSquareVerifier');

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];
    const account_three = accounts[2];
    const account_four = accounts[3];
    const account_five = accounts[4];
    const account_six = accounts[5];

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

        it('verify approval for all tokens', async function () {
            let isApproved = await this.contract.isApprovedForAll(account_one, account_three, {from: account_one});
            assert.equal(isApproved, false, "account_three should not be approved");

            //approve account_three for all
            await this.contract.setApprovalForAll(account_three, true, {from:account_one});
            isApproved = await this.contract.isApprovedForAll(account_one, account_three, {from: account_one});
            assert.equal(isApproved, true, "account_three should be approved");

            //remove approval for all
            await this.contract.setApprovalForAll(account_three, false, {from:account_one});
            isApproved = await this.contract.isApprovedForAll(account_one, account_three, {from: account_one});
            assert.equal(isApproved, false, "account_three should (again) not be approved for all");
        });


    });


    describe('match erc721 spec', function () {
        beforeEach(async function () {
            this.contract = await ERC721MintableComplete.new({from: account_one});

            // TODO: mint multiple tokens
            await this.contract.mintVerifiedTokenTo(account_two, 0, {from: account_one});
            await this.contract.mintVerifiedTokenTo(account_three, 1, {from: account_one});
            await this.contract.mintVerifiedTokenTo(account_four, 2, {from: account_one});
            await this.contract.mintVerifiedTokenTo(account_five, 3, {from: account_one});
            await this.contract.mintVerifiedTokenTo(account_six, 4, {from: account_one});
        })

        it('should return total supply', async function () {
            let result = await this.contract.totalSupply.call({from: account_one});
            assert.equal(result.toNumber(), 5, "Error calculating total supply");
        })

        it('should get token balance', async function () {
            let result = await this.contract.balanceOf.call(account_five, {from:account_one});
            assert.equal(result.toNumber(), 1, "Wrong balance for account_five");
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () {
            let result = await this.contract.tokenURI.call(1, {from: account_one});
            assert.equal(result, "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1", "Error fetching token uri");
        })

        it('should transfer token from one owner to another', async function () {
            const tokenId = 0;

            //is token approved?
            let approvedAddress = await this.contract.getApproved.call(tokenId, {from:account_one});
            assert.equal(parseInt(approvedAddress), 0, "Should not be able to retrieve an approved token");

            //add approval for account_four
            await this.contract.approve(account_four, tokenId, {from: account_two});
            approvedAddress = await this.contract.getApproved.call(tokenId, {from: account_one});
            assert.equal(approvedAddress, account_four, "This should be approved for account_four");

            //verify current owner
            let owner = await this.contract.ownerOf.call(tokenId, {from: account_one});
            assert.equal(owner, account_two, "Owner is not account_two");

            /*
            Check balances of account_thw & account_six
            transfer from account_two to account_six
            Check new balances of account_thw & account_six
             */

            let accountBalance = await this.contract.balanceOf.call(account_two, {from: account_one});
            assert.equal(accountBalance.toNumber(), 1, "Error in account balance for account_two");


            accountBalance = await this.contract.balanceOf.call(account_six, {from: account_one});
            assert.equal(accountBalance.toNumber(), 1, "Error in account balance for account_six");

            await this.contract.transferFrom(account_two, account_six, tokenId, {from: account_two});

            accountBalance = await this.contract.balanceOf.call(account_two, {from: account_one});
            assert.equal(accountBalance.toNumber(), 0, "Error in account balance for account_two (should be zero)");


            accountBalance = await this.contract.balanceOf.call(account_six, {from: account_one});
            assert.equal(accountBalance.toNumber(), 2, "Error in account balance for account_six (should be two");

        })
    });


})