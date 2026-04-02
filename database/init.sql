-- =============================================================
-- Vapour FT — Database Schema + Seed Data
-- Version: 4.1 (Includes Portfolio Patch)
-- Password for all accounts: Password1
--   (8 chars, uppercase, lowercase, number — bcrypt $2b$10$)
--
-- Users:
--   ID 1  admin         (admin role  — your account)
--   ID 2  prof_admin    (admin role  — professor demo account)
--   ID 3  testuser      (user role   — primary demo buyer)
--   ID 4  shadowtrader  (user role   — extra listings/history)
--   ID 5  vaultkeeper   (user role   — extra listings/history)
--
-- Asset ID reference (sequential AUTO_INCREMENT, 5 per weapon):
--   1–5   Infinite Striker SS      ULTRA_RARE   smg
--   6–10  Mirage Dunes MP9         RARE         smg
--   11–15 Phantom P7               UNCOMMON     smg
--   16–20 Rustfang MAC-10          COMMON       smg
--   21–25 Chroma Blaster           RARE         shotgun
--   26–30 SpaceShooter X           UNCOMMON     shotgun
--   31–35 Epic Ranger III          ULTRA_RARE   sniper_rifle
--   36–40 Glacial Trace AWP        SECRET_RARE  sniper_rifle
--   41–45 Venom Striker V2         RARE         sniper_rifle
--   46–50 Dark Star II             ULTRA_RARE   machine_gun
--   51–55 Neon Ranger X            UNCOMMON     machine_gun
--   56–60 Death Cross X-9          RARE         pistol
--   61–65 Mulberry Deagle          UNCOMMON     pistol
--   66–70 Ashen Viper AK           SECRET_RARE  rifle
--   71–75 Shadow Sharpshooter SS   RARE         rifle
--   76–80 Drift Alloy Knife        ULTRA_RARE   knife
--   81–85 Emberline Karambit       SECRET_RARE  knife
--   86–90 Tactical Urban Gloves    RARE         gloves
--   91    Specter Ops Balaclava    UNCOMMON     character_cosmetic
--   92    Holo-Grid Sticker        COMMON       stickers
--
-- Condition offset within each weapon block (Mint=+0, NearMint=+1,
-- LightlyPlayed=+2, ModeratelyPlayed=+3, HeavilyPlayed=+4):
--   e.g. Chroma Blaster Lightly Played = 21 + 2 = 23
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
-- All passwords = "Password1" (bcrypt, PHP password_verify compatible)
-- =============================================================
INSERT INTO users (email, password, username, role, verified, bio) VALUES
(
    'admin@vapourft.com',
    '$2b$10$tIQyJzBAyotcpaTF2mNFJeKw0pSVHnDGYajjF1.svoL.by1o7CQWa',
    'admin',
    'admin',
    1,
    'Platform administrator. Manages listings and keeps the marketplace running.'
),
(
    'prof@vapourft.com',
    '$2b$10$cuZu0F.YRX219YBZyLB1fuVRjXhx6DYOOz7DAmvxuoT.qWslcTMta',
    'prof_admin',
    'admin',
    1,
    'Senior platform administrator and market analyst.'
),
(
    'user@vapourft.com',
    '$2b$10$Iw.mqdB3c1aItI0LD1twJ.egwNm63udVC2CLXqHtL2nTGpGe/ApKK',
    'testuser',
    'user',
    1,
    'Casual trader. Specialises in RARE-tier rifles and pistols.'
),
(
    'shadowtrader@vapourft.com',
    '$2b$10$TiaWxC2l1OkVsbLece/1heUPTzeEgZzJDcSRQXDt61H/Q4bM1qiz2',
    'shadowtrader',
    'user',
    1,
    'Veteran skin collector. Shadowfall collection specialist since day one.'
),
(
    'vaultkeeper@vapourft.com',
    '$2b$10$Z.nXfZy9XgEqj/wBDBMDHerKXEf.2nXY2rKar1zlijg9BF91jfALS',
    'vaultkeeper',
    'user',
    1,
    'Long-term holder. Only lists duplicates. Known for fair pricing.'
);

