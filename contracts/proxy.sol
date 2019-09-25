pragma solidity ^0.5.11;

/**
 * @title Proxy
 * @dev Gives the possibility to delegate any call to a foreign implementation.
 */
contract Proxy {
    /* Events */
    event debug_log(string description);
    
    /**
     * Address is payable, just in case the thing implement payable
     * Initial address is the 0 null address.
     */
    address payable public current_implementation = address(0);
    
    
    // Variable to store the contract owner's address.
    address public owner;
    
    // Constructor only used for setting contract owner address
    constructor() public {
        owner = msg.sender;
    }
    
    
    // Modifier that only allows owner of the contract
    modifier onlyOwner() {
        require(msg.sender == owner, "Non-Owner tried to access restricted funciton");
        _;
    }
    
    // Modifier that blocks owner of the contract
    modifier allExceptOwner() {
        require(msg.sender != owner, "Owner tried to access restricted funciton");
        _;
    }
    
    function new_implementation(address payable new_address) public onlyOwner returns(bool) {
        current_implementation = new_address;
        return true;
    }
}