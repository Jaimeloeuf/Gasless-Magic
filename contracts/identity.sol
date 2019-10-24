pragma solidity ^0.5.11;
import "./Executor.sol";

/**
 * @title Identity Proxy contract
 *
 * Inherits the executor contract for call forwarding
 */
contract Proxy is Executor {
    /* Events */
    event debug(string description);
}