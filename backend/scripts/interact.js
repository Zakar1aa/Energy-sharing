// scripts/interact.js - Interacts with the deployed EnergyToken contract

const { ethers } = require("hardhat");
require("dotenv").config();

async function interact() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const walletAddress = "0xD9d9E14F45c519368b891c73cE59A76DDf3dFd25";
    const EnergyToken = await ethers.getContractFactory("EnergyToken");
    const energyToken = await EnergyToken.attach(contractAddress);

    // Example interaction: Minting energy tokens
    const mintTx = await energyToken.produceEnergy(100);
    await mintTx.wait();
    console.log("Minted 100 energy tokens");

    // Example: Checking balance
    const balance = await energyToken.getBalance(walletAddress);
    console.log("Balance:", balance.toString());
}

interact()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });