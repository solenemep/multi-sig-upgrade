const { ethers, upgrades } = require('hardhat');
const { deployed } = require('./deployed');
const { getContract } = require('./getContract');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const StorageV1Address = await getContract('StorageV1', hre.network.name);

  StorageV2 = await ethers.getContractFactory('StorageV2');
  storageV2 = await upgrades.upgradeProxy(StorageV1Address, StorageV2);
  await storageV2.deployed();

  await deployed('StorageV2', hre.network.name, StorageV2.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
