pragma solidity ^0.5.11;

contract proxy {
  uint public n;
  address public sender;
  
  bool public res;
  bytes private val;
  
  bytes public encoded_value;
  
  function callSetN(address _e, uint256 _n) public {
    // encoded_value = abi.encode(bytes4(keccak256("setN(uint256)")), _n);
    encoded_value = abi.encodePacked(bytes4(keccak256("setN(uint256)")), _n);

    /* 2 calls below with the same signature but just executed with different contexts */    
    (res, val) = _e.call(encoded_value);
    // (res, val) = _e.delegatecall(encoded_value);
  }
}