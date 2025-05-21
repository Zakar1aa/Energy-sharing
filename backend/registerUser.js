'use strict';

const fs = require('fs');
const path = require('path');
const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');

async function main() {
  try {
    const ccpPath = path.resolve(__dirname, 'fabric', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(caInfo.url, {
      trustedRoots: caTLSCACerts,
      verify: false,
    }, caInfo.caName);

    const walletPath = path.join(__dirname, 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const enrollmentID = 'appUser2'; // NEW IDENTITY
    const userIdentity = await wallet.get(enrollmentID);
    if (userIdentity) {
      console.log(`✅ ${enrollmentID} already exists in wallet`);
      return;
    }

    const adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
      console.log('❌ Admin identity not found. Enroll admin first.');
      return;
    }

    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    // 🔁 Register
    const secret = await ca.register({
      affiliation: 'org1.department1',
      enrollmentID,
      role: 'client'
    }, adminUser);

    // ✅ Enroll
    const enrollment = await ca.enroll({
      enrollmentID,
      enrollmentSecret: secret
    });

    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: 'Org1MSP',
      type: 'X.509',
    };
    await wallet.put(enrollmentID, x509Identity);
    console.log(`✅ Successfully registered and enrolled ${enrollmentID}`);
  } catch (error) {
    console.error(`❌ Failed to register/enroll: ${error}`);
  }
}

main();
