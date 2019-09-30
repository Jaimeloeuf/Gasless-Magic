pragma solidity ^0.5.11;

/*  Example dapp contract to demo use of proxy contract.
    Only stores 2 variable and exposes a setter function for these values.
*/
contract dapp {
    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier restricted() {
        require(msg.sender == owner, "Non-Owner accessed restricted function");
        _;
    }

    /* The values to be stored and publicly accessible to be read */
    uint256 public n;
    address public sender;

    /* Events used for Debugging */
    event debug(string, uint256);
    event debug(string, address);

    function debug_values(uint256 _n) internal {
        // Emit the values passed into the function
        emit debug("Function input: ", _n);

        // Emit the global values via events for debugging
        emit debug("Value of N is now: ", n);
        emit debug("Sender is now: ", sender);
    }

    // Setter function to change the stored variables
    function setN(uint256 _n) public {
        n = _n;
        sender = msg.sender;

        debug_values(_n);
    }

    // Setter function to change the stored variables
    function setN_restricted(uint256 _n) public restricted {
        n = _n;
        sender = msg.sender;

        debug_values(_n);
    }
}