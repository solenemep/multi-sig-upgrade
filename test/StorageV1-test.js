/* eslint-disable comma-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');

describe('StorageV1', function () {
  let StorageV1, storageV1, dev, alice, bob, charlie;

  const VALUE1 = 'Value1';
  const VALUE2 = 'Value2';
  const MULTISIG_ADDRESS = '0x6e2f8f6Df2Fc7E7b2A7419Ac6F140113bcf7366B';

  beforeEach(async function () {
    [dev, alice, bob, charlie] = await ethers.getSigners();
    StorageV1 = await ethers.getContractFactory('StorageV1');
    storageV1 = await upgrades.deployProxy(StorageV1);
    await storageV1.deployed();
  });

  describe('initialize', async function () {
    it(`sets dev as owner`, async function () {
      expect(await storageV1.owner()).to.equal(dev.address);
    });
  });
  describe('setData1', async function () {
    it(`sets new value in storage`, async function () {
      await storageV1.connect(alice).setData1(VALUE2);
      expect(await storageV1.connect(alice).getData1()).to.equal(VALUE2);
    });
    it(`emits Data1Set event`, async function () {
      await expect(storageV1.connect(alice).setData1(VALUE2))
        .to.emit(storageV1, 'Data1Set')
        .withArgs(alice.address, VALUE2);
    });
  });
  describe('version', async function () {
    it(`sets version v1`, async function () {
      expect(await storageV1.version()).to.equal('v1.0');
    });
  });
  describe('transferOwnership', async function () {
    it(`transfers ownership to MultiSig contract address`, async function () {
      await storageV1.connect(dev).transferOwnership(MULTISIG_ADDRESS);
      expect(await storageV1.owner()).to.equal(MULTISIG_ADDRESS);
    });
  });
});
