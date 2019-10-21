pragma solidity ^0.5.11;

/// @dev Enum to define the possible types of operations
contract Enum {
    enum Operation {
        Call,
        DelegateCall,
        Create
    }
}
