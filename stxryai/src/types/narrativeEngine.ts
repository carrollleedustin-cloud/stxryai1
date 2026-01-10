/**
 * Persistent Narrative Engine Types
 * Core type definitions for the multi-book series management system
 */

// ============================================================================
// ENUMS
// ============================================================================

export type StoryMode = 'story' | 'book' | 'novel' | 'series';
export type CharacterStatus = 'active' | 'deceased' | 'missing' | 'retired' | 'transformed';
export type RelationshipType =
  | 'ally'
  | 'enemy'
  | 'family'
  | 'romantic'
  | 'mentor'
  | 'rival'
  | 'neutral'
  | 'complicated';
export type CanonLockLevel = 'suggestion' | 'soft' | 'hard' | 'immutable';
export type WorldElementType =
  | 'geography'
  | 'culture'
  | 'religion'
  | 'magic_system'
  | 'technology'
  | 'political'
  | 'economic'
  | 'historical'
  | 'myth'
  | 'custom';
export type ChangeType =
  | 'physical'
  | 'psychological'
  | 'relational'
  | 'status'
  | 'ability'
  | 'possession'
  | 'location';
export type ArcType = 'character' | 'plot' | 'thematic' | 'relationship' | 'world';
export type ArcStatus = 'setup' | 'rising' | 'climax' | 'falling' | 'resolved' | 'abandoned';
export type RippleIntensity = 'subtle' | 'noticeable' | 'significant' | 'transformative';

// ============================================================================
// SERIES MANAGEMENT
// ============================================================================

export interface StorySeries {
  id: string;
  authorId: string;
  title: string;
  description?: string;
  premise?: string;
  genre: string;
  subgenres: string[];
  targetBookCount: number;
  currentBookCount: number;
  seriesStatus: 'planning' | 'active' | 'on_hold' | 'completed' | 'abandoned';

  // Thematic elements
  primaryThemes: string[];
  secondaryThemes: string[];
  recurringMotifs: string[];

  // Series-level arcs
  mainConflict?: string;
  seriesArcSummary?: string;
  plannedEnding?: string;

  // Configuration
  tone: string;
  pacing: string;
  targetAudience: string;
  contentRating: string;

