// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "./PriceConverter.sol";

error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public MIN_USD = 50 * 1e18;
    address[] private s_funders;
    address private i_owner;
    mapping(address => uint256) private s_addToAmount;
    AggregatorV3Interface private s_priceFeed;

    constructor(address s_priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(s_priceFeedAddress);
    }

    modifier onlyOwner {
        // require(msg.sender == i_owner, "Administrator only");
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    function fund() public payable {
        require(msg.value.getConversionRate(s_priceFeed) >= MIN_USD, "Insufficient fund");
        s_funders.push(msg.sender);
        s_addToAmount[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        for (uint256 i = 0; i < s_funders.length; i++) {
            address funder = s_funders[i];
            s_addToAmount[funder] = 0;
        }
        s_funders = new address[](0);
            (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
            require(callSuccess, "Transaction Failed");
    }

    function cheapWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        for(uint256 i = 0; i < funders.length; i++) {
            s_addToAmount[funders[i]] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 i) public view returns (address) {
        return s_funders[i];
    }

    function getAddToAmount(address adr) public view returns (uint256) {
        return s_addToAmount[adr];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}

// maps can't be in memory