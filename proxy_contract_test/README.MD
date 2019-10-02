# Proxy Contract test/example project
This is a dApp project used for demoing the use of proxy contracts.

## Files
- dapp.sol
    - Example dapp smart contract, that will be used to demo interactions with a dapp from proxy contracts
    - Super simple dapp, that is just a basic state machine
- proxy_call.sol
    - A proxy contract, that makes proxied calls using the "call()" member of the given dapp smart contract address
    - Where the underlying opcode used is "delegateCall"
    - This will modify the dapp's state
- proxy_delegateCall.sol
    - A proxy contract, that makes proxied calls using the "delegatecall()" member of the given dapp smart contract address
    - Where the underlying opcode used is "call"
    - This will modify the proxy identity contract's state