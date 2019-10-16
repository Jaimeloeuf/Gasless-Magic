/*  @Doc
    This is the assembly implementation of the generalised proxy contract
*/

pragma solidity ^0.5.11;

/* Proxy contract that makes a call to the dapp contract to modify the dapp's state */
contract proxy {
    /* Events used for debugging */
    event debug(string, bytes);
    event debug(string, uint256);

    // owner is the first and only declared variable
    // Remember to offset when using storage and coming out with the storage layout
    address public owner;

    /// @dev Constructor used for setting contract owner address
    constructor() public {
        owner = msg.sender;
    }

    // Modifier that only allows owner of the contract to pass
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this restricted function");
        _;
    }

    /// @dev Function for changing the owner of the contract
    /// @param new_owner Is a payable address which will now own/inherit the contract
    function changeOwner(address payable new_owner) public onlyOwner {
        owner = new_owner;
    }

    // @Todo might remove the modifier and implement check inside function
    // Fallback function that should forward all calls to proxied contract
    function() external payable onlyOwner {
        emit debug("Length of msg.data in fallback fn:", msg.data.length);
        emit debug("The msg.data passed to the fallback function is:", msg.data);

        /*  What we are trying to implement is different from most smart contract proxies out there
            Because unlike the other proxy contracts where values like delegate/proxied address to call are all fixed/pre-set,
            We want a generalisable contract where everything to do with the transaction is relayed in, instead of it being fixed
            Meaning that all the call data are part of the function arguement list.
        */

        // solium-disable-next-line security/no-inline-assembly
        assembly {
            /*
                Steps:
                    1) Get all the data needed for the call
                    2) Make the call and get the execution status + return values
                    3) Check if the call succeeded
                        a) Revert all state changes if the call faile
                        b) Return the call's return value to the contract caller as return value

                Getting data needed for the call
                    1) Get the address to be called, this is part of the call data
                    2) Get the function signature and input value(s) for the function to be called from the call data, as 1 full hex
            */

            /* Step (1) Extract data needed, from the call data */
            // Copy the calling data into memory
            // calldatasize is the size of call data in bytes
            // Copy calldatasize() amount of bytes from position 0 of calldata to position 0 of memory
            calldatacopy(0, 0, calldatasize)

            // Load all data from storage data starting at address 0
            // The data from storage at position 0, is the variable "address public addr"
            // Use a bitmask to grab the first 20bytes or unint160 of the storage data to get the address value
            let addr := and(mload(0), 0xffffffffffffffffffffffffffffffffffffffff)


            /* Step (2) Making the call and getting the return result */
            // calldatasize is the size of call data in bytes
            // Make a delegate call to the addr address with
            //      input memory from 0 to 0 + calldatasize()
            //      providing "gas" amount of gas
            //      the "gas" variable stores the gas amount still available to execution
            //      output area from 0 to 0 + 0
            // Effectively using the code from addr but stay in context of current contract
            let success := delegatecall(gas, addr, 0, calldatasize(), 0, 0)
            // let success := call(gas, addr, 0, calldatasize(), 0, 0)

            // returndatasize() returns the size of the last return data
            // copy returndatasize() bytes from position 0 of returndata to position 0 of mememory
            returndatacopy(0, 0, returndatasize)


            /* Step (3) Making the call */
            // if success == 0, meaning the operation is not successful
            // revert state changes and end execution
            // Return data memory from position 0 to 0 + returndatasize()
            if eq(success, 0) { revert(0, returndatasize) }

            // End execution and return data memory from position 0 to 0 + returndatasize()
            return(0, returndatasize())
        }
    }
}