-- =============================================================
-- SEED: WALLETS (placeholder — final balances set at bottom)
-- =============================================================
INSERT INTO wallets (user_id, balance) VALUES
(1, 0.00),
(2, 0.00),
(3, 0.00),
(4, 0.00),
(5, 0.00);

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
-- Image paths verified against actual filesystem.
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
-- Each asset is owned by exactly ONE user — no duplicates.
-- =============================================================
INSERT INTO inventory (user_id, asset_id) VALUES
-- admin (1)
(1, 36),   -- Glacial Trace AWP | Mint           SECRET_RARE  active listing
(1, 37),   -- Glacial Trace AWP | Near Mint      SECRET_RARE
(1, 81),   -- Emberline Karambit | Mint          SECRET_RARE  active listing
(1, 82),   -- Emberline Karambit | Near Mint     SECRET_RARE
(1, 66),   -- Ashen Viper AK | Mint              SECRET_RARE  sold → tx1
(1,  1),   -- Infinite Striker SS | Mint         ULTRA_RARE   active listing
(1,  2),   -- Infinite Striker SS | Near Mint    ULTRA_RARE
(1, 46),   -- Dark Star II | Mint                ULTRA_RARE   active listing
(1, 76),   -- Drift Alloy Knife | Mint           ULTRA_RARE   active listing
(1, 31),   -- Epic Ranger III | Mint             ULTRA_RARE   sold → tx3
(1, 86),   -- Tactical Urban Gloves | Mint       RARE         active listing
(1, 21),   -- Chroma Blaster | Mint              RARE
(1, 91),   -- Specter Ops Balaclava              UNCOMMON
(1, 92),   -- Holo-Grid Sticker Capsule          COMMON

-- prof_admin (2)
(2, 38),   -- Glacial Trace AWP | Lightly Played SECRET_RARE
(2, 68),   -- Ashen Viper AK | Lightly Played    SECRET_RARE
(2, 47),   -- Dark Star II | Near Mint           ULTRA_RARE   active listing
(2, 77),   -- Drift Alloy Knife | Near Mint      ULTRA_RARE
(2, 32),   -- Epic Ranger III | Near Mint        ULTRA_RARE
(2, 22),   -- Chroma Blaster | Near Mint         RARE         active listing
(2, 87),   -- Tactical Urban Gloves | Near Mint  RARE
(2, 51),   -- Neon Ranger X | Mint               UNCOMMON
(2, 61),   -- Mulberry Deagle | Mint             UNCOMMON

-- testuser (3)
(3, 71),   -- Shadow Sharpshooter SS | Mint      RARE         active listing
(3, 72),   -- Shadow Sharpshooter SS | Near Mint RARE
(3, 56),   -- Death Cross X-9 | Mint             RARE         active listing
(3, 41),   -- Venom Striker V2 | Mint            RARE         sold → tx2
(3,  6),   -- Mirage Dunes MP9 | Mint            RARE         active listing
(3, 26),   -- SpaceShooter X | Mint              UNCOMMON     active listing
(3, 11),   -- Phantom P7 | Mint                  UNCOMMON
(3, 16),   -- Rustfang MAC-10 | Mint             COMMON       active listing
(3, 20),   -- Rustfang MAC-10 | Heavily Played   COMMON

-- shadowtrader (4)
(4, 83),   -- Emberline Karambit | Lightly Played SECRET_RARE
(4, 33),   -- Epic Ranger III | Lightly Played   ULTRA_RARE
(4, 42),   -- Venom Striker V2 | Near Mint       RARE         active listing
(4, 23),   -- Chroma Blaster | Lightly Played    RARE         active listing
(4, 73),   -- Shadow Sharpshooter SS | Lightly   RARE
(4, 57),   -- Death Cross X-9 | Near Mint        RARE         active listing
(4, 27),   -- SpaceShooter X | Near Mint         UNCOMMON     active listing
(4, 52),   -- Neon Ranger X | Near Mint          UNCOMMON
(4, 62),   -- Mulberry Deagle | Near Mint        UNCOMMON
(4, 17),   -- Rustfang MAC-10 | Near Mint        COMMON

