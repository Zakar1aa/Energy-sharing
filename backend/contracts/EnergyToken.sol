// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title EnergyToken
 * @dev A smart contract for managing energy as a tokenized asset.
 * Users can produce (mint), transfer, and check their energy balance.
 * The contract acts as a decentralized ledger for energy transactions.
 */
contract EnergyToken {
    address public owner; // Contract owner (admin)
    mapping(address => uint256) public balances; // Stores each user's energy balance

    // Event declarations
    event EnergyProduced(address indexed producer, uint256 amount);
    event EnergyTransferred(
        address indexed from,
        address indexed to,
        uint256 amount
    );

    /**
     * @dev Constructor sets the contract deployer as the owner.
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Function to produce (mint) energy tokens.
     * Only the producer (caller) can mint energy to their own balance.
     * @param _amount Amount of energy tokens to mint.
     */
    function produceEnergy(uint256 _amount) public {
        require(_amount > 0, "Amount must be greater than zero");
        balances[msg.sender] += _amount;
        emit EnergyProduced(msg.sender, _amount);
    }

    /**
     * @dev Function to transfer energy tokens from one user to another.
     * Ensures sender has enough balance before transfer.
     * @param _to Address of the recipient.
     * @param _amount Amount of energy tokens to transfer.
     */
    function transferEnergy(address _to, uint256 _amount) public {
        require(_to != address(0), "Cannot transfer to zero address");
        require(_amount > 0, "Amount must be greater than zero");
        require(balances[msg.sender] >= _amount, "Insufficient balance");

        balances[msg.sender] -= _amount;
        balances[_to] += _amount;

        emit EnergyTransferred(msg.sender, _to, _amount);
    }

    /**
     * @dev Function to check the energy balance of a user.
     * @param _user Address of the user.
     * @return The energy balance of the user.
     */
    function getBalance(address _user) public view returns (uint256) {
        return balances[_user];
    }
}
