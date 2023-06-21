// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {

    function getPrice(AggregatorV3Interface s_priceFeed) internal view returns(uint256) {
        (, int price,,,) = s_priceFeed.latestRoundData();
        return uint256(price*1e10);

    }

    function getVersion() internal view returns(uint256) {
        AggregatorV3Interface s_priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
        return s_priceFeed.version();
    }

    function getConversionRate(uint256 ethAmount, AggregatorV3Interface s_priceFeed) internal view returns(uint256) {
        uint256 ethPrice = getPrice(s_priceFeed);
        uint256 ethUSD = (ethPrice * ethAmount) / 1e18;
        return ethUSD;
    }

}
