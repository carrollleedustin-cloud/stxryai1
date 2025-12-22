# Persistent Narrative Engine

> A comprehensive system for multi-book series with persistent memory, character evolution, worldbuilding archives, and canon enforcement. This transforms story generation from a stateless operation into a continuity-aware literary engine.

## Overview

The Persistent Narrative Engine is designed to solve the fundamental problem with AI story generation: **lack of memory**. Traditional generators treat each request in isolation, leading to inconsistencies, contradictions, and stories that don't build on themselves.

This engine changes that. It remembers everything:
- **Characters** that evolve instead of resetting
- **Worlds** that accrete history, scars, politics, and myths
- **Continuity** that's enforced, not suggested
- **Series** that build across books with deliberate arcs

## Core Components

### 1. Database Schema (`supabase/migrations/20251222000001_persistent_narrative_engine.sql`)

The foundation of persistent memory:

- **`story_series`**: Top-level container for multi-book narratives
- **`series_books`**: Individual books within a series
- **`persistent_characters`**: Character definitions that persist across books
- **`character_book_states`**: Character state snapshots per book
- **`character_events`**: Timeline of changes (injuries, transformations, deaths)
- **`character_relationships`**: Bidirectional relationship tracking
- **`world_elements`**: Geography, cultures, religions, magic systems, etc.
- **`world_locations`**: Hierarchical location system
- **`world_systems`**: Magic/technology rules and constraints
- **`world_factions`**: Organizations with goals, alliances, and conflicts
- **`canon_rules`**: Author-defined facts that must be respected
- **`narrative_arcs`**: Multi-book story arcs
- **`timeline_events`**: Chronological event tracking
- **`revision_requests`**: Retroactive change propagation

### 2. Story Modes

Three distinct modes for different scopes:

#### Book Mode
```typescript
{
  mode: 'book',
  targetWordCount: 80000,
  targetChapterCount: 20,
  useOutline: true,
  useBeatSheet: true,
  enablePOVTracking: true,
  enableSubplots: true,
  chapterCliffhangers: true,
}
```

Features:
- Three-act structure with beat sheets
- Chapter-by-chapter generation
- Thematic callbacks
- Pacing intelligence

#### Novel Mode
```typescript
{
  mode: 'novel',
  targetWordCount: 100000,
  povStyle: 'rotating',
  maxConcurrentSubplots: 4,
  characterEvolutionDepth: 'moderate',
  enableSlowBurn: true,
  thematicResonance: true,
}
```

Features:
- POV rotation/tracking
- Deep subplot management
- Slow-burn character development
- Tonal consistency enforcement

#### Series Mode
```typescript
{
  mode: 'series',
  targetBooks: 3,
  enableLongForeshadowing: true,
  foreshadowingHorizon: 2,
  recurringAntagonists: true,
  antagonistEvolution: true,
  seriesClimaxBook: 3,
}
```

Features:
- Multi-book architecture
- Long-game foreshadowing
- Series-level arcs
- Character persistence across books
- World evolution over time

### 3. Core Services

#### PersistentNarrativeEngine
The heart of the system. Manages:
- Series CRUD operations
- Character persistence and evolution
- Relationship tracking
- World state management
- Generation context compilation

```typescript
import { persistentNarrativeEngine } from '@/services/persistentNarrativeEngine';

// Create a series
const series = await persistentNarrativeEngine.createSeries({
  authorId: 'user-123',
  title: 'The Eternal Conflict',
  genre: 'fantasy',
  targetBookCount: 3,
  primaryThemes: ['power', 'corruption', 'redemption'],
});

// Create a character
const character = await persistentNarrativeEngine.createCharacter({
  seriesId: series.id,
  name: 'Kira Shadowmend',
  characterRole: 'protagonist',
  corePersonality: {
    traits: ['determined', 'loyal', 'impulsive'],
    fears: ['abandonment', 'failure'],
    desires: ['belonging', 'justice'],
  },
});

// Record a permanent change
await persistentNarrativeEngine.recordCharacterEvent({
  characterId: character.id,
  eventType: 'physical',
  eventDescription: 'Lost right eye in battle with the Shadow King',
  isPermanent: true,
  significanceLevel: 9,
});
```

#### WorldbuildingArchive
Manages the living world state:

```typescript
import { worldbuildingArchive } from '@/services/worldbuildingArchive';

// Create a magic system with rules
const magicSystem = await worldbuildingArchive.createSystem({
  seriesId: series.id,
  systemName: 'Shadowweaving',
  systemType: 'magic',
  fundamentalLaws: [
    'Cannot create light, only manipulate shadows',
    'Requires emotional connection to darkness',
    'More powerful at night, weakest at noon',
  ],
  limitations: [
    'Cannot affect areas in direct sunlight',
    'Extended use causes physical corruption',
  ],
  costs: ['Mental fatigue', 'Gradual loss of color vision'],
  canonLockLevel: 'hard',
});

// Validate an ability against system rules
const validation = await worldbuildingArchive.validateAbilityAgainstSystem(
  magicSystem.id,
  {
    name: 'Shadow Step',
    description: 'Teleport through connected shadows',
    effects: ['Instant movement', 'Brief invisibility'],
  }
);
```

#### CanonEnforcer
Guards the internal logic aggressively:

```typescript
import { canonEnforcer } from '@/services/canonEnforcer';

// Define an immutable fact
await canonEnforcer.declareImmutableFact(series.id, authorId, {
  category: 'character',
  name: 'Kira Eye Loss',
  description: 'Kira lost her right eye in Book 1, Chapter 23',
  entityId: character.id,
});

// Enforce canon on generated content
const result = await canonEnforcer.enforceCanon(
  series.id,
  bookNumber,
  generatedContent,
  {
    charactersInvolved: [character.id],
    worldElementsReferenced: [magicSystem.id],
  }
);

if (!result.isCanonCompliant) {
  // Handle violations
  result.violations.forEach(v => {
    console.log(`Violation: ${v.violationDescription}`);
    console.log(`Suggestion: ${v.suggestion}`);
  });
}
```

