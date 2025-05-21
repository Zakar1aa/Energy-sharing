CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(255),
  created_a DATETIME
);



CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    balance DECIMAL(18, 8) DEFAULT 0.0,  -- Stores energy token balance
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE energy_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    tx_hash VARCHAR(255) UNIQUE NOT NULL,  -- Blockchain transaction hash
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE smart_contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_address VARCHAR(255) UNIQUE NOT NULL,
    owner_id INT NOT NULL,  -- User who deployed the contract
    deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE energy_production (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    produced_amount DECIMAL(18, 8) NOT NULL,
    stored_amount DECIMAL(18, 8) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE energy_consumption (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    consumed_amount DECIMAL(18, 8) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE payment_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,  -- E.g., crypto, PayPal, card
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- Store hashed passwords
    role ENUM('superadmin', 'moderator') DEFAULT 'moderator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_energy_tx ON energy_transactions(tx_hash);