  // Metadata
  coverImageUrl?: string;
  isPublished: boolean;
  isPremium: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SeriesBook {
  id: string;
  seriesId?: string;
  storyId?: string;
  authorId: string;

  // Book positioning
  bookNumber: number;
  title: string;
  subtitle?: string;

  // Book-level narrative
  bookPremise?: string;
  bookConflict?: string;
  bookArcSummary?: string;
  bookResolution?: string;

  // Story mode
  storyMode: StoryMode;

  // Target metrics
  targetWordCount?: number;
  targetChapterCount?: number;
  currentWordCount: number;
  currentChapterCount: number;

  // Status
  status: 'planning' | 'outlining' | 'drafting' | 'revising' | 'editing' | 'complete' | 'published';

  // Timeline
  timelineStart?: string;
  timelineEnd?: string;
  timeSkipFromPrevious?: string;

  // Metadata
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CHARACTER SYSTEM
// ============================================================================

export interface CharacterPersonality {
  traits: string[];
  values: string[];
  fears: string[];
  desires: string[];
  quirks?: string[];
  strengths?: string[];
  weaknesses?: string[];
}

export interface PhysicalDescription {
  height?: string;
  build?: string;
  hairColor?: string;
  hairStyle?: string;
  eyeColor?: string;
  skinTone?: string;
  distinguishingFeatures: string[];
  clothing?: string;
  mannerisms?: string[];
}

export interface PersistentCharacter {
  id: string;
  seriesId?: string;
  authorId: string;

  // Identity
  name: string;
  aliases: string[];
  title?: string;

  // Core traits
  corePersonality: CharacterPersonality;
  backstory?: string;
  motivation?: string;
  fatalFlaw?: string;

  // Physical baseline
  physicalDescription: PhysicalDescription;
  ageAtSeriesStart?: number;

  // Role
  characterRole:
    | 'protagonist'
    | 'antagonist'
    | 'deuteragonist'
    | 'supporting'
    | 'minor'
    | 'background';
  firstAppearsBook: number;

  // Status tracking
  currentStatus: CharacterStatus;
  statusChangedAt?: string;
  statusChangeReason?: string;

  // Voice
  dialogueStyle?: string;
  speechPatterns: string[];
  vocabularyLevel: string;
  typicalExpressions: string[];

  // Canon locks
  canonLockLevel: CanonLockLevel;
  lockedAttributes: string[];

  // Metadata
  isAiGenerated: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterBookState {
  id: string;
  characterId: string;
  bookId: string;

  // State at book start
  statusAtStart: CharacterStatus;
  ageAtBook?: number;
  locationAtStart?: string;

  // Physical state
  physicalChanges: string[];
  appearanceNotes?: string;

  // Psychological state
  mentalState?: string;
  emotionalArc?: string;
  beliefsAtStart: Record<string, any>;
  beliefsAtEnd: Record<string, any>;

  // Relationships
  keyRelationships: Record<string, { type: RelationshipType; intensity: number; status: string }>;

  // Goals
  bookGoal?: string;
  internalConflict?: string;
  externalConflict?: string;

  // Arc
  arcType?: ArcType;
  arcStatus: ArcStatus;
  arcResolution?: string;

  // Presence
  wordCount: number;
  sceneCount: number;
  chapterAppearances: number[];

  createdAt: string;
  updatedAt: string;
}

export interface CharacterEvent {
  id: string;
  characterId: string;
  bookId?: string;
  chapterId?: string;

  // Event details
  eventType: ChangeType;
  eventDescription: string;
  eventCause?: string;

  // Timing
  occurredAtChapter?: number;
  inUniverseDate?: string;

  // Impact
  isPermanent: boolean;
  reversalPossible: boolean;
  significanceLevel: number; // 1-10

  // State change
  previousState: Record<string, any>;
  newState: Record<string, any>;

  // Canon
  canonLockLevel: CanonLockLevel;
  isCanon: boolean;

  createdAt: string;
}

export interface CharacterRelationship {
  id: string;
  characterAId: string;
  characterBId: string;
  seriesId: string;

  // A's perspective
  relationshipTypeAToB: RelationshipType;
  intensityAToB: number;

  // B's perspective
  relationshipTypeBToA: RelationshipType;
  intensityBToA: number;

  // Details
  relationshipHistory?: string;
  firstMeetingDescription?: string;
  currentDynamic?: string;
  tensionPoints: string[];
  sharedHistory: string[];

  // Status
  isActive: boolean;
  endedInBook?: number;
  endingReason?: string;

  // Canon
  canonLockLevel: CanonLockLevel;

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// WORLDBUILDING
// ============================================================================

export interface WorldElement {
  id: string;
  seriesId: string;
  authorId: string;
  parentElementId?: string;

  // Identity
  elementType: WorldElementType;
  name: string;
  aliases: string[];

  // Description
  shortDescription?: string;
  fullDescription?: string;
  visualDescription?: string;

  // Categorization
  category?: string;
  tags: string[];

  // Relationships
  relatedElements: string[];
  conflictsWith: string[];
  dependsOn: string[];

  // Rules
  rules: {
    rules: string[];
    constraints: string[];
    exceptions: string[];
  };

  // First appearance
  introducedInBook?: number;
  introducedInChapter?: number;

  // Status
  isActive: boolean;
  destroyedInBook?: number;
  destructionReason?: string;

  // Canon
  canonLockLevel: CanonLockLevel;

  // Metadata
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface WorldLocation {
  id: string;
  elementId: string;
  seriesId: string;

  // Location details
  locationType?: string;
  coordinates?: { lat?: number; lng?: number; custom?: Record<string, any> };
  parentLocationId?: string;

  // Properties
  population?: string;
  climate?: string;
  terrain?: string;
  resources: string[];
  hazards: string[];

  // Political
  controllingFaction?: string;
  governmentType?: string;

  // Connections
  connectedLocations: string[];
  travelTimes: Record<string, string>;

  createdAt: string;
  updatedAt: string;
}

export interface WorldSystem {
  id: string;
  elementId: string;
  seriesId: string;

  // System details
  systemType: string;
  systemName: string;

  // Rules
  fundamentalLaws: string[];
  energySource?: string;
  limitations: string[];
  costs: string[];

  // Hierarchy
  powerLevels: { levels: string[]; descriptions: string[] };

  // Users
  whoCanUse?: string;
  trainingRequired: boolean;
  hereditary: boolean;

  // Abilities
  knownAbilities: Array<{
    name: string;
    description: string;
    requirements: string[];
    effects: string[];
  }>;

  // Forbidden
  taboos: string[];
  dangers: string[];

  // Canon
  canonLockLevel: CanonLockLevel;

  createdAt: string;
  updatedAt: string;
}

export interface WorldFaction {
  id: string;
  elementId: string;
  seriesId: string;

  // Identity
  factionName: string;
  factionType?: string;

  // Structure
  leadershipType?: string;
  hierarchyStructure?: string;

  // Goals
  publicGoals: string[];
  secretGoals: string[];

  // Resources
  powerBase?: string;
  militaryStrength?: string;
  economicPower?: string;

  // Relationships
  alliedFactions: string[];
  enemyFactions: string[];

  // Members
  leaderId?: string;
  keyMembers: string[];

  // Status
  isActive: boolean;
  dissolvedInBook?: number;
  dissolutionReason?: string;

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CANON ENFORCEMENT
// ============================================================================

export interface CanonRule {
  id: string;
  seriesId: string;
  authorId: string;

  // Rule identity
  ruleCategory: 'character' | 'world' | 'plot' | 'timeline' | 'relationship' | 'system';
  ruleName: string;
  ruleDescription: string;

  // Type
  ruleType: 'must' | 'must_not' | 'should' | 'should_not' | 'may';

  // Scope
  appliesToEntityType?: string;
  appliesToEntityIds: string[];
  appliesFromBook: number;
  appliesUntilBook?: number;

  // Lock level
  lockLevel: CanonLockLevel;

  // Violation handling
  violationSeverity: 'warning' | 'error' | 'critical';
  violationMessage?: string;

  // Examples
  validExamples: string[];
  invalidExamples: string[];

  // Status
  isActive: boolean;
  supersededBy?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CanonViolation {
  id: string;
  ruleId?: string;
  seriesId: string;
  bookId?: string;
  chapterId?: string;

  // Violation details
  violationType: string;
  violationDescription: string;
  violatingContent?: string;

  // Context
  detectedAt: string;
  detectedBy: 'system' | 'author' | 'ai';

  // Resolution
  resolutionStatus: 'pending' | 'resolved' | 'ignored' | 'overridden';
  resolutionAction?: string;
  resolvedAt?: string;
  resolvedBy?: string;

  // Override
  isIntentionalOverride: boolean;
  overrideReason?: string;
}

// ============================================================================
// NARRATIVE ARCS
// ============================================================================

export interface NarrativeArc {
  id: string;
  seriesId: string;
  authorId: string;

  // Identity
  arcName: string;
  arcType: ArcType;
  arcDescription?: string;

  // Scope
  startsInBook: number;
  endsInBook?: number;
  startsInChapter?: number;
  endsInChapter?: number;

  // Status
  arcStatus: ArcStatus;
  completionPercentage: number;

  // Structure
  setupPoints: string[];
  risingActionPoints: string[];
  climaxPoint?: string;
  fallingActionPoints: string[];
  resolutionPoint?: string;

  // Connected elements
  primaryCharacters: string[];
  secondaryCharacters: string[];
  relatedArcs: string[];

  // Themes
  themes: string[];

  // Foreshadowing
  foreshadowingElements: {
    plantedIn: Array<{ bookNumber: number; chapter?: number; element: string }>;
    payoffIn: Array<{ bookNumber: number; chapter?: number; element: string }>;
  };

  createdAt: string;
  updatedAt: string;
}

export interface Subplot {
  id: string;
  seriesId: string;
  arcId?: string;

  // Details
  subplotName: string;
  subplotDescription?: string;
  subplotType?: string;

  // Scope
  startsInBook: number;
  endsInBook?: number;

  // Status
  status: ArcStatus;

  // Characters
  primaryCharacters: string[];

  // Integration
  integratesWithMainPlot: boolean;
  integrationPoints: string[];

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CONTINUITY & TIMELINE
// ============================================================================

export interface TimelineEvent {
  id: string;
  seriesId: string;

  // Event details
  eventName: string;
  eventDescription?: string;
  eventType: 'historical' | 'current' | 'flashback' | 'prophecy';

  // Timing
  inUniverseDate?: string;
  relativeTiming?: string;
  sequenceNumber: number;

  // References
  referencedInBooks: number[];
  firstMentionedBook?: number;
  firstMentionedChapter?: number;

  // Participants
  involvedCharacters: string[];
  involvedFactions: string[];
  involvedLocations: string[];

  // Impact
  consequences: string[];
  leadsToEvents: string[];
  causedByEvents: string[];

  // Canon
  isCanon: boolean;
  canonLockLevel: CanonLockLevel;

  createdAt: string;
  updatedAt: string;
}

export interface ContinuityNote {
  id: string;
  seriesId: string;
  authorId: string;

  // Note details
  noteType: 'reminder' | 'question' | 'todo' | 'inconsistency' | 'idea';
  noteTitle: string;
  noteContent: string;

  // References
  referencedBook?: number;
  referencedChapter?: number;
  referencedCharacters: string[];
  referencedElements: string[];

  // Priority
  priority: 'low' | 'medium' | 'high' | 'critical';

  // Status
  isResolved: boolean;
  resolution?: string;
  resolvedAt?: string;

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// REVISION & PROPAGATION
// ============================================================================

export interface RevisionRequest {
  id: string;
  seriesId: string;
  authorId: string;

  // Request details
  revisionType: 'character_change' | 'world_change' | 'retcon' | 'consistency_fix';
  revisionDescription: string;

  // Scope
  affectsEntityType: string;
  affectsEntityId: string;
  affectsBooks: number[];

  // Change
  oldValue: Record<string, any>;
  newValue: Record<string, any>;

  // Propagation
  propagationStatus:
    | 'pending'
    | 'analyzing'
    | 'ready'
    | 'in_progress'
    | 'completed'
    | 'failed'
    | 'cancelled';

  // Analysis
  affectedChapters: string[];
  requiredChanges: Record<
    string,
    Array<{ type: string; description: string; suggestedEdit: string }>
  >;

  // AI analysis
  aiAnalysis?: string;
  aiSuggestedChanges: Record<string, any>;

  createdAt: string;
  updatedAt: string;
}

export interface PropagatedChange {
  id: string;
  revisionRequestId: string;
  chapterId: string;

  // Change details
  changeType: string;
  originalContent?: string;
  updatedContent?: string;

  // Status
  status: 'pending' | 'applied' | 'rejected' | 'manual_review';

  // Review
  reviewedBy?: string;
  reviewNotes?: string;

  appliedAt?: string;
  createdAt: string;
}

export interface WorldRipple {
  id: string;
  seriesId: string;
  sourceChoiceId?: string;
  sourceEventId?: string;

  title: string;
  description: string;
  intensity: RippleIntensity;

  // Impact
  affectedCharacterIds: string[];
  affectedLocationIds: string[];
  affectedFactionIds: string[];

  // Logic
  triggerCondition?: string;
  consequenceSummary: string;
  isActive: boolean;

  // Persistence
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// GENERATION CONTEXT
// ============================================================================

export interface GenerationContext {
  id: string;
  seriesId: string;
  bookId?: string;
  chapterId?: string;

  // Context type
  contextType: 'full_series' | 'book_summary' | 'chapter_context' | 'scene_context';

  // Compiled context
  worldState: Record<string, any>;
  activeCharacters: Array<{
    id: string;
    name: string;
    role: string;
    status: CharacterStatus;
    corePersonality: CharacterPersonality;
  }>;
  relationshipMap: CharacterRelationship[];
  activeArcs: Array<{
    id: string;
    name: string;
    type: ArcType;
    status: ArcStatus;
    completion: number;
  }>;
  recentEvents: Record<string, any>;

  // Constraints
  canonRules: CanonRule[];
  lockedElements: string[];

  // Narrative guidance
  toneGuidance?: string;
  pacingGuidance?: string;
  themeReminders: string[];

  // Foreshadowing
  pendingPayoffs: string[];

  // Generated at
  generatedAt: string;
  validUntil?: string;
}

// ============================================================================
// STORY MODE CONFIGURATIONS
// ============================================================================

export interface BookModeConfig {
  mode: 'book';
  targetWordCount: number;
  targetChapterCount: number;
  chapterWordTarget: number;

  // Structure
  useOutline: boolean;
  useBeatSheet: boolean;

  // Features
  enablePOVTracking: boolean;
  enableSubplots: boolean;
  enableThematicCallbacks: boolean;

  // Pacing
  pacingStyle: 'methodical' | 'brisk' | 'variable';
  chapterCliffhangers: boolean;
}

export interface NovelModeConfig {
  mode: 'novel';
  targetWordCount: number;
  targetChapterCount: number;

  // Deep narrative control
  povStyle: 'single' | 'rotating' | 'omniscient';
  primaryPOVCharacters: string[];

  // Subplots
  maxConcurrentSubplots: number;
  subplotIntegration: 'tight' | 'loose' | 'episodic';

  // Character evolution
  characterEvolutionDepth: 'subtle' | 'moderate' | 'dramatic';
  enableSlowBurn: boolean;

  // Tonal consistency
  toneVariance: 'strict' | 'moderate' | 'flexible';
  emotionalRange: string[];

  // Thematic
  thematicResonance: boolean;
  recurringImagery: string[];
}

export interface SeriesModeConfig {
  mode: 'series';
  targetBooks: number;
  averageWordsPerBook: number;

  // Series architecture
  seriesStructure: 'continuous' | 'episodic' | 'anthology';
  bookArcsPerSeriesArc: number;

  // Long-game features
  enableLongForeshadowing: boolean;
  foreshadowingHorizon: number; // How many books ahead to plant seeds

  // Recurring elements
  recurringAntagonists: boolean;
  antagonistEvolution: boolean;

  // Character handling across books
  characterPersistenceLevel: 'full' | 'selective' | 'minimal';
  enableCharacterRotation: boolean;

  // World evolution
  worldChangeRate: 'static' | 'gradual' | 'dynamic';

  // Series-level arcs
  seriesClimaxBook: number;
  denouementBooks: number;
}

export type StoryModeConfig = BookModeConfig | NovelModeConfig | SeriesModeConfig;

// ============================================================================
// AI GENERATION INTERFACES
// ============================================================================

export interface NarrativeGenerationRequest {
  seriesId: string;
  bookId: string;
  chapterId?: string;

  // Mode
  storyMode: StoryMode;
  modeConfig: StoryModeConfig;

  // What to generate
  generationType: 'chapter' | 'scene' | 'dialogue' | 'description' | 'outline' | 'continuation';

  // Context
  context: GenerationContext;

  // User input
  prompt?: string;
  direction?: string;

  // Constraints
  wordCount?: { min: number; max: number };
  mustInclude?: string[];
  mustAvoid?: string[];

  // Style
  toneOverride?: string;
  pacingOverride?: string;
}

export interface NarrativeGenerationResult {
  success: boolean;
  content: string;

  // Metadata
  wordCount: number;

  // Continuity
  charactersInvolved: Array<{ id: string; name: string; action: string }>;
  worldElementsReferenced: Array<{ id: string; name: string }>;
  arcsAdvanced: Array<{ id: string; name: string; newStatus?: ArcStatus }>;

  // Changes detected
  suggestedCharacterEvents: CharacterEvent[];
  suggestedWorldChanges: Array<{ elementId: string; change: string }>;

  // Canon check
  potentialViolations: CanonViolation[];

  // Foreshadowing
  foreshadowingPlanted: string[];
  foreshadowingPaidOff: string[];
}

// ============================================================================
// DASHBOARD INTERFACES
// ============================================================================

export interface SeriesOverview {
  series: StorySeries;
  books: SeriesBook[];
  characterCount: number;
  worldElementCount: number;
  activeArcCount: number;
  totalWordCount: number;
  continuityNotes: number;
  pendingViolations: number;
}

export interface CharacterDashboard {
  character: PersistentCharacter;
  bookStates: CharacterBookState[];
  events: CharacterEvent[];
  relationships: Array<{
    otherCharacter: PersistentCharacter;
    relationship: CharacterRelationship;
  }>;
  arcInvolvement: NarrativeArc[];
}

export interface WorldDashboard {
  elements: WorldElement[];
  locations: WorldLocation[];
  systems: WorldSystem[];
  factions: WorldFaction[];
  timeline: TimelineEvent[];
}

export interface ContinuityDashboard {
  timeline: TimelineEvent[];
  notes: ContinuityNote[];
  violations: CanonViolation[];
  revisionRequests: RevisionRequest[];
}
