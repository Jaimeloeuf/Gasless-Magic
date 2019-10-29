pragma solidity ^0.5.11;

/**
  * @dev Make calls to any foreign implementation.
  */

// Contract holding members that allow contract that inherit this make abitary contract code execution
contract Executor {
    event ContractCreation(address newContract);
    event debug(string indexed description, uint256 gasleftover);
    
    function execute(address to, uint256 value, bytes memory data, uint8 operation) public returns (bool success, bytes memory result) {
        emit debug("The gas left is", gasleft());
        (success, result) = execute_with_custom_gas(to, value, data, operation, gasleft());
        emit debug("The gas left is", gasleft());
    }

    // Execute function switcher that should be called
    function execute_with_custom_gas(address to, uint256 value, bytes memory data, uint8 operation, uint256 txGas) public returns (bool success, bytes memory result)
    {
        // Simple if else statement to determine the operation type
        if (operation == 0)
            (success, result) = executeCall(to, value, data, txGas);
        else if (operation == 1)
            success = executeDelegateCall(to, data, txGas);
        else {
            address newContract = executeCreate(data);
            success = newContract != address(0);
            emit ContractCreation(newContract);
        }
    }

    function executeCall(address to, uint256 value, bytes memory data, uint256 txGas) private returns (bool success, bytes memory result) {
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := call(txGas, to, value, add(data, 0x20), mload(data), 0, 0)

            // returndatasize returns the size of the last return data
            // copy returndatasize bytes from position 0 of returndata to position 0 of mememory
            returndatacopy(result, 0, returndatasize)
        }
    }

    function executeDelegateCall(address to, bytes memory data, uint256 txGas) private returns (bool success) {
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := delegatecall(txGas, to, add(data, 0x20), mload(data), 0, 0)
        }
    }

    function executeCreate(bytes memory data) private returns (address newContract) {
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            newContract := create(0, add(data, 0x20), mload(data))
        }
    }
}
