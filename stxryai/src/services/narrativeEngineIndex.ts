/**
 * Narrative Engine Services Index
 * Central export point for all narrative engine services.
 */

// Core engine
export { persistentNarrativeEngine, PersistentNarrativeEngine } from './persistentNarrativeEngine';

// Story mode management
export {
  storyModeManager,
  StoryModeManager,
  DEFAULT_BOOK_CONFIG,
  DEFAULT_NOVEL_CONFIG,
  DEFAULT_SERIES_CONFIG,
  type BookOutline,
  type ChapterOutline,
  type SceneOutline,
  type Beat,
  type ChapterType,
} from './storyModeManager';

// Worldbuilding
export {
  worldbuildingArchive,
  WorldbuildingArchive,
  type WorldState,
  type ElementWithContext,
  type LocationNode,
  type ValidationResult,
  type ConsistencyCheckResult,
} from './worldbuildingArchive';

// Canon enforcement
export {
  canonEnforcer,
  CanonEnforcer,
  type DefineRuleInput,
  type EnforcementContext,
  type EnforcementResult,
} from './canonEnforcer';

// Revision propagation
export {
  revisionPropagation,
  RevisionPropagationService,
  type CharacterChangeRequest,
  type WorldChangeRequest,
  type RetconRequest,
  type ImpactAnalysis,
  type PropagationResult,
} from './revisionPropagation';
