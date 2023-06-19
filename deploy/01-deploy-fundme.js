// function deployFunc({ getNamedAccounts, deployments }) {
//     const { deploy, log } = deployments;
//     const { deployer} = await getNamedAccounts();
//     const chainID = network.config.chainID;
// }

// module.exports.default = deployFunc;

require("dotenv").config();

const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainID = network.config.chainId;
    let ethUsdPriceFeedAddress;

    if (developmentChains.includes(network.name)) {
        const ethUsdPriceFeed = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdPriceFeed.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainID]["ethUsdPriceFeed"];
    }

    const args = [ethUsdPriceFeedAddress];
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args);
    }
    log("_____________________________________");
};

module.exports.tags = ["all", "fundme"];

// Sepolia ETH / USD: 0x694AA1769357215DE4FAC081bf1f309aDC325306
// Goerli ETH / USD: 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
