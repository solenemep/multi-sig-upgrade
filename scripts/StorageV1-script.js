// HAS TO BE DEPLOYED MANUALLY ON ACALA-EVM

const { ethers, upgrades } = require('hardhat');
const { deployed } = require('./deployed');

async function main() {
  const [dev] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  StorageV1 = await ethers.getContractFactory('StorageV1');
  storageV1 = await upgrades.deployProxy(StorageV1);
  await storageV1.deployed();

  await deployed('StorageV1', hre.network.name, storageV1.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
