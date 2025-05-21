// fabricClient.js
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function logAuction(buyerId, sellerId, amount, price, txHash) {
  try {
    const ccpPath = path.resolve(__dirname, 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const walletPath = path.join(__dirname, 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get('appUser');
    if (!identity) {
      throw new Error('Identity for appUser not found in wallet');
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'appUser2',
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('basic');

    const result = await contract.submitTransaction(
      'LogAuction',
      buyerId,
      sellerId,
      amount,
      price,
      txHash
    );

    await gateway.disconnect();
    return result.toString();

  } catch (error) {
    console.error('❌ Error in logAuction:', error);
    throw error;
  }
}

// ✅ EXPORT it correctly
module.exports = {
  logAuction
};