-- vaultkeeper (5)
(5, 84),   -- Emberline Karambit | Moderately    SECRET_RARE
(5, 43),   -- Venom Striker V2 | Lightly Played  RARE
(5, 88),   -- Tactical Urban Gloves | Lightly    RARE         active listing
(5, 24),   -- Chroma Blaster | Moderately Played RARE
(5, 74),   -- Shadow Sharpshooter SS | Moderately RARE
(5, 12),   -- Phantom P7 | Near Mint             UNCOMMON     active listing
(5, 63),   -- Mulberry Deagle | Lightly Played   UNCOMMON     active listing
(5, 53),   -- Neon Ranger X | Lightly Played     UNCOMMON
(5, 18),   -- Rustfang MAC-10 | Lightly Played   COMMON       active listing
(5, 19);   -- Rustfang MAC-10 | Moderately Played COMMON

-- =============================================================
-- SEED: LISTINGS (Merged from original + patch)
-- Listings 17, 19, 20, 21 adjusted directly to 'sold' 
-- status to match the patch's update requirements cleanly.
-- =============================================================
INSERT INTO listings (seller_id, asset_id, price, status) VALUES
-- Active (Original set)
(1, 36, 1899.99, 'active'),   -- 1
(1, 81, 1250.00, 'active'),   -- 2
(1,  1,  349.99, 'active'),   -- 3
(1, 46,  299.00, 'active'),   -- 4
(1, 76,  475.00, 'active'),   -- 5
(1, 86,  129.50, 'active'),   -- 6
(2, 47,  275.00, 'active'),   -- 7
(2, 22,   79.00, 'active'),   -- 8
(3, 71,  189.99, 'active'),   -- 9
(3, 56,   89.00, 'active'),   -- 10
(3,  6,   74.99, 'active'),   -- 11
(3, 26,   34.99, 'active'),   -- 12
(3, 16,    4.50, 'active'),   -- 13
(4, 42,   88.00, 'active'),   -- 14
(4, 23,   65.00, 'active'),   -- 15
(4, 57,   75.00, 'active'),   -- 16
(4, 27,   28.00, 'sold'),     -- 17 (Modified to sold per patch)
(5, 88,   95.00, 'active'),   -- 18
(5, 12,   18.50, 'sold'),     -- 19 (Modified to sold per patch)
(5, 63,   14.00, 'sold'),     -- 20 (Modified to sold per patch)
(5, 18,    3.50, 'sold'),     -- 21 (Modified to sold per patch)
-- Sold (Original historical)
(1, 66, 1100.00, 'sold'),     -- 22  tx1: testuser bought Ashen Viper AK from admin
(3, 41,   95.00, 'sold'),     -- 23  tx2: admin bought Venom Striker V2 from testuser
(1, 31,  420.00, 'sold'),     -- 24  tx3: testuser bought Epic Ranger III from admin
(4, 33,  390.00, 'sold'),     -- 25  tx4: prof_admin bought Epic Ranger III LP from shadowtrader
(5, 43,   72.00, 'sold'),     -- 26  tx5: shadowtrader bought Venom Striker V2 LP from vaultkeeper
-- New listings (From Portfolio Patch)
(2, 22,  79.00, 'sold'),      -- 27: prof_admin sells Chroma Blaster NM
(4, 52,  52.00, 'sold'),      -- 28: shadowtrader sells Neon Ranger X NM
(4, 27,  28.00, 'sold'),      -- 29: shadowtrader sells SpaceShooter X NM
(5, 12,  18.50, 'sold'),      -- 30: vaultkeeper sells Phantom P7 NM
(5, 63,  14.00, 'sold'),      -- 31: vaultkeeper sells Mulberry Deagle LP
(5, 18,   3.50, 'sold'),      -- 32: vaultkeeper sells Rustfang MAC-10 LP
(2, 87,  95.00, 'active'),    -- 33: prof_admin   Tactical Urban Gloves NM
(4, 73,  55.00, 'active'),    -- 34: shadowtrader Shadow SS Moderately Played
(5, 53,  12.00, 'active'),    -- 35: vaultkeeper  Neon Ranger X Lightly Played
(5, 19,   2.50, 'active');    -- 36: vaultkeeper  Rustfang MAC-10 Moderately Played

