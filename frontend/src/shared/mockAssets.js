/**
 * mockAssets.js — Vapour FT Shared Mock Data
 * LEAD ONLY — single source of truth for all NFT data structures.
 * Do not add page-specific data here. Add to your own island file instead.
 *
 * Import path from any island:
 *   import { mockAssets, RARITY, CONDITIONS, USE_MOCK } from '../../shared/mockAssets.js'
 *
 * Flip USE_MOCK to false once /api/v1/ endpoints are live.
 */

export const USE_MOCK = false;

/* ---------------------------------------------------------- */
/* ENUMERATIONS — use these constants everywhere, never raw strings */
/* ---------------------------------------------------------- */
export const RARITY = {
  COMMON:      'COMMON',
  UNCOMMON:    'UNCOMMON',
  RARE:        'RARE',
  ULTRA_RARE:  'ULTRA_RARE',
  SECRET_RARE: 'SECRET_RARE',
};

export const CONDITION = {
  MINT:               'Mint',
  NEAR_MINT:          'Near Mint',
  LIGHTLY_PLAYED:     'Lightly Played',
  MODERATELY_PLAYED:  'Moderately Played',
  HEAVILY_PLAYED:     'Heavily Played',
};

export const COLLECTION = {
  CORE_DROP_2024:          'Core Drop 2024',
  SHADOWFALL:              'Shadowfall Collection',
  CELESTIAL_SERIES:        'Celestial Series',
  PROMO_TOURNAMENT:        'Promo/Tournament Exclusive',
};

export const TRANSACTION_STATUS = {
  ACTIVE:    'active',
  SOLD:      'sold',
  CANCELLED: 'cancelled',
  PENDING:   'pending',
};

/* ---------------------------------------------------------- */
/* MOCK USERS                                                  */
/* ---------------------------------------------------------- */
export const mockUsers = [
  { id: 'user-001', username: '0xVault',     avatarUrl: null, joinedAt: '2024-01-15', isVerified: true },
  { id: 'user-002', username: 'NeonTrader',  avatarUrl: null, joinedAt: '2024-02-20', isVerified: false },
  { id: 'user-003', username: 'ShadowHawk',  avatarUrl: null, joinedAt: '2024-03-05', isVerified: true },
  { id: 'user-004', username: 'CelestialX',  avatarUrl: null, joinedAt: '2024-04-12', isVerified: false },
  { id: 'user-005', username: 'VaultKeeper', avatarUrl: null, joinedAt: '2024-05-01', isVerified: true },
];

/* ---------------------------------------------------------- */
/* MOCK ASSETS                                                 */
/* ---------------------------------------------------------- */
export const mockAssets = [
  {
    id:          'asset-001',
    name:        'Shadowfall Genesis #001',
    description: 'The inaugural piece of the Shadowfall Collection. A generative digital illustration depicting a hooded figure emerging from crystalline darkness.',
    collection:  COLLECTION.SHADOWFALL,
    rarity:      RARITY.SECRET_RARE,
    condition:   CONDITION.MINT,
    imageUrl:    null, // replace with real URL when available
    seller:      mockUsers[0],
    price:       4200.00,
    priceHistory: [3800, 3950, 4100, 3900, 4050, 4200],
    listedAt:    '2025-03-01T10:00:00Z',
    status:      TRANSACTION_STATUS.ACTIVE,
    tags:        ['generative', 'hooded-figure', 'dark-art'],
  },
  {
    id:          'asset-002',
    name:        'Ancient Phoenix',
    description: 'A majestic phoenix rendered in celestial fire. Part of the first Celestial Series drop.',
    collection:  COLLECTION.CELESTIAL_SERIES,
    rarity:      RARITY.SECRET_RARE,
    condition:   CONDITION.MINT,
    imageUrl:    null,
    seller:      mockUsers[1],
    price:       1299.00,
    priceHistory: [900, 980, 1100, 1050, 1200, 1299],
    listedAt:    '2025-03-05T14:30:00Z',
    status:      TRANSACTION_STATUS.ACTIVE,
    tags:        ['phoenix', 'fire', 'celestial'],
  },
  {
    id:          'asset-003',
    name:        'Dark Sorcerer Supreme',
    description: 'An ultra-rare profile picture piece from Core Drop 2024, depicting a sorcerer in dimensional flux.',
    collection:  COLLECTION.CORE_DROP_2024,
    rarity:      RARITY.ULTRA_RARE,
    condition:   CONDITION.NEAR_MINT,
    imageUrl:    null,
    seller:      mockUsers[2],
    price:       249.99,
    priceHistory: [180, 200, 230, 215, 245, 249.99],
    listedAt:    '2025-03-08T09:00:00Z',
    status:      TRANSACTION_STATUS.ACTIVE,
    tags:        ['pfp', 'sorcerer', 'dimensional'],
  },
  {
    id:          'asset-004',
    name:        'Forest Guardian',
    description: 'A lush scene illustration of a guardian spirit woven from ancient roots and bioluminescent flora.',
    collection:  COLLECTION.CORE_DROP_2024,
    rarity:      RARITY.UNCOMMON,
    condition:   CONDITION.LIGHTLY_PLAYED,
    imageUrl:    null,
    seller:      mockUsers[3],
    price:       12.99,
    priceHistory: [8, 9, 11, 10, 12, 12.99],
    listedAt:    '2025-03-10T16:00:00Z',
    status:      TRANSACTION_STATUS.ACTIVE,
    tags:        ['forest', 'guardian', 'scene'],
  },
  {
    id:          'asset-005',
    name:        'Void Architect #003',
    description: 'Promo-exclusive generative piece awarded to tournament top-8 finishers in Q1 2025.',
    collection:  COLLECTION.PROMO_TOURNAMENT,
    rarity:      RARITY.RARE,
    condition:   CONDITION.MINT,
    imageUrl:    null,
    seller:      mockUsers[4],
    price:       89.50,
    priceHistory: [60, 65, 70, 75, 85, 89.50],
    listedAt:    '2025-03-11T11:00:00Z',
    status:      TRANSACTION_STATUS.ACTIVE,
    tags:        ['promo', 'tournament', 'generative'],
  },
  {
    id:          'asset-006',
    name:        'Neon Wraith',
    description: 'A synthwave-inspired apparition from the Shadowfall Collection. Common tier, high-volume trade piece.',
    collection:  COLLECTION.SHADOWFALL,
    rarity:      RARITY.COMMON,
    condition:   CONDITION.MODERATELY_PLAYED,
    imageUrl:    null,
    seller:      mockUsers[0],
    price:       2.50,
    priceHistory: [1.5, 2, 2.2, 2.1, 2.4, 2.50],
    listedAt:    '2025-03-12T08:00:00Z',
    status:      TRANSACTION_STATUS.ACTIVE,
    tags:        ['synthwave', 'wraith', 'common'],
  },
];

/* ---------------------------------------------------------- */
/* MOCK STATS — for Home page stats bar                        */
/* ---------------------------------------------------------- */
export const mockStats = {
  totalVolume:    '$2,847,392',
  activeListings: 14_823,
  totalUsers:     8_204,
  floorPrice:     '$1.20',
  weeklyChange:   '+24.5%',
  weeklyPositive: true,
};

/* ---------------------------------------------------------- */
/* MOCK PRICE CHART DATA — for PriceChart island              */
/* ---------------------------------------------------------- */
export const mockPriceChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Shadowfall Floor',
      data:  [820, 940, 1100, 1050, 1320, 1480],
    },
    {
      label: 'Celestial Floor',
      data:  [400, 480, 550, 520, 700, 890],
    },
  ],
};
