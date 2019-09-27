pragma solidity ^0.5.11;

contract EtherPaymentFallback {
    /// @dev Fallback function accepts Ether transactions.
    function ()
        external
        payable
    {

    }
}
