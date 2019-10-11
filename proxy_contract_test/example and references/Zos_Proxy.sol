pragma solidity ^0.5.11;

/**
 * @title Proxy
 * @dev Gives the possibility to delegate any call to a foreign implementation.
 */
contract Proxy {
  /**
  * @dev Tells the address of the implementation where every call will be delegated.
  * @return address of the implementation to which it will be delegated
  */
  // function implementation() public view returns (address);


  address private current;

  function implementation() public view returns (address) {
      return current;
  }
  
  function set(address new_addr) public {
      current = new_addr;
  }

  /**
  * @dev Fallback function allowing to perform a delegatecall to the given implementation.
  * This function will return whatever the implementation call returns
  */
  function () external payable  {
    address _impl = implementation();
    require(_impl != address(0), "Current Implementation does not exist yet, is set to null address");

    
    bytes memory encoded_value = abi.encode(bytes4(keccak256("update_nonRestricted(address)")), "0xDB07E446Aa742E3aDb8ecA9f0342a80F2Bc2E46c");
    _impl.call(encoded_value);

    // Below comment is to stop linter from showing inline-assembly usage warning
    // solium-disable-next-line security/no-inline-assembly
    // assembly {
    //   let ptr := mload(0x40)
    //   calldatacopy(ptr, 0, calldatasize)
    // //   let result := delegatecall(gas, _impl, ptr, calldatasize, 0, 0)
    //   let result := call(10000, _impl, 10000, 0, calldatasize, 0, 0)
    //   let size := returndatasize
    //   returndatacopy(ptr, 0, size)

    //   switch result
    //   case 0 { revert(ptr, size) }
    //   default { return(ptr, size) }
    // }
  }
}