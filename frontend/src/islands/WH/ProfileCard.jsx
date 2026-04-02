/**
 * ProfileCard.jsx — Dev 2 Island
 * Owner: Dev 2
 * Mounts via: mountIsland('profile-card-root', ProfileCard)
 * PHP view: backend/src/Views/profile.php
 * data-props: { userId }
 */

import { useState } from 'react';
import Card     from '../../shared/atoms/Card.jsx';
import Badge    from '../../shared/atoms/Badge.jsx';
import Button   from '../../shared/atoms/Button.jsx';
import Skeleton from '../../shared/atoms/Skeleton.jsx';
import { useApi }              from '../../shared/hooks/useApi.js';

const NAME_MAX = 30;
const BIO_MAX  = 150;



const PenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden="true">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const EyeIcon = () => (
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

const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" aria-hidden="true" style={{ color: '#92400e' }}>
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <path d="M16 12h2"/>
    <path d="M2 10h20"/>
  </svg>
);

export default function ProfileCard({ userId, currentUserId }) {
  const { data, loading, error } = useApi(`/api/v1/users/${userId}/profile`);

  const profile = data;

  const [activeSection, setActiveSection]     = useState('view');
  const [displayName, setDisplayName]         = useState('');
  const [bio, setBio]                         = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw]     = useState(false);
  const [showNewPw, setShowNewPw]             = useState(false);
  const [showConfirmPw, setShowConfirmPw]     = useState(false);
  const [passwordMsg, setPasswordMsg]         = useState('');
  const [bankName, setBankName]               = useState('');
  const [accountNumber, setAccountNumber]     = useState('');
  const [holderName, setHolderName]           = useState('');
  const [bankMsg, setBankMsg]                 = useState('');
  const [liveDisplayName, setLiveDisplayName] = useState(null);
  const [liveBio, setLiveBio]                 = useState(null);
  const [liveBank, setLiveBank]               = useState(null);
  const [showBalance, setShowBalance]         = useState(true);
  const [profileSaved, setProfileSaved]       = useState(false);

  if (loading) return <Skeleton variant="card" label="Loading profile" />;
  if (error)   return <p role="alert" className="text-(--color-danger) text-sm">Failed to load profile: {error}</p>;

  const { user, stats, wallet, bank } = profile ?? {};

  const shownName   = liveDisplayName ?? user?.username;
  const shownBio    = liveBio         ?? user?.bio;
  const shownBank   = liveBank        ?? bank;
  const isOwner     = !currentUserId  || userId === currentUserId;

  const maskedBalance = wallet?.balance
    ? '$' + wallet.balance.toLocaleString().replace(/[0-9]/g, 'x')
    : '$x,xxx';

  function handleEditStart() {
    setDisplayName(shownName ?? '');
    setBio(shownBio ?? '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMsg('');
    setProfileSaved(false);
    setActiveSection('profile');
  }

  async function handleProfileSave() {
    if (displayName.length > NAME_MAX || bio.length > BIO_MAX) return;

    try {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        const res  = await fetch(`/api/v1/users/${userId}/profile`, {
            method:  'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrf,
            },
            body: JSON.stringify({ displayName, bio }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            setPasswordMsg(data.message ?? 'Failed to update profile.');
            return;
        }

        setLiveDisplayName(displayName);
        setLiveBio(bio);
        setProfileSaved(true);
      setTimeout(() => {
        setProfileSaved(false);
        window.location.reload(); // reload so navbar + dashboard reflect new username
      }, 1500); // short delay

    } catch (err) {
        setPasswordMsg('Network error. Please try again.');
    }
}

  async function handlePasswordSave() {
    if (!currentPassword)                { setPasswordMsg('Enter your current password.'); return; }
    if (newPassword.length < 8)          { setPasswordMsg('New password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg('Passwords do not match.'); return; }

    try {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        const res  = await fetch('/api/v1/auth/change-password', {
            method:  'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrf,
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password:     newPassword,
            }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            setPasswordMsg(data.message ?? 'Failed to update password.');
            return;
        }

        setPasswordMsg('✅ Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

    } catch (err) {
        setPasswordMsg('Network error. Please try again.');
    }
}

  function handleBankStart() {
    setBankName(shownBank?.bankName ?? '');
    setAccountNumber(shownBank?.accountNumber ?? '');
    setHolderName(shownBank?.holderName ?? '');
    setActiveSection('bank');
  }

  function handleBankSave() {
    if (!bankName || !accountNumber || !holderName) { setBankMsg('All fields are required.'); return; }
    setLiveBank({ bankName, accountNumber, holderName });
    setBankMsg('✅ Bank details updated!');
    setTimeout(() => { setBankMsg(''); setActiveSection('view'); }, 1000);
  }
  const baseInput    = "bg-(--color-surface-2) border border-(--color-border) text-(--color-text-primary) text-sm rounded-md py-2 w-full";
  const inputClass   = `${baseInput} px-3`;
  const pwInputClass = `${baseInput} pl-3 pr-10`;

  return (
    <Card variant="default" padding="lg" className="flex flex-col gap-5">

      {activeSection === 'view' && (
        <>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-(--color-accent-subtle) border-2 border-(--color-accent) flex items-center justify-center shrink-0" aria-hidden="true">
              <span className="text-lg font-bold text-(--color-accent)">
                {shownName?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-(--color-text-primary)">{shownName}</h2>
                {user?.isVerified && <Badge label="Verified" colour="accent" size="sm" />}
                {isOwner && (
                  <button type="button" onClick={handleEditStart} aria-label="Edit profile" className="text-(--color-text-muted) hover:text-(--color-accent) transition-colors">
                    <PenIcon />
                  </button>
                )}
              </div>
              <p className="text-xs text-(--color-text-muted)">
                Joined {new Date(stats?.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          {shownBio && <p className="text-sm text-(--color-text-secondary)">{shownBio}</p>}

          <div className="grid grid-cols-3 gap-3 border-t border-(--color-border) pt-4">
            {[
              { label: 'Sales',  value: stats?.totalSales  },
              { label: 'Volume', value: stats?.totalVolume },
              { label: 'Owned',  value: stats?.itemsOwned  },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-base font-bold text-(--color-text-primary)">{value ?? '—'}</p>
                <p className="text-[10px] text-(--color-text-muted) uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          {isOwner && (
            <div className="flex flex-col gap-3 border-t border-(--color-border) pt-4">
              
                <div className="flex items-center gap-2">
                  <WalletIcon />
                  <h3 className="text-sm font-bold text-(--color-text-primary)">My Wallet</h3>
                
                  <button
                    type="button"
                    onClick={() => setShowBalance(v => !v)}
                    aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                    className="ml-1 text-(--color-text-muted) hover:text-(--color-accent) transition-colors inline-flex items-center"
                  >
                    {showBalance ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                  
                </div>
              <p className="text-2xl font-bold text-(--color-accent)">
                {showBalance ? `$${wallet?.balance?.toLocaleString()}` : maskedBalance}
                <span className="text-sm font-normal text-(--color-text-muted) ml-1">{wallet?.currency}</span>
              </p>
              <Button variant="secondary" size="sm" onClick={handleBankStart} className="w-fit">
                🏦 Bank Account
              </Button>
            </div>
          )}
        </>
      )}

      {activeSection === 'profile' && (
        <div className="flex flex-col gap-4">

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-(--color-text-primary)">Edit Profile</h3>
            <button
              type="button"
              onClick={() => setActiveSection('view')}
              aria-label="Close edit profile"
              className="text-(--color-text-muted) hover:text-(--color-accent) transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20">
              <div className="w-20 h-20 rounded-full bg-(--color-accent-subtle) border-2 border-(--color-accent) flex items-center justify-center">
                <span className="text-2xl font-bold text-(--color-accent)">
                  {shownName?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <button type="button" aria-label="Upload profile photo" onClick={() => alert('Photo upload coming soon!')}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-(--color-accent) text-white flex items-center justify-center border-2 border-(--color-surface) hover:bg-(--color-accent-hover) transition-colors">
                <CameraIcon />
              </button>
            </div>
            <p className="text-xs text-(--color-text-muted)">Tap camera to upload photo</p>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <label className="text-xs text-(--color-text-muted)" htmlFor="edit-name">Display Name</label>
              <span className={`text-xs ${displayName.length > NAME_MAX ? 'text-(--color-danger)' : 'text-(--color-text-muted)'}`}>
                {displayName.length}/{NAME_MAX}
              </span>
            </div>
            <input id="edit-name" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your display name" className={inputClass} />
            {displayName.length > NAME_MAX && <p className="text-xs text-(--color-danger)">Name too long!</p>}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <label className="text-xs text-(--color-text-muted)" htmlFor="edit-bio">Bio</label>
              <span className={`text-xs ${bio.length > BIO_MAX ? 'text-(--color-danger)' : 'text-(--color-text-muted)'}`}>
                {bio.length}/{BIO_MAX}
              </span>
            </div>
            <textarea id="edit-bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell others about yourself..." rows={3} className={`${inputClass} resize-none`} />
            {bio.length > BIO_MAX && <p className="text-xs text-(--color-danger)">Bio too long!</p>}
          </div>

          <div className="flex flex-col gap-2">
             <Button variant="primary" size="sm" onClick={handleProfileSave} disabled={displayName.length > NAME_MAX || bio.length > BIO_MAX} className="w-fit">
              Save Profile
            </Button>
            {profileSaved && (
              <p className="text-xs text-(--color-success)">✅ Profile updated successfully!</p>
            )}
          </div>

          <div className="border-t border-(--color-border) pt-4 flex flex-col gap-3">
            <h4 className="text-sm font-bold text-(--color-text-primary)">Change Password</h4>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-(--color-text-muted)" htmlFor="current-pw">Current Password</label>
              <div className="relative">
                <input id="current-pw" type={showCurrentPw ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" className={pwInputClass} />
                <button type="button" onClick={() => setShowCurrentPw(v => !v)} aria-label={showCurrentPw ? 'Hide' : 'Show'} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-accent)">
                  {showCurrentPw ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-(--color-text-muted)" htmlFor="new-pw">New Password</label>
              <div className="relative">
                <input id="new-pw" type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" className={pwInputClass} />
                <button type="button" onClick={() => setShowNewPw(v => !v)} aria-label={showNewPw ? 'Hide' : 'Show'} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-accent)">
                  {showNewPw ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-(--color-text-muted)" htmlFor="confirm-pw">Confirm New Password</label>
              <div className="relative">
                <input id="confirm-pw" type={showConfirmPw ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" className={pwInputClass} />
                <button type="button" onClick={() => setShowConfirmPw(v => !v)} aria-label={showConfirmPw ? 'Hide' : 'Show'} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-accent)">
                  {showConfirmPw ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
            </div>

            {passwordMsg && (
              <p className={`text-xs ${passwordMsg.startsWith('✅') ? 'text-(--color-success)' : 'text-(--color-danger)'}`}>{passwordMsg}</p>
            )}

            <Button variant="primary" size="sm" onClick={handlePasswordSave} className="w-fit">
              Update Password
            </Button>
          </div>

        </div>
      )}

      {activeSection === 'bank' && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-(--color-text-primary)">🏦 Bank Account Details</h3>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-(--color-text-muted)" htmlFor="bank-name">Bank Name</label>
            <input id="bank-name" type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. DBS Bank, OCBC" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-(--color-text-muted)" htmlFor="account-number">Account Number</label>
            <input id="account-number" type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="e.g. 1234-5678-9012" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-(--color-text-muted)" htmlFor="holder-name">Account Holder Name</label>
            <input id="holder-name" type="text" value={holderName} onChange={e => setHolderName(e.target.value)} placeholder="Full name on account" className={inputClass} />
          </div>
          {bankMsg && (
            <p className={`text-xs ${bankMsg.startsWith('✅') ? 'text-(--color-success)' : 'text-(--color-danger)'}`}>{bankMsg}</p>
          )}
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleBankSave}>Save</Button>
            <Button variant="secondary" size="sm" onClick={() => { setActiveSection('view'); setBankMsg(''); }}>Cancel</Button>
          </div>
        </div>
      )}

    </Card>
  );
}