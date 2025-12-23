/**
 * CHARACTER SHEET GENERATOR
 * Creates personalized character sheets based on astrological birth data
 */

import {
  BirthDataInput,
  CharacterSheet,
  ZodiacSign,
  CoreAlignment,
  PersonalityArchetype,
  CharacterTraits,
  LoveProfile,
  EmotionalProfile,
  VocationProfile,
  ShadowProfile,
  AestheticProfile,
  ZODIAC_SIGNS,
  ARCHETYPE_TITLES,
} from '@/types/character-sheet';

// Helper to get zodiac sign from date
export function getSunSign(birthDate: string): { sign: ZodiacSign; degree: string } {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const mmdd = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
  for (const zodiac of ZODIAC_SIGNS) {
    const start = zodiac.startDate;
    const end = zodiac.endDate;
    
    // Handle Capricorn which spans year boundary
    if (zodiac.sign === 'Capricorn') {
      if (mmdd >= '12-22' || mmdd <= '01-19') {
        const degree = calculateDegree(mmdd, start, end, true);
        return { sign: zodiac.sign, degree };
      }
    } else if (mmdd >= start && mmdd <= end) {
      const degree = calculateDegree(mmdd, start, end, false);
      return { sign: zodiac.sign, degree };
    }
  }
  
  return { sign: 'Aries', degree: '0°' }; // Fallback
}

function calculateDegree(date: string, start: string, end: string, spanYear: boolean): string {
  // Simplified degree calculation
  const [m, d] = date.split('-').map(Number);
  const [sm, sd] = start.split('-').map(Number);
  
  let dayInSign;
  if (spanYear && m === 1) {
    // January portion of Capricorn
    dayInSign = d + 10; // Days past Dec 22
  } else {
    const startDay = sm * 30 + sd;
    const currentDay = m * 30 + d;
    dayInSign = currentDay - startDay;
  }
  
  const degree = Math.floor((dayInSign / 30) * 30);
  const minutes = Math.floor(Math.random() * 60);
  return `${degree}°${minutes}'`;
}

// Calculate moon sign based on birth date and time (simplified algorithm)
export function getMoonSign(birthDate: string, birthTime: string): { sign: ZodiacSign; degree: string } {
  const date = new Date(birthDate);
  const [hours, minutes] = birthTime.split(':').map(Number);
  
  // Simplified moon calculation based on day and time
  // In reality, this would need ephemeris data
  const dayOfMonth = date.getDate();
  const timeOffset = hours / 24;
  const moonCycle = ((dayOfMonth + timeOffset) * 12.37) % 360;
  const signIndex = Math.floor(moonCycle / 30);
  const degree = Math.floor(moonCycle % 30);
  
  const sign = ZODIAC_SIGNS[signIndex % 12].sign;
  return { sign, degree: `${degree}°${Math.floor(Math.random() * 60)}'` };
}

// Calculate rising sign based on birth time (simplified)
export function getRisingSign(birthDate: string, birthTime: string): ZodiacSign {
  const [hours] = birthTime.split(':').map(Number);
  const date = new Date(birthDate);
  const sunSignIndex = ZODIAC_SIGNS.findIndex(z => z.sign === getSunSign(birthDate).sign);
  
  // Rising changes every ~2 hours
  const risingOffset = Math.floor(hours / 2);
  const risingIndex = (sunSignIndex + risingOffset) % 12;
  
  return ZODIAC_SIGNS[risingIndex].sign;
}

// Get element for a sign
function getElement(sign: ZodiacSign): string {
  return ZODIAC_SIGNS.find(z => z.sign === sign)?.element || 'Fire';
}