-- =============================================================
-- SEED: TRANSACTIONS (Merged original + patch)
-- =============================================================
INSERT INTO transactions (listing_id, buyer_id, seller_id, asset_id, price, completed_at) VALUES
-- tx1: testuser(3) bought Ashen Viper AK | Mint from admin(1) — $1100, 60 days ago
(22, 3, 1, 66, 1100.00, DATE_SUB(NOW(), INTERVAL 60 DAY)),
-- tx2: admin(1) bought Venom Striker V2 | Mint from testuser(3) — $95, 45 days ago
(23, 1, 3, 41,   95.00, DATE_SUB(NOW(), INTERVAL 45 DAY)),
-- tx3: testuser(3) bought Epic Ranger III | Mint from admin(1) — $420, 30 days ago
(24, 3, 1, 31,  420.00, DATE_SUB(NOW(), INTERVAL 30 DAY)),
-- tx4: prof_admin(2) bought Epic Ranger III | LP from shadowtrader(4) — $390, 50 days ago
(25, 2, 4, 33,  390.00, DATE_SUB(NOW(), INTERVAL 50 DAY)),
-- tx5: shadowtrader(4) bought Venom Striker V2 | LP from vaultkeeper(5) — $72, 20 days ago
(26, 4, 5, 43,   72.00, DATE_SUB(NOW(), INTERVAL 20 DAY)),
-- tx6  day-28: shadowtrader buys Chroma Blaster NM (asset 22) from prof_admin
(27, 4, 2, 22,  79.00, DATE_SUB(NOW(), INTERVAL 28 DAY)),
-- tx7  day-21: vaultkeeper buys Neon Ranger X NM (asset 52) from shadowtrader
(28, 5, 4, 52,  52.00, DATE_SUB(NOW(), INTERVAL 21 DAY)),
-- tx8  day-14: testuser buys SpaceShooter X NM (asset 27) from shadowtrader
(29, 3, 4, 27,  28.00, DATE_SUB(NOW(), INTERVAL 14 DAY)),
-- tx9  day-7:  prof_admin buys Phantom P7 NM (asset 12) from vaultkeeper
(30, 2, 5, 12,  18.50, DATE_SUB(NOW(), INTERVAL 7 DAY)),
-- tx10 day-3:  admin buys Mulberry Deagle LP (asset 63) from vaultkeeper
(31, 1, 5, 63,  14.00, DATE_SUB(NOW(), INTERVAL 3 DAY)),
-- tx11 day-1:  shadowtrader buys Rustfang MAC-10 LP (asset 18) from vaultkeeper
(32, 4, 5, 18,   3.50, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- =============================================================
-- INVENTORY UPDATES (Transfer inventory ownership for sold assets)
-- =============================================================
-- Original updates
UPDATE inventory SET user_id = 3 WHERE user_id = 1 AND asset_id = 66;  -- Ashen Viper AK → testuser
UPDATE inventory SET user_id = 1 WHERE user_id = 3 AND asset_id = 41;  -- Venom Striker V2 → admin
UPDATE inventory SET user_id = 3 WHERE user_id = 1 AND asset_id = 31;  -- Epic Ranger III → testuser
UPDATE inventory SET user_id = 2 WHERE user_id = 4 AND asset_id = 33;  -- Epic Ranger III LP → prof_admin
UPDATE inventory SET user_id = 4 WHERE user_id = 5 AND asset_id = 43;  -- Venom Striker V2 LP → shadowtrader
-- Patch updates
UPDATE inventory SET user_id = 4 WHERE user_id = 2 AND asset_id = 22;  -- Chroma Blaster NM → shadowtrader
UPDATE inventory SET user_id = 5 WHERE user_id = 4 AND asset_id = 52;  -- Neon Ranger X NM → vaultkeeper
UPDATE inventory SET user_id = 3 WHERE user_id = 4 AND asset_id = 27;  -- SpaceShooter X NM → testuser
UPDATE inventory SET user_id = 2 WHERE user_id = 5 AND asset_id = 12;  -- Phantom P7 NM → prof_admin
UPDATE inventory SET user_id = 1 WHERE user_id = 5 AND asset_id = 63;  -- Mulberry Deagle LP → admin
UPDATE inventory SET user_id = 4 WHERE user_id = 5 AND asset_id = 18;  -- Rustfang MAC-10 LP → shadowtrader

-- =============================================================
-- SEED: WALLET LEDGER
-- Backdated to match transaction timestamps.
-- =============================================================

-- Day -90: Initial seed deposits
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason, created_at) VALUES
(1, 'SEED-INIT-001', 'credit', 15000.00,     0.00, 15000.00, 'seed_deposit', DATE_SUB(NOW(), INTERVAL 90 DAY)),
(2, 'SEED-INIT-002', 'credit',  8000.00,     0.00,  8000.00, 'seed_deposit', DATE_SUB(NOW(), INTERVAL 90 DAY)),
(3, 'SEED-INIT-003', 'credit',  5000.00,     0.00,  5000.00, 'seed_deposit', DATE_SUB(NOW(), INTERVAL 90 DAY)),
(4, 'SEED-INIT-004', 'credit',  3000.00,     0.00,  3000.00, 'seed_deposit', DATE_SUB(NOW(), INTERVAL 90 DAY)),
(5, 'SEED-INIT-005', 'credit',  2000.00,     0.00,  2000.00, 'seed_deposit', DATE_SUB(NOW(), INTERVAL 90 DAY));

