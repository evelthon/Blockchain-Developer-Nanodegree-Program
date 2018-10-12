pragma solidity ^0.4.23;

import './ERC721Token.sol';

contract StarNotary is ERC721Token {

    struct Star {
        string name;
    }

    //map star id to it's metadata
    mapping(uint256 => Star) public tokenIdToStarInfo;

    //map tp denote stars up for sale
    mapping(uint256 => uint256) public starsForSale;


    function createStar(string _name, uint256 _tokenId) public {
        //create an instance of the star struct to hold the star name
        Star memory newStar = Star(_name);//the memory keyword denotes a temp memory var, release after function call.

        tokenIdToStarInfo[_tokenId] = newStar;

        ERC721Token.mint(_tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        //only the owner can put star up for sale.
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        /*
        0 is the defailt value in solidity. So, a star with value 0 is not for sale.
        A star that is not for sale would have a value of 0, even if we did not explicitly put it their.
        */
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        clearOtherStates(_tokenId);

        ERC721Token.transferFromHelper(starOwner, msg.sender, _tokenId);

        starOwner.transfer(starCost);


        //If the buyer overpayed, they get a refund
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }


    function clearOtherStates(uint256 _tokenId) private {
        // clear approvals
        tokenToApproved[_tokenId] = address(0);

        // clear being on sale
        starsForSale[_tokenId] = 0;
    }
}