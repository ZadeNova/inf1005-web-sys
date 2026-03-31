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
-- SEED ASSETS — CSGO-style skins, per-condition rows
-- Rarities:   COMMON | UNCOMMON | RARE | ULTRA_RARE | SECRET_RARE
-- Conditions: Mint | Near Mint | Lightly Played | Moderately Played | Heavily Played
-- =============================================================
INSERT INTO assets (name, description, image_url, rarity, collection, condition_state) VALUES

-- SMG: Infinite Striker SS
('Infinite Striker SS', 'A relentless SMG with chrome trim and neon highlights.', '/images/assets/smg/Infinite Striker SS/Mint.png',             'ULTRA_RARE',  'Shadowfall', 'Mint'),
('Infinite Striker SS', 'A relentless SMG with chrome trim and neon highlights.', '/images/assets/smg/Infinite Striker SS/Near Mint.png',        'ULTRA_RARE',  'Shadowfall', 'Near Mint'),
('Infinite Striker SS', 'A relentless SMG with chrome trim and neon highlights.', '/images/assets/smg/Infinite Striker SS/Lightly Played.png',   'ULTRA_RARE',  'Shadowfall', 'Lightly Played'),
('Infinite Striker SS', 'A relentless SMG with chrome trim and neon highlights.', '/images/assets/smg/Infinite Striker SS/Moderately Played.png','ULTRA_RARE',  'Shadowfall', 'Moderately Played'),
('Infinite Striker SS', 'A relentless SMG with chrome trim and neon highlights.', '/images/assets/smg/Infinite Striker SS/Heavily Played.png',   'ULTRA_RARE',  'Shadowfall', 'Heavily Played'),

-- SMG: Mirage Dunes MP9
('Mirage Dunes MP9', 'Desert-pattern MP9 built for hot climate operations.', '/images/assets/smg/Mirage Dunes MP9/Mint.png',             'RARE',        'Shadowfall', 'Mint'),
('Mirage Dunes MP9', 'Desert-pattern MP9 built for hot climate operations.', '/images/assets/smg/Mirage Dunes MP9/Near_Mint.png',        'RARE',        'Shadowfall', 'Near Mint'),
('Mirage Dunes MP9', 'Desert-pattern MP9 built for hot climate operations.', '/images/assets/smg/Mirage Dunes MP9/Lightly_Played.png',   'RARE',        'Shadowfall', 'Lightly Played'),
('Mirage Dunes MP9', 'Desert-pattern MP9 built for hot climate operations.', '/images/assets/smg/Mirage Dunes MP9/Moderately_Played.png','RARE',        'Shadowfall', 'Moderately Played'),
('Mirage Dunes MP9', 'Desert-pattern MP9 built for hot climate operations.', '/images/assets/smg/Mirage Dunes MP9/Heavily_Played.png',   'RARE',        'Shadowfall', 'Heavily Played'),

-- SMG: Phantom P7
('Phantom P7', 'Ghostly silhouette finish. Spotted in three conflict zones.', '/images/assets/smg/Phantom P7/Mint.png',             'UNCOMMON',    'Shadowfall', 'Mint'),
('Phantom P7', 'Ghostly silhouette finish. Spotted in three conflict zones.', '/images/assets/smg/Phantom P7/Near Mint.png',        'UNCOMMON',    'Shadowfall', 'Near Mint'),
('Phantom P7', 'Ghostly silhouette finish. Spotted in three conflict zones.', '/images/assets/smg/Phantom P7/Lightly Played.png',   'UNCOMMON',    'Shadowfall', 'Lightly Played'),
('Phantom P7', 'Ghostly silhouette finish. Spotted in three conflict zones.', '/images/assets/smg/Phantom P7/Moderately Played.png','UNCOMMON',    'Shadowfall', 'Moderately Played'),
('Phantom P7', 'Ghostly silhouette finish. Spotted in three conflict zones.', '/images/assets/smg/Phantom P7/Heavily Played.png',   'UNCOMMON',    'Shadowfall', 'Heavily Played'),

