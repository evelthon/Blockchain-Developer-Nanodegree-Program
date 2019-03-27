var Web3Utils = require('web3-utils'); //https://web3js.readthedocs.io/en/1.0/getting-started.html
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    let fundAmount = await config.flightSuretyApp.AIRLINE_REGISTRATION_FEE.call();
  });

  /****************************************************************************************
   Security checks
   ****************************************************************************************/
  // describe('can create a star ', () => {
    //Check caller is not authorized
    it('(authorization   ) Caller is (correctly) not authorized', async function () {
      let isAuthCaller = await config.flightSuretyData.isAuthorizedCaller(config.flightSuretyApp.address);
      assert.equal(isAuthCaller, false, 'Called is authorized when he should not be.');
    });

    //add authorized caller
    it('(authorization   ) Caller can be authorized', async function () {
      await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
      let isAuthCaller = await config.flightSuretyData.isAuthorizedCaller(config.flightSuretyApp.address);
      assert.equal(isAuthCaller, true, 'Caller should be authorized.');
    });

  // });
  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(Initial creation) Airline registered on contract deployment`, async function () {

    // Get operating status
    let firstAirline = await config.flightSuretyData.isAirline.call(config.firstAirline);
    assert.equal(firstAirline, true, "Airline not registered on contract deployment");

  });


  it(`(multiparty      ) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });


  it(`(multiparty      ) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

    // Ensure that access is denied for non-Contract Owner account
    let accessDenied = false;
    try {
      await config.flightSuretyData.setOperatingStatus(false, {from: config.testAddresses[2]});
    } catch (e) {
      accessDenied = true;
    }
    assert.equal(accessDenied, true, "Access not restricted to Contract Owner");

  });

  it(`(multiparty      ) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

    // Ensure that access is allowed for Contract Owner account
    let accessDenied = false;
    try {
      await config.flightSuretyData.setOperatingStatus(false);
    } catch (e) {
      accessDenied = true;
    }
    assert.equal(accessDenied, false, "Access not restricted to Contract Owner");

  });

  it(`(multiparty      ) can block access to functions using requireIsOperational when operating status is false`, async function () {

    await config.flightSuretyData.setOperatingStatus(false);

    let reverted = false;
    try {
      await config.flightSurety.setTestingMode(true);
    } catch (e) {
      reverted = true;
    }
    assert.equal(reverted, true, "Access not blocked for requireIsOperational");

    // Set it back for other tests to work
    await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline         ) cannot register an Airline using registerAirline() if it is not funded', async () => {

    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
      await config.flightSuretyApp.registerAirline.call(newAirline, {from: config.firstAirline});
    } catch (e) {

    }
    let result = await config.flightSuretyData.isAirline.call(newAirline);

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });

  //R
