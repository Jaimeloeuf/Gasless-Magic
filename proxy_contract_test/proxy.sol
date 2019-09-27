pragma solidity ^0.5.11;
import "./Enum.sol";
import "./Executor.sol";

/**
 * @title Proxy
 * @dev Gives the possibility to delegate any call to a foreign implementation.
 */
contract Proxy is Executor {
    /* Events */
    event debug_log(string description);
    event result(bool);
    
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
    
    function changeOwner(address payable new_owner) public onlyOwner {
        owner = new_owner;
    }

    
    function change (bytes calldata data) external payable {
        emit result(execute(current_implementation, 0, data, Enum.Operation.DelegateCall, 40000));
    }
    

    /// @dev Fallback function forwards all transactions and returns all received return data.
    // Gnosis Safe, Proxies/Proxy.sol
    // External function where it can only be called from external sources
    /* function () external payable {
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            // let current_implementation := and(sload(0), 0xffffffffffffffffffffffffffffffffffffffff)

            calldatacopy(0, 0, calldatasize())

            // Call the function and save the returned bool in the success variable.
            let success := delegatecall(gas, current_implementation_offset, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            if eq(success, 0) { revert(0, returndatasize()) }
            return(0, returndatasize())
        }
    } */
}