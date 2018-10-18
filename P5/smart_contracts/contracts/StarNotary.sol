pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 { 

    struct Star { 
        string name;
        string story;
        string ra;
        string dec;
        string mag;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo; 
    mapping(uint256 => uint256) public starsForSale;

    //A register star is linked to an address
    mapping(bytes32 => address) public hashToAddress;

    uint256 public tokenHeight;

    function createStar(string _name, string _story, string _ra, string _dec, string _mag) public {

        tokenHeight++;
        uint256 _tokenId = tokenHeight;
        //Require star with this specific coordinates not already registered
        //If not, the default value returned is zero.
        require(hashToAddress[keccak256(abi.encodePacked(_ra, _dec, _mag))] == address(0));

        Star memory newStar = Star(_name, _story, _ra, _dec, _mag);

        tokenIdToStarInfo[_tokenId] = newStar;

        hashToAddress[keccak256(abi.encodePacked(_ra, _dec, _mag))] = msg.sender;

        _mint(msg.sender, _tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSale[_tokenId] > 0);
        
        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);
        
        starOwner.transfer(starCost);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }
    }

    function checkIfStarExist(string _ra, string _dec, string _mag) public view returns (bool) {
        if (hashToAddress[keccak256(abi.encodePacked(_ra, _dec, _mag))] == address(0)) {
            return false;
        } else {
            return true;
        }
    }

    function tokenIdToStarInfo(uint256 tokenId) public view returns(string, string, string, string, string) {
        return (
                tokenIdToStarInfo[tokenId].name,
                tokenIdToStarInfo[tokenId].story,
                tokenIdToStarInfo[tokenId].ra,
                tokenIdToStarInfo[tokenId].dec,
                tokenIdToStarInfo[tokenId].mag
                );
    }

    function mint (uint256 tokenId) public {
        super._mint(msg.sender, tokenId);
    }
}