// Generate tagline based on sun, moon, rising
function generateTagline(sun: ZodiacSign, moon: ZodiacSign, rising: ZodiacSign): string {
  const sunElement = getElement(sun);
  const moonElement = getElement(moon);
  
  const taglines: Record<string, string[]> = {
    'Fire-Fire': ['A wildfire of passion and purpose.', 'Born to blaze trails and inspire.'],
    'Fire-Earth': ['Passion grounded in purpose.', 'A volcano of controlled power.'],
    'Fire-Air': ['Sparks that ignite ideas into movements.', 'A mind on fire with vision.'],
    'Fire-Water': ['Steam rising from the depths of feeling.', 'Passion forged in emotional depths.'],
    'Earth-Fire': ['Steady hands building dreams of fire.', 'The architect of ambition.'],
    'Earth-Earth': ['Unshakeable foundation of will.', 'The mountain that moves nations.'],
    'Earth-Air': ['Practical dreams made manifest.', 'Thoughts turned into empires.'],
    'Earth-Water': ['Nurturing strength from deep roots.', 'The garden that weathers all storms.'],
    'Air-Fire': ['Ideas that set the world ablaze.', 'The philosopher with a warrior\'s heart.'],
    'Air-Earth': ['Wisdom grounded in reality.', 'The thinker who builds.'],
    'Air-Air': ['A universe of thought in motion.', 'The eternal question seeker.'],
    'Air-Water': ['Thoughts that flow like rivers.', 'The poet of logic and feeling.'],
    'Water-Fire': ['Intuition with the courage to act.', 'The dreamer who dares.'],
    'Water-Earth': ['Emotional wisdom made tangible.', 'Feelings that build lasting bonds.'],
    'Water-Air': ['Empathy that speaks truth.', 'The bridge between heart and mind.'],
    'Water-Water': ['Depths within depths, mystery within mystery.', 'The oracle of the unseen.'],
  };
  
  const key = `${sunElement}-${moonElement}`;
  const options = taglines[key] || ['A unique soul navigating the cosmos.'];
  return options[Math.floor(Math.random() * options.length)];
}

// Generate personality archetype
function generateArchetype(sun: ZodiacSign, moon: ZodiacSign): PersonalityArchetype {
  const sunElement = getElement(sun);
  const moonElement = getElement(moon);
  
  // Try specific combination first
  let title = ARCHETYPE_TITLES[`${sun}-${moon}`];
  if (!title) {
    title = ARCHETYPE_TITLES[`${sunElement}-${moonElement}`] || 'The Cosmic Traveler';
  }
  
  const essences: Record<string, string> = {
    Fire: 'driven by passion and the need to create',
    Earth: 'grounded in reality and committed to building',
    Air: 'fueled by ideas and the pursuit of understanding',
    Water: 'guided by intuition and emotional depth',
  };
  
  const modes: Record<string, string> = {
    Fire: 'Act. Create. Inspire. Repeat.',
    Earth: 'Plan. Build. Sustain. Grow.',
    Air: 'Think. Connect. Share. Evolve.',
    Water: 'Feel. Reflect. Heal. Transform.',
  };
  
  const essence = `A soul ${essences[sunElement]}, with a heart ${essences[moonElement].replace('driven by', 'attuned to').replace('grounded in', 'seeking').replace('fueled by', 'processing through').replace('guided by', 'protected by')}.`;
  
  return {
    title,
    essence,
    modeOfOperation: modes[sunElement],
  };
}

// Generate strengths based on signs
function generateStrengths(sun: ZodiacSign, moon: ZodiacSign, rising: ZodiacSign): string[] {
  const signStrengths: Record<ZodiacSign, string[]> = {
    Aries: ['Bold leadership', 'Courageous initiative', 'Pioneering spirit'],
    Taurus: ['Unwavering determination', 'Sensual appreciation', 'Financial acumen'],
    Gemini: ['Adaptable intelligence', 'Communication mastery', 'Quick wit'],
    Cancer: ['Emotional intelligence', 'Nurturing presence', 'Strong intuition'],
    Leo: ['Natural charisma', 'Creative expression', 'Generous heart'],
    Virgo: ['Analytical precision', 'Practical wisdom', 'Service-oriented'],
    Libra: ['Diplomatic grace', 'Aesthetic sensibility', 'Partnership skills'],
    Scorpio: ['Psychological depth', 'Transformative power', 'Investigative mind'],
    Sagittarius: ['Philosophical insight', 'Adventurous spirit', 'Optimistic outlook'],
    Capricorn: ['Strategic thinking', 'Disciplined ambition', 'Leadership ability'],
    Aquarius: ['Innovative thinking', 'Humanitarian vision', 'Independent spirit'],
    Pisces: ['Artistic sensitivity', 'Compassionate nature', 'Spiritual awareness'],
  };
  
  const strengths = new Set<string>();
  [sun, moon, rising].forEach(sign => {
    const s = signStrengths[sign];
    strengths.add(s[0]);
    if (strengths.size < 5) strengths.add(s[1]);
  });
  
  return Array.from(strengths).slice(0, 5);
}

