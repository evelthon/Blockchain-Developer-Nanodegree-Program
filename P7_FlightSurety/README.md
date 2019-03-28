# Project7
FlightSurety, a sample application project for Udacity's Blockchain course.

Project rubric https://review.udacity.com/#!/rubrics/1711/view

Using:
- Truffle v5.0.8 (core: 5.0.8
- Solidity - ^0.4.24 (solc-js)
- Node v10.15.3
- Web3.js v1.0.0-beta.37

## Getting Started

These instructions will install requirements and allow you to execute the code.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/]. Most Linux distributions have ready-to-install packages.

### Configuring your project


- Install requirements
```
npm install 
```
- start ganache-cli with the following command (this will create 50 accounts):
```
ganache-cli -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat" -l 99999999 -a 50
```
- Compile your project and migrate it
```
truffle migrate --reset --compile-all
```

- Test the contracts by issuing the command:
```
truffle test test/flightSurety.js 
```
The expected output is as follows:
```
 Contract: Flight Surety Tests
    ✓ (authorization   ) Caller is (correctly) not authorized
    ✓ (authorization   ) Caller can be authorized (59ms)
    ✓ (Initial creation) Airline registered on contract deployment
    ✓ (multiparty      ) has correct initial isOperational() value
    ✓ (multiparty      ) can block access to setOperatingStatus() for non-Contract Owner account (38ms)
    ✓ (multiparty      ) can allow access to setOperatingStatus() for Contract Owner account
    ✓ (multiparty      ) can block access to functions using requireIsOperational when operating status is false (70ms)
    ✓ (airline         ) cannot register an Airline using registerAirline() if it is not funded
    ✓ (airline         ) Airline cannot be funded (insufficient funds - less than 10 ether)
    ✓ (airline         ) Airline is funded with 10 Ether (46ms)
    ✓ (airline         ) A funded Airline can register another airline using registerAirline() (38ms)
    ✓ (airline         ) A registered airline cannot be registered twice (50ms)
    ✓ (airline         ) New airlines are registered until multi-party consensus threshold is reached (128ms)
    ✓ (airline         ) Starting from first funded airline, fund the first 4 airlines (103ms)
    ✓ (airline         ) Register a fifth Airline using multi-party consensus (140ms)
    ✓ (insurance       ) Stop passenger from paying more than 1 Ether for insurance
    ✓ (insurance       ) Passenger can buy insurance for a maximum of 1 Ether (47ms)
    ✓ (insurance       ) Passenger cannot buy multiple insurance for same flight (49ms)
    ✓ (insurance       ) Passenger balance (before insurance claim) is 0
    ✓ (oracles         ) Call submitOracleResponse() in a loop to emit processFlightStatus() - inspired by oracle.js (2768ms)
    ✓ (passenger       ) check passenger was credited 1.5x but do not withdraw amount
    ✓ (passenger       ) Initiate withdrawal to account (49ms)
    ✓ (passenger       ) prevent multiple withdrawal to account
```
```
truffle test test/oracles.js 

```

To use the dapp:

`npm run dapp`

To view dapp:

`http://localhost:8000`

## Develop Server

`npm run server`
`truffle test ./test/oracles.js`

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder


## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)

#### Attributions

- https://medium.com/@blockchain101/calling-the-function-of-another-contract-in-solidity-f9edfa921f4c
- https://blog.aventus.io/stack-too-deep-error-in-solidity-5b8861891bae
- https://hackernoon.com/how-i-converted-my-react-app-to-vanillajs-and-whether-or-not-it-was-a-terrible-idea-4b14b1b2faff
- http://www.dappuniversity.com/articles/web3-js-intro
- https://ethereum.stackexchange.com/questions/33154/function-call-behaves-differently-to-function-in-truffle-test
- https://ethereum.stackexchange.com/questions/13167/are-there-well-solved-and-simple-storage-patterns-for-solidity
- https://ethereum.stackexchange.com/questions/1441/mapping-with-array-as-key-or-value-data-type
- https://stackoverflow.com/questions/50877587/is-it-possible-to-get-uint256-value-from-solidity-using-web3-js
- https://medium.com/coinmonks/what-the-hack-is-memory-and-storage-in-solidity-6b9e62577305
