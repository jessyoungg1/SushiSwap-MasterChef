//SPDX-License-Identifier: Unlicense
pragma solidity 0.6.12;

import "hardhat/console.sol";

import "@sushiswap/core/contracts/uniswapv2/interfaces/IUniswapV2Router02.sol";
import "@sushiswap/core/contracts/uniswapv2/interfaces/IUniswapV2Factory.sol";
import "@sushiswap/core/contracts/uniswapv2/interfaces/IUniswapV2Pair.sol";
import "@sushiswap/core/contracts/uniswapv2/interfaces/IWETH.sol";
import "@sushiswap/core/contracts/uniswapv2/interfaces/IERC20.sol";
import "@sushiswap/core/contracts/MasterChef.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
