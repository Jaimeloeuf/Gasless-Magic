pragma solidity ^0.5.11;

/* Proxy contract that makes a call to the dapp contract to modify the dapp's state */
contract proxy {
    // Public variables that are set by the call function.
    bool public res;
    bytes public val;
    bytes public encoded_value;
    
    // Function that converts a uint256 bytes to address type using assembly
    function bytesToAddress(bytes memory bys) private pure returns (address addr) {
        assembly {
            // A Ethereum address is 20 bytes long or a uint160 type, thus it's represented by 40 Hex characters
            // Since the original value given is Big endian with left padding, we only need the last 20 hex of the input
            // Which is from Address 24-64

            // Thus all that is needed is to load the last 20 bytes into the "addr" variable which is then returned
            // Basically load from memory position bys + 32
            addr := mload(add(bys,32))
        } 
    }
    
    // Function to get the returned value in address type
    function getReturnedAddress () public view returns (address) {
        return bytesToAddress(val);
    }

    function callSetN(address addr, uint256 _n) public {
        // encoded_value = abi.encode(bytes4(keccak256("setN(uint256)")), _n);
        encoded_value = abi.encodePacked(bytes4(keccak256("setN(uint256)")), _n);

        // "dapp" contract's storage is set, whereas "proxy" contract's storage is not modified
        (res, val) = addr.call(encoded_value);
    }

    function proxied_call(address addr, string memory fn_signature, uint256 _n) public {
        // 1) Convert fn_signature from string type to bytes type
        // 2) Get the keccak256 hash of the signature
        // 3) Get the first 4 bytes of the signature hash as function selector
        // 4) encode it together with the arguement for the function
        encoded_value = abi.encodePacked(bytes4(keccak256(bytes(fn_signature))), _n);

        // Make a proxied call to the method of given address and catch the result of the call with the returned value
        (res, val) = addr.call(encoded_value);
    }
}