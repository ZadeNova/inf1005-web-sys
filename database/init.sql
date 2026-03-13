-- =============================================================
-- Vapour FT — Database Schema
-- init.sql is auto-run by MySQL on first container start
-- =============================================================

CREATE DATABASE IF NOT EXISTS vapourft
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE vapourft;

-- =============================================================
-- USERS
-- Managed by delight-im/PHP-Auth — do NOT rename core columns
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
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- WALLETS
-- One wallet per user, created at registration
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
-- Double-entry audit log — every balance mutation recorded here
-- =============================================================
CREATE TABLE IF NOT EXISTS wallet_ledger (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED        NOT NULL,
    transaction_ref VARCHAR(64)         NOT NULL,           -- links debit + credit for same trade
    type            ENUM('credit', 'debit') NOT NULL,
    amount          DECIMAL(10, 2)      NOT NULL,
    balance_before  DECIMAL(10, 2)      NOT NULL,
    balance_after   DECIMAL(10, 2)      NOT NULL,
    reason          VARCHAR(128)        NOT NULL,           -- e.g. 'purchase', 'sale', 'deposit'
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_ledger_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- ASSETS
-- The catalog of tradeable in-game items (admin-managed)
-- =============================================================
CREATE TABLE IF NOT EXISTS assets (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    name            VARCHAR(128)        NOT NULL,
    description     TEXT                NULL,
    image_url       VARCHAR(512)        NULL,
    rarity          ENUM('Common', 'Rare', 'Legendary') NOT NULL DEFAULT 'Common',
    collection      VARCHAR(64)         NULL,               -- e.g. 'Season 1', 'Founders Pack'
    condition_state ENUM('Mint', 'Used') NOT NULL DEFAULT 'Mint',
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- USER INVENTORY
-- Tracks which user owns which asset
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
-- Active sell listings on the marketplace
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
-- Completed buy/sell events — the source of truth for price history
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
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_blog_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- SEED DATA
-- Admin user (password: Admin1234! — bcrypt hashed)
-- Regular test user (password: User1234! — bcrypt hashed)
-- =============================================================
INSERT INTO users (email, password, username, role, verified) VALUES
(
    'admin@vapourft.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- replace with real hash
    'admin',
    'admin',
    1
),
(
    'user@vapourft.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- replace with real hash
    'testuser',
    'user',
    1
);

-- Wallets for seed users (user IDs 1 and 2)
INSERT INTO wallets (user_id, balance) VALUES
(1, 10000.00),
(2, 500.00);

-- Sample asset catalog
INSERT INTO assets (name, description, rarity, collection, condition_state) VALUES
('Ember Blade',       'A legendary sword forged in volcanic fire.',     'Legendary', 'Season 1', 'Mint'),
('Shadow Hood',       'Rare stealth armor worn by elite scouts.',       'Rare',      'Season 1', 'Mint'),
('Iron Buckler',      'A basic shield. Gets the job done.',             'Common',    'Season 1', 'Used'),
('Phantom Dagger',    'Strikes before you see it coming.',              'Rare',      'Season 1', 'Mint'),
('Founders Cape',     'Exclusive to early adopters. Highly sought.',    'Legendary', 'Founders', 'Mint'),
('Bronze Helm',       'Standard issue headgear for new recruits.',      'Common',    'Season 1', 'Used');

-- Give test user some inventory
INSERT INTO inventory (user_id, asset_id) VALUES
(2, 3),
(2, 6);