-- SMG: Rustfang MAC-10
('Rustfang MAC-10', 'Weathered MAC-10 with a bite. Favoured by scrapyard runners.', '/images/assets/smg/Rustfang MAC-10/Mint.png',             'COMMON',      'Shadowfall', 'Mint'),
('Rustfang MAC-10', 'Weathered MAC-10 with a bite. Favoured by scrapyard runners.', '/images/assets/smg/Rustfang MAC-10/Near_Mint.png',        'COMMON',      'Shadowfall', 'Near Mint'),
('Rustfang MAC-10', 'Weathered MAC-10 with a bite. Favoured by scrapyard runners.', '/images/assets/smg/Rustfang MAC-10/Lightly_Played.png',   'COMMON',      'Shadowfall', 'Lightly Played'),
('Rustfang MAC-10', 'Weathered MAC-10 with a bite. Favoured by scrapyard runners.', '/images/assets/smg/Rustfang MAC-10/Moderately_Played.png','COMMON',      'Shadowfall', 'Moderately Played'),
('Rustfang MAC-10', 'Weathered MAC-10 with a bite. Favoured by scrapyard runners.', '/images/assets/smg/Rustfang MAC-10/Heavily_Played.png',   'COMMON',      'Shadowfall', 'Heavily Played'),

-- Shotgun: Chroma Blaster
('Chroma Blaster', 'Full-spectrum paint job on a pump action. Loud in every sense.', '/images/assets/shotgun/Chroma Blaster/Mint.png',             'RARE',        'Shadowfall', 'Mint'),
('Chroma Blaster', 'Full-spectrum paint job on a pump action. Loud in every sense.', '/images/assets/shotgun/Chroma Blaster/Near Mint.png',        'RARE',        'Shadowfall', 'Near Mint'),
('Chroma Blaster', 'Full-spectrum paint job on a pump action. Loud in every sense.', '/images/assets/shotgun/Chroma Blaster/Lightly Played.png',   'RARE',        'Shadowfall', 'Lightly Played'),
('Chroma Blaster', 'Full-spectrum paint job on a pump action. Loud in every sense.', '/images/assets/shotgun/Chroma Blaster/Moderately Played.png','RARE',        'Shadowfall', 'Moderately Played'),
('Chroma Blaster', 'Full-spectrum paint job on a pump action. Loud in every sense.', '/images/assets/shotgun/Chroma Blaster/Heavily Played.png',   'RARE',        'Shadowfall', 'Heavily Played'),

-- Shotgun: SpaceShooter X
('SpaceShooter X', 'Galactic decal series. Zero-gravity tested, atmosphere approved.', '/images/assets/shotgun/SpaceShooter X/Mint.png',             'UNCOMMON',    'Shadowfall', 'Mint'),
('SpaceShooter X', 'Galactic decal series. Zero-gravity tested, atmosphere approved.', '/images/assets/shotgun/SpaceShooter X/Near Mint.png',        'UNCOMMON',    'Shadowfall', 'Near Mint'),
('SpaceShooter X', 'Galactic decal series. Zero-gravity tested, atmosphere approved.', '/images/assets/shotgun/SpaceShooter X/Lightly Played.png',   'UNCOMMON',    'Shadowfall', 'Lightly Played'),
('SpaceShooter X', 'Galactic decal series. Zero-gravity tested, atmosphere approved.', '/images/assets/shotgun/SpaceShooter X/Moderately Played.png','UNCOMMON',    'Shadowfall', 'Moderately Played'),
('SpaceShooter X', 'Galactic decal series. Zero-gravity tested, atmosphere approved.', '/images/assets/shotgun/SpaceShooter X/Heavily Played.png',   'UNCOMMON',    'Shadowfall', 'Heavily Played'),

