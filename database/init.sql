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
-- admin    → id 1 | password: Admin1234!
-- testuser → id 2 | password: User1234!
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

-- ── Wallets ───────────────────────────────────────────────────────────────
INSERT INTO wallets (user_id, balance) VALUES
(1, 10000.00),
(2, 500.00);

-- ── Wallet ledger — record the starting balances as seed deposits ─────────
-- Without these rows the ledger is empty for seed accounts, which looks
-- wrong on the dashboard and breaks the audit trail assumption.
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason) VALUES
(1, 'SEED-ADMIN-001', 'credit', 10000.00, 0.00, 10000.00, 'seed_deposit'),
(2, 'SEED-USER-001',  'credit',   500.00, 0.00,   500.00, 'seed_deposit');

-- ── Asset catalog ─────────────────────────────────────────────────────────
-- IDs 1–6 are the original six. IDs 7–14 are new additions.
-- Covering all three rarities and both conditions so the filter UI
-- has something to actually filter.
INSERT INTO assets (name, description, rarity, collection, condition_state) VALUES
-- Season 1 originals
('Ember Blade',       'A legendary sword forged in volcanic fire.',          'Legendary', 'Season 1', 'Mint'),
('Shadow Hood',       'Rare stealth armor worn by elite scouts.',            'Rare',      'Season 1', 'Mint'),
('Iron Buckler',      'A basic shield. Gets the job done.',                  'Common',    'Season 1', 'Used'),
('Phantom Dagger',    'Strikes before you see it coming.',                   'Rare',      'Season 1', 'Mint'),
('Founders Cape',     'Exclusive to early adopters. Highly sought after.',   'Legendary', 'Founders', 'Mint'),
('Bronze Helm',       'Standard issue headgear for new recruits.',           'Common',    'Season 1', 'Used'),
-- Season 2 additions
('Void Katana',       'Forged in a collapsing star. One of three ever made.','Legendary', 'Season 2', 'Mint'),
('Storm Gauntlets',   'Channel lightning through your fists.',               'Rare',      'Season 2', 'Mint'),
('Cracked Visor',     'Seen better days, but still blocks bullets.',         'Common',    'Season 2', 'Used'),
('Ashen Cloak',       'Renders the wearer almost invisible in smoke.',       'Rare',      'Season 2', 'Mint'),
-- Founders Pack additions
('Founders Blade',    'Twin to the Founders Cape. Extremely rare.',          'Legendary', 'Founders', 'Mint'),
('Neon Wraps',        'Glowing hand wraps from the first tournament.',       'Rare',      'Founders', 'Mint'),
-- Common filler — realistic marketplace has plenty of cheap commons
('Dented Canteen',    'Holds water. Usually.',                               'Common',    'Season 1', 'Used'),
('Worn Boot Knife',   'Every soldier carries one. Most never use it.',       'Common',    'Season 2', 'Used');

-- ── Inventory ─────────────────────────────────────────────────────────────
-- Rule: a listing can only exist if the seller owns the asset.
-- Assign inventory first, then listings reference these exact assets.

-- admin (user 1) owns high-value items
INSERT INTO inventory (user_id, asset_id) VALUES
(1, 1),   -- admin owns Ember Blade
(1, 5),   -- admin owns Founders Cape
(1, 7),   -- admin owns Void Katana
(1, 11),  -- admin owns Founders Blade
(1, 12),  -- admin owns Neon Wraps
(1, 8);   -- admin owns Storm Gauntlets

-- testuser (user 2) owns a mix
INSERT INTO inventory (user_id, asset_id) VALUES
(2, 2),   -- testuser owns Shadow Hood
(2, 3),   -- testuser owns Iron Buckler
(2, 4),   -- testuser owns Phantom Dagger
(2, 6),   -- testuser owns Bronze Helm
(2, 9),   -- testuser owns Cracked Visor
(2, 10);  -- testuser owns Ashen Cloak

-- ── Listings ──────────────────────────────────────────────────────────────
-- Only list assets the seller actually owns (matches business logic).
-- Mix of price points across all rarities — gives the sort/filter
-- UI real data to work with.

-- admin's active listings (seller_id = 1)
INSERT INTO listings (seller_id, asset_id, price, status) VALUES
(1, 7,  899.99, 'active'),   -- Void Katana
(1, 11, 450.00, 'active'),   -- Founders Blade
(1, 12,  89.99, 'active'),   -- Neon Wraps
(1, 8,   65.00, 'active');   -- Storm Gauntlets

