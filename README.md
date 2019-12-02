# Smart Contract Wallet
Smart Contract Wallet is a Blockchain wallet/account that runs as a piece of code on the Blockchain (more specifically, the Ethereum Blockchain) to control your funds. This contrast with the traditionally available EOA (Externally Owned Accounts) which is just a Private/Public Key pair.  
The whole point of a Smart Contract Wallet is to act exactly like a EOA but with more features like gas abstraction, with better extensibility.  


## Main features
- Gasless Wallet Deployment
    - A smart contract wallet is a smart contract, which requires gas from the user to deploy, thus a Gasless deployment system will be used to remove this UX barrier especially for users who just encountered blockchain for the first time, and do not wish to pay a fee just to get a wallet to hold funds.
    - Deployment party of the wallet should be a Relayer which will make deployment to the user seem invisible and free.
    - Done using meta transaction and CREATE2
- Gas Abstraction
    - Gas abstraction is to remove the need to think about gas fee when using dapps on the Ethereum network for the users.
    - Gas abstractions, regardless of how it is implemented, will allow users to do things like hold DAI only accounts and do ETH-Less transactions!
    - The types of Gas abstractions that will be implemented are:
        - Gasless Transactions
            - Smart Contract wallet provider pays for the user's gas to increase user adoption.
            - Done using Meta transactions, where the provider signs on the user transaction to pay for the gas.
            - Invisible to the user, as it will not require any work on the user's end.
        - Pay for Gas in ERC20 tokens or other forms of currency
            - Smart Contract wallet provider runs a relayer to pay for the user's gas in ETH, before making the user's smart contract wallet pay back the fee in any accepted token of equal value to the gas fee.
            - Done using Meta transactions, where the providers signs on the users transaction to pay for the gas first.
            - User would be able to see this option and choose to pay for the gas fee in their desired token / payment method.
- Integration with Torus wallet (Web2.0 convenience for Web3.0)
    - Integrates with the well established Torus EOA "wallet" that gives you the ease of use of Web2.0 systems like Google Logins for Web3.0 softwares.
    - Readmore at the [website](https://tor.us)


## Project Structure
- contracts/
    - Directory for all the smart contracts of this Smart Contract Wallet
    - Basically holds the contract will be deployed.
- migrations/
    - Directory for all the code used for migrating/deploying the smart contracts onto the specified chain.
    - Will be executed in order of the prefix number of the file names.
- skip_migrations/
    - Empty Directory to be used as the migrations directory to skip all the migration functions if you would need to skip the migrations for whatever reasons.
    - For example, running tests without migrating after every test run.
- test/
    - Tests for the smart contracts.
    - Named after the contracts that they are testing
    - All tests can be ran using the npm scripts like "npm run test" or "npm run full_test"


## Running tests
Currently, the test, "gasless.js" requires PORT 2001 & 2002 to be free for use. Test will fail if these 2 PORTs are already in used.  


## On truffle usage
#### Contract Deployment/Migration
- When you use "truffle migrate" or "truffle migrate --reset", the address of the contract is changed since it is redeployed and the new contract address is determined by the nonce value which never repeats.
- This means that when you are using truffle console, and you did not restart the shell, when you try to access the ABI again, you get the old address of the contract, which will seem as if nothing has changed.
- The easiest fix for this is to just restart the truffle console shell.


## Q&A
- Who will pay for the smart contract wallet deployment?
    - Torus (The service behind the wallet) will pay for the creation of the user's smart contract wallet, so it will seem as if there is no fee.
    - Torus pays for it as Customer/User acquisition fee
- How to interact with the wallet?
    - To interact with the smart contract wallet, you would need your own EOA which acts as a proof of your identity
        - You need to have your own private key (From your EOA or Public/Private key pair whatever you prefer)
        - Your private key will be used to proof your own identity when you interact with the Smart Contract
        - This EOA part is essentially already provided by the current Torus wallet
    - Flow of action
        - It is an EOA that interacts with the smart contract wallet,
        - you sign Tx to show proof that you approve of that Tx
        - Send the Signed Tx to the recepient off chain
        - Recepient signs it and submits it to the Tx pool for the smart contract wallet to execute it
        - The SW sees the incoming transaction, and determines if the original signature belongs to the owner of the SW.
            - If it is true, send the value over to the address that submitted the Tx
            - But since the Tx was sent to the Tx pool by the recepient, the recepient pays for the Gas fee.
- Who pays for the Gas when user makes a payment transaction?
    - The user should pay for their own gas if they are making a payment transaction
- Who pays for the Gas when user makes a transaction to interact with a dApp?
    - Ideally the dApp should pay for the gas


## Credits
This project is heavily influenced by the from many sources, some of which are:
- [Gnosis Safe](https://github.com/gnosis/safe-contracts)
- [Argent wallet](https://www.argent.xyz)
- [Austin Griffith's work on Meta transactions](https://metatx.io)
- [Tabookey's GSN implementation](https://github.com/tabookey/tabookey-gasless)


## Security and Liability
All contracts are WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
Use this at your own risk and discretion, please do your own research before implementing.  


## License and Contributing
All items in this Repo are released under the MIT License. Please reach out [here](mailto:junjie@tor.us) or [here](mailto:jaimeloeuf@gmail.com) if you would like to contribute, and please follow our CODE OF CONDUCT.  
Contributors
- JJ ([Jaimeloeuf](https://github.com/Jaimeloeuf))