-- Sniper Rifle: Epic Ranger III
('Epic Ranger III', 'Third gen precision rifle. Hits harder than its predecessors.', '/images/assets/sniper_rifle/Epic Ranger III/Mint.png',             'ULTRA_RARE',  'Shadowfall', 'Mint'),
('Epic Ranger III', 'Third gen precision rifle. Hits harder than its predecessors.', '/images/assets/sniper_rifle/Epic Ranger III/Near Mint.png',        'ULTRA_RARE',  'Shadowfall', 'Near Mint'),
('Epic Ranger III', 'Third gen precision rifle. Hits harder than its predecessors.', '/images/assets/sniper_rifle/Epic Ranger III/Lightly Played.png',   'ULTRA_RARE',  'Shadowfall', 'Lightly Played'),
('Epic Ranger III', 'Third gen precision rifle. Hits harder than its predecessors.', '/images/assets/sniper_rifle/Epic Ranger III/Moderately Played.png','ULTRA_RARE',  'Shadowfall', 'Moderately Played'),
('Epic Ranger III', 'Third gen precision rifle. Hits harder than its predecessors.', '/images/assets/sniper_rifle/Epic Ranger III/Heavily Played.png',   'ULTRA_RARE',  'Shadowfall', 'Heavily Played'),

-- Sniper Rifle: Glacial Trace AWP
('Glacial Trace AWP', 'Ice-blue fade AWP. One of the most coveted skins in the collection.', '/images/assets/sniper_rifle/Glacial Trace AWP/Mint.png',             'SECRET_RARE', 'Shadowfall', 'Mint'),
('Glacial Trace AWP', 'Ice-blue fade AWP. One of the most coveted skins in the collection.', '/images/assets/sniper_rifle/Glacial Trace AWP/Near_Mint.png',        'SECRET_RARE', 'Shadowfall', 'Near Mint'),
('Glacial Trace AWP', 'Ice-blue fade AWP. One of the most coveted skins in the collection.', '/images/assets/sniper_rifle/Glacial Trace AWP/Lightly_Played.png',   'SECRET_RARE', 'Shadowfall', 'Lightly Played'),
('Glacial Trace AWP', 'Ice-blue fade AWP. One of the most coveted skins in the collection.', '/images/assets/sniper_rifle/Glacial Trace AWP/Moderately_Played.png','SECRET_RARE', 'Shadowfall', 'Moderately Played'),
('Glacial Trace AWP', 'Ice-blue fade AWP. One of the most coveted skins in the collection.', '/images/assets/sniper_rifle/Glacial Trace AWP/Heavily_Played.png',   'SECRET_RARE', 'Shadowfall', 'Heavily Played'),

-- Sniper Rifle: Venom Striker V2
('Venom Striker V2', 'Serpent-scale pattern. The V2 improves on an already lethal design.', '/images/assets/sniper_rifle/Venom Striker V2/Mint.png',             'RARE',        'Shadowfall', 'Mint'),
('Venom Striker V2', 'Serpent-scale pattern. The V2 improves on an already lethal design.', '/images/assets/sniper_rifle/Venom Striker V2/Near Mint.png',        'RARE',        'Shadowfall', 'Near Mint'),
('Venom Striker V2', 'Serpent-scale pattern. The V2 improves on an already lethal design.', '/images/assets/sniper_rifle/Venom Striker V2/Lightly Played.png',   'RARE',        'Shadowfall', 'Lightly Played'),
('Venom Striker V2', 'Serpent-scale pattern. The V2 improves on an already lethal design.', '/images/assets/sniper_rifle/Venom Striker V2/Moderately Played.png','RARE',        'Shadowfall', 'Moderately Played'),
('Venom Striker V2', 'Serpent-scale pattern. The V2 improves on an already lethal design.', '/images/assets/sniper_rifle/Venom Striker V2/Heavily Played.png',   'RARE',        'Shadowfall', 'Heavily Played'),

