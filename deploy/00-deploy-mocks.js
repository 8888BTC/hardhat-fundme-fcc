const { network } = require("hardhat")
const { decimals, initialAnswer } = require("../helper-network-chainid")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId
    if (chainId == "31337") {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            args: [decimals, initialAnswer],
            log: true,
        })
        log("Mocks deployed!")
        log("--------------------------------------")
    }
}
module.exports.tags = ["all", "mocks"]
