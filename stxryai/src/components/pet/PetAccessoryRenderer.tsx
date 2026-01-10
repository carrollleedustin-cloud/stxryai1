'use client';

/**
 * Pet Accessory Renderer
 * Renders visual accessories on the pet
 */

import React from 'react';
import { motion } from 'framer-motion';
import { PetAccessory, PetTraits } from '@/types/pet';

interface PetAccessoryRendererProps {
  accessories: PetAccessory[];
  traits: PetTraits;
  scale: number;
}

export default function PetAccessoryRenderer({
  accessories,
  traits,
  scale,
}: PetAccessoryRendererProps) {
  const equipped = accessories.filter((a) => a.equipped);

  if (equipped.length === 0) return null;

  const accessoryStyles: Record<string, (acc: PetAccessory) => React.CSSProperties> = {
    crown: (acc) => ({
      position: 'absolute',
      top: '-18%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: `${60 * scale}%`,
      height: `${25 * scale}%`,
      background:
        acc.rarity === 'legendary'
          ? 'linear-gradient(135deg, #ffd700, #ffed4e, #ffd700, #ffaa00)'
          : acc.rarity === 'epic'
            ? 'linear-gradient(135deg, #a855f7, #c084fc, #a855f7)'
            : 'linear-gradient(135deg, #c0c0c0, #e8e8e8, #c0c0c0)',
      clipPath: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)',
      filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.4)) ${acc.rarity === 'legendary' ? 'drop-shadow(0 0 10px #ffd700)' : ''}`,
      zIndex: 10,
    }),
    hat: (acc) => ({
      position: 'absolute',
      top: '-12%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: `${85 * scale}%`,
      height: `${25 * scale}%`,
      background: `linear-gradient(135deg, ${traits.accentColor}, ${traits.secondaryColor})`,
      borderRadius: '50% 50% 0 0',
      borderBottom: `4px solid ${traits.primaryColor}`,
      boxShadow: `0 2px 8px ${traits.primaryColor}40`,
      zIndex: 10,
    }),
    glasses: () => ({
      position: 'absolute',
      top: '35%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: `${75 * scale}%`,
      height: `${18 * scale}%`,
      display: 'flex',
      gap: `${8 * scale}%`,
      zIndex: 5,
    }),
    collar: (acc) => ({
      position: 'absolute',
      top: '60%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: `${95 * scale}%`,
      height: `${10 * scale}%`,
      background: `linear-gradient(90deg, ${traits.accentColor}, ${traits.secondaryColor}, ${traits.accentColor})`,
      borderRadius: '50%',
      border: `3px solid ${traits.primaryColor}`,
      boxShadow: `0 2px 6px ${traits.primaryColor}60`,
      zIndex: 5,
    }),
    scarf: (acc) => ({
      position: 'absolute',
      top: '55%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: `${90 * scale}%`,
      height: `${15 * scale}%`,
      background: `linear-gradient(135deg, ${traits.accentColor}, ${traits.secondaryColor}, ${traits.accentColor})`,
      borderRadius: '20%',
      clipPath: 'polygon(0% 0%, 100% 0%, 92% 100%, 8% 100%)',
      filter: `drop-shadow(0 2px 4px ${traits.primaryColor}40)`,
      zIndex: 5,
    }),
    wings: (acc) => ({
      position: 'absolute',
      top: '20%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: `${120 * scale}%`,
      height: `${60 * scale}%`,
      zIndex: 1,
    }),
    bow: (acc) => ({
      position: 'absolute',
      top: '58%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: `${20 * scale}%`,
      height: `${15 * scale}%`,
      background: `linear-gradient(135deg, ${traits.accentColor}, ${traits.secondaryColor})`,
      clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
      zIndex: 6,
    }),
    aura: (acc) => ({
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: `${150 * scale}%`,
      height: `${150 * scale}%`,
      borderRadius: '50%',
      background:
        acc.rarity === 'legendary'
          ? 'radial-gradient(circle, rgba(255,215,0,0.3), rgba(255,215,0,0.1), transparent)'
          : `radial-gradient(circle, ${traits.primaryColor}30, ${traits.primaryColor}10, transparent)`,
      filter: 'blur(10px)',
      zIndex: 0,
      pointerEvents: 'none',
    }),
  };

  return (
    <>
      {equipped.map((accessory) => {
        const style = accessoryStyles[accessory.type]?.(accessory);
        if (!style) return null;

        return (
          <motion.div
            key={accessory.id}
            style={style}
            animate={
              accessory.type === 'wings'
                ? { rotate: [-5, 5, -5] }
                : accessory.type === 'bow'
                  ? { rotate: [-2, 2, -2] }
                  : accessory.type === 'aura'
                    ? { scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }
                    : {}
            }
            transition={
              accessory.type === 'aura'
                ? { duration: 2, repeat: Infinity }
                : { duration: 1.5, repeat: Infinity }
            }
          >
            {accessory.type === 'glasses' && (
              <>
                <div
                  style={{
                    width: '48%',
                    height: '100%',
                    border: `4px solid ${traits.accentColor}`,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    boxShadow: `inset 0 0 10px ${traits.accentColor}40`,
                  }}
                />
                <div
                  style={{
                    width: '48%',
                    height: '100%',
                    border: `4px solid ${traits.accentColor}`,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    boxShadow: `inset 0 0 10px ${traits.accentColor}40`,
                  }}
                />
                {/* Bridge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '8%',
                    height: '30%',
                    background: traits.accentColor,
                    borderRadius: '2px',
                  }}
                />
              </>
            )}

            {accessory.type === 'wings' && (
              <>
                <motion.div
                  style={{
                    position: 'absolute',
                    left: '0%',
                    top: '20%',
                    width: '45%',
                    height: '60%',
                    background: `linear-gradient(135deg, ${traits.accentColor}80, ${traits.secondaryColor}60)`,
                    borderRadius: '50% 10% 10% 50%',
                    clipPath: 'polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)',
                  }}
                  animate={{ rotate: [-10, 10, -10] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  style={{
                    position: 'absolute',
                    right: '0%',
                    top: '20%',
                    width: '45%',
                    height: '60%',
                    background: `linear-gradient(225deg, ${traits.accentColor}80, ${traits.secondaryColor}60)`,
                    borderRadius: '10% 50% 50% 10%',
                    clipPath: 'polygon(0% 20%, 100% 0%, 100% 100%, 0% 80%)',
                  }}
                  animate={{ rotate: [10, -10, 10] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </>
            )}
          </motion.div>
        );
      })}
    </>
  );
}