-- Machine Gun: Dark Star II
('Dark Star II', 'Heavy suppression fire wrapped in a void-black finish.', '/images/assets/machine_gun/Dark Star II/Mint.png',             'ULTRA_RARE',  'Shadowfall', 'Mint'),
('Dark Star II', 'Heavy suppression fire wrapped in a void-black finish.', '/images/assets/machine_gun/Dark Star II/Near Mint.png',        'ULTRA_RARE',  'Shadowfall', 'Near Mint'),
('Dark Star II', 'Heavy suppression fire wrapped in a void-black finish.', '/images/assets/machine_gun/Dark Star II/Lightly Played.png',   'ULTRA_RARE',  'Shadowfall', 'Lightly Played'),
('Dark Star II', 'Heavy suppression fire wrapped in a void-black finish.', '/images/assets/machine_gun/Dark Star II/Moderately Played.png','ULTRA_RARE',  'Shadowfall', 'Moderately Played'),
('Dark Star II', 'Heavy suppression fire wrapped in a void-black finish.', '/images/assets/machine_gun/Dark Star II/Heavily Played.png',   'ULTRA_RARE',  'Shadowfall', 'Heavily Played'),

-- Machine Gun: Neon Ranger X
('Neon Ranger X', 'Electric orange LMG skin. Impossible to miss — for everyone.', '/images/assets/machine_gun/Neon Ranger X/Mint.png',             'UNCOMMON',    'Shadowfall', 'Mint'),
('Neon Ranger X', 'Electric orange LMG skin. Impossible to miss — for everyone.', '/images/assets/machine_gun/Neon Ranger X/Near Mint.png',        'UNCOMMON',    'Shadowfall', 'Near Mint'),
('Neon Ranger X', 'Electric orange LMG skin. Impossible to miss — for everyone.', '/images/assets/machine_gun/Neon Ranger X/Lightly Played.png',   'UNCOMMON',    'Shadowfall', 'Lightly Played'),
('Neon Ranger X', 'Electric orange LMG skin. Impossible to miss — for everyone.', '/images/assets/machine_gun/Neon Ranger X/Moderately Played.png','UNCOMMON',    'Shadowfall', 'Moderately Played'),
('Neon Ranger X', 'Electric orange LMG skin. Impossible to miss — for everyone.', '/images/assets/machine_gun/Neon Ranger X/Heavily Played.png',   'UNCOMMON',    'Shadowfall', 'Heavily Played'),

-- Pistol: Death Cross X-9
('Death Cross X-9', 'Crosshair engraving on matte black. Precision is a lifestyle.', '/images/assets/pistol/Death Cross X-9/Mint.png',             'RARE',        'Shadowfall', 'Mint'),
('Death Cross X-9', 'Crosshair engraving on matte black. Precision is a lifestyle.', '/images/assets/pistol/Death Cross X-9/Near Mint.png',        'RARE',        'Shadowfall', 'Near Mint'),
('Death Cross X-9', 'Crosshair engraving on matte black. Precision is a lifestyle.', '/images/assets/pistol/Death Cross X-9/Lightly Played.png',   'RARE',        'Shadowfall', 'Lightly Played'),
('Death Cross X-9', 'Crosshair engraving on matte black. Precision is a lifestyle.', '/images/assets/pistol/Death Cross X-9/Moderately Played.png','RARE',        'Shadowfall', 'Moderately Played'),
('Death Cross X-9', 'Crosshair engraving on matte black. Precision is a lifestyle.', '/images/assets/pistol/Death Cross X-9/Heavily Played.png',   'RARE',        'Shadowfall', 'Heavily Played'),

