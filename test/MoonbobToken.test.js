const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MoonbobToken", function () {
  let token;
  let owner;
  let minter;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, minter, user1, user2] = await ethers.getSigners();

    const MoonbobToken = await ethers.getContractFactory("MoonbobToken");
    token = await MoonbobToken.deploy(owner.address, minter.address);
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await token.name()).to.equal("Moonbob Token");
      expect(await token.symbol()).to.equal("MOONBOB");
    });

    it("Should set the correct decimals", async function () {
      expect(await token.decimals()).to.equal(18);
    });

    it("Should set the correct owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should set the correct minter", async function () {
      expect(await token.minter()).to.equal(minter.address);
    });

    it("Should have zero initial supply", async function () {
      expect(await token.totalSupply()).to.equal(0);
    });

    it("Should revert if minter address is zero", async function () {
      const MoonbobToken = await ethers.getContractFactory("MoonbobToken");
      await expect(
        MoonbobToken.deploy(owner.address, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(token, "InvalidMinterAddress");
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await token.connect(minter).mint(user1.address, mintAmount);

      expect(await token.balanceOf(user1.address)).to.equal(mintAmount);
      expect(await token.totalSupply()).to.equal(mintAmount);
    });

    it("Should revert when non-minter tries to mint", async function () {
      const mintAmount = ethers.parseEther("1000");

      await expect(
        token.connect(user1).mint(user1.address, mintAmount)
      ).to.be.revertedWithCustomError(token, "NotMinter");
    });

    it("Should revert when owner (not minter) tries to mint", async function () {
      const mintAmount = ethers.parseEther("1000");

      await expect(
        token.connect(owner).mint(user1.address, mintAmount)
      ).to.be.revertedWithCustomError(token, "NotMinter");
    });

    it("Should allow multiple mints", async function () {
      const mintAmount1 = ethers.parseEther("500");
      const mintAmount2 = ethers.parseEther("300");

      await token.connect(minter).mint(user1.address, mintAmount1);
      await token.connect(minter).mint(user2.address, mintAmount2);

      expect(await token.balanceOf(user1.address)).to.equal(mintAmount1);
      expect(await token.balanceOf(user2.address)).to.equal(mintAmount2);
      expect(await token.totalSupply()).to.equal(mintAmount1 + mintAmount2);
    });
  });

  describe("Minter Management", function () {
    it("Should allow owner to change minter", async function () {
      await expect(token.connect(owner).setMinter(user1.address))
        .to.emit(token, "MinterUpdated")
        .withArgs(minter.address, user1.address);

      expect(await token.minter()).to.equal(user1.address);
    });

    it("Should allow new minter to mint after change", async function () {
      await token.connect(owner).setMinter(user1.address);

      const mintAmount = ethers.parseEther("1000");
      await token.connect(user1).mint(user2.address, mintAmount);

      expect(await token.balanceOf(user2.address)).to.equal(mintAmount);
    });

    it("Should prevent old minter from minting after change", async function () {
      await token.connect(owner).setMinter(user1.address);

      const mintAmount = ethers.parseEther("1000");
      await expect(
        token.connect(minter).mint(user2.address, mintAmount)
      ).to.be.revertedWithCustomError(token, "NotMinter");
    });

    it("Should revert when non-owner tries to change minter", async function () {
      await expect(
        token.connect(user1).setMinter(user2.address)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should revert when setting minter to zero address", async function () {
      await expect(
        token.connect(owner).setMinter(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(token, "InvalidMinterAddress");
    });
  });

  describe("ERC20 Functionality", function () {
    beforeEach(async function () {
      const mintAmount = ethers.parseEther("1000");
      await token.connect(minter).mint(user1.address, mintAmount);
    });

    it("Should allow token transfers", async function () {
      const transferAmount = ethers.parseEther("100");
      await token.connect(user1).transfer(user2.address, transferAmount);

      expect(await token.balanceOf(user1.address)).to.equal(
        ethers.parseEther("900")
      );
      expect(await token.balanceOf(user2.address)).to.equal(transferAmount);
    });

    it("Should allow approvals and transferFrom", async function () {
      const approveAmount = ethers.parseEther("100");
      await token.connect(user1).approve(user2.address, approveAmount);

      expect(await token.allowance(user1.address, user2.address)).to.equal(
        approveAmount
      );

      await token.connect(user2).transferFrom(user1.address, user2.address, approveAmount);

      expect(await token.balanceOf(user1.address)).to.equal(
        ethers.parseEther("900")
      );
      expect(await token.balanceOf(user2.address)).to.equal(approveAmount);
    });
  });
});