// Generate weaknesses based on signs
function generateWeaknesses(sun: ZodiacSign, moon: ZodiacSign): string[] {
  const signWeaknesses: Record<ZodiacSign, string[]> = {
    Aries: ['Impatience', 'Impulsiveness', 'Confrontational tendencies'],
    Taurus: ['Stubbornness', 'Possessiveness', 'Resistance to change'],
    Gemini: ['Restlessness', 'Inconsistency', 'Overthinking'],
    Cancer: ['Moodiness', 'Over-sensitivity', 'Tendency to retreat'],
    Leo: ['Pride', 'Need for validation', 'Dramatic reactions'],
    Virgo: ['Perfectionism', 'Over-critical nature', 'Anxiety'],
    Libra: ['Indecisiveness', 'People-pleasing', 'Conflict avoidance'],
    Scorpio: ['Jealousy', 'Secretiveness', 'Holding grudges'],
    Sagittarius: ['Restlessness', 'Bluntness', 'Overcommitment'],
    Capricorn: ['Emotional suppression', 'Workaholism', 'Pessimism'],
    Aquarius: ['Emotional detachment', 'Stubbornness', 'Rebelliousness'],
    Pisces: ['Escapism', 'Over-idealization', 'Boundary issues'],
  };
  
  const weaknesses = new Set<string>();
  weaknesses.add(signWeaknesses[sun][0]);
  weaknesses.add(signWeaknesses[moon][0]);
  weaknesses.add(signWeaknesses[sun][1]);
  weaknesses.add(signWeaknesses[moon][1]);
  
  return Array.from(weaknesses).slice(0, 5);
}

// Generate Venus sign (simplified based on sun position)
function getVenusSign(birthDate: string): ZodiacSign {
  const sun = getSunSign(birthDate).sign;
  const sunIndex = ZODIAC_SIGNS.findIndex(z => z.sign === sun);
  // Venus is usually within 2 signs of the Sun
  const offset = Math.floor(Math.random() * 5) - 2;
  const venusIndex = (sunIndex + offset + 12) % 12;
  return ZODIAC_SIGNS[venusIndex].sign;
}

// Generate Mars sign
function getMarsSign(birthDate: string): ZodiacSign {
  const sun = getSunSign(birthDate).sign;
  const sunIndex = ZODIAC_SIGNS.findIndex(z => z.sign === sun);
  const offset = Math.floor(Math.random() * 7) - 3;
  const marsIndex = (sunIndex + offset + 12) % 12;
  return ZODIAC_SIGNS[marsIndex].sign;
}