//https://web3js.readthedocs.io/en/1.0/web3-utils.html
  it('(airline         ) Airline cannot be funded (insufficient funds - less than 10 ether)', async () => {

    // ARRANGE
    let reverted = false;

    // ACT
    try {
      await config.flightSuretyApp.fund.call({from: config.firstAirline, value: Web3Utils.toWei("9.9", "ether")});
    } catch (e) {
      reverted = true;
    }

    // ASSERT
    assert.equal(reverted, true, "Airline initial funding was less than 10 Ether.");

  });

  it('(airline         ) Airline is funded with 10 Ether', async () => {
//https://ethereum.stackexchange.com/questions/33154/function-call-behaves-differently-to-function-in-truffle-test
    let fundAmount = await config.flightSuretyApp.AIRLINE_REGISTRATION_FEE.call();
    // console.log(fundAmount);

    // ARRANGE
    let reverted = false;

    // ACT
    try {
      await config.flightSuretyApp.fund({from: config.firstAirline, value: fundAmount.toString()});
    } catch (e) {
      reverted = true;
    }

    // ASSERT
    assert.equal(reverted, false, "Airline was not funded.");

  });

  it('(airline         ) A funded Airline can register another airline using registerAirline()', async () => {

    // ARRANGE
    let airline2 = accounts[2];
    let reverted = false;

    // ACT
    try {
      await config.flightSuretyApp.registerAirline(airline2, {from: config.firstAirline});

    } catch (e) {
      reverted = true;
    }

    // let tmp = await config.flightSuretyApp.registeredAirlinesCount.call();
    // console.log(tmp.toString());

    // ASSERT
    assert.equal(reverted, false, "A funded airline should be able to be registered a new airline.");

  });

  it('(airline         ) A registered airline cannot be registered twice', async () => {

    // ARRANGE
    let airline2 = accounts[2];
    let reverted = false;

    // ACT
    try {
      await config.flightSuretyApp.registerAirline(airline2, {from: config.firstAirline});
    } catch (e) {
      reverted = true;
    }

    // ASSERT
    assert.equal(reverted, true, "An airline should not be registered twice.");

  });

  it('(airline         ) New airlines are registered until multi-party consensus threshold is reached', async () => {

    // ARRANGE
    let airline3 = accounts[3];
    let airline4 = accounts[4];
    let airline5 = accounts[5];
    let reverted = false;

    // ACT
    try {
      await config.flightSuretyApp.registerAirline(airline3, {from: config.firstAirline})
      // let tmp = await config.flightSuretyApp.registeredAirlinesCount.call();
      // console.log(tmp.toString());
      await config.flightSuretyApp.registerAirline(airline4, {from: config.firstAirline});
      await config.flightSuretyApp.registerAirline(airline5, {from: config.firstAirline});
    } catch (e) {
      reverted = true
      console.log(e);
    }

    // ASSERT
    // assert.equal(reverted, true, "An airline should not be registered twice.");
    let reggedAirlines = await config.flightSuretyApp.registeredAirlinesCount.call();
    assert.equal(reggedAirlines.toString(), 4, "Threshold not honored");


  });

  it('(airline         ) Starting from first funded airline, fund the first 4 airlines', async () => {

    // ARRANGE
    let fundAmount = await config.flightSuretyApp.AIRLINE_REGISTRATION_FEE.call();
    let airline2 = accounts[2];
    let airline3 = accounts[3];
    let airline4 = accounts[4];
    let reverted = false;

    // ACT
    try {
      await config.flightSuretyApp.fund({from: airline2, value: fundAmount.toString()});
      await config.flightSuretyApp.fund({from: airline3, value: fundAmount.toString()});
      await config.flightSuretyApp.fund({from: airline4, value: fundAmount.toString()});
    } catch (e) {
      reverted = true;
      console.log(e);
    }

    // ASSERT
    assert.equal(reverted, false, "Airlines 2 - 4 not funded.");

  });

  it('(airline         ) Register a fifth Airline using multi-party consensus', async () => {

    // ARRANGE
    let fundAmount = await config.flightSuretyApp.AIRLINE_REGISTRATION_FEE.call();

    let airline6 = accounts[6];//new airline
    let airline2 = accounts[2];//registered
    let airline3 = accounts[3];//registered


    //Register new airline - Registered count should not change.
    await config.flightSuretyApp.registerAirline(airline6, {from: airline2});
    let registeredAirlines = await config.flightSuretyApp.registeredAirlinesCount.call();
    assert.equal(registeredAirlines.toString(), 4, "Threshold not honored");

    //Attempt multiple voting from airline2 - should be ignored
    let isMultipleVotingAllowed = true;
    try {
      await config.flightSuretyApp.registerAirline(airline6, {from: airline2});
    } catch (e) {
      isMultipleVotingAllowed = false;
    }
    assert.equal(isMultipleVotingAllowed, false, "ERROR: Multiple voting occured");

    //Airline3 votes to register airline6 (new vote)
    await config.flightSuretyApp.registerAirline(airline6, {from: airline3});
    registeredAirlines = await config.flightSuretyApp.registeredAirlinesCount.call();
    assert.equal(registeredAirlines.toString(), 5, "ERROR: Airline consensus not honored");

  });

  it('(insurance       ) Stop passenger from paying more than 1 Ether for insurance', async () => {

    // ARRANGE
    let passenger = accounts[7];
    let airline2 = accounts[2];
    let flight = "ND1309";
    let value = Web3Utils.toWei("1.7", "ether");
    let reverted = false;

    //ACT
    try {
      await config.flightSuretyApp.registerFlight(airline2, flight, 0, {from: passenger, value: value, gasPrice: 0});
    } catch (e) {
      reverted = true;
    }

    // ASSERT
    assert.equal(reverted, true, "Error: Maximum insurance payment exceeded");

  });

  it('(insurance       ) Passenger can buy insurance for a maximum of 1 Ether', async () => {

    // ARRANGE
    let passenger = accounts[7];
    let airline2 = accounts[2];
    let flight = "ND1309";
    let value = Web3Utils.toWei("1", "ether");
    let reverted = false;

    //ACT
    try {
      await config.flightSuretyApp.registerFlight(airline2, flight, 0, {from: passenger, value: value, gasPrice: 0});
    } catch (e) {
      reverted = true;
      // console.log(e);
    }

    // ASSERT

    assert.equal(reverted, false, "Error: Maximum insurance payment exceeded");

  })

  it('(insurance       ) Passenger cannot buy multiple insurance for same flight', async () => {

    // ARRANGE
    let passenger = accounts[7];
    let airline2 = accounts[2];
    let flight = "ND1309";
    let value = Web3Utils.toWei("1", "ether");
    let reverted = false;

    //ACT
    try {
      await config.flightSuretyApp.registerFlight(airline2, flight, 0, {from: passenger, value: value, gasPrice: 0});
    } catch (e) {
      reverted = true;
      // console.log(e);
    }

    // ASSERT


    assert.equal(reverted, true, "Error: Passenger can buy multiple insurances for same flight");

  });

  it('(insurance       ) Passenger balance (before insurance claim) is 0', async () => {

    // ARRANGE
    let passenger = accounts[7];
    let balance = 7;
    let reverted = false;

    //ACT
    try {
      balance = await config.flightSuretyApp.insureeBalance({from: passenger});
    } catch (e) {
      reverted = true;
    }

    // ASSERT

    assert.equal(balance.toNumber(), 0, "Error while getting traveler balance");
    assert.equal(reverted, false, "Error while getting traveler balance");

  });

  it('(oracles         ) Call submitOracleResponse() in a loop to emit processFlightStatus() - inspired by oracle.js', async () => {
    // ARRANGE
    const ORACLES_COUNT = 10;
    const STATUS_CODE_LATE_AIRLINE = 20;
    let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();
    let airline = accounts[2];
    let flight = 'ND1309';

    // ACT
    for(let i = 1; i < ORACLES_COUNT; i++) {
      await config.flightSuretyApp.registerOracle({from: accounts[i], value: fee});
      await config.flightSuretyApp.fetchFlightStatus(airline, flight, 0, {from: accounts[i]});

      for (let j = 0; j < 5; j++) {
        try {
          await config.flightSuretyApp.submitOracleResponse(j, airline, flight, 0, STATUS_CODE_LATE_AIRLINE, {from: accounts[i]});
          //console.log("Valid response received " + j);
        } catch (e) {
          //console.log(e.message);
        }
      }
    }
  });

  it('(passenger       ) check passenger was credited 1.5x but do not withdraw amount', async () => {
    let insuree = accounts[7];
    let reverted = false;
    let balance = 0;

    try {
      balance = await config.flightSuretyApp.insureeBalance({from: insuree});
    }
    catch(e) {
      reverted = true;
    }

    // ASSERT
    assert.equal(reverted, false, "Error:Unable to check balance.");
    assert.equal(balance.toString(), new BigNumber("1500000000000000000").toString(), "Error: Balance not credited.");
  });

  it('(passenger       ) Initiate withdrawal to account', async () => {
    let insuree = accounts[7];
    let initialBalance = await web3.eth.getBalance(insuree);
    let balance = 1000;

    let reverted = false;
    try {
      await config.flightSuretyApp.makeWithdrawal({from: insuree});
      balance = await config.flightSuretyApp.insureeBalance({from: insuree});
    }
    catch(e) {
      reverted = true;
      // console.log(e);
    }

    let currentBalance = await web3.eth.getBalance(insuree);
    assert.equal(reverted, false, "Failure on withdraw to passanger account.");
    assert.equal(balance.toString(), "0", "Balance should be 0");
    assert.equal(new BigNumber(currentBalance.toString()).isGreaterThan(new BigNumber(initialBalance.toString())), true, "Invalid balance on account");
  });

  it('(passenger       ) prevent multiple withdrawal to account', async () => {
    let insuree = accounts[7];
    let initialBalance = await web3.eth.getBalance(insuree);

    let reverted = false;
    try {
      await config.flightSuretyApp.makeWithdrawal({from: insuree});
    }
    catch(e) {
      reverted = true;
      console.log(e);
    }

    let currentBalance = await web3.eth.getBalance(insuree);
    assert.equal(reverted, false, "Error. Contract should not allow multiple withdrawals.");
    assert.equal(new BigNumber(currentBalance.toString()).isEqualTo(new BigNumber(initialBalance.toString())), false, "Error: Balance is in error");
  });

});
