# Proxy Contract test/example project
This is a dApp project used for demoing the use of proxy contracts.

## Files
- Proxy.sol
    - Proxy contract from the Gnosis Safe project. Copied over to learn how they do proxy calls.
    - Documented all the Assembly code in the fallback function too.
- proxy_call.sol
    - A proxy contract, that makes proxied calls using the "call()" member of the given dapp smart contract address
    - Where the underlying opcode used is "call"
    - This will modify the dapp's state
- proxy_delegateCall.sol
    - A proxy contract, that makes proxied calls using the "delegatecall()" member of the given dapp smart contract address
    - Where the underlying opcode used is "delegateCall"
    - This will modify the proxy identity contract's state