-- Pistol: Mulberry Deagle
('Mulberry Deagle', 'Rich purple anodised finish on the classic Desert Eagle.', '/images/assets/pistol/Mulberry Deagle/Mint.png',             'UNCOMMON',    'Shadowfall', 'Mint'),
('Mulberry Deagle', 'Rich purple anodised finish on the classic Desert Eagle.', '/images/assets/pistol/Mulberry Deagle/Near_Mint.png',        'UNCOMMON',    'Shadowfall', 'Near Mint'),
('Mulberry Deagle', 'Rich purple anodised finish on the classic Desert Eagle.', '/images/assets/pistol/Mulberry Deagle/Lightly_Played.png',   'UNCOMMON',    'Shadowfall', 'Lightly Played'),
('Mulberry Deagle', 'Rich purple anodised finish on the classic Desert Eagle.', '/images/assets/pistol/Mulberry Deagle/Moderately_Played.png','UNCOMMON',    'Shadowfall', 'Moderately Played'),
('Mulberry Deagle', 'Rich purple anodised finish on the classic Desert Eagle.', '/images/assets/pistol/Mulberry Deagle/Heavily_Played.png',   'UNCOMMON',    'Shadowfall', 'Heavily Played'),

-- Rifle: Ashen Viper AK
('Ashen Viper AK', 'Ash-grey serpent wrap on an AK. Fan favourite since Season 1.', '/images/assets/rifle/Ashen Viper AK/Mint.png',             'SECRET_RARE', 'Shadowfall', 'Mint'),
('Ashen Viper AK', 'Ash-grey serpent wrap on an AK. Fan favourite since Season 1.', '/images/assets/rifle/Ashen Viper AK/Near_Mint.png',        'SECRET_RARE', 'Shadowfall', 'Near Mint'),
('Ashen Viper AK', 'Ash-grey serpent wrap on an AK. Fan favourite since Season 1.', '/images/assets/rifle/Ashen Viper AK/Lightly_Played.png',   'SECRET_RARE', 'Shadowfall', 'Lightly Played'),
('Ashen Viper AK', 'Ash-grey serpent wrap on an AK. Fan favourite since Season 1.', '/images/assets/rifle/Ashen Viper AK/Moderately_Played.png','SECRET_RARE', 'Shadowfall', 'Moderately Played'),
('Ashen Viper AK', 'Ash-grey serpent wrap on an AK. Fan favourite since Season 1.', '/images/assets/rifle/Ashen Viper AK/Heavily_Played.png',   'SECRET_RARE', 'Shadowfall', 'Heavily Played'),

-- Rifle: Shadow Sharpshooter SS
('Shadow Sharpshooter SS', 'Dark ops M4 variant. Issued to shadow division marksmen.', '/images/assets/rifle/Shadow Sharpshooter SS/Mint.png',             'RARE',        'Shadowfall', 'Mint'),
('Shadow Sharpshooter SS', 'Dark ops M4 variant. Issued to shadow division marksmen.', '/images/assets/rifle/Shadow Sharpshooter SS/Near Mint.png',        'RARE',        'Shadowfall', 'Near Mint'),
('Shadow Sharpshooter SS', 'Dark ops M4 variant. Issued to shadow division marksmen.', '/images/assets/rifle/Shadow Sharpshooter SS/Lightly Played.png',   'RARE',        'Shadowfall', 'Lightly Played'),
('Shadow Sharpshooter SS', 'Dark ops M4 variant. Issued to shadow division marksmen.', '/images/assets/rifle/Shadow Sharpshooter SS/Moderately Played.png','RARE',        'Shadowfall', 'Moderately Played'),
('Shadow Sharpshooter SS', 'Dark ops M4 variant. Issued to shadow division marksmen.', '/images/assets/rifle/Shadow Sharpshooter SS/Heavily Played.png',   'RARE',        'Shadowfall', 'Heavily Played'),

