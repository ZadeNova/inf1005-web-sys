-- =============================================================
-- Vapour FT — Database Schema + Seed Data
-- Version: 5.1 (Expanded Listings & Transactions)
-- Password for all accounts: Password1
--   (8 chars, uppercase, lowercase, number — bcrypt $2b$10$)
--
-- Users:
--   ID 1  admin         (admin role  — no assets)
--   ID 2  prof_admin    (admin role  — no assets)
--   ID 3  testuser      (user role   — buyer/seller)
--   ID 4  shadowtrader  (user role   — buyer/seller)
--   ID 5  vaultkeeper   (user role   — buyer/seller)
-- =============================================================

CREATE DATABASE IF NOT EXISTS vapourft
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE vapourft;

-- =============================================================
-- TABLES
-- =============================================================

CREATE TABLE IF NOT EXISTS users (
    id              INT UNSIGNED         NOT NULL AUTO_INCREMENT,
    email           VARCHAR(249)         NOT NULL UNIQUE,
    password        VARCHAR(255)         NOT NULL,
    username        VARCHAR(48)          NOT NULL UNIQUE,
    role            ENUM('user','admin') NOT NULL DEFAULT 'user',
    verified        TINYINT(1)           NOT NULL DEFAULT 0,
    registered_at   DATETIME             NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at   DATETIME             NULL,
    bio             VARCHAR(150)         NULL DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wallets (
    id          INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED   NOT NULL UNIQUE,
    balance     DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wallet_ledger (
    id              INT UNSIGNED              NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED              NOT NULL,
    transaction_ref VARCHAR(64)               NOT NULL,
    type            ENUM('credit','debit')    NOT NULL,
    amount          DECIMAL(10,2)             NOT NULL,
    balance_before  DECIMAL(10,2)             NOT NULL,
    balance_after   DECIMAL(10,2)             NOT NULL,
    reason          VARCHAR(128)              NOT NULL,
    created_at      DATETIME                  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_ledger_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bank_accounts (
    id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    user_id        INT UNSIGNED  NOT NULL UNIQUE,
    bank_name      VARCHAR(64)   NOT NULL,
    account_number VARCHAR(34)   NOT NULL,
    holder_name    VARCHAR(128)  NOT NULL,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_bank_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assets (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    name            VARCHAR(128)    NOT NULL,
    description     TEXT            NULL,
    image_url       VARCHAR(512)    NULL,
    rarity          ENUM('COMMON','UNCOMMON','RARE','ULTRA_RARE','SECRET_RARE')
                    NOT NULL DEFAULT 'COMMON',
    collection      VARCHAR(64)     NULL,
    condition_state ENUM('Mint','Near Mint','Lightly Played','Moderately Played','Heavily Played')
                    NOT NULL DEFAULT 'Mint',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED  NOT NULL,
    asset_id    INT UNSIGNED  NOT NULL,
    acquired_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_inventory_user  FOREIGN KEY (user_id)  REFERENCES users (id)  ON DELETE CASCADE,
    CONSTRAINT fk_inventory_asset FOREIGN KEY (asset_id) REFERENCES assets (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS listings (
    id          INT UNSIGNED                          NOT NULL AUTO_INCREMENT,
    seller_id   INT UNSIGNED                          NOT NULL,
    asset_id    INT UNSIGNED                          NOT NULL,
    price       DECIMAL(10,2)                         NOT NULL,
    status      ENUM('active','sold','cancelled')     NOT NULL DEFAULT 'active',
    created_at  DATETIME                              NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME                              NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_listings_seller FOREIGN KEY (seller_id) REFERENCES users (id)  ON DELETE CASCADE,
    CONSTRAINT fk_listings_asset  FOREIGN KEY (asset_id)  REFERENCES assets (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transactions (
    id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    listing_id   INT UNSIGNED  NOT NULL,
    buyer_id     INT UNSIGNED  NOT NULL,
    seller_id    INT UNSIGNED  NOT NULL,
    asset_id     INT UNSIGNED  NOT NULL,
    price        DECIMAL(10,2) NOT NULL,
    completed_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_tx_listing FOREIGN KEY (listing_id) REFERENCES listings (id),
    CONSTRAINT fk_tx_buyer   FOREIGN KEY (buyer_id)   REFERENCES users (id),
    CONSTRAINT fk_tx_seller  FOREIGN KEY (seller_id)  REFERENCES users (id),
    CONSTRAINT fk_tx_asset   FOREIGN KEY (asset_id)   REFERENCES assets (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_posts (
    id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    author_id  INT UNSIGNED  NOT NULL,
    title      VARCHAR(255)  NOT NULL,
    body       TEXT          NOT NULL,
    category   VARCHAR(64)   NULL DEFAULT 'Market Update',
    created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_blog_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- INDEXES
-- =============================================================
ALTER TABLE listings      ADD INDEX idx_listings_status (status);
ALTER TABLE listings      ADD INDEX idx_listings_seller (seller_id);
ALTER TABLE listings      ADD INDEX idx_listings_asset  (asset_id);
ALTER TABLE transactions  ADD INDEX idx_tx_asset        (asset_id);
ALTER TABLE transactions  ADD INDEX idx_tx_buyer        (buyer_id);
ALTER TABLE transactions  ADD INDEX idx_tx_seller       (seller_id);
ALTER TABLE wallet_ledger ADD INDEX idx_ledger_user     (user_id);
ALTER TABLE inventory     ADD INDEX idx_inventory_user  (user_id);
ALTER TABLE inventory     ADD INDEX idx_inventory_asset (asset_id);

-- =============================================================
-- SEED: USERS
-- =============================================================
INSERT INTO users (email, password, username, role, verified, bio) VALUES
('admin@vapourft.com',        '$2b$10$tIQyJzBAyotcpaTF2mNFJeKw0pSVHnDGYajjF1.svoL.by1o7CQWa', 'admin',        'admin', 1, 'Platform administrator.'),
('prof@vapourft.com',         '$2b$10$cuZu0F.YRX219YBZyLB1fuVRjXhx6DYOOz7DAmvxuoT.qWslcTMta', 'prof_admin',   'admin', 1, 'Senior platform administrator.'),
('user@vapourft.com',         '$2b$10$Iw.mqdB3c1aItI0LD1twJ.egwNm63udVC2CLXqHtL2nTGpGe/ApKK', 'testuser',     'user',  1, 'Casual trader.'),
('shadowtrader@vapourft.com', '$2b$10$TiaWxC2l1OkVsbLece/1heUPTzeEgZzJDcSRQXDt61H/Q4bM1qiz2', 'shadowtrader', 'user',  1, 'Veteran skin collector.'),
('vaultkeeper@vapourft.com',  '$2b$10$Z.nXfZy9XgEqj/wBDBMDHerKXEf.2nXY2rKar1zlijg9BF91jfALS', 'vaultkeeper',  'user',  1, 'Long-term holder.');

-- =============================================================
-- SEED: WALLETS (placeholder — final balances set at bottom)
-- =============================================================
INSERT INTO wallets (user_id, balance) VALUES
(1, 0.00), (2, 0.00), (3, 0.00), (4, 0.00), (5, 0.00);

-- =============================================================
-- SEED: BANK ACCOUNTS
-- =============================================================
INSERT INTO bank_accounts (user_id, bank_name, account_number, holder_name) VALUES
(1, 'DBS Bank',  '0039-1234-5678', 'Admin Vapour'),
(2, 'POSB Bank', '1122-3344-5566', 'Prof Admin'),
(3, 'OCBC Bank', '5021-8765-4321', 'Test User'),
(4, 'UOB Bank',  '3087-2211-9900', 'Shadow Trader'),
(5, 'Citibank',  '7754-0012-3388', 'Vault Keeper');

-- =============================================================
-- SEED: ASSETS (92 rows)
-- =============================================================
INSERT INTO assets (name, description, image_url, rarity, collection, condition_state) VALUES
('Infinite Striker SS', 'A relentless SMG with chrome trim and neon highlights.', '/images/assets/smg/Infinite Striker SS/Mint.png',             'ULTRA_RARE', 'Shadowfall', 'Mint'),
('Infinite Striker SS', 'A relentless SMG with chrome trim and neon highlights.', '/images/assets/smg/Infinite Striker SS/Near Mint.png',        'ULTRA_RARE', 'Shadowfall', 'Near Mint'),
('Infinite Striker SS', 'A relentless SMG with chrome trim and neon highlights.', '/images/assets/smg/Infinite Striker SS/Lightly Played.png',   'ULTRA_RARE', 'Shadowfall', 'Lightly Played'),
('Infinite Striker SS', 'A relentless SMG with chrome trim and neon highlights.', '/images/assets/smg/Infinite Striker SS/Moderately Played.png','ULTRA_RARE', 'Shadowfall', 'Moderately Played'),
('Infinite Striker SS', 'A relentless SMG with chrome trim and neon highlights.', '/images/assets/smg/Infinite Striker SS/Heavily Played.png',   'ULTRA_RARE', 'Shadowfall', 'Heavily Played'),
('Mirage Dunes MP9', 'Desert-pattern MP9 built for hot climate operations.', '/images/assets/smg/Mirage Dunes MP9/Mint.png',              'RARE', 'Shadowfall', 'Mint'),
('Mirage Dunes MP9', 'Desert-pattern MP9 built for hot climate operations.', '/images/assets/smg/Mirage Dunes MP9/Near_Mint.png',         'RARE', 'Shadowfall', 'Near Mint'),
('Mirage Dunes MP9', 'Desert-pattern MP9 built for hot climate operations.', '/images/assets/smg/Mirage Dunes MP9/Lightly_Played.png',    'RARE', 'Shadowfall', 'Lightly Played'),
('Mirage Dunes MP9', 'Desert-pattern MP9 built for hot climate operations.', '/images/assets/smg/Mirage Dunes MP9/Moderately_Played.png', 'RARE', 'Shadowfall', 'Moderately Played'),
('Mirage Dunes MP9', 'Desert-pattern MP9 built for hot climate operations.', '/images/assets/smg/Mirage Dunes MP9/Heavily_Played.png',    'RARE', 'Shadowfall', 'Heavily Played'),
('Phantom P7', 'Ghostly silhouette finish. Spotted in three conflict zones.', '/images/assets/smg/Phantom P7/Mint.png',             'UNCOMMON', 'Shadowfall', 'Mint'),
('Phantom P7', 'Ghostly silhouette finish. Spotted in three conflict zones.', '/images/assets/smg/Phantom P7/Near Mint.png',        'UNCOMMON', 'Shadowfall', 'Near Mint'),
('Phantom P7', 'Ghostly silhouette finish. Spotted in three conflict zones.', '/images/assets/smg/Phantom P7/Lightly Played.png',   'UNCOMMON', 'Shadowfall', 'Lightly Played'),
('Phantom P7', 'Ghostly silhouette finish. Spotted in three conflict zones.', '/images/assets/smg/Phantom P7/Moderately Played.png','UNCOMMON', 'Shadowfall', 'Moderately Played'),
('Phantom P7', 'Ghostly silhouette finish. Spotted in three conflict zones.', '/images/assets/smg/Phantom P7/Heavily Played.png',   'UNCOMMON', 'Shadowfall', 'Heavily Played'),
('Rustfang MAC-10', 'Weathered MAC-10 with a bite. Favoured by scrapyard runners.', '/images/assets/smg/Rustfang MAC-10/Mint.png',              'COMMON', 'Shadowfall', 'Mint'),
('Rustfang MAC-10', 'Weathered MAC-10 with a bite. Favoured by scrapyard runners.', '/images/assets/smg/Rustfang MAC-10/Near_Mint.png',         'COMMON', 'Shadowfall', 'Near Mint'),
('Rustfang MAC-10', 'Weathered MAC-10 with a bite. Favoured by scrapyard runners.', '/images/assets/smg/Rustfang MAC-10/Lightly_Played.png',    'COMMON', 'Shadowfall', 'Lightly Played'),
('Rustfang MAC-10', 'Weathered MAC-10 with a bite. Favoured by scrapyard runners.', '/images/assets/smg/Rustfang MAC-10/Moderately_Played.png', 'COMMON', 'Shadowfall', 'Moderately Played'),
('Rustfang MAC-10', 'Weathered MAC-10 with a bite. Favoured by scrapyard runners.', '/images/assets/smg/Rustfang MAC-10/Heavily_Played.png',    'COMMON', 'Shadowfall', 'Heavily Played'),
('Chroma Blaster', 'Full-spectrum paint job on a pump action. Loud in every sense.', '/images/assets/shotgun/Chroma Blaster/Mint.png',             'RARE', 'Shadowfall', 'Mint'),
('Chroma Blaster', 'Full-spectrum paint job on a pump action. Loud in every sense.', '/images/assets/shotgun/Chroma Blaster/Near Mint.png',        'RARE', 'Shadowfall', 'Near Mint'),
('Chroma Blaster', 'Full-spectrum paint job on a pump action. Loud in every sense.', '/images/assets/shotgun/Chroma Blaster/Lightly Played.png',   'RARE', 'Shadowfall', 'Lightly Played'),
('Chroma Blaster', 'Full-spectrum paint job on a pump action. Loud in every sense.', '/images/assets/shotgun/Chroma Blaster/Moderately Played.png','RARE', 'Shadowfall', 'Moderately Played'),
('Chroma Blaster', 'Full-spectrum paint job on a pump action. Loud in every sense.', '/images/assets/shotgun/Chroma Blaster/Heavily Played.png',   'RARE', 'Shadowfall', 'Heavily Played'),
('SpaceShooter X', 'Galactic decal series. Zero-gravity tested, atmosphere approved.', '/images/assets/shotgun/SpaceShooter X/Mint.png',             'UNCOMMON', 'Shadowfall', 'Mint'),
('SpaceShooter X', 'Galactic decal series. Zero-gravity tested, atmosphere approved.', '/images/assets/shotgun/SpaceShooter X/Near Mint.png',        'UNCOMMON', 'Shadowfall', 'Near Mint'),
('SpaceShooter X', 'Galactic decal series. Zero-gravity tested, atmosphere approved.', '/images/assets/shotgun/SpaceShooter X/Lightly Played.png',   'UNCOMMON', 'Shadowfall', 'Lightly Played'),
('SpaceShooter X', 'Galactic decal series. Zero-gravity tested, atmosphere approved.', '/images/assets/shotgun/SpaceShooter X/Moderately Played.png','UNCOMMON', 'Shadowfall', 'Moderately Played'),
('SpaceShooter X', 'Galactic decal series. Zero-gravity tested, atmosphere approved.', '/images/assets/shotgun/SpaceShooter X/Heavily Played.png',   'UNCOMMON', 'Shadowfall', 'Heavily Played'),
('Epic Ranger III', 'Third gen precision rifle. Hits harder than its predecessors.', '/images/assets/sniper_rifle/Epic Ranger III/Mint.png',             'ULTRA_RARE', 'Shadowfall', 'Mint'),
('Epic Ranger III', 'Third gen precision rifle. Hits harder than its predecessors.', '/images/assets/sniper_rifle/Epic Ranger III/Near Mint.png',        'ULTRA_RARE', 'Shadowfall', 'Near Mint'),
('Epic Ranger III', 'Third gen precision rifle. Hits harder than its predecessors.', '/images/assets/sniper_rifle/Epic Ranger III/Lightly Played.png',   'ULTRA_RARE', 'Shadowfall', 'Lightly Played'),
('Epic Ranger III', 'Third gen precision rifle. Hits harder than its predecessors.', '/images/assets/sniper_rifle/Epic Ranger III/Moderately Played.png','ULTRA_RARE', 'Shadowfall', 'Moderately Played'),
('Epic Ranger III', 'Third gen precision rifle. Hits harder than its predecessors.', '/images/assets/sniper_rifle/Epic Ranger III/Heavily Played.png',   'ULTRA_RARE', 'Shadowfall', 'Heavily Played'),
('Glacial Trace AWP', 'Ice-blue fade AWP. One of the most coveted skins in the collection.', '/images/assets/sniper_rifle/Glacial Trace AWP/Mint.png',              'SECRET_RARE', 'Shadowfall', 'Mint'),
('Glacial Trace AWP', 'Ice-blue fade AWP. One of the most coveted skins in the collection.', '/images/assets/sniper_rifle/Glacial Trace AWP/Near_Mint.png',         'SECRET_RARE', 'Shadowfall', 'Near Mint'),
('Glacial Trace AWP', 'Ice-blue fade AWP. One of the most coveted skins in the collection.', '/images/assets/sniper_rifle/Glacial Trace AWP/Lightly_Played.png',    'SECRET_RARE', 'Shadowfall', 'Lightly Played'),
('Glacial Trace AWP', 'Ice-blue fade AWP. One of the most coveted skins in the collection.', '/images/assets/sniper_rifle/Glacial Trace AWP/Moderately_Played.png', 'SECRET_RARE', 'Shadowfall', 'Moderately Played'),
('Glacial Trace AWP', 'Ice-blue fade AWP. One of the most coveted skins in the collection.', '/images/assets/sniper_rifle/Glacial Trace AWP/Heavily_Played.png',    'SECRET_RARE', 'Shadowfall', 'Heavily Played'),
('Venom Striker V2', 'Serpent-scale pattern. The V2 improves on an already lethal design.', '/images/assets/sniper_rifle/Venom Striker V2/Mint.png',             'RARE', 'Shadowfall', 'Mint'),
('Venom Striker V2', 'Serpent-scale pattern. The V2 improves on an already lethal design.', '/images/assets/sniper_rifle/Venom Striker V2/Near Mint.png',        'RARE', 'Shadowfall', 'Near Mint'),
('Venom Striker V2', 'Serpent-scale pattern. The V2 improves on an already lethal design.', '/images/assets/sniper_rifle/Venom Striker V2/Lightly Played.png',   'RARE', 'Shadowfall', 'Lightly Played'),
('Venom Striker V2', 'Serpent-scale pattern. The V2 improves on an already lethal design.', '/images/assets/sniper_rifle/Venom Striker V2/Moderately Played.png','RARE', 'Shadowfall', 'Moderately Played'),
('Venom Striker V2', 'Serpent-scale pattern. The V2 improves on an already lethal design.', '/images/assets/sniper_rifle/Venom Striker V2/Heavily Played.png',   'RARE', 'Shadowfall', 'Heavily Played'),
('Dark Star II', 'Heavy suppression fire wrapped in a void-black finish.', '/images/assets/machine_gun/Dark Star II/Mint.png',             'ULTRA_RARE', 'Shadowfall', 'Mint'),
('Dark Star II', 'Heavy suppression fire wrapped in a void-black finish.', '/images/assets/machine_gun/Dark Star II/Near Mint.png',        'ULTRA_RARE', 'Shadowfall', 'Near Mint'),
('Dark Star II', 'Heavy suppression fire wrapped in a void-black finish.', '/images/assets/machine_gun/Dark Star II/Lightly Played.png',   'ULTRA_RARE', 'Shadowfall', 'Lightly Played'),
('Dark Star II', 'Heavy suppression fire wrapped in a void-black finish.', '/images/assets/machine_gun/Dark Star II/Moderately Played.png','ULTRA_RARE', 'Shadowfall', 'Moderately Played'),
('Dark Star II', 'Heavy suppression fire wrapped in a void-black finish.', '/images/assets/machine_gun/Dark Star II/Heavily Played.png',   'ULTRA_RARE', 'Shadowfall', 'Heavily Played'),
('Neon Ranger X', 'Electric orange LMG skin. Impossible to miss — for everyone.', '/images/assets/machine_gun/Neon Ranger X/Mint.png',             'UNCOMMON', 'Shadowfall', 'Mint'),
('Neon Ranger X', 'Electric orange LMG skin. Impossible to miss — for everyone.', '/images/assets/machine_gun/Neon Ranger X/Near Mint.png',        'UNCOMMON', 'Shadowfall', 'Near Mint'),
('Neon Ranger X', 'Electric orange LMG skin. Impossible to miss — for everyone.', '/images/assets/machine_gun/Neon Ranger X/Lightly Played.png',   'UNCOMMON', 'Shadowfall', 'Lightly Played'),
('Neon Ranger X', 'Electric orange LMG skin. Impossible to miss — for everyone.', '/images/assets/machine_gun/Neon Ranger X/Moderately Played.png','UNCOMMON', 'Shadowfall', 'Moderately Played'),
('Neon Ranger X', 'Electric orange LMG skin. Impossible to miss — for everyone.', '/images/assets/machine_gun/Neon Ranger X/Heavily Played.png',   'UNCOMMON', 'Shadowfall', 'Heavily Played'),
('Death Cross X-9', 'Crosshair engraving on matte black. Precision is a lifestyle.', '/images/assets/pistol/Death Cross X-9/Mint.png',             'RARE', 'Shadowfall', 'Mint'),
('Death Cross X-9', 'Crosshair engraving on matte black. Precision is a lifestyle.', '/images/assets/pistol/Death Cross X-9/Near Mint.png',        'RARE', 'Shadowfall', 'Near Mint'),
('Death Cross X-9', 'Crosshair engraving on matte black. Precision is a lifestyle.', '/images/assets/pistol/Death Cross X-9/Lightly Played.png',   'RARE', 'Shadowfall', 'Lightly Played'),
('Death Cross X-9', 'Crosshair engraving on matte black. Precision is a lifestyle.', '/images/assets/pistol/Death Cross X-9/Moderately Played.png','RARE', 'Shadowfall', 'Moderately Played'),
('Death Cross X-9', 'Crosshair engraving on matte black. Precision is a lifestyle.', '/images/assets/pistol/Death Cross X-9/Heavily Played.png',   'RARE', 'Shadowfall', 'Heavily Played'),
('Mulberry Deagle', 'Rich purple anodised finish on the classic Desert Eagle.', '/images/assets/pistol/Mulberry Deagle/Mint.png',              'UNCOMMON', 'Shadowfall', 'Mint'),
('Mulberry Deagle', 'Rich purple anodised finish on the classic Desert Eagle.', '/images/assets/pistol/Mulberry Deagle/Near_Mint.png',         'UNCOMMON', 'Shadowfall', 'Near Mint'),
('Mulberry Deagle', 'Rich purple anodised finish on the classic Desert Eagle.', '/images/assets/pistol/Mulberry Deagle/Lightly_Played.png',    'UNCOMMON', 'Shadowfall', 'Lightly Played'),
('Mulberry Deagle', 'Rich purple anodised finish on the classic Desert Eagle.', '/images/assets/pistol/Mulberry Deagle/Moderately_Played.png', 'UNCOMMON', 'Shadowfall', 'Moderately Played'),
('Mulberry Deagle', 'Rich purple anodised finish on the classic Desert Eagle.', '/images/assets/pistol/Mulberry Deagle/Heavily_Played.png',    'UNCOMMON', 'Shadowfall', 'Heavily Played'),
('Ashen Viper AK', 'Ash-grey serpent wrap on an AK. Fan favourite since Season 1.', '/images/assets/rifle/Ashen Viper AK/Mint.png',              'SECRET_RARE', 'Shadowfall', 'Mint'),
('Ashen Viper AK', 'Ash-grey serpent wrap on an AK. Fan favourite since Season 1.', '/images/assets/rifle/Ashen Viper AK/Near_Mint.png',         'SECRET_RARE', 'Shadowfall', 'Near Mint'),
('Ashen Viper AK', 'Ash-grey serpent wrap on an AK. Fan favourite since Season 1.', '/images/assets/rifle/Ashen Viper AK/Lightly_Played.png',    'SECRET_RARE', 'Shadowfall', 'Lightly Played'),
('Ashen Viper AK', 'Ash-grey serpent wrap on an AK. Fan favourite since Season 1.', '/images/assets/rifle/Ashen Viper AK/Moderately_Played.png', 'SECRET_RARE', 'Shadowfall', 'Moderately Played'),
('Ashen Viper AK', 'Ash-grey serpent wrap on an AK. Fan favourite since Season 1.', '/images/assets/rifle/Ashen Viper AK/Heavily_Played.png',    'SECRET_RARE', 'Shadowfall', 'Heavily Played'),
('Shadow Sharpshooter SS', 'Dark ops M4 variant. Issued to shadow division marksmen.', '/images/assets/rifle/Shadow Sharpshooter SS/Mint.png',             'RARE', 'Shadowfall', 'Mint'),
('Shadow Sharpshooter SS', 'Dark ops M4 variant. Issued to shadow division marksmen.', '/images/assets/rifle/Shadow Sharpshooter SS/Near Mint.png',        'RARE', 'Shadowfall', 'Near Mint'),
('Shadow Sharpshooter SS', 'Dark ops M4 variant. Issued to shadow division marksmen.', '/images/assets/rifle/Shadow Sharpshooter SS/Lightly Played.png',   'RARE', 'Shadowfall', 'Lightly Played'),
('Shadow Sharpshooter SS', 'Dark ops M4 variant. Issued to shadow division marksmen.', '/images/assets/rifle/Shadow Sharpshooter SS/Moderately Played.png','RARE', 'Shadowfall', 'Moderately Played'),
('Shadow Sharpshooter SS', 'Dark ops M4 variant. Issued to shadow division marksmen.', '/images/assets/rifle/Shadow Sharpshooter SS/Heavily Played.png',   'RARE', 'Shadowfall', 'Heavily Played'),
('Drift Alloy Knife', 'Lightweight titanium alloy blade. Balanced for the fastest draw.', '/images/assets/knife/Drift Alloy Knife/Mint.png',              'ULTRA_RARE', 'Shadowfall', 'Mint'),
('Drift Alloy Knife', 'Lightweight titanium alloy blade. Balanced for the fastest draw.', '/images/assets/knife/Drift Alloy Knife/Near_Mint.png',         'ULTRA_RARE', 'Shadowfall', 'Near Mint'),
('Drift Alloy Knife', 'Lightweight titanium alloy blade. Balanced for the fastest draw.', '/images/assets/knife/Drift Alloy Knife/Lightly_Played.png',    'ULTRA_RARE', 'Shadowfall', 'Lightly Played'),
('Drift Alloy Knife', 'Lightweight titanium alloy blade. Balanced for the fastest draw.', '/images/assets/knife/Drift Alloy Knife/Moderately_Played.png', 'ULTRA_RARE', 'Shadowfall', 'Moderately Played'),
('Drift Alloy Knife', 'Lightweight titanium alloy blade. Balanced for the fastest draw.', '/images/assets/knife/Drift Alloy Knife/Heavily_Played.png',    'ULTRA_RARE', 'Shadowfall', 'Heavily Played'),
('Emberline Karambit', 'Flame-etched karambit. The rarest blade in the Shadowfall drop.', '/images/assets/knife/Emberline Karambit/Mint.png',              'SECRET_RARE', 'Shadowfall', 'Mint'),
('Emberline Karambit', 'Flame-etched karambit. The rarest blade in the Shadowfall drop.', '/images/assets/knife/Emberline Karambit/Near_Mint.png',         'SECRET_RARE', 'Shadowfall', 'Near Mint'),
('Emberline Karambit', 'Flame-etched karambit. The rarest blade in the Shadowfall drop.', '/images/assets/knife/Emberline Karambit/Lightly_Played.png',    'SECRET_RARE', 'Shadowfall', 'Lightly Played'),
('Emberline Karambit', 'Flame-etched karambit. The rarest blade in the Shadowfall drop.', '/images/assets/knife/Emberline Karambit/Moderately_Played.png', 'SECRET_RARE', 'Shadowfall', 'Moderately Played'),
('Emberline Karambit', 'Flame-etched karambit. The rarest blade in the Shadowfall drop.', '/images/assets/knife/Emberline Karambit/Heavily_Played.png',    'SECRET_RARE', 'Shadowfall', 'Heavily Played'),
('Tactical Urban Gloves', 'Reinforced knuckle gloves. Standard kit for urban engagements.', '/images/assets/gloves/Tactical Urban Gloves/Mint.png',              'RARE', 'Shadowfall', 'Mint'),
('Tactical Urban Gloves', 'Reinforced knuckle gloves. Standard kit for urban engagements.', '/images/assets/gloves/Tactical Urban Gloves/Near_Mint.png',         'RARE', 'Shadowfall', 'Near Mint'),
('Tactical Urban Gloves', 'Reinforced knuckle gloves. Standard kit for urban engagements.', '/images/assets/gloves/Tactical Urban Gloves/Lightly_Played.png',    'RARE', 'Shadowfall', 'Lightly Played'),
('Tactical Urban Gloves', 'Reinforced knuckle gloves. Standard kit for urban engagements.', '/images/assets/gloves/Tactical Urban Gloves/Moderately_Played.png', 'RARE', 'Shadowfall', 'Moderately Played'),
('Tactical Urban Gloves', 'Reinforced knuckle gloves. Standard kit for urban engagements.', '/images/assets/gloves/Tactical Urban Gloves/Heavily_Played.png',    'RARE', 'Shadowfall', 'Heavily Played'),
('Specter Ops Balaclava', 'Full-face tactical balaclava worn by Specter division operatives.', '/images/assets/character_cosmetic/Specter Ops Balaclava/Specter Ops Balaclava.png', 'UNCOMMON', 'Shadowfall', 'Mint'),
('Holo-Grid Sticker Capsule (Series A)', 'Holographic grid sticker set. Apply to any weapon for a clean finish.', '/images/assets/stickers/Holo-Grid Sticker Capsule (Series A)/Holo-Grid Sticker Capsule (Series A).png', 'COMMON', 'Shadowfall', 'Mint');

-- =============================================================
-- SEED: INVENTORY
-- Explicit assignment reflecting current, post-transaction ownership.
-- =============================================================
INSERT INTO inventory (user_id, asset_id) VALUES
-- testuser (3)
(3, 71), (3, 72), (3, 56), (3, 41), (3, 6), (3, 26), (3, 11), (3, 20), (3, 81), (3, 1), (3, 46), (3, 63),
-- shadowtrader (4)
(4, 83), (4, 33), (4, 42), (4, 23), (4, 73), (4, 57), (4, 27), (4, 52), (4, 62), (4, 17), (4, 76), (4, 31), (4, 66), (4, 16),
-- vaultkeeper (5)
(5, 84), (5, 43), (5, 88), (5, 24), (5, 74), (5, 12), (5, 53), (5, 18), (5, 19), (5, 21), (5, 91), (5, 36);

-- =============================================================
-- SEED: LISTINGS
-- =============================================================
INSERT INTO listings (seller_id, asset_id, price, status) VALUES
-- Active (Listed for sale)
(3, 71, 189.99, 'active'),  -- 1
(3,  1, 349.99, 'active'),  -- 2
(3, 56,  90.00, 'active'),  -- 3 (New)
(4, 42,  88.00, 'active'),  -- 4
(4, 76, 475.00, 'active'),  -- 5
(4, 33, 400.00, 'active'),  -- 6 (New)
(5, 88,  95.00, 'active'),  -- 7
(5, 21,  79.00, 'active'),  -- 8
(5, 12,  25.00, 'active'),  -- 9 (New)
(5, 91,  15.00, 'active'),  -- 10 (New)

-- Sold (For fresh transaction history)
(4, 46,  300.00, 'sold'),   -- 11: shadowtrader sold Dark Star II to testuser
(5, 66, 1100.00, 'sold'),   -- 12: vaultkeeper sold Ashen Viper AK to shadowtrader
(3, 36, 1800.00, 'sold'),   -- 13: testuser sold Glacial Trace AWP to vaultkeeper
(5, 63,   14.00, 'sold'),   -- 14: vaultkeeper sold Mulberry Deagle to testuser
(3, 16,    5.00, 'sold');   -- 15: testuser sold Rustfang MAC-10 to shadowtrader

-- =============================================================
-- SEED: TRANSACTIONS 
-- =============================================================
INSERT INTO transactions (listing_id, buyer_id, seller_id, asset_id, price, completed_at) VALUES
(11, 3, 4, 46,  300.00, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(12, 4, 5, 66, 1100.00, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(13, 5, 3, 36, 1800.00, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(14, 3, 5, 63,   14.00, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(15, 4, 3, 16,    5.00, DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- =============================================================
-- SEED: WALLET LEDGER
-- =============================================================
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason, created_at) VALUES
-- Initial Deposits
(3, 'SEED-INIT-003', 'credit', 5000.00, 0.00, 5000.00, 'seed_deposit', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(4, 'SEED-INIT-004', 'credit', 5000.00, 0.00, 5000.00, 'seed_deposit', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(5, 'SEED-INIT-005', 'credit', 5000.00, 0.00, 5000.00, 'seed_deposit', DATE_SUB(NOW(), INTERVAL 30 DAY)),

-- Tx1: testuser (3) buys Dark Star II from shadowtrader (4) for $300
(3, 'TXN-001', 'debit',   300.00, 5000.00, 4700.00, 'purchase:Dark Star II', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(4, 'TXN-001', 'credit',  300.00, 5000.00, 5300.00, 'sale:Dark Star II',     DATE_SUB(NOW(), INTERVAL 10 DAY)),

-- Tx2: shadowtrader (4) buys Ashen Viper AK from vaultkeeper (5) for $1100
(4, 'TXN-002', 'debit',  1100.00, 5300.00, 4200.00, 'purchase:Ashen Viper AK', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(5, 'TXN-002', 'credit', 1100.00, 5000.00, 6100.00, 'sale:Ashen Viper AK',     DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- Tx3: vaultkeeper (5) buys Glacial Trace AWP from testuser (3) for $1800
(5, 'TXN-003', 'debit',  1800.00, 6100.00, 4300.00, 'purchase:Glacial Trace AWP', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 'TXN-003', 'credit', 1800.00, 4700.00, 6500.00, 'sale:Glacial Trace AWP',     DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Tx4: testuser (3) buys Mulberry Deagle from vaultkeeper (5) for $14
(3, 'TXN-004', 'debit',    14.00, 6500.00, 6486.00, 'purchase:Mulberry Deagle', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 'TXN-004', 'credit',   14.00, 4300.00, 4314.00, 'sale:Mulberry Deagle',     DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Tx5: shadowtrader (4) buys Rustfang MAC-10 from testuser (3) for $5
(4, 'TXN-005', 'debit',     5.00, 4200.00, 4195.00, 'purchase:Rustfang MAC-10', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(3, 'TXN-005', 'credit',    5.00, 6486.00, 6491.00, 'sale:Rustfang MAC-10',     DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- =============================================================
-- FINAL WALLET BALANCES 
-- Admins strictly set to 0. 
-- =============================================================
UPDATE wallets SET balance =    0.00 WHERE user_id = 1;
UPDATE wallets SET balance =    0.00 WHERE user_id = 2;
UPDATE wallets SET balance = 6491.00 WHERE user_id = 3;
UPDATE wallets SET balance = 4195.00 WHERE user_id = 4;
UPDATE wallets SET balance = 4314.00 WHERE user_id = 5;

-- =============================================================
-- SEED: BLOG POSTS
-- =============================================================
INSERT INTO blog_posts (author_id, title, body, category, created_at) VALUES
(1,
 'Welcome to the Vapour FT Marketplace',
 'We are thrilled to launch Vapour FT — the premier peer-to-peer marketplace for digital weapon skins and cosmetics from the Shadowfall collection. Whether you are hunting a SECRET_RARE karambit or offloading duplicates, you will find the best items right here. Every transaction is protected by our atomic settlement engine.',
 'Company News',
 DATE_SUB(NOW(), INTERVAL 85 DAY)),
(2,
 'Platform Update: Atomic Transactions Now Live',
 'We have completed the rollout of our atomic transaction engine across all marketplace purchases. Every trade on Vapour FT now settles instantly using database-level locking — your wallet is only debited when the item is confirmed transferred to your inventory.',
 'Company News',
 DATE_SUB(NOW(), INTERVAL 20 DAY));