-- Day -60: tx1 — testuser buys Ashen Viper AK from admin ($1100)
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason, created_at) VALUES
(3, 'SEED-TXN-001', 'debit',  1100.00,  5000.00,  3900.00, 'purchase:Ashen Viper AK', DATE_SUB(NOW(), INTERVAL 60 DAY)),
(1, 'SEED-TXN-001', 'credit', 1100.00, 15000.00, 16100.00, 'sale:Ashen Viper AK',     DATE_SUB(NOW(), INTERVAL 60 DAY));

-- Day -50: tx4 — prof_admin buys Epic Ranger III LP from shadowtrader ($390)
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason, created_at) VALUES
(2, 'SEED-TXN-004', 'debit',   390.00,  8000.00,  7610.00, 'purchase:Epic Ranger III', DATE_SUB(NOW(), INTERVAL 50 DAY)),
(4, 'SEED-TXN-004', 'credit',  390.00,  3000.00,  3390.00, 'sale:Epic Ranger III',     DATE_SUB(NOW(), INTERVAL 50 DAY));

-- Day -45: tx2 — admin buys Venom Striker V2 from testuser ($95)
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason, created_at) VALUES
(1, 'SEED-TXN-002', 'debit',    95.00, 16100.00, 16005.00, 'purchase:Venom Striker V2', DATE_SUB(NOW(), INTERVAL 45 DAY)),
(3, 'SEED-TXN-002', 'credit',   95.00,  3900.00,  3995.00, 'sale:Venom Striker V2',     DATE_SUB(NOW(), INTERVAL 45 DAY));