-- testuser's active listings (seller_id = 2)
INSERT INTO listings (seller_id, asset_id, price, status) VALUES
(2, 4,  45.00, 'active'),    -- Phantom Dagger
(2, 10, 78.50, 'active'),    -- Ashen Cloak
(2, 9,   4.99, 'active'),    -- Cracked Visor
(2, 2,  55.00, 'active');    -- Shadow Hood

-- ── Completed transactions — price history ────────────────────────────────
-- These represent past trades that already happened before the app launched.
-- They populate the transactions table so price charts have data on first load.
-- The listing_id references must point to valid listings — we use the IDs
-- inserted above. Active listings are IDs 1–8, so we add closed ones first.

-- Insert some historical sold listings to reference in transactions
INSERT INTO listings (seller_id, asset_id, price, status) VALUES
(1, 5,  320.00, 'sold'),     -- listing id 9:  Founders Cape sold by admin
(2, 3,    8.00, 'sold'),     -- listing id 10: Iron Buckler sold by testuser
(1, 1, 1200.00, 'sold');     -- listing id 11: Ember Blade sold by admin

-- Transactions that consumed those listings
-- buyer_id must differ from seller_id (enforced by executePurchase,
-- modelled correctly here for consistency)
INSERT INTO transactions (listing_id, buyer_id, seller_id, asset_id, price) VALUES
(9,  2, 1, 5,  320.00),   -- testuser bought Founders Cape from admin
(10, 1, 2, 3,    8.00),   -- admin bought Iron Buckler from testuser
(11, 2, 1, 1, 1200.00);   -- testuser bought Ember Blade from admin

-- Fix ownership to match the transaction history above:
-- After these trades, Founders Cape and Ember Blade belong to testuser,
-- Iron Buckler belongs to admin.
-- The inventory inserts above gave admin asset 1 and testuser asset 3 —
-- update those to reflect the completed trades.
UPDATE inventory SET user_id = 2 WHERE user_id = 1 AND asset_id = 1;  -- Ember Blade → testuser
UPDATE inventory SET user_id = 2 WHERE user_id = 1 AND asset_id = 5;  -- Founders Cape → testuser
UPDATE inventory SET user_id = 1 WHERE user_id = 2 AND asset_id = 3;  -- Iron Buckler → admin

-- ── Wallet ledger — reflect the completed transactions ────────────────────
-- These entries are what the dashboard ledger view will show for seed accounts.
-- Each transaction produces one debit and one credit sharing a transaction_ref.

-- Transaction 1: testuser (2) bought Founders Cape for $320 from admin (1)
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason) VALUES
(2, 'SEED-TXN-001', 'debit',  320.00, 500.00,  180.00, 'purchase:Founders Cape'),
(1, 'SEED-TXN-001', 'credit', 320.00, 10000.00, 10320.00, 'sale:Founders Cape');

-- Transaction 2: admin (1) bought Iron Buckler for $8 from testuser (2)
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason) VALUES
(1, 'SEED-TXN-002', 'debit',   8.00, 10320.00, 10312.00, 'purchase:Iron Buckler'),
(2, 'SEED-TXN-002', 'credit',  8.00,   180.00,   188.00, 'sale:Iron Buckler');

-- Transaction 3: testuser (2) bought Ember Blade for $1200 from admin (1)
-- testuser's balance: 188.00 - 1200 would go negative, so we top up first
-- (in reality they'd have deposited — seed data doesn't have to be perfectly
-- realistic, but the running balance must not go negative in the ledger)
UPDATE wallets SET balance = 500.00 WHERE user_id = 2;

INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason) VALUES
(2, 'SEED-TXN-003-TOP', 'credit', 1312.00, 188.00, 1500.00, 'seed_topup'),
(2, 'SEED-TXN-003', 'debit',  1200.00, 1500.00,  300.00, 'purchase:Ember Blade'),
(1, 'SEED-TXN-003', 'credit', 1200.00, 10312.00, 11512.00, 'sale:Ember Blade');

-- Set final wallet balances to match the ledger trail
UPDATE wallets SET balance = 11512.00 WHERE user_id = 1;
UPDATE wallets SET balance =   300.00 WHERE user_id = 2;