// Generate love profile
function generateLoveProfile(birthDate: string): LoveProfile {
  const venus = getVenusSign(birthDate);
  const mars = getMarsSign(birthDate);
  
  const venusDescriptions: Record<ZodiacSign, string> = {
    Aries: 'Passionate, direct, loves the chase. Wants excitement in love.',
    Taurus: 'Sensual, devoted, craves stability. Love through comfort and presence.',
    Gemini: 'Playful, curious, needs mental stimulation. Love through conversation.',
    Cancer: 'Nurturing, emotionally intuitive, craving deep connection. Feels everything.',
    Leo: 'Generous, dramatic, needs to be adored. Love as performance art.',
    Virgo: 'Devoted through service, practical love language. Shows care through actions.',
    Libra: 'Romantic idealist, seeks harmony and beauty in partnership.',
    Scorpio: 'Intense, transformative love. All or nothing devotion.',
    Sagittarius: 'Adventurous lover, needs freedom and growth together.',
    Capricorn: 'Committed, building toward long-term partnership. Love as legacy.',
    Aquarius: 'Unconventional, needs intellectual connection and space.',
    Pisces: 'Romantic dreamer, boundless compassion and spiritual connection.',
  };
  
  const marsDescriptions: Record<ZodiacSign, string> = {
    Aries: 'Direct, competitive, passionate pursuer of desire.',
    Taurus: 'Slow and steady, sensual, persistent in pursuit.',
    Gemini: 'Flirtatious, verbal, attracted to wit and intelligence.',
    Cancer: 'Protective, intuitive, driven by emotional security.',
    Leo: 'Loyal, expressive, magnetically confident in pursuit of desire.',
    Virgo: 'Attentive, service-oriented, shows desire through helpfulness.',
    Libra: 'Charming, diplomatic, seeks balance in passion.',
    Scorpio: 'Intense, magnetic, transformative desire.',
    Sagittarius: 'Adventurous, enthusiastic, needs freedom in pursuit.',
    Capricorn: 'Ambitious, controlled, desire tied to achievement.',
    Aquarius: 'Unconventional, experimental, intellectual attraction.',
    Pisces: 'Dreamy, intuitive, spiritually connected desire.',
  };
  
  const archetypes = [
    'The Devoted Dreamer', 'The Passionate Guardian', 'The Romantic Philosopher',
    'The Sensual Strategist', 'The Charismatic Nurturer', 'The Mysterious Lover',
  ];
  
  return {
    venusSign: venus,
    venusDescription: venusDescriptions[venus],
    marsSign: mars,
    marsDescription: marsDescriptions[mars],
    romanticArchetype: archetypes[Math.floor(Math.random() * archetypes.length)],
    traits: [
      `Craves ${getElement(venus) === 'Water' ? 'emotional depth' : getElement(venus) === 'Fire' ? 'excitement' : getElement(venus) === 'Earth' ? 'stability' : 'mental connection'}`,
      `Expresses desire through ${getElement(mars) === 'Fire' ? 'bold action' : getElement(mars) === 'Water' ? 'emotional intensity' : getElement(mars) === 'Earth' ? 'consistent presence' : 'words and ideas'}`,
      'Needs to feel safe before fully opening',
    ],
  };
}

