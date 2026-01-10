'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { NebulaCard } from '@/components/nebula/NebulaCard';
import { NebulaButton } from '@/components/nebula/NebulaButton';
import { NebulaInput, NebulaSelect } from '@/components/nebula/NebulaInput';
import { NebulaTitle } from '@/components/nebula/NebulaText';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';

/**
 * CREATE CHILD PROFILE PAGE
 * A step-by-step wizard to create a child's profile.
 * Makes it easy and delightful for parents.
 */

const AVATARS = [
  '👧',
  '👦',
  '🧒',
  '👶',
  '🦸‍♀️',
  '🦸‍♂️',
  '🧚‍♀️',
  '🧜‍♂️',
  '🦊',
  '🐰',
  '🐼',
  '🦁',
  '🐸',
  '🦄',
  '🐱',
  '🐶',
  '🐻',
  '🐨',
];

const AGE_OPTIONS = [
  { value: '3', label: '3 years old' },
  { value: '4', label: '4 years old' },
  { value: '5', label: '5 years old' },
  { value: '6', label: '6 years old' },
  { value: '7', label: '7 years old' },
  { value: '8', label: '8 years old' },
  { value: '9', label: '9 years old' },
  { value: '10', label: '10 years old' },
  { value: '11', label: '11 years old' },
  { value: '12', label: '12 years old' },
];

const CONTENT_PREFERENCES = [
  {
    id: 'fantasy',
    label: 'Fantasy & Magic',
    emoji: '🧙',
    desc: 'Dragons, wizards, magical worlds',
  },
  { id: 'adventure', label: 'Adventure', emoji: '🗺️', desc: 'Exploration, quests, heroes' },
  { id: 'animals', label: 'Animal Stories', emoji: '🐾', desc: 'Friendly animal characters' },
  { id: 'space', label: 'Space & Science', emoji: '🚀', desc: 'Rockets, planets, discovery' },
  { id: 'fairytale', label: 'Fairy Tales', emoji: '👸', desc: 'Classic stories, princesses' },
  { id: 'friendship', label: 'Friendship', emoji: '🤝', desc: 'Stories about friends' },
  { id: 'educational', label: 'Educational', emoji: '📚', desc: 'Learning through stories' },
  { id: 'humor', label: 'Funny Stories', emoji: '😄', desc: 'Silly and humorous' },
];

const SCREEN_TIME_OPTIONS = [
  { value: '15', label: '15 minutes/day' },
  { value: '30', label: '30 minutes/day' },
  { value: '45', label: '45 minutes/day' },
  { value: '60', label: '1 hour/day' },
  { value: '90', label: '1.5 hours/day' },
  { value: '120', label: '2 hours/day' },
  { value: 'unlimited', label: 'Unlimited' },
];

