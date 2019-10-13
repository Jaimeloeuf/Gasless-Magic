/*  @Doc
    This is the assembly implementation of the generalised proxy contract
*/

pragma solidity ^0.5.11;

/* Proxy contract that makes a call to the dapp contract to modify the dapp's state */
contract proxy {
    /* Events used for debugging */
    event debug(string, bytes);

    // owner is the first and only declared variable
    // Remember to offset when using storage and coming out with the storage layout
    address public owner;

    /// @dev Constructor used for setting contract owner address
    constructor() public {
        owner = msg.sender;
    }

    // Modifier that only allows owner of the contract to pass
    modifier onlyOwner() {
        require(msg.sender == owner, "Non-Owner tried to access 'onlyOwner' restricted function");
        _;
    }


    // Fallback function that should forward all calls to proxied contract
    function() external payable {
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
        }
    }
}