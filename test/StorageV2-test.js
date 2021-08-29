/* eslint-disable comma-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');

describe('StorageV2', function () {
  let StorageV1, storageV1, StorageV2, storageV2, dev, alice, bob, charlie;

  const VALUE1 = 'Value1';
  const VALUE2 = 'Value2';

  beforeEach(async function () {
    [dev, alice, bob, charlie] = await ethers.getSigners();
    StorageV1 = await ethers.getContractFactory('StorageV1');
    storageV1 = await upgrades.deployProxy(StorageV1);
    await storageV1.deployed();
    StorageV2 = await ethers.getContractFactory('StorageV2');
    storageV2 = await upgrades.upgradeProxy(storageV1.address, StorageV2);
    await storageV2.deployed();
  });

  describe('setData2', async function () {
    it(`sets new value in storage`, async function () {
      await storageV2.connect(alice).setData2(VALUE2);
      expect(await storageV2.connect(alice).getData2()).to.equal(VALUE2);
    });
    it(`emits Data2Set event`, async function () {
      await expect(storageV2.connect(alice).setData2(VALUE2))
        .to.emit(storageV2, 'Data2Set')
        .withArgs(alice.address, VALUE2);
    });
  });
  describe('setData1', async function () {
    it(`sets new value in storage`, async function () {
      await storageV2.connect(alice).setData1(VALUE2);
      expect(await storageV2.connect(alice).getData1()).to.equal(VALUE2);
    });
    it(`emits Data1Set event`, async function () {
      await expect(storageV2.connect(alice).setData1(VALUE2))
        .to.emit(storageV2, 'Data1Set')
        .withArgs(alice.address, VALUE2);
    });
  });
  describe('version', async function () {
    it(`sets version v2`, async function () {
      expect(await storageV2.version()).to.equal('v2.0');
    });
  });
});
