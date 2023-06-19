// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "./PriceConverter.sol";

error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;
    uint256 public minUSD = 50 * 1e18;
    address[] public funders;
    address public owner;
    mapping(address => uint256) public addToAmount;
    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    modifier onlyOwner {
        // require(msg.sender == owner, "Administrator only");
        if (msg.sender != owner) revert FundMe__NotOwner();
        _;
    }

    function fund() public payable {
        require(msg.value.getConversionRate(priceFeed) >= minUSD, "Insufficient fund");
        funders.push(msg.sender);
        addToAmount[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            addToAmount[funder] = 0;
        }
        funders = new address[](0);
            (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
            require(callSuccess, "Transaction Failed");
    }
}