-- Day -30: tx3 — testuser buys Epic Ranger III from admin ($420)
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason, created_at) VALUES
(3, 'SEED-TXN-003', 'debit',   420.00,  3995.00,  3575.00, 'purchase:Epic Ranger III', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(1, 'SEED-TXN-003', 'credit',  420.00, 16005.00, 16425.00, 'sale:Epic Ranger III',     DATE_SUB(NOW(), INTERVAL 30 DAY));

-- Day -20: tx5 — shadowtrader buys Venom Striker V2 LP from vaultkeeper ($72)
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason, created_at) VALUES
(4, 'SEED-TXN-005', 'debit',    72.00,  3390.00,  3318.00, 'purchase:Venom Striker V2', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(5, 'SEED-TXN-005', 'credit',   72.00,  2000.00,  2072.00, 'sale:Venom Striker V2',     DATE_SUB(NOW(), INTERVAL 20 DAY));

-- Day 0: Top up testuser to $5000 for clean demo balance
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason, created_at) VALUES
(3, 'SEED-TOPUP-001', 'credit', 1425.00, 3575.00, 5000.00, 'wallet_topup', NOW());

-- Day -28: tx6 — shadowtrader(4) buys Chroma Blaster NM from prof_admin(2), $79
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason, created_at) VALUES
(4, 'SEED-TXN-006', 'debit',   79.00, 3318.00, 3239.00, 'purchase:Chroma Blaster',    DATE_SUB(NOW(), INTERVAL 28 DAY)),
(2, 'SEED-TXN-006', 'credit',  79.00, 7610.00, 7689.00, 'sale:Chroma Blaster',        DATE_SUB(NOW(), INTERVAL 28 DAY));

-- Day -21: tx7 — vaultkeeper(5) buys Neon Ranger X NM from shadowtrader(4), $52
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason, created_at) VALUES
(5, 'SEED-TXN-007', 'debit',   52.00, 2072.00, 2020.00, 'purchase:Neon Ranger X',     DATE_SUB(NOW(), INTERVAL 21 DAY)),
(4, 'SEED-TXN-007', 'credit',  52.00, 3239.00, 3291.00, 'sale:Neon Ranger X',         DATE_SUB(NOW(), INTERVAL 21 DAY));

-- Day -14: tx8 — testuser(3) buys SpaceShooter X NM from shadowtrader(4), $28
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason, created_at) VALUES
(3, 'SEED-TXN-008', 'debit',   28.00, 5000.00, 4972.00, 'purchase:SpaceShooter X',    DATE_SUB(NOW(), INTERVAL 14 DAY)),
(4, 'SEED-TXN-008', 'credit',  28.00, 3291.00, 3319.00, 'sale:SpaceShooter X',        DATE_SUB(NOW(), INTERVAL 14 DAY));

-- Day -7: tx9 — prof_admin(2) buys Phantom P7 NM from vaultkeeper(5), $18.50
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason, created_at) VALUES
(2, 'SEED-TXN-009', 'debit',   18.50, 7689.00, 7670.50, 'purchase:Phantom P7',        DATE_SUB(NOW(), INTERVAL 7 DAY)),
(5, 'SEED-TXN-009', 'credit',  18.50, 2020.00, 2038.50, 'sale:Phantom P7',            DATE_SUB(NOW(), INTERVAL 7 DAY));

-- Day -3: tx10 — admin(1) buys Mulberry Deagle LP from vaultkeeper(5), $14
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason, created_at) VALUES
(1, 'SEED-TXN-010', 'debit',   14.00, 16425.00, 16411.00, 'purchase:Mulberry Deagle', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5, 'SEED-TXN-010', 'credit',  14.00,  2038.50,  2052.50, 'sale:Mulberry Deagle',     DATE_SUB(NOW(), INTERVAL 3 DAY));

-- Day -1: tx11 — shadowtrader(4) buys Rustfang MAC-10 LP from vaultkeeper(5), $3.50
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason, created_at) VALUES
(4, 'SEED-TXN-011', 'debit',    3.50, 3319.00, 3315.50, 'purchase:Rustfang MAC-10',   DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 'SEED-TXN-011', 'credit',   3.50, 2052.50, 2056.00, 'sale:Rustfang MAC-10',       DATE_SUB(NOW(), INTERVAL 1 DAY));

