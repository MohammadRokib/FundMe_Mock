const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

describe("FundMe", async function () {
    let fundMe, deployer, mockV3Aggregator;
    const sendValue = ethers.utils.parseEther("1"); // 1 ETH
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;

        // it will run through every deploy script in the deploy folder
        await deployments.fixture(["all"]);

        // to get the most recent deployment of FundMe & MockV3Aggregator contract
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        );
    });

    describe("constructor", async function () {
        it("sets the aggregator address correctly", async function () {
            const response = await fundMe.priceFeed();
            assert.equal(response, mockV3Aggregator.address);
        });
    });

    describe("fund", async function () {
        it("Fails if fund is insufficient", async function () {
            await expect(fundMe.fund()).to.be.revertedWith("Insufficient fund");
        });

        it("Updates the amount funded data structure", async function () {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.addToAmount(deployer);
            assert.equal(response.toString(), sendValue.toString());
        });

        it("Adds funder to the funders array", async function () {
            await fundMe.fund({ value: sendValue });
            const funder = await fundMe.funders(0);
            assert.equal(funder, deployer);
        });
    });

    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue });
        });

        it("Withdraw ETH from a single funder", async function () {
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            // Act
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            // Assert
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance().add(gasCost).toString()
            );
        });
    });
});
