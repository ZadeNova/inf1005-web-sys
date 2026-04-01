/**
 * constants.js — Vapour FT Shared Enumerations
 * Single source of truth for all domain constants.
 * Mirrors the DB ENUM values exactly.
 */

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
  CORE_DROP_2024:     'Core Drop 2024',
  SHADOWFALL:         'Shadowfall Collection',
  CELESTIAL_SERIES:   'Celestial Series',
  PROMO_TOURNAMENT:   'Promo/Tournament Exclusive',
};

export const TRANSACTION_STATUS = {
  ACTIVE:    'active',
  SOLD:      'sold',
  CANCELLED: 'cancelled',
  PENDING:   'pending',
};