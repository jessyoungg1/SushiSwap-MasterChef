const { expect } = require("chai");
const { ethers } = require("hardhat");
var Web3 = require('web3');

describe("MasterChef", function () {
    it("Swap ETH to DAI", async () => {
      const [owner] = await ethers.getSigners();
      const sushiRouter = await ethers.getContractAt(
        "IUniswapV2Router02",
        "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"
      );
      const weth = await ethers.getContractAt(
        "IWETH",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      );
      const dai = await ethers.getContractAt(
        "IERC20", //openzeppelin
        "0x6b175474e89094c44da98b954eedeac495271d0f"
      );

      //Desired amount to exchange
      const amountIn = Web3.utils.toWei("1",'ether')

      const daiBalance = await dai.balanceOf(owner.address);
      console.log("Dai balance before ETH -> DAI: ", daiBalance)

      await sushiRouter.swapExactETHForTokens(
        "3000",
        [weth.address,dai.address],
        owner.address,
        Math.floor(Date.now() / 1000)+60,
        {value: amountIn}
      )

      const newDaiBalance = await dai.balanceOf(owner.address)
      console.log("DAI balance after ETH -> DAI: ", newDaiBalance)

      daiBalanceNumber = Number(daiBalance);
      newDaiBalanceNumber = Number(newDaiBalance);
      //Expect number of DAI to increase after swapping ETH to DAI
      expect(daiBalanceNumber).to.lessThan(newDaiBalanceNumber);
      })

    it("Adding to ETH/DAI liquidity pool", async () =>{
      const [owner] = await ethers.getSigners();
      const sushiRouter = await ethers.getContractAt(
        "IUniswapV2Router02",
        "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"
      );
      const sushiFactory = await ethers.getContractAt(
        "IUniswapV2Factory",
        "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac"
      );
      const weth = await ethers.getContractAt(
        "IWETH",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      );
      const dai = await ethers.getContractAt(
        "IERC20", //openzeppelin
        "0x6b175474e89094c44da98b954eedeac495271d0f"
      );
      const pool = await sushiFactory.getPair(weth.address, dai.address);
      const poolToken = await ethers.getContractAt("IERC20", pool);

      //Desired amount of DAI to add to liquidity
      const daiValue = await sushiRouter.getAmountsOut(
        Web3.utils.toWei("0.1",'ether'),
        [weth.address, dai.address],
      )
      //Minimum amount of ether to add to liquidity pool
      const ethValue = Web3.utils.toWei("0.097",'ether')
      //Amount of ether sent to the function
      const ethInputValue = Web3.utils.toWei("1",'ether')
      //Approve sushiRouter to use desired amount of DAI tokens
      await dai.approve(sushiRouter.address,daiValue[1]);

      const LPBalanceBeforeAddingLiquidity = await poolToken.balanceOf(owner.address)
      console.log("Sushiswap LP token balance before adding liquidity: ", LPBalanceBeforeAddingLiquidity);

      //Add liquidity
      await sushiRouter.addLiquidityETH(
        dai.address, //token address
        daiValue[1], //desired dai input
        daiValue[1], //minimum dai input
        ethValue, //minimum ETH input
        owner.address, //address to receive LP tokens
        Math.floor(Date.now() / 1000)+120, //Time request ends - now + 2 mins
        {value: ethInputValue} //
      )

      const LPBalanceAfterAddingLiquidity = await poolToken.balanceOf(owner.address)
      console.log("Sushiswap LP token balance after adding liquidity: ", LPBalanceAfterAddingLiquidity);

      //Expect balance of LP tokens before adding liquidity is less than after
      LPBalanceBeforeAddingLiquidityNumber = Number(LPBalanceBeforeAddingLiquidity);
      LPBalanceAfterAddingLiquidityNumber = Number(LPBalanceAfterAddingLiquidity);
      expect(LPBalanceBeforeAddingLiquidityNumber).to.lessThan(LPBalanceAfterAddingLiquidityNumber);
    });   

    it("Send LP tokens to masterchef", async () =>{
      const [owner] = await ethers.getSigners();
      const sushiFactory = await ethers.getContractAt(
        "IUniswapV2Factory",
        "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac"
      );
      const weth = await ethers.getContractAt(
        "IWETH",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      );
      const dai = await ethers.getContractAt(
        "IERC20", //openzeppelin
        "0x6b175474e89094c44da98b954eedeac495271d0f"
      );
      const masterChef = await ethers.getContractAt(
        "MasterChef",
        "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd"
      );
      const pool = await sushiFactory.getPair(weth.address, dai.address);
      const poolToken = await ethers.getContractAt("IERC20", pool);
      const _pid = 2;

      //Amount of pools in masterchef
      const length = await masterChef.poolLength();
      console.log("Pool length: ", Number(length));
      console.log("My LP tokens address: ", poolToken.address)

      //Amount of LP tokens 
      const LPbalance = await poolToken.balanceOf(owner.address);
      //Approve masterChef address to spend LP tokens
      await poolToken.approve(masterChef.address, LPbalance);
      
      const lpBalanceBeforeDeposit = await poolToken.balanceOf(owner.address);
      console.log("Sushiswap LP token balance before depositing:", lpBalanceBeforeDeposit);

      //deposit LP tokens to masterchef (LP pool ID 2)
      await masterChef.deposit(_pid, LPbalance);

      const lpBalanceAfterDeposit = await poolToken.balanceOf(owner.address);
      console.log("Sushiswap LP token balance after depositing:", lpBalanceAfterDeposit);

      //Expect owner to own less LP tokens once deposited them into master chef
      lpBalanceBeforeDepositNumber = Number(lpBalanceBeforeDeposit);
      lpBalanceAfterDepositNumber = Number(lpBalanceAfterDeposit);
      expect(lpBalanceAfterDepositNumber).to.lessThan(lpBalanceBeforeDepositNumber);

    })
    it("Pending SUSHI", async () =>{
      const [owner] = await ethers.getSigners();
      const masterChef = await ethers.getContractAt(
        "MasterChef",
        "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd"
      );
      const _pid = 2;

      const pendingSushi = await masterChef.pendingSushi(_pid, owner.address);
      console.log("Pending Sushi ", pendingSushi);
      
      //Mine block to process to transactions
      await hre.network.provider.send("evm_mine");

      const pendingSushi2 = await masterChef.pendingSushi(_pid, owner.address)
      console.log("Pending Sushi ", pendingSushi2);

      pendingSushiNumber = Number(pendingSushi);
      pendingSushi2Number = Number(pendingSushi2)
      expect(pendingSushiNumber).to.be.lessThan(pendingSushi2Number);

    })
    it("Update pool", async () =>{
      const [owner] = await ethers.getSigners();
      const sushi = await ethers.getContractAt(
        "IERC20",
        "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2"
      );
      const masterChef = await ethers.getContractAt(
        "MasterChef",
        "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd"
      );

      const sushiBalance = await sushi.balanceOf(masterChef.address);
      console.log("Sushi balance before pool is updated: ", sushiBalance) 
      
      await masterChef.updatePool(2);

      const sushiBalance2 = await sushi.balanceOf(masterChef.address);
      console.log("Sushi balance after pool is updated: ", sushiBalance2)

      sushiBalanceNumber = Number(sushiBalance);
      sushiBalance2Number = Number(sushiBalance2);
      expect(sushiBalanceNumber).to.be.lessThan(sushiBalance2Number)
    })
    it("Withdraw LP and SUSHI", async () =>{
      const [owner] = await ethers.getSigners();
      const sushiFactory = await ethers.getContractAt(
        "IUniswapV2Factory",
        "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac"
      );
      const weth = await ethers.getContractAt(
        "IWETH",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      );
      const dai = await ethers.getContractAt(
        "IERC20", //openzeppelin
        "0x6b175474e89094c44da98b954eedeac495271d0f"
      );
      const sushi = await ethers.getContractAt(
        "IERC20",
        "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2"
      );
      const masterChef = await ethers.getContractAt(
        "MasterChef",
        "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd"
      );
      const pool = await sushiFactory.getPair(weth.address, dai.address);
      const poolToken = await ethers.getContractAt("IERC20", pool);

      //balance of LP tokens before withdraw
      const lpBalanceNumber1 = await poolToken.balanceOf(owner.address);
      console.log("LP token balance before withdraw: ",lpBalanceNumber1);

      //balance of SUSHI tokens before withdraw
      const sushiBalanceBeforeWithdraw = await sushi.balanceOf(owner.address);
      console.log("Sushi token balance before withdraw: ", sushiBalanceBeforeWithdraw);
      
      //withdraw 100 of deposited LP tokens from masterchef + SUSHI
      await masterChef.withdraw(2,100);

      //balance of LP tokens after withdraw
      const lpBalanceNumber2 = await poolToken.balanceOf(owner.address);
      console.log("LP token balance after withdraw: ", lpBalanceNumber2);

      //balance of SUSHI tokens after withdraw
      const sushiBalanceAfterWithdraw = await sushi.balanceOf(owner.address);
      console.log("Sushi token balance after withdraw: ", sushiBalanceAfterWithdraw);

      const lpBalanceNumber1_ = Number(lpBalanceNumber1);
      const lpBalanceNumber2_ = Number(lpBalanceNumber2);

      sushiBalanceBeforeWithdraw_ = Number(sushiBalanceBeforeWithdraw)
      sushiBalanceAfterWithdraw_ = Number(sushiBalanceAfterWithdraw)

      expect(lpBalanceNumber1_).to.be.lessThan(lpBalanceNumber2_);
      expect(sushiBalanceBeforeWithdraw_).to.be.lessThan(sushiBalanceAfterWithdraw_);
    })
    it("Emergance withdraw", async () =>{
      const [owner] = await ethers.getSigners();
      const sushiFactory = await ethers.getContractAt(
        "IUniswapV2Factory",
        "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac"
      );
      const weth = await ethers.getContractAt(
        "IWETH",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      );
      const dai = await ethers.getContractAt(
        "IERC20", //openzeppelin
        "0x6b175474e89094c44da98b954eedeac495271d0f"
      );
      const masterChef = await ethers.getContractAt(
        "MasterChef",
        "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd"
      );
      const pool = await sushiFactory.getPair(weth.address, dai.address);
      const poolToken = await ethers.getContractAt("IERC20", pool);

      //balance of owners LP tokens before emergancy withdraw
      const emlpBalanceNumber1 = await poolToken.balanceOf(owner.address);
      console.log("LP token balance before Emergancy withdraw: ", emlpBalanceNumber1);
      //withdraw all deposited LP tokens from masterchef without care for rewards
      await masterChef.emergencyWithdraw(2);
      //balance of owners LP tokens after withdrawing LP tokens
      const emlpBalanceNumber2 = await poolToken.balanceOf(owner.address);
      console.log("LP token balance after Emergancy withdraw: ", emlpBalanceNumber2)

      emlpBalanceNumber1_ = Number(emlpBalanceNumber1);
      emlpBalanceNumber2_ = Number(emlpBalanceNumber2);

      expect(emlpBalanceNumber1_).to.lessThan(emlpBalanceNumber2_);
    })
    it("Ensure only previous dev can update dev address", async () =>{
      const [owner] = await ethers.getSigners();
      const masterChef = await ethers.getContractAt(
        "MasterChef",
        "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd"
      );
      //Ensure only previous dev can update dev address
      await expect(masterChef.dev(owner.address)).to.be.revertedWith("dev: wut?");
      });
})
