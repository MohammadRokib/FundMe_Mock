// function deployFunc({ getNamedAccounts, deployments }) {
//     const { deploy, log } = deployments;
//     const { deployer} = await getNamedAccounts();
//     const chainID = network.config.chainID;
// }

// module.exports.default = deployFunc;

const { networkConfig } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainID = network.config.chainID;

    const ethUsdPriceFeedAddress = networkConfig[chainID]["ethUsdPriceFeed"];

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
    })
};

// Sepolia ETH / USD: 0x694AA1769357215DE4FAC081bf1f309aDC325306
// Goerli ETH / USD: 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
