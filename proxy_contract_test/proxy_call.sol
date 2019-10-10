pragma solidity ^0.5.11;

/* Proxy contract that makes a call to the dapp contract to modify the dapp's state */
contract proxy {
    // Public variables that are set by the call function.
    bool public res;
    bytes public val;
    bytes public encoded_value;
    bytes public encoding;
    
    /* Events used for debugging */
    event debug(string, bytes);
    event debug(string, uint256);

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

    function proxied_call(address addr, string memory fn_signature, uint256 _n) public returns (bytes memory value) {
        return proxied_call(addr, fn_signature, new bytes(_n));
    }
    
    function proxied_call(address addr, string memory fn_signature, bytes memory _n) public returns (bytes memory value) {
        // 1) Convert fn_signature from string type to bytes type
        // 2) Get the keccak256 hash of the signature
        // 3) Get the first 4 bytes of the signature hash as function selector
        // 4) encode it together with the arguement for the function
        encoded_value = abi.encodePacked(bytes4(keccak256(bytes(fn_signature))), _n);

        // Make a proxied call to the method of given address and catch the result of the call with the returned value
        // Using "call" code, Callee's contract state is modified, whereas caller's contract state is unchanged
        (res, val) = addr.call(encoded_value);
        return val;
    }

    // Wrapper function over proxied_call, with hardcoded function signature
    function callSetN(address addr, uint256 _n) public {
        // encoded_value = abi.encode(bytes4(keccak256("setN(uint256)")), _n);
        proxied_call(addr, "setN(uint256)", _n);
    }

    // Wrapper function over proxied_call, with hardcoded function signature
    function callSetN_getSender(address addr, uint256 _n) public {
        // encoded_value = abi.encode(bytes4(keccak256("setN(uint256)")), _n);
        proxied_call(addr, "setN_getSender(uint256)", _n);
    }

    // Fallback function that should forward all calls to proxied contract
    function() external payable {
        emit debug("Length of msg.data in fallback fn:", msg.data.length);
        emit debug("The msg.data passed to the fallback function is:", msg.data);

        /*  What we are trying to implement is different from most smart contract proxies out there
            Because unlike the other proxy contracts where values like delegate/proxied address to call are all fixed/pre-set,
            We want a generalisable contract where everything to do with the transaction is relayed in, instead of it being fixed
            Meaning that all the call data are part of the function arguement list.
        */

        // solium-disable-next-line security/no-inline-assembly
        assembly {
            /*
                Getting data needed for the call
                    1) Get the address to be called, this is part of the call data
                    2) Get the function signature and input value(s) for the function to be called from the call data, as 1 full hex
                
                Steps:
                    1)
            */


        }
    }
}