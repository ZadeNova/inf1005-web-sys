-- =============================================================
-- Vapour FT — Database Schema (FIXED)
-- FIX: assets.rarity ENUM updated from 3-tier to 5-tier system
--      to match frontend RARITY constants exactly.
-- FIX: assets.condition_state ENUM updated to match frontend CONDITION constants.
-- FIX: Seed assets now use correct rarity tiers.
-- =============================================================

CREATE DATABASE IF NOT EXISTS vapourft
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE vapourft;

-- =============================================================
-- USERS
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    email           VARCHAR(249)    NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    username        VARCHAR(48)     NOT NULL UNIQUE,
    role            ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    verified        TINYINT(1)      NOT NULL DEFAULT 0,
    registered_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at   DATETIME        NULL,
    bio             VARCHAR(150)    NULL DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- WALLETS
-- =============================================================
CREATE TABLE IF NOT EXISTS wallets (
    id          INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED        NOT NULL UNIQUE,
    balance     DECIMAL(10, 2)      NOT NULL DEFAULT 0.00,
    updated_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- WALLET LEDGER
-- =============================================================
CREATE TABLE IF NOT EXISTS wallet_ledger (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED        NOT NULL,
    transaction_ref VARCHAR(64)         NOT NULL,
    type            ENUM('credit', 'debit') NOT NULL,
    amount          DECIMAL(10, 2)      NOT NULL,
    balance_before  DECIMAL(10, 2)      NOT NULL,
    balance_after   DECIMAL(10, 2)      NOT NULL,
    reason          VARCHAR(128)        NOT NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_ledger_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- ASSETS
-- FIX: rarity ENUM now uses 5-tier system matching frontend RARITY constants
-- FIX: condition_state ENUM now matches frontend CONDITION constants
-- =============================================================
CREATE TABLE IF NOT EXISTS assets (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    name            VARCHAR(128)        NOT NULL,
    description     TEXT                NULL,
    image_url       VARCHAR(512)        NULL,
    rarity          ENUM('COMMON', 'UNCOMMON', 'RARE', 'ULTRA_RARE', 'SECRET_RARE')
                    NOT NULL DEFAULT 'COMMON',
    collection      VARCHAR(64)         NULL,
    condition_state ENUM('Mint', 'Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played')
                    NOT NULL DEFAULT 'Mint',
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- USER INVENTORY
-- =============================================================
CREATE TABLE IF NOT EXISTS inventory (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED    NOT NULL,
    asset_id    INT UNSIGNED    NOT NULL,
    acquired_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_inventory_user  FOREIGN KEY (user_id)  REFERENCES users (id)  ON DELETE CASCADE,
    CONSTRAINT fk_inventory_asset FOREIGN KEY (asset_id) REFERENCES assets (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- LISTINGS
-- =============================================================
CREATE TABLE IF NOT EXISTS listings (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    seller_id       INT UNSIGNED        NOT NULL,
    asset_id        INT UNSIGNED        NOT NULL,
    price           DECIMAL(10, 2)      NOT NULL,
    status          ENUM('active', 'sold', 'cancelled') NOT NULL DEFAULT 'active',
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_listings_seller FOREIGN KEY (seller_id) REFERENCES users (id)  ON DELETE CASCADE,
    CONSTRAINT fk_listings_asset  FOREIGN KEY (asset_id)  REFERENCES assets (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TRANSACTIONS
-- =============================================================
CREATE TABLE IF NOT EXISTS transactions (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    listing_id      INT UNSIGNED        NOT NULL,
    buyer_id        INT UNSIGNED        NOT NULL,
    seller_id       INT UNSIGNED        NOT NULL,
    asset_id        INT UNSIGNED        NOT NULL,
    price           DECIMAL(10, 2)      NOT NULL,
    completed_at    DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_tx_listing FOREIGN KEY (listing_id) REFERENCES listings (id),
    CONSTRAINT fk_tx_buyer   FOREIGN KEY (buyer_id)   REFERENCES users (id),
    CONSTRAINT fk_tx_seller  FOREIGN KEY (seller_id)  REFERENCES users (id),
    CONSTRAINT fk_tx_asset   FOREIGN KEY (asset_id)   REFERENCES assets (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- BLOG POSTS
-- =============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    author_id   INT UNSIGNED    NOT NULL,
    title       VARCHAR(255)    NOT NULL,
    body        TEXT            NOT NULL,
    category    VARCHAR(64)     NULL DEFAULT 'Market Update',
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_blog_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- SEED DATA
-- =============================================================

INSERT INTO users (email, password, username, role, verified) VALUES
(
    'admin@vapourft.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    'admin',
    1
),
(
    'user@vapourft.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'testuser',
    'user',
    1
);

INSERT INTO wallets (user_id, balance) VALUES
(1, 10000.00),
(2, 500.00);

INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason) VALUES
(1, 'SEED-ADMIN-001', 'credit', 10000.00, 0.00, 10000.00, 'seed_deposit'),
(2, 'SEED-USER-001',  'credit',   500.00, 0.00,   500.00, 'seed_deposit');

-- =============================================================
-- SEED ASSETS — using correct 5-tier rarity + full condition values
-- Rarities:   COMMON | UNCOMMON | RARE | ULTRA_RARE | SECRET_RARE
-- Conditions: Mint | Near Mint | Lightly Played | Moderately Played | Heavily Played
-- =============================================================
INSERT INTO assets (name, description, rarity, collection, condition_state) VALUES
('Ember Blade',       'A legendary sword forged in volcanic fire.',          'ULTRA_RARE',  'Season 1', 'Mint'),
('Shadow Hood',       'Rare stealth armor worn by elite scouts.',            'RARE',        'Season 1', 'Mint'),
('Iron Buckler',      'A basic shield. Gets the job done.',                  'COMMON',      'Season 1', 'Lightly Played'),
('Phantom Dagger',    'Strikes before you see it coming.',                   'RARE',        'Season 1', 'Mint'),
('Founders Cape',     'Exclusive to early adopters. Highly sought after.',   'SECRET_RARE', 'Founders', 'Mint'),
('Bronze Helm',       'Standard issue headgear for new recruits.',           'COMMON',      'Season 1', 'Moderately Played'),
('Void Katana',       'Forged in a collapsing star. One of three ever made.','SECRET_RARE', 'Season 2', 'Mint'),
('Storm Gauntlets',   'Channel lightning through your fists.',               'ULTRA_RARE',  'Season 2', 'Mint'),
('Cracked Visor',     'Seen better days, but still blocks bullets.',         'COMMON',      'Season 2', 'Heavily Played'),
('Ashen Cloak',       'Renders the wearer almost invisible in smoke.',       'RARE',        'Season 2', 'Mint'),
('Founders Blade',    'Twin to the Founders Cape. Extremely rare.',          'SECRET_RARE', 'Founders', 'Mint'),
('Neon Wraps',        'Glowing hand wraps from the first tournament.',       'UNCOMMON',    'Founders', 'Mint'),
('Dented Canteen',    'Holds water. Usually.',                               'COMMON',      'Season 1', 'Heavily Played'),
('Worn Boot Knife',   'Every soldier carries one. Most never use it.',       'COMMON',      'Season 2', 'Heavily Played');

INSERT INTO inventory (user_id, asset_id) VALUES
(1, 1),(1, 5),(1, 7),(1, 11),(1, 12),(1, 8);

INSERT INTO inventory (user_id, asset_id) VALUES
(2, 2),(2, 3),(2, 4),(2, 6),(2, 9),(2, 10);

INSERT INTO listings (seller_id, asset_id, price, status) VALUES
(1, 7,  899.99, 'active'),
(1, 11, 450.00, 'active'),
(1, 12,  89.99, 'active'),
(1, 8,   65.00, 'active');

INSERT INTO listings (seller_id, asset_id, price, status) VALUES
(2, 4,  45.00, 'active'),
(2, 10, 78.50, 'active'),
(2, 9,   4.99, 'active'),
(2, 2,  55.00, 'active');

INSERT INTO listings (seller_id, asset_id, price, status) VALUES
(1, 5,  320.00, 'sold'),
(2, 3,    8.00, 'sold'),
(1, 1, 1200.00, 'sold');

INSERT INTO transactions (listing_id, buyer_id, seller_id, asset_id, price) VALUES
(9,  2, 1, 5,  320.00),
(10, 1, 2, 3,    8.00),
(11, 2, 1, 1, 1200.00);

UPDATE inventory SET user_id = 2 WHERE user_id = 1 AND asset_id = 1;
UPDATE inventory SET user_id = 2 WHERE user_id = 1 AND asset_id = 5;
UPDATE inventory SET user_id = 1 WHERE user_id = 2 AND asset_id = 3;

INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason) VALUES
(2, 'SEED-TXN-001', 'debit',  320.00, 500.00,   180.00, 'purchase:Founders Cape'),
(1, 'SEED-TXN-001', 'credit', 320.00, 10000.00, 10320.00, 'sale:Founders Cape');

INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason) VALUES
(1, 'SEED-TXN-002', 'debit',   8.00, 10320.00, 10312.00, 'purchase:Iron Buckler'),
(2, 'SEED-TXN-002', 'credit',  8.00,   180.00,   188.00, 'sale:Iron Buckler');

UPDATE wallets SET balance = 500.00 WHERE user_id = 2;

INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason) VALUES
(2, 'SEED-TXN-003-TOP', 'credit', 1312.00, 188.00, 1500.00, 'seed_topup'),
(2, 'SEED-TXN-003', 'debit',  1200.00, 1500.00,  300.00, 'purchase:Ember Blade'),
(1, 'SEED-TXN-003', 'credit', 1200.00, 10312.00, 11512.00, 'sale:Ember Blade');

UPDATE wallets SET balance = 11512.00 WHERE user_id = 1;
UPDATE wallets SET balance =   300.00 WHERE user_id = 2;