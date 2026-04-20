// ─── Primitive enums ────────────────────────────────────────────────────────

export type ArtifactType = 'runway' | 'sketch' | 'material'

export type SourceBadge =
  | 'Brand Archive'
  | 'Studio London'
  | 'Paris Office'
  | 'Material Library'

export type DimensionStatus = 'clear' | 'watch' | 'risk' | 'dormant'

export type DimensionKey =
  | 'moqAlignment'
  | 'leadTime'
  | 'materialAvailability'
  | 'factoryCapacity'
  | 'sustainabilityScore'
  | 'sampleIterationRisk'
  | 'machineComplexity'

// ─── Alignment breakdown (used in both hint and rationale) ───────────────────

export interface AlignmentBreakdown {
  silhouette: number  // 0–100
  palette: number     // 0–100
  hardware: number    // 0–100
  material: number    // 0–100
}

// ─── Intake / search result card ────────────────────────────────────────────

export interface IntakeCard {
  /** Stable identifier for this search result entry */
  id: string
  type: ArtifactType
  /** Primary label: e.g. "FW23 Biker — Rick Owens ref" */
  label: string
  /** Secondary descriptor: e.g. "Brand Archive · FW23" */
  sublabel: string
  source: SourceBadge
  /** Hex color used as placeholder thumbnail background */
  thumbnailColor: string
  /** Pre-scored alignment hints embedded in mock data */
  alignmentHint: AlignmentBreakdown
}

// ─── Canvas artifact (a dropped + pinned IntakeCard) ─────────────────────────

export interface ArtifactNode extends IntakeCard {
  /** Position on the infinite canvas in pixels */
  position: { x: number; y: number }
  /**
   * Overall alignment score 0–100.
   * null until the /api/score response arrives.
   */
  alignmentScore: number | null
  /**
   * Per-dimension breakdown returned by the AI scoring API.
   * null until the response arrives (card shows skeleton).
   */
  alignmentRationale: AlignmentBreakdown | null
  /** Unix timestamp (Date.now()) when the artifact was dropped */
  droppedAt: number
  /** Approval state driven by per-card gestures */
  approved: boolean | null
}

// ─── Logistics dimension card ────────────────────────────────────────────────

export interface DimensionCardData {
  key: DimensionKey
  /** Human-readable display label */
  label: string
  /** Score 0–100 (used to render the fill bar and drive status color) */
  score: number
  status: DimensionStatus
  /** Specific, data-rich explanation sentence shown on the card */
  explanation: string
  /** Whether this card has been activated by the current canvas state */
  isActive: boolean
}

// ─── Left-rail logistics state ───────────────────────────────────────────────

export interface LogisticsState {
  cards: Record<DimensionKey, DimensionCardData>
  /**
   * Mean score of all ACTIVE cards only.
   * null when no cards are active (canvas empty).
   */
  overallFeasibility: number | null
}

// ─── Brief package produced for "Approve + Dispatch" ────────────────────────

export interface BriefPackage {
  productionLead: string
  sourcingManager: string
  merchandising: string
}

// ─── Team member metadata ────────────────────────────────────────────────────

export interface TeamMember {
  name: string
  role: string
  initials: string
  avatarColor: string
  briefKey: keyof BriefPackage
}
