/**
 * profile.jsx — Profile Page Prototype Entry
 * Owner: WH (Dev 2)
 * Route: /profile (profile.html)
 * At integration: moves to backend/src/Views/profile.php
 * 
 * AVAILABLE ISLANDS (yours to mount):
 *   <ProfileCard userId="user-001" /> ← mounts as  <div id="profile-card-root">
 *
 * AVAILABLE MOLECULES + ATOMS (import from shared):
 *   AssetCard  ← from '../shared/molecules/AssetCard.jsx'  (for owned assets grid)
 *   Card, Button, Badge, Skeleton  ← from '../shared/atoms/...'
 *
 * MOCK DATA (already available):
 *   mockAssets  ← use this to render a mock "Owned Assets" grid below the ProfileCard
 *
 *     the profile page will likely need:
 *   - ProfileCard island at the top (user avatar, bio, stats)
 *   - A section below for "Owned Assets" — use mockAssets + <AssetCard compact />
 *   - Optional: tabs for "Owned", "Listed", "Transaction History"
 */

import { StrictMode, useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

import LocalNav                        from '../shared/molecules/LocalNav.jsx';
import ProfileCard                     from '../islands/WH/ProfileCard.jsx';
import Card                            from '../shared/atoms/Card.jsx';
import Button                          from '../shared/atoms/Button.jsx';
import Badge                           from '../shared/atoms/Badge.jsx';
import { RarityBadge, ConditionBadge } from '../shared/atoms/Badge.jsx';
import { mockAssets, RARITY, CONDITION } from '../shared/mockAssets.js';

const saved = localStorage.getItem('vft-theme');
document.documentElement.setAttribute('data-theme',
  ['dark','light','colorblind'].includes(saved) ? saved : 'dark'
);

const TABS           = ['Owned Assets', 'Transaction History'];
const PER_PAGE       = 6;
const ALL_RARITIES   = Object.values(RARITY);
const ALL_CONDITIONS = Object.values(CONDITION);

const mockTransactions = [
  { id: 'tx-001', type: 'BUY',  asset: 'Shadowfall Genesis #001', rarity: RARITY.SECRET_RARE, condition: 'Mint',              price: 4200.00, date: '2025-03-01', counterparty: 'NeonTrader'  },
  { id: 'tx-002', type: 'SELL', asset: 'Ancient Phoenix',         rarity: RARITY.SECRET_RARE, condition: 'Mint',              price: 1299.00, date: '2025-03-05', counterparty: 'ShadowHawk'  },
  { id: 'tx-003', type: 'BUY',  asset: 'Dark Sorcerer Supreme',   rarity: RARITY.ULTRA_RARE,  condition: 'Near Mint',         price: 249.99,  date: '2025-03-08', counterparty: 'CelestialX'  },
  { id: 'tx-004', type: 'SELL', asset: 'Forest Guardian',         rarity: RARITY.UNCOMMON,    condition: 'Lightly Played',    price: 12.99,   date: '2025-03-10', counterparty: 'VaultKeeper' },
  { id: 'tx-005', type: 'BUY',  asset: 'Void Architect #003',     rarity: RARITY.RARE,        condition: 'Mint',              price: 89.50,   date: '2025-03-11', counterparty: '0xVault'     },
  { id: 'tx-006', type: 'SELL', asset: 'Neon Wraith',             rarity: RARITY.COMMON,      condition: 'Moderately Played', price: 2.50,    date: '2025-03-12', counterparty: 'NeonTrader'  },
];

const PenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const EyeOpenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function ProfilePage() {
  const [activeTab, setActiveTab]               = useState('Owned Assets');
  const [view, setView]                         = useState('grid');
  const [page, setPage]                         = useState(1);
  const [editingInterests, setEditingInterests] = useState(false);
  const [interests, setInterests]               = useState([RARITY.SECRET_RARE, RARITY.ULTRA_RARE, RARITY.RARE]);
  const [mintPreferred, setMintPreferred]       = useState(true);
  const [editingFavourite, setEditingFavourite] = useState(false);
  const [favouriteIndex, setFavouriteIndex]     = useState(0);
  const [favSearch, setFavSearch]               = useState('');
  const [favRarity, setFavRarity]               = useState('');
  const [historyVisible, setHistoryVisible]     = useState(true);
  const [txSort, setTxSort]                     = useState('low');
  const [txRarity, setTxRarity]                 = useState('');
  const [txCondition, setTxCondition]           = useState('');
  const [txType, setTxType]                     = useState('');
  const [ownedSort, setOwnedSort]               = useState('low');
  const [ownedRarity, setOwnedRarity]           = useState('');

  const favouriteAsset = mockAssets[favouriteIndex];

  const filteredFavAssets = useMemo(() =>
    mockAssets.filter(a => {
      if (favSearch && !a.name.toLowerCase().includes(favSearch.toLowerCase())) return false;
      if (favRarity && a.rarity !== favRarity) return false;
      return true;
    }), [favSearch, favRarity]
  );

  const filteredOwned = useMemo(() => {
    const f = mockAssets.filter(a => {
      if (ownedRarity && a.rarity !== ownedRarity) return false;
      return true;
    });
    return [...f].sort((a, b) =>
      ownedSort === 'high' ? b.price - a.price : a.price - b.price
    );
  }, [ownedSort, ownedRarity]);

  const totalPages  = Math.ceil(filteredOwned.length / PER_PAGE);
  const pagedAssets = filteredOwned.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const filteredTx = useMemo(() => {
    const f = mockTransactions.filter(tx => {
      if (txType === 'BUY' && tx.type !== 'BUY') return false;
      if (txType === 'SELL' && tx.type !== 'SELL') return false;
      if (txRarity && tx.rarity !== txRarity) return false;
      if (txCondition && tx.condition !== txCondition) return false;
      return true;
    });
    return [...f].sort((a, b) =>
      txSort === 'high' ? b.price - a.price : a.price - b.price
    );
  }, [txSort, txRarity, txCondition, txType]);

  function handleTabChange(tab) {
    setActiveTab(tab);
    setPage(1);
  }

  function toggleInterest(rarity) {
    setInterests(prev =>
      prev.includes(rarity) ? prev.filter(r => r !== rarity) : [...prev, rarity]
    );
  }

  const selectClass = "bg-(--color-surface-2) border border-(--color-border) text-(--color-text-primary) text-sm rounded-md px-3 py-2";
  const inputClass  = "bg-(--color-surface-2) border border-(--color-border) text-(--color-text-primary) text-sm rounded-md px-3 py-2 w-full";

  return (
    <div className="min-h-screen bg-(--color-bg)">
      <LocalNav />
      <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">

        <ProfileCard userId="user-001" currentUserId="user-001" />

        <Card variant="default" padding="md" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-(--color-text-primary)">Looking For</h3>
            <button type="button" onClick={() => setEditingInterests(e => !e)} aria-label="Edit looking for" className="text-(--color-text-muted) hover:text-(--color-accent) transition-colors">
              <PenIcon />
            </button>
          </div>
          {editingInterests ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-(--color-text-muted)">Select rarities you are looking for:</p>
              <div className="flex flex-wrap gap-2">
                {ALL_RARITIES.map(r => (
                  <button key={r} type="button" onClick={() => toggleInterest(r)}
                    className={`text-xs px-3 py-1 rounded-full border font-semibold transition-colors
                      ${interests.includes(r)
                        ? 'bg-(--color-accent) border-(--color-accent) text-white'
                        : 'bg-transparent border-(--color-border) text-(--color-text-muted) hover:border-(--color-accent)'
                      }`}>
                    {r}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm text-(--color-text-primary) cursor-pointer">
                <input type="checkbox" checked={mintPreferred} onChange={e => setMintPreferred(e.target.checked)} className="accent-(--color-accent)" />
                Mint condition preferred
              </label>
              <Button variant="primary" size="sm" onClick={() => setEditingInterests(false)}>Done</Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {interests.map(interest => (
                <Badge key={interest} label={interest} colour="accent" size="sm" />
              ))}
              {mintPreferred && <span className="text-xs text-(--color-text-muted) self-center">+ Mint condition preferred</span>}
            </div>
          )}
        </Card>

        <Card variant="default" padding="md" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-(--color-text-primary)">⭐ Favourite Asset</h3>
            <button type="button" onClick={() => setEditingFavourite(e => !e)} aria-label="Edit favourite asset" className="text-(--color-text-muted) hover:text-(--color-accent) transition-colors">
              <PenIcon />
            </button>
          </div>
          {editingFavourite ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <input type="search" value={favSearch} onChange={e => setFavSearch(e.target.value)} placeholder="Search assets..." className={`${inputClass} flex-1 min-w-0`} aria-label="Search favourite asset" />
                <select value={favRarity} onChange={e => setFavRarity(e.target.value)} className={selectClass} aria-label="Filter by rarity">
                  <option value="">All Rarities</option>
                  {ALL_RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {filteredFavAssets.length === 0 ? (
                  <p className="text-sm text-(--color-text-muted) text-center py-4">No assets found</p>
                ) : (
                  filteredFavAssets.map(asset => (
                    <button key={asset.id} type="button"
                      onClick={() => { setFavouriteIndex(mockAssets.indexOf(asset)); setEditingFavourite(false); setFavSearch(''); setFavRarity(''); }}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors
                        ${mockAssets.indexOf(asset) === favouriteIndex
                          ? 'border-(--color-accent) bg-(--color-accent-subtle)'
                          : 'border-(--color-border) hover:border-(--color-accent)'
                        }`}>
                      <div className="w-10 h-10 rounded bg-(--color-surface-2) border border-(--color-border) flex items-center justify-center shrink-0">
                        <span className="text-xs text-(--color-text-muted)">IMG</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-(--color-text-primary)">{asset.name}</p>
                        <p className="text-xs text-(--color-text-muted)">{asset.rarity} · {asset.collection}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-md bg-(--color-surface-2) border border-(--color-border) shrink-0 flex items-center justify-center">
                <span className="text-xs text-(--color-text-muted)">IMG</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-(--color-text-primary)">{favouriteAsset.name}</p>
                <div className="flex flex-wrap gap-1">
                  <RarityBadge tier={favouriteAsset.rarity} size="sm" />
                  <ConditionBadge condition={favouriteAsset.condition} size="sm" />
                </div>
                <p className="text-xs text-(--color-text-muted)">{favouriteAsset.collection}</p>
              </div>
            </div>
          )}
        </Card>

        <section>
          <div className="flex gap-1 border-b border-(--color-border) mb-6">
            {TABS.map(tab => (
              <button key={tab} type="button" onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-px
                  ${activeTab === tab
                    ? 'border-(--color-accent) text-(--color-accent)'
                    : 'border-transparent text-(--color-text-muted) hover:text-(--color-text-primary)'
                  }`}
                aria-selected={activeTab === tab} role="tab">
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Owned Assets' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <select value={ownedRarity} onChange={e => { setOwnedRarity(e.target.value); setPage(1); }} className={selectClass} aria-label="Filter by rarity">
                    <option value="">All Rarities</option>
                    {ALL_RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select value={ownedSort} onChange={e => setOwnedSort(e.target.value)} className={selectClass} aria-label="Sort by price">
                    <option value="low">Default</option>
                    <option value="high">Price: High to Low</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-(--color-text-muted)">{filteredOwned.length} assets</p>
                  <div className="flex gap-1 border border-(--color-border) rounded-md p-0.5">
                    <button type="button" onClick={() => setView('grid')} aria-label="Grid view" className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${view === 'grid' ? 'bg-(--color-accent) text-white' : 'text-(--color-text-muted) hover:text-(--color-text-primary)'}`}>Grid</button>
                    <button type="button" onClick={() => setView('list')} aria-label="List view" className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${view === 'list' ? 'bg-(--color-accent) text-white' : 'text-(--color-text-muted) hover:text-(--color-text-primary)'}`}>List</button>
                  </div>
                </div>
              </div>

              {filteredOwned.length === 0 && (
                <p className="text-center text-(--color-text-muted) py-12 text-sm">No assets found.</p>
              )}

              {view === 'grid' && filteredOwned.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pagedAssets.map(asset => (
                    <Card key={asset.id} variant="default" padding="sm" className="flex flex-col gap-3">
                      <div className="w-full aspect-square bg-(--color-surface-2) rounded-md border border-(--color-border) flex items-center justify-center">
                        <span className="text-xs text-(--color-text-muted)">IMG</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-(--color-text-primary) line-clamp-2">{asset.name}</p>
                        <div className="flex flex-wrap gap-1">
                          <RarityBadge tier={asset.rarity} size="sm" />
                        </div>
                        <p className="text-xs text-(--color-text-muted)">{asset.collection}</p>
                        <p className="text-sm font-bold text-(--color-text-primary)">${asset.price.toLocaleString()}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {view === 'list' && filteredOwned.length > 0 && (
                <div className="flex flex-col gap-3">
                  {pagedAssets.map(asset => (
                    <div key={asset.id} className="flex items-center gap-4 p-4 rounded-lg bg-(--color-surface) border border-(--color-border)">
                      <div className="w-16 h-16 rounded-md bg-(--color-surface-2) border border-(--color-border) shrink-0 flex items-center justify-center">
                        <span className="text-xs text-(--color-text-muted)">IMG</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-(--color-text-primary) truncate">{asset.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <RarityBadge tier={asset.rarity} size="sm" />
                        </div>
                        <p className="text-xs text-(--color-text-muted) mt-1">{asset.collection}</p>
                      </div>
                      <p className="text-sm font-bold text-(--color-text-primary) shrink-0">${asset.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-2">
                  <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} aria-label="Previous page">← Prev</Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} type="button" onClick={() => setPage(p)} aria-label={`Page ${p}`} aria-current={page === p ? 'page' : undefined}
                      className={`w-8 h-8 rounded text-sm font-semibold transition-colors ${page === p ? 'bg-(--color-accent) text-white' : 'text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-surface-2)'}`}>
                      {p}
                    </button>
                  ))}
                  <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} aria-label="Next page">Next →</Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Transaction History' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                  <select value={txSort} onChange={e => setTxSort(e.target.value)} className={selectClass} aria-label="Sort by price">
                    <option value="low">Default</option>
                    <option value="high">Price: High to Low</option>
                  </select>
                  <select value={txRarity} onChange={e => setTxRarity(e.target.value)} className={selectClass} aria-label="Filter by rarity">
                    <option value="">All Rarities</option>
                    {ALL_RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select value={txCondition} onChange={e => setTxCondition(e.target.value)} className={selectClass} aria-label="Filter by condition">
                    <option value="">All Conditions</option>
                    {ALL_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="flex gap-1 border border-(--color-border) rounded-md p-0.5">
                    <button type="button" onClick={() => setTxType('')} aria-label="Show all"
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${txType === '' ? 'bg-(--color-accent) text-white' : 'text-(--color-text-muted) hover:text-(--color-text-primary)'}`}>
                      All
                    </button>
                    <button type="button" onClick={() => setTxType('BUY')} aria-label="Show buy only"
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${txType === 'BUY' ? 'bg-(--color-success) text-white' : 'text-(--color-text-muted) hover:text-(--color-text-primary)'}`}>
                      Buy
                    </button>
                    <button type="button" onClick={() => setTxType('SELL')} aria-label="Show sell only"
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${txType === 'SELL' ? 'bg-(--color-danger) text-white' : 'text-(--color-text-muted) hover:text-(--color-text-primary)'}`}>
                      Sell
                    </button>
                  </div>
                </div>
                <button type="button" onClick={() => setHistoryVisible(v => !v)}
                  aria-label={historyVisible ? 'Hide history' : 'Show history'}
                  className="flex items-center gap-1.5 text-xs text-(--color-text-muted) hover:text-(--color-accent) transition-colors">
                  {historyVisible ? <EyeOpenIcon /> : <EyeOffIcon />}
                  {historyVisible ? 'Hide History' : 'Show History'}
                </button>
              </div>

              {historyVisible ? (
                filteredTx.length === 0 ? (
                  <p className="text-center text-(--color-text-muted) py-12 text-sm">No transactions found.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {filteredTx.map(tx => (
                      <div key={tx.id} className="flex items-center gap-3 p-4 rounded-lg bg-(--color-surface) border border-(--color-border)">
                        <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${tx.type === 'BUY' ? 'bg-(--color-success-subtle) text-(--color-success)' : 'bg-(--color-danger-subtle) text-(--color-danger)'}`}>
                          {tx.type}
                        </span>
                        <p className="text-sm font-semibold text-(--color-text-primary) flex-1 truncate">{tx.asset}</p>
                        <div className="hidden sm:flex gap-1 shrink-0">
                          <RarityBadge tier={tx.rarity} size="sm" />
                          <ConditionBadge condition={tx.condition} size="sm" />
                        </div>
                        <p className="text-xs text-(--color-text-muted) shrink-0 hidden md:block">
                          {tx.type === 'BUY' ? 'from' : 'to'} {tx.counterparty} for <span className="text-sm font-semibold text-(--color-text-primary)">${tx.price.toLocaleString()}</span>
                        </p>
                       
                        <p className="text-xs text-(--color-text-muted) shrink-0">
                          {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center gap-2 py-12">
                  <EyeOffIcon />
                  <p className="text-sm text-(--color-text-muted)">Transaction history is hidden</p>
                  <button type="button" onClick={() => setHistoryVisible(true)} className="text-xs text-(--color-accent) hover:underline">Show history</button>
                </div>
              )}
            </div>
          )}

        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><ProfilePage /></StrictMode>
);