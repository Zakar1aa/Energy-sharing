const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs'), path = require('path');
const router = express.Router();

// Load connection profile
 const ccp = JSON.parse(fs.readFileSync(
  path.resolve(
    __dirname,
    '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json'
  ),
  'utf8'
));

// Helper to get a contract instance for a given user
async function getContract(user) {
  const walletPath = path.resolve(__dirname, '../wallet/org1');
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: user,
    discovery: { enabled: true, asLocalhost: true }
  });

  const network = await gateway.getNetwork('mychannel');
  return network.getContract('energytoken');
}

// Produce Energy → CreateAsset
router.post('/produce', async (req, res) => {
  const { user, amount } = req.body;
  try {
    const contract = await getContract(user);
    await contract.submitTransaction('CreateAsset', user, amount.toString());
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transfer Energy → TransferAsset
router.post('/transfer', async (req, res) => {
  const { user, to, amount } = req.body;
  try {
    const contract = await getContract(user);
    // In asset-transfer-basic, assetID is the key—use user as key, amount as new value logic in your REST
    await contract.submitTransaction('TransferAsset', user, to);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Balance → ReadAsset
router.get('/balance/:user', async (req, res) => {
  const user = req.params.user;
  try {
    const contract = await getContract(user);
    const result = await contract.evaluateTransaction('ReadAsset', user);
    res.json({ balance: JSON.parse(result.toString()).Color }); // or adjust based on asset schema
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
