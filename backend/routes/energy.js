// routes/energy.js

require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");
const { NonceManager } = require("@ethersproject/experimental");
const router = express.Router();

// ─── on-chain setup ────────────────────────────────────────────────────────────
const provider = new ethers.providers.JsonRpcProvider(
  process.env.BLOCKCHAIN_RPC_URL
);

const contractAddress = process.env.ENERGY_TOKEN_ADDRESS;
const abi = [
  "function produceEnergy(uint256) external",
  "function transferEnergy(address,uint256) external",
  "function balances(address) view returns (uint256)"
];

// Load your four PKs from .env
const PRIVATE_KEYS = {
  prosumer1: process.env.PK_PROSUMER1,
  prosumer2: process.env.PK_PROSUMER2,
  prosumer3: process.env.PK_PROSUMER3,
  prosumer4: process.env.PK_PROSUMER4,
};

// Build one Nonce-managed signer + contract per prosumer at startup
const signers   = {};
const contracts = {};
for (const [name, key] of Object.entries(PRIVATE_KEYS)) {
  if (!key) throw new Error(`Missing .env key for ${name}`);
  // 1) create a wallet
  const wallet = new ethers.Wallet(key, provider);
  // 2) wrap it so it auto-increments its nonce on every tx
  const nm = new NonceManager(wallet);
  signers[name] = nm;
  // 3) and bind the contract to it
  contracts[name] = new ethers.Contract(contractAddress, abi, nm);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function validateAmount(amount) {
  if (isNaN(amount) || Number(amount) <= 0) {
    const err = new Error("Invalid amount; must be a positive number.");
    err.status = 400;
    throw err;
  }
}

function getContract(name) {
  const c = contracts[name];
  if (!c) {
    const err = new Error(`Unknown prosumer: ${name}`);
    err.status = 400;
    throw err;
  }
  return c;
}

// ─── Produce endpoint ────────────────────────────────────────────────────────
router.post("/produce", async (req, res) => {
  try {
    const { prosumer, amount } = req.body;
    validateAmount(amount);

    const contract = getContract(prosumer);
    const parsed   = ethers.utils.parseUnits(amount.toString(), 18);

    // No manual nonce override; NonceManager will handle it
    const tx = await contract.produceEnergy(parsed);
    await tx.wait();

    res.json({ message: "Energy produced", transaction: tx.hash });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// ─── Transfer endpoint ───────────────────────────────────────────────────────
router.post("/transfer", async (req, res) => {
  try {
    const { prosumer, to, amount } = req.body;
    validateAmount(amount);
    if (!ethers.utils.isAddress(to)) {
      const err = new Error("Invalid recipient address");
      err.status = 400;
      throw err;
    }

    const contract = getContract(prosumer);
    const parsed   = ethers.utils.parseUnits(amount.toString(), 18);

    const tx = await contract.transferEnergy(to, parsed);
    await tx.wait();

    res.json({ message: "Energy transferred", transaction: tx.hash });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// ─── Balance endpoint ────────────────────────────────────────────────────────
router.get("/balance/:address", async (req, res) => {
  try {
    const addr = req.params.address;
    if (!ethers.utils.isAddress(addr)) {
      return res.status(400).json({ error: "Invalid address" });
    }
    // Use a read-only contract
    const readCtc = new ethers.Contract(contractAddress, abi, provider);
    const balBN   = await readCtc.balances(addr);
    const balance = ethers.utils.formatUnits(balBN, 18);
    res.json({ balance });
  } catch (e) {
    console.error("Error in getBalance:", e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