-- Knife: Drift Alloy Knife
('Drift Alloy Knife', 'Lightweight titanium alloy blade. Balanced for the fastest draw.', '/images/assets/knife/Drift Alloy Knife/Mint.png',             'ULTRA_RARE',  'Shadowfall', 'Mint'),
('Drift Alloy Knife', 'Lightweight titanium alloy blade. Balanced for the fastest draw.', '/images/assets/knife/Drift Alloy Knife/Near_Mint.png',        'ULTRA_RARE',  'Shadowfall', 'Near Mint'),
('Drift Alloy Knife', 'Lightweight titanium alloy blade. Balanced for the fastest draw.', '/images/assets/knife/Drift Alloy Knife/Lightly_Played.png',   'ULTRA_RARE',  'Shadowfall', 'Lightly Played'),
('Drift Alloy Knife', 'Lightweight titanium alloy blade. Balanced for the fastest draw.', '/images/assets/knife/Drift Alloy Knife/Moderately_Played.png','ULTRA_RARE',  'Shadowfall', 'Moderately Played'),
('Drift Alloy Knife', 'Lightweight titanium alloy blade. Balanced for the fastest draw.', '/images/assets/knife/Drift Alloy Knife/Heavily_Played.png',   'ULTRA_RARE',  'Shadowfall', 'Heavily Played'),

-- Knife: Emberline Karambit
('Emberline Karambit', 'Flame-etched karambit. The rarest blade in the Shadowfall drop.', '/images/assets/knife/Emberline Karambit/Mint.png',             'SECRET_RARE', 'Shadowfall', 'Mint'),
('Emberline Karambit', 'Flame-etched karambit. The rarest blade in the Shadowfall drop.', '/images/assets/knife/Emberline Karambit/Near_Mint.png',        'SECRET_RARE', 'Shadowfall', 'Near Mint'),
('Emberline Karambit', 'Flame-etched karambit. The rarest blade in the Shadowfall drop.', '/images/assets/knife/Emberline Karambit/Lightly_Played.png',   'SECRET_RARE', 'Shadowfall', 'Lightly Played'),
('Emberline Karambit', 'Flame-etched karambit. The rarest blade in the Shadowfall drop.', '/images/assets/knife/Emberline Karambit/Moderately_Played.png','SECRET_RARE', 'Shadowfall', 'Moderately Played'),
('Emberline Karambit', 'Flame-etched karambit. The rarest blade in the Shadowfall drop.', '/images/assets/knife/Emberline Karambit/Heavily_Played.png',   'SECRET_RARE', 'Shadowfall', 'Heavily Played'),

-- Gloves: Tactical Urban Gloves
('Tactical Urban Gloves', 'Reinforced knuckle gloves. Standard kit for urban engagements.', '/images/assets/gloves/Tactical Urban Gloves/Mint.png',             'RARE',        'Shadowfall', 'Mint'),
('Tactical Urban Gloves', 'Reinforced knuckle gloves. Standard kit for urban engagements.', '/images/assets/gloves/Tactical Urban Gloves/Near_Mint.png',        'RARE',        'Shadowfall', 'Near Mint'),
('Tactical Urban Gloves', 'Reinforced knuckle gloves. Standard kit for urban engagements.', '/images/assets/gloves/Tactical Urban Gloves/Lightly_Played.png',   'RARE',        'Shadowfall', 'Lightly Played'),
('Tactical Urban Gloves', 'Reinforced knuckle gloves. Standard kit for urban engagements.', '/images/assets/gloves/Tactical Urban Gloves/Moderately_Played.png','RARE',        'Shadowfall', 'Moderately Played'),
('Tactical Urban Gloves', 'Reinforced knuckle gloves. Standard kit for urban engagements.', '/images/assets/gloves/Tactical Urban Gloves/Heavily_Played.png',   'RARE',        'Shadowfall', 'Heavily Played'),

-- Character Cosmetic: Specter Ops Balaclava (no condition variants)
('Specter Ops Balaclava', 'Full-face tactical balaclava worn by Specter division operatives.', '/images/assets/character_cosmetic/Specter Ops Balaclava/Specter Ops Balaclava.png', 'UNCOMMON', 'Shadowfall', 'Mint'),