#### RevisionPropagation
Handles retroactive changes intelligently:

```typescript
import { revisionPropagation } from '@/services/revisionPropagation';

// Create a revision request
const request = await revisionPropagation.createCharacterRevision(
  series.id,
  authorId,
  character.id,
  {
    description: 'Change character name from "Kira" to "Kyra"',
    changedFields: ['name'],
    newValues: { name: 'Kyra Shadowmend' },
  }
);

// Analyze impact
const analysis = await revisionPropagation.analyzeRevisionImpact(request.id);
console.log(`Affected chapters: ${analysis.affectedChapters.length}`);
console.log(`Risk level: ${analysis.riskLevel}`);

// Execute propagation
const result = await revisionPropagation.executePropagation(request.id, {
  autoOnly: true, // Only apply automatic changes
});
```

### 4. Generation Context

When generating content, the engine compiles a comprehensive context:

```typescript
const context = await persistentNarrativeEngine.compileGenerationContext(
  seriesId,
  bookId,
  chapterNumber
);

// Context includes:
// - worldState: Current state of all world elements
// - activeCharacters: Characters with their current states
// - relationshipMap: All active relationships
// - activeArcs: Arcs in progress
// - canonRules: Applicable rules
// - lockedElements: Elements that cannot change
// - pendingPayoffs: Foreshadowing that needs resolution
// - themeReminders: Themes to reinforce
```

## UI Components

### SeriesManager
The command center for managing series:
- Series overview with stats
- Book progression tracking
- Character, world, arc, and canon tabs
- Violation alerts

### CharacterEvolution
Track character development:
- Evolution timeline with events
- Relationship map
- Trait and personality tracking
- Dialogue style management
- Locked attribute display

## API Routes

- `GET/POST /api/narrative-engine/series` - List/create series
- `GET/PATCH /api/narrative-engine/series/[seriesId]` - Get/update series
- `GET/POST /api/narrative-engine/series/[seriesId]/books` - List/create books
- `GET/POST /api/narrative-engine/characters` - List/create characters

## Key Principles

### 1. Memory is Law
Every change is tracked. If a character loses an eye, that's permanent unless explicitly retconned with full propagation.

### 2. Canon is Infrastructure
World rules aren't suggestions—they're constraints. The magic system's limitations apply to every generation.

### 3. Evolution Over Reset
Characters grow, change, and accumulate history. Relationships evolve. The world gets heavier with each book.

### 4. Controlled Chaos
Authors can lock facts as immutable. The AI can be creative within those boundaries, but cannot violate them.

### 5. Propagation Over Patches
One change ripples outward. Rename a character, and every reference updates. Retroactive continuity is managed, not ignored.

## Usage Example: Creating a Series

```typescript
// 1. Create the series
const series = await persistentNarrativeEngine.createSeries({
  authorId,
  title: 'The Shattered Crown',
  genre: 'fantasy',
  targetBookCount: 5,
  primaryThemes: ['power', 'sacrifice', 'legacy'],
  mainConflict: 'The crown grants immortality but slowly consumes the wearer\'s humanity',
  plannedEnding: 'Final heir destroys crown, accepting mortality',
});

// 2. Create the protagonist
const protagonist = await persistentNarrativeEngine.createCharacter({
  seriesId: series.id,
  authorId,
  name: 'Prince Aldric',
  characterRole: 'protagonist',
  corePersonality: {
    traits: ['ambitious', 'charismatic', 'secretly insecure'],
    values: ['family honor', 'duty'],
    fears: ['inadequacy', 'his father\'s disappointment'],
    desires: ['to prove himself worthy', 'to be loved genuinely'],
  },
});

// 3. Define the magic system
const crownMagic = await worldbuildingArchive.createSystem({
  seriesId: series.id,
  authorId,
  systemName: 'Crown Magic',
  systemType: 'magic',
  fundamentalLaws: [
    'Power flows from the Shattered Crown',
    'Each fragment grants different abilities',
    'Using a fragment accelerates emotional detachment',
  ],
  costs: ['Gradual loss of empathy', 'Memories fade over time'],
  canonLockLevel: 'immutable',
});

// 4. Create the main narrative arc
const mainArc = await persistentNarrativeEngine.createNarrativeArc({
  seriesId: series.id,
  authorId,
  arcName: 'The Crown\'s Corruption',
  arcType: 'plot',
  startsInBook: 1,
  endsInBook: 5,
  foreshadowingElements: {
    plantedIn: [
      { bookNumber: 1, element: 'Aldric notices his father never laughs anymore' },
      { bookNumber: 2, element: 'A portrait shows the king once had warm eyes' },
    ],
    payoffIn: [
      { bookNumber: 4, element: 'Aldric realizes his father forgot his mother\'s name' },
    ],
  },
});

// 5. Generate with full context
const context = await persistentNarrativeEngine.compileGenerationContext(
  series.id,
  bookId,
  1 // Chapter 1
);

// The context now contains everything needed for consistent generation
```

## Future Enhancements

- **AI-powered conflict detection**: Deep NLP analysis for subtle contradictions
- **Collaborative series**: Multiple authors with shared canon
- **Timeline visualization**: Interactive chronology explorer
- **Character voice training**: Fine-tuned dialogue generation per character
- **Automatic foreshadowing**: AI suggests where to plant seeds for future payoffs

---

This engine doesn't just imagine worlds—it remembers them, protects them, and lets them grow feral over time. Stories that stack, deepen, and compound. Not more output, but more gravity.

