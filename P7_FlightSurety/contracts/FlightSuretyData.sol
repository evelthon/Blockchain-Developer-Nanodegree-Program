pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    mapping(address => uint256) private authorizedCaller; //Store list of authorized callers.

    struct Airline {
        bool isRegistered;
        bool isFunded;
    }
    mapping(address => Airline) private airlines;


    //struct of data for each insured traveler
    struct FlightInsurance {
        bool isInsured;// is traveler insured
        bool isCredited;//used to determine if the traveler was payed(avoid multiple payments)
        uint256 amount;//amount traveler is insured
    }

    //What will be payble to each insured traveler (or what was payed?)
    mapping(address => uint256) private insureeBalances;

    //Insurance details of each traveler (all flights)
    mapping(bytes32 => FlightInsurance) private flightInsurances;

    //List of insured travelers per flight
    mapping(bytes32 => address[]) private insureesMap;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    The first Airline gets registered on contract deployment

    */
    constructor (
        address firstAirline
    )
    public
    {
        contractOwner = msg.sender;

        //Register first Airline w/o funding
        airlines[firstAirline].isRegistered = true;
        airlines[firstAirline].isFunded = false;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    modifier requireIsCallerAuthorized(){
        require(msg.sender == contractOwner || authorizedCaller[msg.sender] == 1, "Caller not authorized!");
        _;
    }

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
        require(operational, "Contract is currently not operational");
        _;
        // All modifiers require an "_" which indicates where the function body will be added
    }


    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireIsCallerAirlineFunded(address callingAirline){
        require(airlines[callingAirline].isFunded, "Airline cannot participate in contract if not funded.");
        _;
    }

    modifier requireFlightNotInsured(address sender, address airline, string flightCode, uint256 timestamp){
        require(!isFlightInsured(sender, airline, flightCode, timestamp), "Passenger is already insured");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/


    function authorizeCaller(address contractAddress) external
    requireContractOwner
    {
        authorizedCaller[contractAddress] = 1;
    }

    function deauthorizeCaller(address contractAddress) external
    requireContractOwner
    {
        delete authorizedCaller[contractAddress];
    }

    function isAuthorizedCaller(address contractAddress) public view
    requireContractOwner
    returns (bool)
    {
        return authorizedCaller[contractAddress] == 1;
    }

    function isFlightInsured(address sender, address airline, string flightCode, uint256 timestamp) public view
    returns (bool)
    {
        FlightInsurance storage insurance = flightInsurances[getKey(sender, airline, flightCode, timestamp)];
        return insurance.isInsured;
    }


    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational()
    public
    view
    returns (bool)
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus
    (
        bool mode
    )
    external
    requireContractOwner
    {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    //See https://ethereum.stackexchange.com/questions/29771/retrieve-token-balance-for-addresses?rq=1
    function getBalance(address addr) public view
    requireIsOperational
    requireIsCallerAuthorized
    returns (uint256){
        return address(addr).balance;
    }


    //Verifies an Airline by the fact the airline is registered
    function isAirline(address airline) external view returns (bool) {
        return airlines[airline].isRegistered;
    }

    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */
    function registerAirline(address callingAirline, address airline) external
    requireIsOperational
    requireIsCallerAuthorized
    requireIsCallerAirlineFunded(callingAirline)
    returns (bool status)
    {
        //Fail fast if airline already registered
        require(!airlines[airline].isRegistered, "Airline already registered.");
        airlines[airline].isRegistered = true;
        airlines[airline].isFunded = false;

        return airlines[airline].isRegistered;
    }


    function fundAirline (address airline) external
    requireIsOperational
    requireIsCallerAuthorized
    {
        airlines[airline].isFunded = true;
    }

    function insureeBalance (address sender) external
    requireIsOperational
    requireIsCallerAuthorized
    view
    returns (uint256)
    {
        return insureeBalances[sender];
    }

    /**
     * @dev Buy insurance for a flight
     *
     */

    //Reading on storage vs memory https://medium.com/coinmonks/what-the-hack-is-memory-and-storage-in-solidity-6b9e62577305
    function buy
    (
        address sender,
        address airline,
        string flightCode,
        uint256 timestamp,
        uint256 insuranceAmount
    )
    external
    requireIsOperational
    requireIsCallerAuthorized
    requireFlightNotInsured(sender, airline, flightCode, timestamp)
    {
        FlightInsurance storage flInsurance = flightInsurances[getKey(sender, airline, flightCode, timestamp)];
        flInsurance.isInsured = true;
        flInsurance.amount = insuranceAmount;

        //add insuree to list of insurees
        //TODO: see checkIfStarExist()

        //Breaking the function helps avoid error: CompilerError: Stack too deep, try removing local variables.
        //In other programming languages it would be ok to be one function
        saveInsuree(sender, airline, flightCode, timestamp);
    }

    function saveInsuree(address sender, address airline, string flightCode, uint256 timestamp) internal requireIsOperational {
        address [] storage insurees = insureesMap[getKey(address(0), airline, flightCode, timestamp)];
        bool insureeExists = false;
        for(uint256 i = 0; i < insurees.length; i++) {
            if(insurees[i] == sender) {
                duplicate = true;
                break;
            }
        }

        if(!insureeExists) {
            insurees.push(sender);
        }
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
    (
    address airline,
    string flightCode,
    uint256 timestamp
    )
    external
    requireIsOperational
    requireIsCallerAuthorized
    {
        address [] storage insurees = insureesMap[getKey(address(0), airline, flightCode, timestamp)];

        for(uint i = 0; i < insurees.length; i++) {
            FlightInsurance storage insurance = flightInsurances[getKey(insurees[i], airline, flightCode, timestamp)];

            //Verify the passenger was not previously credited before
            // his payment amount is increased by 1.5x
            if(insurance.isInsured && !insurance.isCredited) {
                insurance.isCredited = true;
                insureeBalances[insurees[i]] = insureeBalances[insurees[i]].add(insurance.amount.div(10).mul(15));
            }
        }
    }


    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay (address sender) external requireIsOperational requireIsCallerAuthorized
    {
        //Fail fast if contract has no funds
        require(address(this).balance >= insureeBalances[sender], "Error: Not enought funds in contract");
        //Continue with withdrawl
        uint256 tmp = insureeBalances[sender];
        insureeBalances[sender] = 0;
        sender.transfer(tmp);

    }

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
     *      resulting in insurance payouts, the contract should be self-sustaining
     *
     */
    function fund() public payable
    {
    }

    function getKey(
        address insuree,
        address airline,
        string memory flight,
        uint256 timestamp
    ) pure internal returns(bytes32){
        return keccak256(abi.encodePacked(insuree, airline, flight, timestamp));
    }

    function getFlightKey
    (
        address airline,
        string memory flight,
        uint256 timestamp
    )
    pure
    internal
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }


    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function()
    external
    payable
    {
        fund();
    }


}

