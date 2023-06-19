const { developmentChains, DECIMALS } = require("../helper-hardhat-config");
const { networkConfig, INITIAL_ANSWER } = require("../helper-hardhat-config");
const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainID = network.config.chainId;

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying Mocks...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });
        log("Mocks Deployed...");
        log("_________________________________________");
    }
};

module.exports.tags = ["all", "mocks"];
