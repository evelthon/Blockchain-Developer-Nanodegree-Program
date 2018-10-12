pragma solidity ^0.4.24;

import './ERC721.sol';

contract ERC721Token is ERC721 {

/// @notice Count all NFTs assigned to an owner

/*
Functions from ERC721 does not dictate how to create new tokens. This is up to us.

*/

/*
A token is simply a reference of ownership. The way we can do that here is to create a mapping which is
essentially a key - value store, to keep track of what address owns a tokenId.

We also need a mapping to hold the balance for each owner address.

In solidity the default value is always zero(0).
So to check that no one owns the tokenId passed to the mint function we require that the owner for that token is
address 0. 
*/

    mapping(uint256 => address) tokenToOwner;
    mapping(address => uint256) ownerToBalance;

    //which address is approved for a particular token.
    mapping(uint256 => address) tokenToApproved;

    /*nested mapping
        Given a user and an operator, will return true or false whether that operator can 
        transfer all tokens on that user's behalf
    */
    mapping(address => mapping(address => bool)) ownerToOperator;

    //make sure that whoever is calling that method is allowed to do so, so no token get stolen.
    modifier hasPermission(address _caller, uint256 _tokenId ) {
        require(_caller == tokenToOwner[_tokenId] 
        || getApproved(_tokenId) == _caller
        || isApprovedForAll(tokenToOwner[_tokenId], _caller));
        //if require is valid, continue, as noted by the underscore.
        _; 
    }

    function mint(uint256 _tokenId) public {
        require(tokenToOwner[_tokenId] == address(0), "This token belongs to someone else already");

        //assign ownership of tokenId to user. All we have to do is update our mapping.
        tokenToOwner[_tokenId] = msg.sender;

        // update user balance
        ownerToBalance[msg.sender] += 1;

        emit Transfer(address(0), msg.sender, _tokenId);
    }


/*
Functions in ERC721
*/

    
    /// @dev NFTs assigned to the zero address are considered invalid, and this
    ///  function throws for queries about the zero address.
    /// @param _owner An address for whom to query the balance
    /// @return The number of NFTs owned by `_owner`, possibly zero
    function balanceOf(address _owner) external view returns (uint256){
        require(_owner != address(0), "Cannot ask of balance of address 0");
        return ownerToBalance[_owner];
    }

    /// @notice Find the owner of an NFT
    /// @dev NFTs assigned to zero address are considered invalid, and queries
    ///  about them do throw.
    /// @param _tokenId The identifier for an NFT
    /// @return The address of the owner of the NFT
    function ownerOf(uint256 _tokenId) external view returns (address){
        return tokenToOwner[_tokenId];
    }

    /// @notice Transfers the ownership of an NFT from one address to another address
    /// @dev Throws unless `msg.sender` is the current owner, an authorized
    ///  operator, or the approved address for this NFT. Throws if `_from` is
    ///  not the current owner. Throws if `_to` is the zero address. Throws if
    ///  `_tokenId` is not a valid NFT. When transfer is complete, this function
    ///  checks if `_to` is a smart contract (code size > 0). If so, it calls
    ///  `onERC721Received` on `_to` and throws if the return value is not
    ///  `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`.
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    /// @param data Additional data with no specified format, sent in call to `_to`
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable {
        //WILL not implement see time index 6:00
    }

    /// @notice Transfers the ownership of an NFT from one address to another address
    /// @dev This works identically to the other function with an extra data parameter,
    ///  except this function just sets data to "".
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable {
        //WILL not implement
    }

    /// @notice Transfer ownership of an NFT -- THE CALLER IS RESPONSIBLE
    ///  TO CONFIRM THAT `_to` IS CAPABLE OF RECEIVING NFTS OR ELSE
    ///  THEY MAY BE PERMANENTLY LOST
    /// @dev Throws unless `msg.sender` is the current owner, an authorized
    ///  operator, or the approved address for this NFT. Throws if `_from` is
    ///  not the current owner. Throws if `_to` is the zero address. Throws if
    ///  `_tokenId` is not a valid NFT.
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    function transferFrom(address _from, address _to, uint256 _tokenId) external payable hasPermission(msg.sender, _tokenId){
        tokenToOwner[_tokenId] = _to;
        ownerToBalance[_from] -= 1;

        emit Transfer(_from, _to, _tokenId);
    }

    /// @notice Change or reaffirm the approved address for an NFT
    /// @dev The zero address indicates there is no approved address.
    ///  Throws unless `msg.sender` is the current NFT owner, or an authorized
    ///  operator of the current owner.
    /// @param _approved The new approved NFT controller
    /// @param _tokenId The NFT to approve
        //this function allows another user to act on your behalf
    function approve(address _approved, uint256 _tokenId) external payable {
        //the only caller that is allowed to set an approver for a token is the owner of the token
        require(tokenToOwner[_tokenId] == msg.sender);
        tokenToApproved[_tokenId] = _approved;
        emit Approval(msg.sender, _approved, _tokenId);
    }

    /// @notice Enable or disable approval for a third party ("operator") to manage
    ///  all of `msg.sender`'s assets
    /// @dev Emits the ApprovalForAll event. The contract MUST allow
    ///  multiple operators per owner.
    /// @param _operator Address to add to the set of authorized operators
    /// @param _approved True if the operator is approved, false to revoke approval

    function setApprovalForAll(address _operator, bool _approved) external {
        ownerToOperator[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    /// @notice Get the approved address for a single NFT
    /// @dev Throws if `_tokenId` is not a valid NFT.
    /// @param _tokenId The NFT to find the approved address for
    /// @return The approved address for this NFT, or the zero address if there is none
    function getApproved(uint256 _tokenId) public view returns (address) {
        return tokenToApproved[_tokenId] ;
    }

    /// @notice Query if an address is an authorized operator for another address
    /// @param _owner The address that owns the NFTs
    /// @param _operator The address that acts on behalf of the owner
    /// @return True if `_operator` is an approved operator for `_owner`, false otherwise
    function isApprovedForAll(address _owner, address _operator) public view returns (bool) {
        return ownerToOperator[_owner][_operator];
    }
}
