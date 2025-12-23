'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BirthDataInput, ZODIAC_SIGNS } from '@/types/character-sheet';

/**
 * BIRTH CHART WIZARD
 * A beautiful multi-step form for collecting birth chart information
 */

interface BirthChartWizardProps {
  onComplete: (data: BirthDataInput) => void;
  onCancel?: () => void;
  initialData?: Partial<BirthDataInput>;
}

type Step = 'name' | 'date' | 'time' | 'location' | 'confirm';

const STEPS: Step[] = ['name', 'date', 'time', 'location', 'confirm'];

const StepIndicator = ({ currentStep }: { currentStep: Step }) => {
  const currentIndex = STEPS.indexOf(currentStep);
  
  return (
    <div className="flex justify-center gap-2 mb-8">
      {STEPS.map((step, index) => (
        <motion.div
          key={step}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            index <= currentIndex
              ? 'bg-gradient-to-r from-cyan-400 to-purple-500'
              : 'bg-white/20'
          }`}
          initial={false}
          animate={{
            scale: index === currentIndex ? 1.2 : 1,
          }}
        />
      ))}
    </div>
  );
};

const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoFocus,
  min,
  max,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  min?: string;
  max?: string;
}) => (
  <div className="space-y-2">
    <label className="block text-sm text-white/60">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      min={min}
      max={max}
      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
    />
  </div>
);

export function BirthChartWizard({ onComplete, onCancel, initialData }: BirthChartWizardProps) {
  const [step, setStep] = useState<Step>('name');
  const [data, setData] = useState<BirthDataInput>({
    name: initialData?.name || '',
    birthDate: initialData?.birthDate || '',
    birthTime: initialData?.birthTime || '',
    birthCity: initialData?.birthCity || '',
    birthState: initialData?.birthState || '',
    birthCountry: initialData?.birthCountry || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateData = (field: keyof BirthDataInput, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'name':
        if (!data.name.trim()) {
          newErrors.name = 'Please enter your name';
        }
        break;
      case 'date':
        if (!data.birthDate) {
          newErrors.birthDate = 'Please enter your birth date';
        }
        break;
      case 'time':
        if (!data.birthTime) {
          newErrors.birthTime = 'Please enter your birth time';
        }
        break;
      case 'location':
        if (!data.birthCity.trim()) {
          newErrors.birthCity = 'Please enter your birth city';
        }
        if (!data.birthCountry.trim()) {
          newErrors.birthCountry = 'Please enter your birth country';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    const currentIndex = STEPS.indexOf(step);
    if (currentIndex < STEPS.length - 1) {
      setStep(STEPS[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1]);
    }
  };

  const handleSubmit = () => {
    onComplete(data);
  };

  // Get zodiac sign preview
  const getZodiacPreview = () => {
    if (!data.birthDate) return null;
    const date = new Date(data.birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const mmdd = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    for (const zodiac of ZODIAC_SIGNS) {
      if (zodiac.sign === 'Capricorn') {
        if (mmdd >= '12-22' || mmdd <= '01-19') {
          return zodiac;
        }
      } else if (mmdd >= zodiac.startDate && mmdd <= zodiac.endDate) {
        return zodiac;
      }
    }
    return null;
  };

  const zodiac = getZodiacPreview();

  const renderStepContent = () => {
    switch (step) {
      case 'name':
        return (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">✨</span>
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Welcome, Cosmic Traveler
              </h2>
              <p className="text-white/60">
                Let's create your personalized Character Sheet based on the stars.
              </p>
            </div>
            <InputField
              label="What name shall we inscribe in the stars?"
              value={data.name}
              onChange={(v) => updateData('name', v)}
              placeholder="Your full name"
              autoFocus
            />
            {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
          </motion.div>
        );

      case 'date':
        return (
          <motion.div
            key="date"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">🌅</span>
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                When did your journey begin?
              </h2>
              <p className="text-white/60">
                Your birth date aligns you with the cosmic dance of the planets.
              </p>
            </div>
            <InputField
              label="Date of Birth"
              type="date"
              value={data.birthDate}
              onChange={(v) => updateData('birthDate', v)}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.birthDate && <p className="text-red-400 text-sm">{errors.birthDate}</p>}
            
            {zodiac && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 text-center"
              >
                <span className="text-3xl">{zodiac.emoji}</span>
                <p className="text-lg font-bold text-white mt-2">{zodiac.sign}</p>
                <p className="text-sm text-white/60">{zodiac.element} Sign • {zodiac.symbol}</p>
              </motion.div>
            )}
          </motion.div>
        );

      case 'time':
        return (
          <motion.div
            key="time"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">🕐</span>
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                What time were you born?
              </h2>
              <p className="text-white/60">
                Your birth time determines your Rising Sign and house placements.
              </p>
            </div>
            <InputField
              label="Time of Birth"
              type="time"
              value={data.birthTime}
              onChange={(v) => updateData('birthTime', v)}
            />
            {errors.birthTime && <p className="text-red-400 text-sm">{errors.birthTime}</p>}
            
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/60">
                💡 <strong className="text-white/80">Tip:</strong> Check your birth certificate for the exact time. 
                If you don't know it, use 12:00 PM as an approximation.
              </p>
            </div>
          </motion.div>
        );

      case 'location':
        return (
          <motion.div
            key="location"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">🌍</span>
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Where did you enter this world?
              </h2>
              <p className="text-white/60">
                Your birth location affects planetary positions and houses.
              </p>
            </div>
            <InputField
              label="City"
              value={data.birthCity}
              onChange={(v) => updateData('birthCity', v)}
              placeholder="e.g., Minneapolis"
            />
            {errors.birthCity && <p className="text-red-400 text-sm">{errors.birthCity}</p>}
            
            <InputField
              label="State/Province (optional)"
              value={data.birthState || ''}
              onChange={(v) => updateData('birthState', v)}
              placeholder="e.g., Minnesota"
            />
            
            <InputField
              label="Country"
              value={data.birthCountry}
              onChange={(v) => updateData('birthCountry', v)}
              placeholder="e.g., USA"
            />
            {errors.birthCountry && <p className="text-red-400 text-sm">{errors.birthCountry}</p>}
          </motion.div>
        );

      case 'confirm':
        return (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">⭐</span>
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Ready to reveal your cosmic blueprint?
              </h2>
              <p className="text-white/60">
                Confirm your details to generate your Character Sheet.
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-nebula-deep to-nebula-space border border-white/10 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/60">Name</span>
                <span className="text-white font-medium">{data.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/60">Birth Date</span>
                <span className="text-white font-medium">{new Date(data.birthDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/60">Birth Time</span>
                <span className="text-white font-medium">{data.birthTime}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-white/60">Birth Place</span>
                <span className="text-white font-medium">
                  {data.birthCity}{data.birthState ? `, ${data.birthState}` : ''}, {data.birthCountry}
                </span>
              </div>
              
              {zodiac && (
                <div className="mt-4 pt-4 border-t border-white/10 text-center">
                  <p className="text-sm text-white/40 mb-2">Sun Sign</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl">{zodiac.emoji}</span>
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                      {zodiac.sign}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <StepIndicator currentStep={step} />
      
      <AnimatePresence mode="wait">
        {renderStepContent()}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-8">
        {step !== 'name' && (
          <motion.button
            onClick={handleBack}
            className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/20 text-white/70 font-medium hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ← Back
          </motion.button>
        )}
        
        {onCancel && step === 'name' && (
          <motion.button
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/20 text-white/70 font-medium hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
        )}
        
        {step !== 'confirm' ? (
          <motion.button
            onClick={handleNext}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue →
          </motion.button>
        ) : (
          <motion.button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold hover:opacity-90 transition-opacity"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ✨ Generate Character Sheet
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default BirthChartWizard;