export default function CreateChildProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [avatar, setAvatar] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [screenTime, setScreenTime] = useState('60');
  const [pin, setPin] = useState('');

  const totalSteps = 4;

  const handlePreferenceToggle = (id: string) => {
    setPreferences((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Get current user
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be logged in to create a child profile');
      }

      // Save child profile to database
      // Note: This assumes a 'family_profiles' or 'child_profiles' table exists
      // If the table structure is different, adjust accordingly
      const { error: saveError } = await supabase.from('family_profiles').insert({
        parent_id: user.id,
        name: name,
        age: parseInt(age),
        avatar: avatar,
        preferences: preferences,
        screen_time_limit: screenTime === 'unlimited' ? null : parseInt(screenTime),
        pin: pin,
        created_at: new Date().toISOString(),
      });

      if (saveError) {
        // If table doesn't exist, try alternative table name
        const { error: altError } = await supabase.from('child_profiles').insert({
          parent_id: user.id,
          name: name,
          age: parseInt(age),
          avatar: avatar,
          preferences: preferences,
          screen_time_limit: screenTime === 'unlimited' ? null : parseInt(screenTime),
          pin: pin,
          created_at: new Date().toISOString(),
        });

        if (altError) {
          console.error('Failed to save profile:', altError);
          // Still redirect but show error message
          router.push('/family?error=profile-save-failed');
          return;
        }
      }

      router.push('/family?success=profile-created');
    } catch (error) {
      console.error('Error creating profile:', error);
      router.push('/family?error=profile-creation-failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return name.length >= 2 && age && avatar;
      case 2:
        return preferences.length >= 1;
      case 3:
        return screenTime;
      case 4:
        return pin.length === 4;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <NebulaButton variant="ghost" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </NebulaButton>
        <div>
          <NebulaTitle size="sm" gradient="aurora">
            Create Child Profile
          </NebulaTitle>
          <p className="text-white/60 mt-1">
            Step {step} of {totalSteps}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #00ffd5, #8020ff)' }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <NebulaCard>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">👋</span>
                Let&apos;s get to know your child
              </h2>

              <div className="space-y-6">
                <NebulaInput
                  label="Child's Name"
                  placeholder="Enter their name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  hint="This is how we'll greet them in the app"
                />

                <NebulaSelect
                  label="Age"
                  options={AGE_OPTIONS}
                  value={age}
                  onChange={setAge}
                  placeholder="Select age"
                />

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">
                    Choose an Avatar
                  </label>
                  <div className="grid grid-cols-6 gap-3">
                    {AVATARS.map((av) => (
                      <motion.button
                        key={av}
                        type="button"
                        onClick={() => setAvatar(av)}
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all"
                        style={{
                          background:
                            avatar === av
                              ? 'linear-gradient(135deg, rgba(0,255,213,0.2), rgba(128,32,255,0.2))'
                              : 'rgba(255,255,255,0.05)',
                          border: avatar === av ? '2px solid #00ffd5' : '2px solid transparent',
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {av}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </NebulaCard>
          )}

          {/* Step 2: Content Preferences */}
          {step === 2 && (
            <NebulaCard>
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <span className="text-2xl">📚</span>
                What does {name || 'your child'} like to read?
              </h2>
              <p className="text-white/60 mb-6">
                Select all that apply. You can change this later.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {CONTENT_PREFERENCES.map((pref) => {
                  const isSelected = preferences.includes(pref.id);

                  return (
                    <motion.button
                      key={pref.id}
                      type="button"
                      onClick={() => handlePreferenceToggle(pref.id)}
                      className="p-4 rounded-xl text-left transition-all"
                      style={{
                        background: isSelected
                          ? 'linear-gradient(135deg, rgba(0,255,213,0.15), rgba(128,32,255,0.15))'
                          : 'rgba(255,255,255,0.03)',
                        border: isSelected
                          ? '2px solid rgba(0,255,213,0.5)'
                          : '2px solid rgba(255,255,255,0.08)',
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{pref.emoji}</span>
                        <div className="flex-1">
                          <p className="font-medium text-white">{pref.label}</p>
                          <p className="text-xs text-white/50">{pref.desc}</p>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center"
                          >
                            <Check size={12} className="text-black" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </NebulaCard>
          )}

          {/* Step 3: Screen Time */}
          {step === 3 && (
            <NebulaCard>
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <span className="text-2xl">⏰</span>
                Daily Reading Time
              </h2>
              <p className="text-white/60 mb-6">
                Set a daily limit for {name || 'your child'}&apos;s reading time.
              </p>

              <div className="space-y-3">
                {SCREEN_TIME_OPTIONS.map((option) => {
                  const isSelected = screenTime === option.value;

                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => setScreenTime(option.value)}
                      className="w-full p-4 rounded-xl text-left flex items-center justify-between transition-all"
                      style={{
                        background: isSelected
                          ? 'linear-gradient(135deg, rgba(0,255,213,0.15), rgba(128,32,255,0.15))'
                          : 'rgba(255,255,255,0.03)',
                        border: isSelected
                          ? '2px solid rgba(0,255,213,0.5)'
                          : '2px solid rgba(255,255,255,0.08)',
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <span className="font-medium text-white">{option.label}</span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center"
                        >
                          <Check size={12} className="text-black" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <p className="text-sm text-white/40 mt-4">
                💡 You can adjust this anytime from the Family Dashboard
              </p>
            </NebulaCard>
          )}

          {/* Step 4: PIN Setup */}
          {step === 4 && (
            <NebulaCard>
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <span className="text-2xl">🔐</span>
                Set a Parental PIN
              </h2>
              <p className="text-white/60 mb-6">
                This PIN will be required to access parental controls and make changes.
              </p>

              <NebulaInput
                label="4-Digit PIN"
                type="password"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                hint="Choose a PIN you'll remember but your child won't guess"
              />

              {/* Preview Card */}
              {name && (
                <div className="mt-8 p-6 rounded-xl" style={{ background: 'rgba(0,255,213,0.05)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-3xl border-2 border-purple-500/30">
                      {avatar}
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{name}</p>
                      <p className="text-white/60">{age} years old</p>
                      <div className="flex gap-2 mt-2">
                        {preferences.slice(0, 3).map((p) => {
                          const pref = CONTENT_PREFERENCES.find((x) => x.id === p);
                          return pref ? (
                            <span key={p} className="text-lg">
                              {pref.emoji}
                            </span>
                          ) : null;
                        })}
                        {preferences.length > 3 && (
                          <span className="text-xs text-white/40">+{preferences.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </NebulaCard>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-4 mt-8">
        {step > 1 && (
          <NebulaButton variant="ghost" onClick={() => setStep(step - 1)}>
            Back
          </NebulaButton>
        )}
        <div className="flex-1" />

        {step < totalSteps ? (
          <NebulaButton onClick={() => setStep(step + 1)} disabled={!canProceed()}>
            Continue
          </NebulaButton>
        ) : (
          <NebulaButton
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            loading={isSubmitting}
            icon={<Sparkles size={18} />}
          >
            Create Profile
          </NebulaButton>
        )}
      </div>
    </div>
  );
}
