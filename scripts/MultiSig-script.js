const hre = require('hardhat');

async function main() {
  const [deployer, dev, alice, bob, charlie] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  // We get the contract to deploy
  const MultiSig = await hre.ethers.getContractFactory('MultiSig');
  const multiSig = await MultiSig.deploy(dev.address, alice.address, bob.address, 36000);

  await multiSig.deployed();

  await deployed('MultiSig', hre.network.name, greeter.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