// Generate emotional profile
function generateEmotionalProfile(moon: ZodiacSign): EmotionalProfile {
  const descriptions: Record<ZodiacSign, { desc: string; archetype: string; trait: string }> = {
    Aries: { desc: 'Quick to feel, quick to move on. Emotions fuel action.', archetype: 'The Warrior Heart', trait: 'Emotional courage and directness' },
    Taurus: { desc: 'Slow to process, steady emotional core. Seeks comfort and security.', archetype: 'The Grounded Heart', trait: 'Emotional stability and patience' },
    Gemini: { desc: 'Intellectualizes feelings. Needs to talk through emotions.', archetype: 'The Thinking Heart', trait: 'Emotional adaptability' },
    Cancer: { desc: 'Deep emotional waters. Nurturing but can retreat into shell.', archetype: 'The Ocean Heart', trait: 'Profound emotional memory' },
    Leo: { desc: 'Warm, generous emotions. Needs recognition of feelings.', archetype: 'The Radiant Heart', trait: 'Emotional generosity' },
    Virgo: { desc: 'Analyzes emotions. Shows care through practical support.', archetype: 'The Service Heart', trait: 'Emotional discernment' },
    Libra: { desc: 'Seeks emotional harmony. Avoids conflict in feelings.', archetype: 'The Balanced Heart', trait: 'Emotional diplomacy' },
    Scorpio: { desc: 'Intense emotional depths. Transforms through feeling.', archetype: 'The Phoenix Heart', trait: 'Emotional power and resilience' },
    Sagittarius: { desc: 'Optimistic emotional outlook. Needs freedom in feeling.', archetype: 'The Free Heart', trait: 'Emotional optimism' },
    Capricorn: { desc: 'Keeps feelings close to the chest. Master of restraint. Emotions expressed through action and loyalty.', archetype: 'The Ice Fortress', trait: 'High emotional resilience' },
    Aquarius: { desc: 'Detached but caring. Processes emotions intellectually.', archetype: 'The Distant Star', trait: 'Emotional independence' },
    Pisces: { desc: 'Boundless emotional empathy. Absorbs others\' feelings.', archetype: 'The Mystic Heart', trait: 'Profound emotional intuition' },
  };
  
  const data = descriptions[moon];
  return {
    moonDescription: data.desc,
    keyTrait: data.trait,
    emotionalArchetype: data.archetype,
    traits: [
      `Trust is earned ${getElement(moon) === 'Water' ? 'through emotional connection' : getElement(moon) === 'Fire' ? 'through shared action' : getElement(moon) === 'Earth' ? 'brick by brick' : 'through understanding'}`,
      `Shows care through ${getElement(moon) === 'Earth' ? 'protection and stability' : getElement(moon) === 'Fire' ? 'enthusiasm and presence' : getElement(moon) === 'Water' ? 'emotional support' : 'words and ideas'}`,
    ],
  };
}

// Generate vocation profile
function generateVocationProfile(sun: ZodiacSign, moon: ZodiacSign): VocationProfile {
  const sunElement = getElement(sun);
  const moonElement = getElement(moon);
  
  const northNodes: ZodiacSign[] = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const northNode = northNodes[Math.floor(Math.random() * northNodes.length)];
  
  const careerThemesByElement: Record<string, string[]> = {
    Fire: ['Leadership and entrepreneurship', 'Creative direction', 'Motivational work'],
    Earth: ['Building lasting structures', 'Financial management', 'Practical arts'],
    Air: ['Communication and media', 'Teaching and writing', 'Networking and connection'],
    Water: ['Healing and counseling', 'Creative arts', 'Spiritual guidance'],
  };
  
  return {
    keyPlacements: `${sun} Sun with ${moon} Moon creates a ${sunElement}-${moonElement} dynamic for career expression.`,
    northNode: `North Node in ${northNode}: Path toward ${getElement(northNode) === 'Fire' ? 'bold self-expression' : getElement(northNode) === 'Earth' ? 'material mastery' : getElement(northNode) === 'Air' ? 'intellectual contribution' : 'emotional/spiritual growth'}.`,
    careerThemes: [
      ...careerThemesByElement[sunElement].slice(0, 2),
      careerThemesByElement[moonElement][0],
    ],
  };
}

