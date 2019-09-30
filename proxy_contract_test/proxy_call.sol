pragma solidity ^0.5.11;

contract proxy {
  bool public res;
  bytes private val;
  
  bytes public encoded_value;
  
  function callSetN(address _e, uint256 _n) public {
    // encoded_value = abi.encode(bytes4(keccak256("setN(uint256)")), _n);
    encoded_value = abi.encodePacked(bytes4(keccak256("setN(uint256)")), _n);

    // "dapp" contract's storage is set, whereas "proxy" contract's storage is not modified
    (res, val) = _e.call(encoded_value);
  }
}