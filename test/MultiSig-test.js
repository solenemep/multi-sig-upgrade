/* eslint-disable comma-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { expect } = require('chai');
const hre = require('hardhat');
const { BigNumber } = require('ethers');

describe('MultiSig', async function () {
  let MultiSig, multiSig, dev, alice, bob, charlie;

  const THRESHOLD = 360;
  const ADMIN = hre.ethers.utils.id('ADMIN');
  const ADDRESS_UPGRADE = '0x6e2f8f6Df2Fc7E7b2A7419Ac6F140113bcf7366B';
  const PERIOD = 2;
  const STATUS_RUNNING = 0;
  const STATUS_APPROVED = 1;
  const STATUS_REJECTED = 2;
  const ZERO = BigNumber.from('0');
  const ONE = BigNumber.from('1');
  const TWO = BigNumber.from('2');

  beforeEach(async function () {
    [dev, alice, bob, charlie] = await hre.ethers.getSigners();
    MultiSig = await hre.ethers.getContractFactory('MultiSig');
    multiSig = await MultiSig.connect(dev).deploy(dev.address, alice.address, bob.address, THRESHOLD);
    await multiSig.deployed();
  });

  describe('Deployment', async function () {
    it(`sets ADMIN role`, async function () {
      expect(await multiSig.hasRole(ADMIN, dev.address)).to.equal(true);
      expect(await multiSig.hasRole(ADMIN, alice.address)).to.equal(true);
      expect(await multiSig.hasRole(ADMIN, bob.address)).to.equal(true);
    });
    it(`sets THRESHOLD`, async function () {
      expect(await multiSig.threshold()).to.equal(THRESHOLD);
    });
  });
  describe('propose', async function () {
    it('reverts if not ADMIN', async function () {
      await expect(multiSig.connect(charlie).propose(ADDRESS_UPGRADE)).to.be.reverted;
    });
    it(`creates new Proposal`, async function () {
      await multiSig.connect(dev).propose(ADDRESS_UPGRADE, PERIOD);
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const blockTimestamp = block.timestamp;
      const proposal = await multiSig.proposalById(1);
      expect(proposal.status).to.equal(STATUS_RUNNING);
      expect(proposal.upgrade).to.equal(ADDRESS_UPGRADE);
      expect(proposal.period).to.equal(PERIOD);
      expect(proposal.nbYes).to.equal(ZERO);
      expect(proposal.nbNo).to.equal(ZERO);
      expect(proposal.createdAt).to.equal({ _hex: ethers.utils.hexlify(blockTimestamp), _isBigNumber: true });
    });
    it(`emits Proposed event`, async function () {
      await expect(multiSig.connect(dev).propose(ADDRESS_UPGRADE, PERIOD))
        .to.emit(multiSig, 'Proposed')
        .withArgs(dev.address, 1);
    });
  });
  describe('vote', async function () {
    it('reverts if not ADMIN', async function () {
      await multiSig.connect(dev).propose(ADDRESS_UPGRADE, PERIOD);
      await expect(multiSig.connect(charlie).vote(1, 0)).to.be.reverted;
    });
    it('reverts if has voted', async function () {
      await multiSig.connect(dev).propose(ADDRESS_UPGRADE, PERIOD);
      await multiSig.connect(alice).vote(1, 0);
      await expect(multiSig.connect(alice).vote(1, 0)).to.be.revertedWith('MultiSig: already voted');
    });
    it('reverts if proposal is not running', async function () {
      await multiSig.connect(dev).propose(ADDRESS_UPGRADE, PERIOD);
      await multiSig.connect(dev).vote(1, 0);
      await multiSig.connect(alice).vote(1, 1);
      await multiSig.connect(bob).vote(1, 1);
      await multiSig.connect(dev).grantRole(ADMIN, charlie.address);
      await expect(multiSig.connect(charlie).vote(1, 1)).to.be.revertedWith('MultiSig: not a running proposal');
    });
    it(`sets proposal vote according to parameter`, async function () {
      await multiSig.connect(dev).propose(ADDRESS_UPGRADE, PERIOD);
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const blockTimestamp = block.timestamp;
      await multiSig.connect(alice).vote(1, 0);
      const proposal = await multiSig.proposalById(1);
      expect(proposal.status).to.equal(STATUS_RUNNING);
      expect(proposal.upgrade).to.equal(ADDRESS_UPGRADE);
      expect(proposal.period).to.equal(PERIOD);
      expect(proposal.nbYes).to.equal(ONE);
      expect(proposal.nbNo).to.equal(ZERO);
      expect(proposal.createdAt).to.equal({ _hex: ethers.utils.hexlify(blockTimestamp), _isBigNumber: true });
    });
    it(`sets has voted to true`, async function () {
      await multiSig.connect(dev).propose(ADDRESS_UPGRADE, PERIOD);
      await multiSig.connect(alice).vote(1, 0);
      expect(await multiSig.hasVoted(alice.address, 1)).to.equal(true);
    });
    it(`clotures proposal with according status (vote completed)`, async function () {
      await multiSig.connect(dev).propose(ADDRESS_UPGRADE, PERIOD);
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const blockTimestamp = block.timestamp;
      it(`clotures with Approved status`, async function () {
        await multiSig.connect(dev).vote(1, 0);
        await multiSig.connect(alice).vote(1, 0);
        await multiSig.connect(bob).vote(1, 1);
        const proposal = await multiSig.proposalById(1);
        expect(proposal.status).to.equal(STATUS_APPROVED);
        expect(proposal.upgrade).to.equal(ADDRESS_UPGRADE);
        expect(proposal.period).to.equal(PERIOD);
        expect(proposal.nbYes).to.equal(TWO);
        expect(proposal.nbNo).to.equal(ONE);
        expect(proposal.createdAt).to.equal({ _hex: ethers.utils.hexlify(blockTimestamp), _isBigNumber: true });
      });
      it(`clotures with Rejected status`, async function () {
        await multiSig.connect(dev).vote(1, 0);
        await multiSig.connect(alice).vote(1, 1);
        await multiSig.connect(bob).vote(1, 1);
        const proposal = await multiSig.proposalById(1);
        expect(proposal.status).to.equal(STATUS_REJECTED);
        expect(proposal.upgrade).to.equal(ADDRESS_UPGRADE);
        expect(proposal.period).to.equal(PERIOD);
        expect(proposal.nbYes).to.equal(ONE);
        expect(proposal.nbNo).to.equal(TWO);
        expect(proposal.createdAt).to.equal({ _hex: ethers.utils.hexlify(blockTimestamp), _isBigNumber: true });
      });
    });
    it(`clotures proposal with according status (time has passed)`, async function () {
      await multiSig.connect(dev).propose(ADDRESS_UPGRADE, PERIOD);
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const blockTimestamp = block.timestamp;
      it(`clotures with Approved status`, async function () {
        await multiSig.connect(bob).vote(1, 1);
        await ethers.provider.send('evm_increaseTime', [120960000]);
        await ethers.provider.send('evm_mine');
        const proposal = await multiSig.proposalById(1);
        expect(proposal.status).to.equal(STATUS_APPROVED);
        expect(proposal.upgrade).to.equal(ADDRESS_UPGRADE);
        expect(proposal.period).to.equal(PERIOD);
        expect(proposal.nbYes).to.equal(ONE);
        expect(proposal.nbNo).to.equal(ZERO);
        expect(proposal.createdAt).to.equal({ _hex: ethers.utils.hexlify(blockTimestamp), _isBigNumber: true });
      });
      it(`clotures with Rejected status`, async function () {
        await multiSig.connect(dev).vote(1, 0);
        await ethers.provider.send('evm_increaseTime', [120960000]);
        await ethers.provider.send('evm_mine');
        const proposal = await multiSig.proposalById(1);
        expect(proposal.status).to.equal(STATUS_REJECTED);
        expect(proposal.upgrade).to.equal(ADDRESS_UPGRADE);
        expect(proposal.period).to.equal(PERIOD);
        expect(proposal.nbYes).to.equal(ZERO);
        expect(proposal.nbNo).to.equal(ONE);
        expect(proposal.createdAt).to.equal({ _hex: ethers.utils.hexlify(blockTimestamp), _isBigNumber: true });
      });
    });
    it(`emits according events (vote completed)`, async function () {
      await multiSig.connect(dev).propose(ADDRESS_UPGRADE, PERIOD);
      it(`emits Approved event`, async function () {
        await multiSig.connect(dev).vote(1, 0);
        await multiSig.connect(alice).vote(1, 0);
        await multiSig.connect(bob).vote(1, 1);
        await expect(multiSig.connect(bob).vote(1, 1)).to.emit(multiSig, 'Approved').withArgs(1);
      });
      it(`emits Rejected event`, async function () {
        await multiSig.connect(dev).vote(1, 0);
        await multiSig.connect(alice).vote(1, 1);
        await multiSig.connect(bob).vote(1, 1);
        await expect(multiSig.connect(bob).vote(1, 1)).to.emit(multiSig, 'Approved').withArgs(1);
      });
    });
    it(`emits according events (time has passed)`, async function () {
      await multiSig.connect(dev).propose(ADDRESS_UPGRADE, PERIOD);
      it(`emits Approved event`, async function () {
        await ethers.provider.send('evm_increaseTime', [120960000]);
        await ethers.provider.send('evm_mine');
        await expect(multiSig.connect(bob).vote(1, 1)).to.emit(multiSig, 'Approved').withArgs(1);
      });
      it(`emits Rejected event`, async function () {
        await ethers.provider.send('evm_increaseTime', [120960000]);
        await ethers.provider.send('evm_mine');
        await expect(multiSig.connect(dev).vote(1, 0)).to.emit(multiSig, 'Approved').withArgs(1);
      });
    });
  });
});