-- Sticker: Holo-Grid Sticker Capsule (no condition variants)
('Holo-Grid Sticker Capsule (Series A)', 'Holographic grid sticker set. Apply to any weapon for a clean finish.', '/images/assets/stickers/Holo-Grid Sticker Capsule (Series A)/Holo-Grid Sticker Capsule (Series A).png', 'COMMON', 'Shadowfall', 'Mint');

-- =============================================================
-- INVENTORY
-- Admin (user 1) owns: high-value skins across categories
-- Testuser (user 2) owns: mid-tier skins across categories
-- =============================================================

INSERT INTO inventory (user_id, asset_id) VALUES
-- Admin's inventory
(1, 36),  -- Glacial Trace AWP | Mint         (SECRET_RARE)
(1, 81),  -- Emberline Karambit | Mint         (SECRET_RARE)
(1, 66),  -- Ashen Viper AK | Mint             (SECRET_RARE)
(1, 1),   -- Infinite Striker SS | Mint        (ULTRA_RARE)
(1, 46),  -- Dark Star II | Mint               (ULTRA_RARE)
(1, 76),  -- Drift Alloy Knife | Mint          (ULTRA_RARE)
(1, 31),  -- Epic Ranger III | Mint            (ULTRA_RARE)
(1, 86),  -- Tactical Urban Gloves | Mint      (RARE)
(1, 21),  -- Chroma Blaster | Mint             (RARE)
(1, 91),  -- Specter Ops Balaclava             (UNCOMMON)
(1, 92),  -- Holo-Grid Sticker Capsule         (COMMON)

-- Testuser's inventory
(2, 71),  -- Shadow Sharpshooter SS | Mint     (RARE)
(2, 56),  -- Death Cross X-9 | Mint            (RARE)
(2, 41),  -- Venom Striker V2 | Mint           (RARE)
(2, 6),   -- Mirage Dunes MP9 | Mint           (RARE)
(2, 26),  -- SpaceShooter X | Mint             (UNCOMMON)
(2, 11),  -- Phantom P7 | Mint                 (UNCOMMON)
(2, 61),  -- Mulberry Deagle | Mint            (UNCOMMON)
(2, 51),  -- Neon Ranger X | Mint              (UNCOMMON)
(2, 16),  -- Rustfang MAC-10 | Mint            (COMMON)
(2, 20);  -- Rustfang MAC-10 | Heavily Played  (COMMON)

-- =============================================================
-- ACTIVE LISTINGS
-- listing_id assignment (sequential):
--   1  = asset 36  (Glacial Trace AWP | Mint)
--   2  = asset 81  (Emberline Karambit | Mint)
--   3  = asset 1   (Infinite Striker SS | Mint)
--   4  = asset 46  (Dark Star II | Mint)
--   5  = asset 86  (Tactical Urban Gloves | Mint)
--   6  = asset 71  (Shadow Sharpshooter SS | Mint)
--   7  = asset 56  (Death Cross X-9 | Mint)
--   8  = asset 26  (SpaceShooter X | Mint)
--   9  = asset 16  (Rustfang MAC-10 | Mint)       SOLD
--   10 = asset 66  (Ashen Viper AK | Mint)        SOLD
--   11 = asset 41  (Venom Striker V2 | Mint)      SOLD
-- =============================================================

INSERT INTO listings (seller_id, asset_id, price, status) VALUES
-- Admin active listings (high-value)
(1, 36,  1899.99, 'active'),  -- Glacial Trace AWP | Mint
(1, 81,  1250.00, 'active'),  -- Emberline Karambit | Mint
(1,  1,   349.99, 'active'),  -- Infinite Striker SS | Mint
(1, 46,   299.00, 'active'),  -- Dark Star II | Mint
(1, 86,   129.50, 'active'),  -- Tactical Urban Gloves | Mint

