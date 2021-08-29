const { deployContract } = require('ethereum-waffle');
const StorageAbi = require('../build/StorageAbi.json');
const { TestAccountSigningKey, Provider, Signer } = require('@acala-network/bodhi');
const { WsProvider } = require('@polkadot/api');
const { createTestPairs } = require('@polkadot/keyring/testingPairs');

async function main() {
  const provider = new Provider({
    provider: new WsProvider('ws://127.0.0.1:9944'),
  });

  const testPairs = createTestPairs();

  const signingKey = new TestAccountSigningKey(provider.api.registry);

  signingKey.addKeyringPair(Object.values(testPairs));

  const wallet = new Signer(provider, testPairs.alice.address, signingKey);

  const storage = await deployContract(master, StorageAbi, [1000]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
