const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
}

const developmentChain = ["hardhat", "localhost"]
const decimals = 8
const initialAnswer = 20000000000
module.exports = {
    networkConfig,
    developmentChain,
    decimals,
    initialAnswer,
}
