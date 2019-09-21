# Smart Contract Wallet
Smart Contract Wallet is a Blockchain wallet/account that runs as a piece of code on the Blockchain (more specifically, the Ethereum Blockchain) to control your funds. This contrast with the traditionally available EOA (Externally Owned Accounts) which is just a Private/Public Key pair.

## Main features
- Gas Abstraction


---
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


---
## Credits
This project is rather heavily influenced by the [Gnosis Safe project](https://github.com/gnosis/safe-contracts).  

## Security and Liability
All contracts are WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
Use this at your own risk and discretion, please do your own research before implementing.  

## License and Contributing
All items in this Repo are released under the MIT License. Please reach out [here](mailto:junjie@tor.us) if you would like to contribute.  
Contributors
- JJ ([Jaimeloeuf](https://github.com/Jaimeloeuf))