-- Testuser active listings (mid-tier)
(2, 71,   189.99, 'active'),  -- Shadow Sharpshooter SS | Mint
(2, 56,    89.00, 'active'),  -- Death Cross X-9 | Mint
(2, 26,    34.99, 'active'),  -- SpaceShooter X | Mint
(2, 16,     4.50, 'active'),  -- Rustfang MAC-10 | Mint

-- Completed sales (for price history / transaction data)
(1, 66,  1100.00, 'sold'),    -- Ashen Viper AK | Mint       → bought by testuser
(2, 41,    95.00, 'sold'),    -- Venom Striker V2 | Mint     → bought by admin
(1, 31,   420.00, 'sold');    -- Epic Ranger III | Mint      → bought by testuser

-- =============================================================
-- TRANSACTIONS (completed sales)
-- listing 10 = Ashen Viper AK    sold by admin(1)   to testuser(2)  $1100
-- listing 11 = Venom Striker V2  sold by testuser(2) to admin(1)    $95
-- listing 12 = Epic Ranger III   sold by admin(1)   to testuser(2)  $420
-- =============================================================

INSERT INTO transactions (listing_id, buyer_id, seller_id, asset_id, price) VALUES
(10, 2, 1, 66,  1100.00),   -- testuser bought Ashen Viper AK from admin
(11, 1, 2, 41,    95.00),   -- admin bought Venom Striker V2 from testuser
(12, 2, 1, 31,   420.00);   -- testuser bought Epic Ranger III from admin

-- Transfer ownership after completed sales
UPDATE inventory SET user_id = 2 WHERE user_id = 1 AND asset_id = 66;  -- AK → testuser
UPDATE inventory SET user_id = 1 WHERE user_id = 2 AND asset_id = 41;  -- V2 → admin
UPDATE inventory SET user_id = 2 WHERE user_id = 1 AND asset_id = 31;  -- AWP → testuser

-- =============================================================
-- WALLET LEDGER — completed transactions
-- Starting balances: admin=10000, testuser=500
-- =============================================================

-- Tx 1: testuser buys Ashen Viper AK for $1100
-- testuser can't afford from 500, top up first
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason) VALUES
(2, 'SEED-TOPUP-001', 'credit', 1000.00, 500.00, 1500.00, 'seed_topup');
UPDATE wallets SET balance = 1500.00 WHERE user_id = 2;

INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason) VALUES
(2, 'SEED-TXN-001', 'debit',  1100.00, 1500.00,  400.00, 'purchase:Ashen Viper AK'),
(1, 'SEED-TXN-001', 'credit', 1100.00, 10000.00, 11100.00, 'sale:Ashen Viper AK');

UPDATE wallets SET balance = 11100.00 WHERE user_id = 1;
UPDATE wallets SET balance =   400.00 WHERE user_id = 2;

-- Tx 2: admin buys Venom Striker V2 for $95
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason) VALUES
(1, 'SEED-TXN-002', 'debit',   95.00, 11100.00, 11005.00, 'purchase:Venom Striker V2'),
(2, 'SEED-TXN-002', 'credit',  95.00,   400.00,   495.00, 'sale:Venom Striker V2');

UPDATE wallets SET balance = 11005.00 WHERE user_id = 1;
UPDATE wallets SET balance =   495.00 WHERE user_id = 2;

-- Tx 3: testuser buys Epic Ranger III for $420
INSERT INTO wallet_ledger (user_id, transaction_ref, type, amount, balance_before, balance_after, reason) VALUES
(2, 'SEED-TXN-003', 'debit',  420.00,  495.00,   75.00, 'purchase:Epic Ranger III'),
(1, 'SEED-TXN-003', 'credit', 420.00, 11005.00, 11425.00, 'sale:Epic Ranger III');

UPDATE wallets SET balance = 11425.00 WHERE user_id = 1;
UPDATE wallets SET balance =    75.00 WHERE user_id = 2;