-- =============================================================
-- FINAL WALLET BALANCES (Updated per Portfolio Patch)
--   admin(1)        = 16411.00
--   prof_admin(2)   =  7670.50
--   testuser(3)     =  4972.00
--   shadowtrader(4) =  3315.50
--   vaultkeeper(5)  =  2056.00
-- =============================================================
UPDATE wallets SET balance = 16411.00 WHERE user_id = 1;
UPDATE wallets SET balance =  7670.50 WHERE user_id = 2;
UPDATE wallets SET balance =  4972.00 WHERE user_id = 3;
UPDATE wallets SET balance =  3315.50 WHERE user_id = 4;
UPDATE wallets SET balance =  2056.00 WHERE user_id = 5;

-- =============================================================
-- SEED: BLOG POSTS (5 posts, backdated)
-- =============================================================
INSERT INTO blog_posts (author_id, title, body, category, created_at) VALUES
(1,
 'Welcome to the Vapour FT Marketplace',
 'We are thrilled to launch Vapour FT — the premier peer-to-peer marketplace for digital weapon skins and cosmetics from the Shadowfall collection. Whether you are hunting a SECRET_RARE karambit or offloading duplicates, you will find the best prices and the most active traders right here. Every transaction is protected by our atomic settlement engine — your funds and items transfer simultaneously with zero risk of partial failure.',
 'Company News',
 DATE_SUB(NOW(), INTERVAL 85 DAY)),
(1,
 'Q1 Market Report: Shadowfall Collection Price Analysis',
 'The Shadowfall collection has seen significant price movement over the past 90 days. The Glacial Trace AWP leads the SECRET_RARE tier with recent sales ranging from $1,100 to $1,900, reflecting strong collector demand. ULTRA_RARE knives — particularly the Drift Alloy Knife — remain the most liquid asset class, averaging under 48 hours to sale. COMMON skins like the Rustfang MAC-10 continue to see high volume at low price points, making them ideal for new traders. Our recommendation: if you are holding RARE-tier weapons, current prices represent a strong selling window.',
 'Market Update',
 DATE_SUB(NOW(), INTERVAL 55 DAY)),
(1,
 'How Condition Affects Skin Value: A Trader''s Guide',
 'Condition is the single biggest price driver after rarity. A Mint Glacial Trace AWP commands up to 60% premium over a Heavily Played copy. When buying for resale, always prioritise Mint and Near Mint grades. Lightly Played items can be good value if you plan to hold long-term, as condition is fixed at the time of in-game acquisition and cannot degrade. Check the listing detail page before committing to any purchase to evaluate the asking price against recent market activity.',
 'Trading Tips',
 DATE_SUB(NOW(), INTERVAL 40 DAY)),
(2,
 'Platform Update: Atomic Transactions Now Live',
 'We have completed the rollout of our atomic transaction engine across all marketplace purchases. Every trade on Vapour FT now settles instantly using database-level locking — your wallet is only debited when the item is confirmed transferred to your inventory. If anything fails mid-transaction, the entire operation rolls back automatically. You will never lose funds due to a failed trade. This is the same settlement pattern used by financial institutions worldwide.',
 'Company News',
 DATE_SUB(NOW(), INTERVAL 20 DAY)),
(2,
 'Spotlight: The Emberline Karambit — Is It Worth the Price?',
 'The Emberline Karambit has become the most discussed item on the platform since launch. With its flame-etched blade and SECRET_RARE classification, Mint copies are currently listed between $1,100 and $1,250. Our analysis suggests this is fair value given the limited supply — fewer than 5 Mint copies have traded in the past 30 days. If you are sitting on one, hold. If you want one, move fast. Browse current listings to find your next trophy piece.',
 'Market Update',
 DATE_SUB(NOW(), INTERVAL 5 DAY));