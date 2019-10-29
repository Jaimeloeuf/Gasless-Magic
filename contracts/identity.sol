pragma solidity ^0.5.11;
import "./base/EtherPayableFallback.sol";
import "./Executor.sol";

/**
 * @title Identity Proxy contract
 * @notice Basically a multisig wallet with proxy call forwarding capability
 * @notice Inherits the executor contract for call forwarding
 */
contract Identity is EthPayableFallback, Executor {
    /// @notice Event only used for debugging during local development, will be removed before production
    event debug(string description);
    event debug(string description, uint256 gas);

    /// @notice Threshold required for transaction to be valid
    uint256 public threshold;
    /// @notice Count tracking number of owners
    /// @dev Setting initial to 1, as it will start with 1 owner via the constructor.
    uint256 public ownersCount = 1;
    /// @notice Mapping to store contract owner(s)'s address(es) and check if an address is owner
    /// @dev Addresses were of payable type previously, but errors with Sol in truffle test, thus removed for now
    mapping (address => bool) public isOwner;

    // Constructor only used for setting contract owner address
    constructor() public {
        isOwner[msg.sender] = true;
    }

    /// @notice Modifier that only allows owner of the contract to continue
    modifier onlyOwners() {
        require(isOwner[msg.sender], "Non-Owner tried to access restricted funciton");
        _;
    }
    
    /// @notice Function implementing a check
    function null_check(address payable new_address) internal pure {
        require(new_address != address(0), "Address cannot be null");  // Null address check
    }
    
    /// @notice Function to add new address to list of owners
    function addOwner(address payable new_owner) public onlyOwners {
        null_check(new_owner); // Do a null check
        require(!isOwner[new_owner], "Address is already an owner!"); // Make sure address sent is not already an owner
        isOwner[new_owner] = true;
        ownersCount += 1; // Increment number of owners after owner has been added
        emit OwnerAdded(_owner); // Emit event
    }
}