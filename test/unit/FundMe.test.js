const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChain } = require("../../helper-network-chainid")
!developmentChain.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1")
          beforeEach(async function () {
              //deploy our fundMe contract
              //ussing Hardhat-deploy
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const resposne = await fundMe.getPriceFeed()
                  assert.equal(resposne, mockV3Aggregator.address)
              })
          })

          describe("fund", async function () {
              it("Fails if you dont send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.reverted
              })
              it("update the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const resposne = await fundMe.getAddresstoAccounts(deployer)
                  assert.equal(resposne.toString(), sendValue.toString())
              })
              it("Adds funder to array of getFunder", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw ETH from a single founder", async function () {
                  //Arrange
                  const startingFundMeBanlance =
                      await fundMe.provider.getBalance(fundMe.address)

                  const startingDeployerBanlance =
                      await fundMe.provider.getBalance(deployer)

                  //Act
                  const transactionResponse = await fundMe.withdraw()

                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt

                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //Assert

                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBanlance.add(startingDeployerBanlance),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              // it("only allow the owner to withdraw", async function () {
              //     const accounts = await ethers.getSigners()

              //     const attackerConnectedContract = await fundMe.connect(accounts[1])
              //     await expect(
              //         attackerConnectedContract.withdraw()
              //     ).to.be.revertedWith("FundMe__NotOwner")

              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  )
                  await expect(fundMeConnectedContract.withdraw()).to.be
                      .reverted
              })

              it("cheaperWithdraw testing...", async function () {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  //Arrange
                  const startingFundMeBanlance =
                      await fundMe.provider.getBalance(fundMe.address)

                  const startingDeployerBanlance =
                      await fundMe.provider.getBalance(deployer)
                  //Act

                  const transactionResponse = await fundMe.cheaperWithdraw()

                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt

                  const withGasCost = gasUsed.mul(effectiveGasPrice)

                  //Asert

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //Assert

                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBanlance
                          .add(startingDeployerBanlance)
                          .toString(),
                      endingDeployerBalance.add(withGasCost).toString()
                  )

                  //Make sure that the getFunder are resrt

                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddresstoAccounts(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
