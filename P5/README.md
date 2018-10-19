# Project5
Create a decentralized Star Notary application (Dapp)


## Getting Started

These instructions will install requirements and allow you to execute the code.
### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/]. Most Linux distributions have ready-to-install packages.

### Configuring your project


- Install requirements (within smart_contracts folder)
```
npm install 
```
- Install Metamask plugin for chrome

- To allow Metamask to work properly as a chrome plugin, you need to host your 
webpage (index.html) on a local server. For this purpose install http-server 
node module to create a local server with 
```
npm install -g http-server 
```

- Metascan must be connected to your wallet. Your need to add ether to your wallet from a faucet.
- When your web app interacts with your wallet, a Metascan confirmation will pop-up for you to confirm like below
![p5_metamask_notif](https://user-images.githubusercontent.com/15610147/47234161-92dd2600-d3dd-11e8-84cb-5ba846c40260.png)

## Contract deployment
```
$> truffle migrate --network rinkeby --reset --compile-all 
Compiling ./contracts/Migrations.sol...
Compiling ./contracts/StarNotary.sol...
Compiling openzeppelin-solidity/contracts/introspection/ERC165.sol...
Compiling openzeppelin-solidity/contracts/introspection/IERC165.sol...
Compiling openzeppelin-solidity/contracts/math/SafeMath.sol...
Compiling openzeppelin-solidity/contracts/token/ERC721/ERC721.sol...
Compiling openzeppelin-solidity/contracts/token/ERC721/IERC721.sol...
Compiling openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol...
Compiling openzeppelin-solidity/contracts/utils/Address.sol...
Writing artifacts to ./build/contracts

Using network 'rinkeby'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0x9a387da61512e7ac44ad468a223dabe1863d650bc050c1a57d1035beb92167ce
  Migrations: 0x40475be804729b7160c611473be57aa9da26faaf
Saving successful migration to network...
  ... 0x160a21378c31f0823518d426e8ad72e66a0c408391a7c7c6e3892bf85758e758
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Deploying StarNotary...
  ... 0x2ef84ec29d3e90e34ac829597db0986de0fb3786fc4eef59b88a80299ba63f99
  StarNotary: 0x71f69a770f2a41079b699cf6ba8c114ec39f2f02
Saving successful migration to network...
  ... 0xb971df4286597a83ba04da8a74f10878f4786c81bbbaad47d9bfaad4e8796cd7
Saving artifacts...
```


## View details on Etherscan
### Contract address 
https://rinkeby.etherscan.io/address/0x71f69a770f2a41079b699cf6ba8c114ec39f2f02


### Transaction information
```
TxHash:0x2ef84ec29d3e90e34ac829597db0986de0fb3786fc4eef59b88a80299ba63f99 
TxReceipt Status:Success
```
https://rinkeby.etherscan.io/tx/0x2ef84ec29d3e90e34ac829597db0986de0fb3786fc4eef59b88a80299ba63f99

### Star claim transaction
```
TxHash:0x24b77dc518b533f21f7a8fd4536d539812efd1209612de81893444783f03e24c 
TxReceipt Status:Success
```
 https://rinkeby.etherscan.io/tx/0x24b77dc518b533f21f7a8fd4536d539812efd1209612de81893444783f03e24c
 
 #### Attributions
 1. Deploying a Smart Contract in Rinkeby using Infura 
 https://walkingtree.tech/deploying-a-smart-contract-in-rinkeby-using-infura/
