const { ethers, getNamedAccounts, deployments, network } = require("hardhat")
const { developmentChain } = require("../../helper-network-chainid")

developmentChain.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe, deployer

          const sendValue = ethers.utils.parseEther("1")

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })
      })
