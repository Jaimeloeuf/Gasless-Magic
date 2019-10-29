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
    uint256 public ownersCount;
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
}