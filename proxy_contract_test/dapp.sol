pragma solidity ^ 0.5.11;

/*  Example dapp contract to demo use of proxy contract.
    Only stores 2 variable and exposes a setter function for these values.
*/
contract dapp {
    /* The values to be stored and publicly accessible to be read */
    uint256 public n;
    address public sender;

    /* Events used for Debugging */
    event debug(string, uint256);
    event debug(string, address);

    // Setter function to change the stored variables
    function setN(uint256 _n) public {
        n = _n;
        sender = msg.sender;

        // Emit the events for debugging
        emit debug("Value of N is now: ", n);
        emit debug("Sender is now: ", sender);
    }
}