// Generate shadow profile
function generateShadowProfile(birthDate: string): ShadowProfile {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  
  // Pluto sign based on generation (simplified)
  let pluto: ZodiacSign;
  if (year >= 1984 && year <= 1995) pluto = 'Scorpio';
  else if (year >= 1996 && year <= 2008) pluto = 'Sagittarius';
  else if (year >= 2008 && year <= 2024) pluto = 'Capricorn';
  else if (year >= 1972 && year <= 1983) pluto = 'Libra';
  else if (year >= 1958 && year <= 1971) pluto = 'Virgo';
  else pluto = 'Scorpio';
  
  const plutoDescriptions: Record<ZodiacSign, string> = {
    Scorpio: 'Intense transformation and fixation tendencies. Deep fear of betrayal, but incredible strength through rebirth.',
    Sagittarius: 'Transformation through beliefs and truth-seeking. Shadow around ideology and meaning.',
    Capricorn: 'Transformation through structures and authority. Shadow around control and legacy.',
    Libra: 'Transformation through relationships. Shadow around harmony and fairness.',
    Virgo: 'Transformation through service and health. Shadow around perfectionism.',
    Aries: 'Transformation through identity and action. Shadow around aggression.',
    Taurus: 'Transformation through values and resources. Shadow around possession.',
    Gemini: 'Transformation through communication. Shadow around truth.',
    Cancer: 'Transformation through family and roots. Shadow around dependency.',
    Leo: 'Transformation through creativity and ego. Shadow around pride.',
    Aquarius: 'Transformation through collective and innovation. Shadow around detachment.',
    Pisces: 'Transformation through spirituality and dissolution. Shadow around escapism.',
  };
  
  const lilithSigns: ZodiacSign[] = ['Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const lilith = lilithSigns[Math.floor(Math.random() * lilithSigns.length)];
  
  const shadowArchetypes = [
    'The Haunted Idealist', 'The Hidden Transformer', 'The Silent Storm',
    'The Wounded Healer', 'The Dark Mirror', 'The Phoenix Rising',
  ];
  
  return {
    plutoSign: pluto,
    plutoDescription: plutoDescriptions[pluto],
    lilithSign: lilith,
    lilithDescription: `Lilith in ${lilith}: Shadow expression through ${getElement(lilith).toLowerCase()} themes.`,
    shadowArchetype: shadowArchetypes[Math.floor(Math.random() * shadowArchetypes.length)],
    traits: [
      'Suffers in silence at times',
      'Needs to let go of control to fully heal',
      'Shadows show up in intense situations',
    ],
  };
}

// Generate aesthetic profile
function generateAestheticProfile(sun: ZodiacSign, moon: ZodiacSign): AestheticProfile {
  const colorsByElement: Record<string, string[]> = {
    Fire: ['Crimson red', 'Sunset orange', 'Royal gold'],
    Earth: ['Forest green', 'Terracotta', 'Warm brown'],
    Air: ['Sky blue', 'Lavender', 'Silver white'],
    Water: ['Ocean blue', 'Moonlit silver', 'Deep purple'],
  };
  
  const stylesByElement: Record<string, string> = {
    Fire: 'Bold statements with dramatic flair; powerful minimalism meets striking accents',
    Earth: 'Structured elegance with natural textures; timeless quality over trends',
    Air: 'Eclectic creativity with intellectual edge; vintage meets avant-garde',
    Water: 'Flowing romantic aesthetics; dreamy elegance with mysterious undertones',
  };
  
  const symbolsBySign: Record<ZodiacSign, string[]> = {
    Aries: ['Ram', 'Flame', 'Sword'],
    Taurus: ['Bull', 'Rose', 'Earth'],
    Gemini: ['Twin moons', 'Quill', 'Butterfly'],
    Cancer: ['Crab', 'Moon', 'Shell'],
    Leo: ['Lion', 'Sun', 'Crown'],
    Virgo: ['Maiden', 'Wheat', 'Key'],
    Libra: ['Scales', 'Mirror', 'Rose'],
    Scorpio: ['Scorpion', 'Phoenix', 'Serpent'],
    Sagittarius: ['Archer', 'Arrow', 'Horse'],
    Capricorn: ['Goat', 'Tower', 'Mountain'],
    Aquarius: ['Water bearer', 'Star', 'Lightning'],
    Pisces: ['Fish', 'Ocean', 'Dream'],
  };
  
  const sunElement = getElement(sun);
  const moonElement = getElement(moon);
  
  return {
    colors: [...colorsByElement[sunElement].slice(0, 2), colorsByElement[moonElement][0]],
    style: stylesByElement[sunElement],
    symbols: [...symbolsBySign[sun].slice(0, 2), symbolsBySign[moon][0]],
    playlistEnergy: `${sunElement === 'Fire' ? 'Energetic' : sunElement === 'Earth' ? 'Grounded' : sunElement === 'Air' ? 'Intellectual' : 'Emotional'} soundscapes with ${moonElement === 'Water' ? 'moody lyricism' : moonElement === 'Fire' ? 'powerful beats' : moonElement === 'Earth' ? 'acoustic warmth' : 'thoughtful melodies'}`,
  };
}

// Generate signature quote
function generateSignatureQuote(sun: ZodiacSign, moon: ZodiacSign): string {
  const quotes: Record<string, string[]> = {
    'Fire-Fire': ['"I burn brightest when the world tells me to dim."', '"Fear is just excitement without breath."'],
    'Fire-Earth': ['"I build empires from the flames of my passion."', '"My dreams have foundations."'],
    'Fire-Air': ['"Ideas are sparks—I am the wildfire."', '"Think big. Act bold. Question everything."'],
    'Fire-Water': ['"My heart is an ocean, my will is the sun."', '"Feel deeply, fight fiercely."'],
    'Earth-Fire': ['"Slow to start, impossible to stop."', '"Patience is just passion playing the long game."'],
    'Earth-Earth': ['"I am the mountain that moves nations."', '"Built to last, designed to matter."'],
    'Earth-Air': ['"Dreams are blueprints waiting for my hands."', '"Think it through, then make it real."'],
    'Earth-Water': ['"My roots run deep into emotional truth."', '"I nurture what I build."'],
    'Air-Fire': ['"Words can start revolutions."', '"My mind is a weapon of creation."'],
    'Air-Earth': ['"Ideas mean nothing without execution."', '"I think, therefore I build."'],
    'Air-Air': ['"Understanding is my superpower."', '"The unexamined life is not worth living—the examined life is an adventure."'],
    'Air-Water': ['"I speak the language of hearts."', '"Empathy with articulation is my gift."'],
    'Water-Fire': ['"I feel everything, and I use it as fuel."', '"My intuition is my sword."'],
    'Water-Earth': ['"I wear armor not to keep others out, but to keep from bleeding on those I love."', '"Feelings become foundations."'],
    'Water-Air': ['"I understand what others cannot say."', '"The bridge between hearts and minds."'],
    'Water-Water': ['"I am the depth others fear to explore."', '"In the darkness, I find light."'],
  };
  
  const key = `${getElement(sun)}-${getElement(moon)}`;
  const options = quotes[key] || ['"I am a universe unto myself."'];
  return options[Math.floor(Math.random() * options.length)];
}

// Main generator function
export function generateCharacterSheet(input: BirthDataInput, userId: string): CharacterSheet {
  const sun = getSunSign(input.birthDate);
  const moon = getMoonSign(input.birthDate, input.birthTime);
  const rising = getRisingSign(input.birthDate, input.birthTime);
  
  const coreAlignment: CoreAlignment = {
    sunSign: sun.sign,
    sunDegree: sun.degree,
    moonSign: moon.sign,
    moonDegree: moon.degree,
    risingSign: rising,
    tagline: generateTagline(sun.sign, moon.sign, rising),
  };
  
  const archetype = generateArchetype(sun.sign, moon.sign);
  const traits: CharacterTraits = {
    strengths: generateStrengths(sun.sign, moon.sign, rising),
    weaknesses: generateWeaknesses(sun.sign, moon.sign),
  };
  
  const now = new Date().toISOString();
  
  return {
    id: `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    
    name: input.name,
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthPlace: `${input.birthCity}${input.birthState ? `, ${input.birthState}` : ''}, ${input.birthCountry}`,
    
    coreAlignment,
    personalityArchetype: archetype,
    traits,
    loveProfile: generateLoveProfile(input.birthDate),
    emotionalProfile: generateEmotionalProfile(moon.sign),
    vocationProfile: generateVocationProfile(sun.sign, moon.sign),
    shadowProfile: generateShadowProfile(input.birthDate),
    aestheticProfile: generateAestheticProfile(sun.sign, moon.sign),
    
    signatureQuote: generateSignatureQuote(sun.sign, moon.sign),
    
    createdAt: now,
    updatedAt: now,
  };
}

export default generateCharacterSheet;

