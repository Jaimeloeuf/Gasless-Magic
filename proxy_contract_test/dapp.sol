pragma solidity ^ 0.5.11;

contract dapp {
    uint256 public n;
    address public sender;

    event debug(string, uint256);
    event debug(string, address);

    function setN(uint256 _n) public {
        n = _n;
        sender = msg.sender;

        emit debug("Value of N is now: ", n);
        emit debug("Sender is now: ", sender);
    }
}