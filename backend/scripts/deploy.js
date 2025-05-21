// scripts/deploy.js - Deploys the EnergyToken smart contract

const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    // Get the contract factory
    const EnergyToken = await ethers.getContractFactory("EnergyToken");

    // Deploy the contract
    const energyToken = await EnergyToken.deploy();
    await energyToken.deployed();

    console.log("EnergyToken deployed to:", energyToken.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });