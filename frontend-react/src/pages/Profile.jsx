import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getAllPlans } from '../api/plans';
import { getProfile, updateProfile, changePassword, getPreferences, updatePreferences } from '../api/user';
import toast from 'react-hot-toast';
import {
  User, Mail, MapPin, FileText, Lock, Shield, BarChart2,
  CheckCircle, AlertCircle, Save, Eye, EyeOff, Plane,
  Calendar, Globe, Zap, Mountain, Utensils, Landmark,
  Music, Camera, Ship, Bike, ChevronRight, Trash2
} from 'lucide-react';

// ─── Travel interest tags config ────────────────────────────────────────────
const INTEREST_TAGS = [
  { id: 'adventure', label: 'Adventure', icon: Mountain },
  { id: 'culture', label: 'Culture', icon: Landmark },
  { id: 'food', label: 'Food & Cuisine', icon: Utensils },
  { id: 'nature', label: 'Nature', icon: Globe },
  { id: 'nightlife', label: 'Nightlife', icon: Music },
  { id: 'photography', label: 'Photography', icon: Camera },
  { id: 'beaches', label: 'Beaches', icon: Ship },
  { id: 'cycling', label: 'Cycling', icon: Bike },
  { id: 'history', label: 'History', icon: Landmark },
  { id: 'wellness', label: 'Wellness & Spa', icon: Zap },
];

const BUDGET_OPTIONS = [
  { value: 'BUDGET', label: 'Backpacker', desc: 'Hostels & Street food' },
  { value: 'MID_RANGE', label: 'Mid-range', desc: 'Hotels & Local restaurants' },
  { value: 'LUXURY', label: 'Luxury', desc: 'Premium stays & Fine dining' },
];

const PACE_OPTIONS = [
  { value: 'SLOW', label: 'Slow & Relaxed', desc: '1–2 activities per day' },
  { value: 'BALANCED', label: 'Balanced', desc: '3–4 activities per day' },
  { value: 'FAST', label: 'Fast-Paced', desc: '5+ activities per day' },
];

// ─── Avatar Component ────────────────────────────────────────────────────────
function Avatar({ name, size = 'lg' }) {
  const initials = name ? name.substring(0, 2).toUpperCase() : '??';
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-cyan-500 to-blue-600',
  ];
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;
  const sizeClass = size === 'lg' ? 'w-24 h-24 text-3xl' : 'w-14 h-14 text-xl';

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center font-medium text-white shadow-lg shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────
function Section({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`bg-card border border-card-border rounded-2xl p-6 md:p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ─── Field Row ───────────────────────────────────────────────────────────────
function FieldRow({ icon: Icon, label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, color = 'blue' }) {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
  };
  return (
    <div className="bg-card border border-card-border rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// ─── Main Profile Page ───────────────────────────────────────────────────────
export default function Profile() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');

  // Data states
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit states — Personal
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [savingPersonal, setSavingPersonal] = useState(false);

  // Edit states — Preferences
  const [budgetLevel, setBudgetLevel] = useState('');
  const [travelPace, setTravelPace] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Edit states — Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'preferences', label: 'Travel Preferences', icon: Plane },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'stats', label: 'Travel Stats', icon: BarChart2 },
  ];

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profileData, prefsData, plansData] = await Promise.allSettled([
        getProfile(),
        getPreferences(),
        getAllPlans(),
      ]);

      if (profileData.status === 'fulfilled') {
        const p = profileData.value;
        setProfile(p);
        setDisplayName(p.displayName || '');
        setBio(p.bio || '');
        setHomeCity(p.homeCity || '');
      }
      if (prefsData.status === 'fulfilled') {
        const pr = prefsData.value;
        setPreferences(pr);
        setBudgetLevel(pr.budgetLevel || '');
        setTravelPace(pr.travelPace || '');
        setDietaryRestrictions(pr.dietaryRestrictions || '');
        setAccessibilityNeeds(pr.accessibilityNeeds || '');
        setSelectedInterests(pr.travelInterests ? pr.travelInterests.split(',').filter(Boolean) : []);
      }
      if (plansData.status === 'fulfilled') {
        const d = plansData.value;
        setPlans(Array.isArray(d) ? d : d?.plans || []);
      }
    } catch (err) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonal = async () => {
    setSavingPersonal(true);
    try {
      const updated = await updateProfile({ displayName, bio, homeCity });
      setProfile(updated);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      await updatePreferences({
        budgetLevel,
        travelPace,
        dietaryRestrictions,
        accessibilityNeeds,
        travelInterests: selectedInterests.join(','),
      });
      toast.success('Travel preferences saved!');
    } catch (err) {
      toast.error('Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incorrect current password');
    } finally {
      setSavingPassword(false);
    }
  };

  const toggleInterest = (id) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Compute stats
  const totalDestinations = new Set(plans.map(p => p.destination?.split(',')[0]?.trim()).filter(Boolean)).size;
  const totalDaysPlanned = plans.reduce((acc, p) => {
    if (!p.startDate || !p.endDate) return acc;
    const diff = Math.abs(new Date(p.endDate) - new Date(p.startDate));
    return acc + Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, 0);
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
          <span className="text-sm text-muted-foreground">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent font-sans">
      
      {/* Static Profile Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#030303]">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=90&w=1920&auto=format&fit=crop"
          alt="Profile Background"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 grayscale-[20%]"
        />
      </div>

      <motion.div 
        className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 }
          }
        }}
      >

        {/* ─── Hero Header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden mb-8"
        >
          {/* Gradient Banner */}
          <div className="h-36 bg-gradient-to-r from-blue-600/30 via-purple-600/20 to-indigo-600/30 border border-card-border" />

          {/* Profile info overlay */}
          <div className="bg-card border-x border-b border-card-border rounded-b-3xl px-6 md:px-10 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <div className="ring-4 ring-card rounded-full">
                <Avatar name={profile?.displayName || user?.username} size="lg" />
              </div>
              <div className="flex-1 pb-1">
                <h1 className="text-2xl font-semibold text-foreground">
                  {profile?.displayName || user?.username}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {profile?.email || user?.email}
                  </span>
                  {profile?.homeCity && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {profile.homeCity}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Member since {memberSince}
                  </span>
                  {profile?.emailVerified ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <AlertCircle className="w-3 h-3" /> Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Tab Navigation ───────────────────────────────────────── */}
        <div className="flex gap-1 bg-card border border-card-border rounded-2xl p-1 mb-8 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
                  isActive
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── Tab Content ──────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* ── Personal Info Tab ── */}
          {activeTab === 'personal' && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Section>
                <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FieldRow icon={User} label="Display Name">
                    <input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder={user?.username}
                      className="input-field"
                    />
                  </FieldRow>

                  <FieldRow icon={Mail} label="Email Address">
                    <div className="relative">
                      <input
                        value={profile?.email || user?.email || ''}
                        readOnly
                        className="input-field opacity-60 cursor-not-allowed pr-28"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        Read-only
                      </span>
                    </div>
                  </FieldRow>

                  <FieldRow icon={MapPin} label="Home City / Base Location">
                    <input
                      value={homeCity}
                      onChange={e => setHomeCity(e.target.value)}
                      placeholder="e.g. Chennai, India"
                      className="input-field"
                    />
                  </FieldRow>

                  <FieldRow icon={User} label="Username">
                    <div className="relative">
                      <input
                        value={user?.username || ''}
                        readOnly
                        className="input-field opacity-60 cursor-not-allowed pr-28"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        Read-only
                      </span>
                    </div>
                  </FieldRow>

                  <div className="md:col-span-2">
                    <FieldRow icon={FileText} label="Bio / Tagline">
                      <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder='e.g. "Adventure seeker, 23 countries visited, weekend hiker 🏔️"'
                        rows={3}
                        className="input-field resize-none"
                      />
                      <span className="text-xs text-muted-foreground mt-1">{bio.length}/200 characters</span>
                    </FieldRow>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                  <p className="text-xs text-muted-foreground">Changes apply to your public travel profile</p>
                  <button
                    onClick={handleSavePersonal}
                    disabled={savingPersonal}
                    className="btn-primary flex items-center gap-2 text-sm px-6 py-2.5"
                  >
                    {savingPersonal ? (
                      <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              </Section>

              {/* Email Verification Banner */}
              {!profile?.emailVerified && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-6 py-4"
                >
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-300">Email not verified</p>
                    <p className="text-xs text-amber-400/70 mt-0.5">Verify your email to unlock advanced features and secure your account.</p>
                  </div>
                  <button
                    onClick={() => toast('Email verification coming soon! 📧', { icon: '⏳' })}
                    className="text-xs font-medium text-amber-300 border border-amber-400/30 px-3 py-1.5 rounded-lg hover:bg-amber-400/10 transition-colors whitespace-nowrap flex items-center gap-1"
                  >
                    Verify Email <ChevronRight className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Travel Preferences Tab ── */}
          {activeTab === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Budget */}
              <Section>
                <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Plane className="w-5 h-5 text-muted-foreground" />
                  Budget Style
                </h2>
                <p className="text-sm text-muted-foreground mb-5">This helps the AI tailor accommodation and dining suggestions.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {BUDGET_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setBudgetLevel(opt.value)}
                      className={`flex flex-col items-start gap-1 p-4 rounded-2xl border transition-all text-left ${
                        budgetLevel === opt.value
                          ? 'border-foreground bg-foreground/5 shadow-sm'
                          : 'border-border hover:border-foreground/30'
                      }`}
                    >
                      <span className="text-sm font-medium text-foreground">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </Section>

              {/* Travel Pace */}
              <Section>
                <h2 className="text-lg font-semibold text-foreground mb-2">Travel Pace</h2>
                <p className="text-sm text-muted-foreground mb-5">How many activities do you like to pack into a single day?</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PACE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setTravelPace(opt.value)}
                      className={`flex flex-col items-start gap-1 p-4 rounded-2xl border transition-all text-left ${
                        travelPace === opt.value
                          ? 'border-foreground bg-foreground/5 shadow-sm'
                          : 'border-border hover:border-foreground/30'
                      }`}
                    >
                      <span className="text-sm font-medium text-foreground">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </Section>

              {/* Interest Tags */}
              <Section>
                <h2 className="text-lg font-semibold text-foreground mb-2">Travel Interests</h2>
                <p className="text-sm text-muted-foreground mb-5">Select all that excite you — the AI uses this to personalise itineraries.</p>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_TAGS.map(tag => {
                    const Icon = tag.icon;
                    const active = selectedInterests.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleInterest(tag.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                          active
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                            : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* Special Needs */}
              <Section>
                <h2 className="text-lg font-semibold text-foreground mb-5">Special Requirements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FieldRow icon={Utensils} label="Dietary Restrictions">
                    <input
                      value={dietaryRestrictions}
                      onChange={e => setDietaryRestrictions(e.target.value)}
                      placeholder="e.g. Vegetarian, Gluten-free, Halal..."
                      className="input-field"
                    />
                  </FieldRow>
                  <FieldRow icon={Shield} label="Accessibility Needs">
                    <input
                      value={accessibilityNeeds}
                      onChange={e => setAccessibilityNeeds(e.target.value)}
                      placeholder="e.g. Wheelchair access, visual aids..."
                      className="input-field"
                    />
                  </FieldRow>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                  <p className="text-xs text-muted-foreground">Preferences improve every AI-generated itinerary</p>
                  <button
                    onClick={handleSavePreferences}
                    disabled={savingPrefs}
                    className="btn-primary flex items-center gap-2 text-sm px-6 py-2.5"
                  >
                    {savingPrefs ? (
                      <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Preferences
                  </button>
                </div>
              </Section>
            </motion.div>
          )}

          {/* ── Security Tab ── */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Change Password */}
              <Section>
                <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  Change Password
                </h2>
                <p className="text-sm text-muted-foreground mb-6">Use a strong password of at least 8 characters.</p>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <FieldRow icon={Lock} label="Current Password">
                    <div className="relative">
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Your current password"
                        required
                        className="input-field pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FieldRow>

                  <FieldRow icon={Lock} label="New Password">
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        required
                        className="input-field pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password strength indicator */}
                    {newPassword && (
                      <div className="flex gap-1 mt-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                            newPassword.length >= i * 3
                              ? newPassword.length >= 12 ? 'bg-emerald-400' : newPassword.length >= 8 ? 'bg-amber-400' : 'bg-red-400'
                              : 'bg-border'
                          }`} />
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-2">
                          {newPassword.length >= 12 ? 'Strong' : newPassword.length >= 8 ? 'Good' : 'Weak'}
                        </span>
                      </div>
                    )}
                  </FieldRow>

                  <FieldRow icon={Lock} label="Confirm New Password">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className={`input-field ${confirmPassword && confirmPassword !== newPassword ? 'border-red-500/50' : ''}`}
                    />
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                    )}
                  </FieldRow>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                      className="btn-primary flex items-center gap-2 text-sm px-6 py-2.5"
                    >
                      {savingPassword ? (
                        <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      Update Password
                    </button>
                  </div>
                </form>
              </Section>

              {/* Account Info */}
              <Section>
                <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  Account Details
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Account Status</span>
                    <span className="text-sm font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Email Verified</span>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      profile?.emailVerified
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-amber-400 bg-amber-500/10'
                    }`}>
                      {profile?.emailVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Member Since</span>
                    <span className="text-sm text-foreground">{memberSince}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-muted-foreground">Account ID</span>
                    <span className="text-xs font-mono text-muted-foreground">#{profile?.id || user?.id}</span>
                  </div>
                </div>
              </Section>

              {/* Danger Zone */}
              <Section className="border-red-500/20">
                <h2 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Deleting your account is permanent and cannot be undone. All your trips, itineraries and preferences will be permanently lost.
                </p>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-sm text-red-400 border border-red-500/30 px-4 py-2 rounded-xl hover:bg-red-500/10 transition-colors"
                  >
                    Delete My Account
                  </button>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                    <p className="text-sm text-red-300 font-medium mb-3">Are you absolutely sure?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          toast.error('Account deletion is disabled in demo mode.');
                          setShowDeleteConfirm(false);
                        }}
                        className="text-sm text-red-400 border border-red-500/30 px-4 py-2 rounded-xl hover:bg-red-500/20 transition-colors"
                      >
                        Yes, delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="text-sm text-muted-foreground border border-border px-4 py-2 rounded-xl hover:bg-foreground/5 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </Section>
            </motion.div>
          )}

          {/* ── Travel Stats Tab ── */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Plane} value={plans.length} label="Trips Planned" color="blue" />
                <StatCard icon={Globe} value={totalDestinations} label="Destinations" color="purple" />
                <StatCard icon={Calendar} value={totalDaysPlanned} label="Days Planned" color="emerald" />
                <StatCard icon={Zap} value={selectedInterests.length} label="Interests" color="amber" />
              </div>

              {/* Destinations List */}
              <Section>
                <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  Your Destinations
                </h2>
                {plans.length === 0 ? (
                  <div className="text-center py-12">
                    <Plane className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <p className="text-muted-foreground text-sm">No trips planned yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">Create your first trip to see stats here!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {plans.map((plan, idx) => (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{plan.destination}</p>
                            {plan.startDate && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(plan.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground bg-card border border-border px-2.5 py-1 rounded-full">
                          {plan.groupType || 'Solo'}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Interests Overview */}
              {selectedInterests.length > 0 && (
                <Section>
                  <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-muted-foreground" />
                    Your Travel DNA
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map(id => {
                      const tag = INTEREST_TAGS.find(t => t.id === id);
                      if (!tag) return null;
                      const Icon = tag.icon;
                      return (
                        <span key={id} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                          <Icon className="w-3.5 h-3.5" />
                          {tag.label}
                        </span>
                      );
                    })}
                  </div>
                </Section>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
