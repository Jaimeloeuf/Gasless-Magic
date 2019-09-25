pragma solidity ^0.5.11;

/**
 * @title Proxy
 * @dev Gives the possibility to delegate any call to a foreign implementation.
 */
contract Proxy {
    /* Events */
    event debug_log(string description);
    
    /**
     * Address is payable, just in case the proxied contract implements as a payable address
     * Initial address is the 0 null address.
     */
    address payable public current_implementation = address(0);
    
    // Variable to store the contract owner's address.
    address public owner;
    
    // Modifier that only allows owner of the contract
    modifier onlyOwner() {
        require(msg.sender == owner, "Non-Owner tried to access restricted funciton");
        _;
    }
    
    // Constructor only used for setting contract owner address
    constructor() public {
        owner = msg.sender;
    }
    
    // Modifier that blocks owner of the contract
    modifier allExceptOwner() {
        require(msg.sender != owner, "Owner tried to access restricted funciton");
        _;
    }
    
    // Function to set address of the new Smart Contract implementation
    function new_implementation(address payable new_address) public onlyOwner {
        require(new_address != address(0), "New Address cannot be a 0 (invalid) address");
        require(current_implementation != new_address, "New Address cannot be the same as the Old address");
        current_implementation = new_address;
    }
}