// web3.js
const Web3 = require('web3');
require('dotenv').config();

// Use the RPC URL from your .env file or default to localhost Ganache instance
const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';

const web3 = new Web3(RPC_URL);

module.exports = web3;
