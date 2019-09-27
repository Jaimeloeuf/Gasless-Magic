pragma solidity ^0.5.11;

/* Super simple example dApp that allow users to update the owner of this contract */
contract Example {
    address public owner;

    /* events used for debugging. */
    event log(string description);
    event log(string description, address new_owner);

    constructor() public {
        owner = msg.sender;
    }

    modifier restricted() {
        require(msg.sender == owner, "Non-Owner accessed restricted function");
        _;
    }

    // Internal event wrapper
    function change_owner(address new_owner) internal {
        emit log("Owner has been changed to: ", new_owner);
    }


    /* 2 Same test function, where 1 is unrestricted and 1 restricted */
    function update_nonRestricted(address addr) public {
        owner = addr;
        change_owner(owner);
    }
    function update_Restricted(address addr) public restricted {
        owner = addr;
        change_owner(owner);
    }
}
