const { network, run } = require("hardhat")
const {
    networkConfig,
    developmentChain,
} = require("../helper-network-chainid.js")
const { verify } = require("../utils/verify.js")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // const ethUsdPriceFeedAddress =
    //     networkConfig[chainId]["ethUsdPriceFeedAddress"]

    let ethUsdPriceFeedAddress
    if (chainId == "31337") {
        const ethUsdAggregator = await get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress =
            networkConfig[chainId]["ethUsdPriceFeedAddress"]
    }
    const args = [ethUsdPriceFeedAddress]
    const fundme = await deploy("FundMe", {
        contract: "FundMe",
        from: deployer,
        args: args, // put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChain.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundme.address, args)
    }

    log("---------------------------------------------------------")
}
// when going for localhost or hardhat network we want to use mocking
module.exports.tags = ["all", "fundme"]
