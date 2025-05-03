const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Gas Estimation", function () {
  let contract;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const RewardHeroNFT = await ethers.getContractFactory("RewardHeroNFT");
    contract = await RewardHeroNFT.deploy();
    await contract.waitForDeployment();
  });

  it("estimate mintCommonHero()", async function () {
    const gasEstimate = await contract.mintCommonHero.estimateGas();
    console.log("Gas estimé pour mintCommonHero():", gasEstimate.toString());
  });

  it("estimate mintHero()", async function () {
    const gasEstimate = await contract.mintHero.estimateGas("Test Hero", false);
    console.log("Gas estimé pour mintHero():", gasEstimate.toString());
  });

  it("estimate changeHeroName()", async function () {
    // Mint un hero d'abord
    await contract.connect(addr1).mintCommonHero();
    const gasEstimate = await contract.connect(addr1).changeHeroName.estimateGas(2, "New Name");
    console.log("Gas estimé pour changeHeroName():", gasEstimate.toString());
  });

  it("estimate setSoulbound()", async function () {
    // Mint un hero d'abord
    await contract.mintCommonHero();
    const gasEstimate = await contract.setSoulbound.estimateGas(1, true);
    console.log("Gas estimé pour setSoulbound():", gasEstimate.toString());
  });

  it("estimate getHeroInfo()", async function () {
    // Mint un hero d'abord
    await contract.mintCommonHero();
    const gasEstimate = await contract.getHeroInfo.estimateGas(owner.address, 0);
    console.log("Gas estimé pour getHeroInfo():", gasEstimate.toString());
  });

  it("estimate getHeroInfoById()", async function () {
    // Mint un hero d'abord
    await contract.mintCommonHero();
    const gasEstimate = await contract.getHeroInfoById.estimateGas(1, 0);
    console.log("Gas estimé pour getHeroInfoById():", gasEstimate.toString());
  });

  it("estimate linkOwnerToTokenId()", async function () {
    // Mint un hero d'abord
    await contract.mintCommonHero();
    const gasEstimate = await contract.linkOwnerToTokenId.estimateGas(owner.address, 1);
    console.log("Gas estimé pour linkOwnerToTokenId():", gasEstimate.toString());
  });

  it("estimate transferFrom()", async function () {
    // Mint un hero d'abord
    await contract.mintCommonHero();
    // Ajouter addr1 à la whitelist
    await contract.setTransferWhitelist(addr1.address, true);
    // Toggle soulbound pour permettre le transfert
    await contract.setSoulbound(1, true);
    const gasEstimate = await contract.transferFrom.estimateGas(owner.address, addr1.address, 1);
    console.log("Gas estimé pour transferFrom():", gasEstimate.toString());
  });
});
