import { create } from 'zustand'
import { LOGISTICS_TEMPLATES } from './mockData'
import type {
  ArtifactNode,
  AlignmentBreakdown,
  DimensionKey,
  IntakeCard,
  LogisticsState,
  BriefPackage,
} from './types'

// ─── computeLogistics ──────────────────────────────────────────────────────
// Pure function called after every artifact mutation.
// Derives LogisticsState entirely from the artifacts array.

function computeLogisticsFinal(artifacts: ArtifactNode[]): LogisticsState {
  const presentTypes = [...new Set(artifacts.map((a) => a.type))]
  const hasMaterial  = presentTypes.includes('material')
  const hasSketch    = presentTypes.includes('sketch')
  const hasThreePlus = artifacts.length >= 3

  const activation: Record<DimensionKey, boolean> = {
    moqAlignment:         hasMaterial,
    leadTime:             hasMaterial,
    materialAvailability: hasMaterial,
    sampleIterationRisk:  hasSketch,
    machineComplexity:    hasSketch,
    factoryCapacity:      hasMaterial && hasSketch,
    sustainabilityScore:  hasThreePlus,
  }

  const cards = {} as LogisticsState['cards']
  let activeScoreSum = 0
  let activeCount    = 0

  for (const key of Object.keys(LOGISTICS_TEMPLATES) as DimensionKey[]) {
    const template = LOGISTICS_TEMPLATES[key]
    const isActive = activation[key]
    cards[key] = {
      ...template,
      isActive,
      status: isActive ? template.status : 'dormant',
    }
    if (isActive) {
      activeScoreSum += template.score
      activeCount++
    }
  }

  return {
    cards,
    overallFeasibility: activeCount > 0 ? Math.round(activeScoreSum / activeCount) : null,
  }
}

// ─── Initial logistics state (all dormant) ────────────────────────────────

const INITIAL_LOGISTICS: LogisticsState = computeLogisticsFinal([])

// ─── Store interface ───────────────────────────────────────────────────────

export interface CanvasStore {
  // ── Canvas ───────────────────────────────────────────────────────────────
  artifacts:       ArtifactNode[]
  collectionTitle: string
  selectedId:      string | null

  // ── Logistics (always derived from artifacts) ────────────────────────────
  logistics: LogisticsState

  // ── Search / intake panel ────────────────────────────────────────────────
  searchQuery:   string
  searchResults: IntakeCard[]
  searchLoading: boolean

  // ── Scoring state (artifact IDs currently awaiting /api/score) ──────────
  scoringIds: string[]

  // ── Approve modal ────────────────────────────────────────────────────────
  approveModalOpen:   boolean
  /** 'global' = Finalize Drop flow, string = per-artifact id */
  approveModalTarget: 'global' | string | null

  // ── Left rail tab ────────────────────────────────────────────────────────
  /** Controls what the left rail renders. Factory = full logistics view. */
  activeTab: 'trend' | 'skus' | 'factory'

  // ── Brief dispatch ───────────────────────────────────────────────────────
  briefPackage:   BriefPackage | null
  briefStreaming: boolean

  // ── Actions ──────────────────────────────────────────────────────────────

  /** Drop an intake card onto the canvas at a given position */
  addArtifact: (card: IntakeCard, position: { x: number; y: number }) => void
  /** Update position of an artifact already on the canvas */
  moveArtifact: (id: string, position: { x: number; y: number }) => void
  /** Remove an artifact (reject gesture or explicit delete) */
  removeArtifact: (id: string) => void
  /** Write AI alignment score + rationale once /api/score resolves */
  setArtifactScore: (
    id:         string,
    score:      number,
    rationale:  AlignmentBreakdown
  ) => void
  /** Approve an artifact (green check gesture) */
  approveArtifact: (id: string) => void
  /** Mark artifact rejected (visual only — does not remove it) */
  rejectArtifact: (id: string) => void

  /** Track which artifact IDs are currently being scored */
  addScoringId:    (id: string) => void
  removeScoringId: (id: string) => void

  setCollectionTitle: (title: string) => void
  selectArtifact:     (id: string | null) => void
  setActiveTab:       (tab: 'trend' | 'skus' | 'factory') => void

  /** Update search query and loading state together */
  setSearch:        (query: string) => void
  setSearchResults: (results: IntakeCard[]) => void
  setSearchLoading: (loading: boolean) => void

  openApproveModal:  (target: 'global' | string) => void
  closeApproveModal: () => void

  setBriefPackage:    (pkg: BriefPackage) => void
  /** Incrementally update a single brief field as the SSE stream arrives */
  updateBriefField:   (field: keyof BriefPackage, content: string) => void
  setBriefStreaming:   (streaming: boolean) => void
  /** Reset brief state when modal is closed */
  clearBrief:          () => void
}

// ─── Store implementation ──────────────────────────────────────────────────

export const useCanvasStore = create<CanvasStore>()((set, get) => ({
  // ── Initial state ─────────────────────────────────────────────────────────
  artifacts:          [],
  collectionTitle:    "Jacket Dystopia — Winter '26",
  selectedId:         null,
  activeTab:          'factory',
  logistics:          INITIAL_LOGISTICS,
  searchQuery:        '',
  searchResults:      [],
  searchLoading:      false,
  scoringIds:         [],
  approveModalOpen:   false,
  approveModalTarget: null,
  briefPackage:       null,
  briefStreaming:     false,

  // ── Canvas actions ────────────────────────────────────────────────────────

  addArtifact: (card, position) => {
    const node: ArtifactNode = {
      ...card,
      // Give each dropped artifact a unique runtime ID
      id:                 crypto.randomUUID(),
      position,
      alignmentScore:     null,
      alignmentRationale: null,
      droppedAt:          Date.now(),
      approved:           null,
    }
    const next = [...get().artifacts, node]
    set({
      artifacts: next,
      logistics: computeLogisticsFinal(next),
    })
    return node
  },

  moveArtifact: (id, position) => {
    set({
      artifacts: get().artifacts.map((a) =>
        a.id === id ? { ...a, position } : a
      ),
    })
  },

  removeArtifact: (id) => {
    const next = get().artifacts.filter((a) => a.id !== id)
    set({
      artifacts:  next,
      logistics:  computeLogisticsFinal(next),
      selectedId: get().selectedId === id ? null : get().selectedId,
    })
  },

  setArtifactScore: (id, score, rationale) => {
    set({
      artifacts: get().artifacts.map((a) =>
        a.id === id
          ? { ...a, alignmentScore: score, alignmentRationale: rationale }
          : a
      ),
    })
  },

  approveArtifact: (id) => {
    set({
      artifacts: get().artifacts.map((a) =>
        a.id === id ? { ...a, approved: true } : a
      ),
    })
  },

  rejectArtifact: (id) => {
    set({
      artifacts: get().artifacts.map((a) =>
        a.id === id ? { ...a, approved: false } : a
      ),
    })
  },

  // ── Scoring lifecycle ─────────────────────────────────────────────────────

  addScoringId: (id) => {
    set({ scoringIds: [...get().scoringIds, id] })
  },

  removeScoringId: (id) => {
    set({ scoringIds: get().scoringIds.filter((s) => s !== id) })
  },

  // ── Canvas metadata ───────────────────────────────────────────────────────

  setCollectionTitle: (title) => set({ collectionTitle: title }),

  selectArtifact: (id) => set({ selectedId: id }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  // ── Search ────────────────────────────────────────────────────────────────

  setSearch: (query) => set({ searchQuery: query }),

  setSearchResults: (results) => set({ searchResults: results, searchLoading: false }),

  setSearchLoading: (loading) => set({ searchLoading: loading }),

  // ── Modal ─────────────────────────────────────────────────────────────────

  openApproveModal: (target) =>
    set({ approveModalOpen: true, approveModalTarget: target }),

  closeApproveModal: () =>
    set({ approveModalOpen: false, approveModalTarget: null }),

  // ── Briefs ────────────────────────────────────────────────────────────────

  setBriefPackage: (pkg) => set({ briefPackage: pkg }),

  updateBriefField: (field, content) => {
    const current = get().briefPackage ?? {
      productionLead:  '',
      sourcingManager: '',
      merchandising:   '',
    }
    set({ briefPackage: { ...current, [field]: content } })
  },

  setBriefStreaming: (streaming) => set({ briefStreaming: streaming }),

  clearBrief: () =>
    set({ briefPackage: null, briefStreaming: false }),
}))

// ─── Selector helpers (memoisation-friendly) ──────────────────────────────
// Import these in components instead of accessing nested state inline.

export const selectArtifacts   = (s: CanvasStore) => s.artifacts
export const selectLogistics   = (s: CanvasStore) => s.logistics
export const selectSearchState = (s: CanvasStore) => ({
  query:   s.searchQuery,
  results: s.searchResults,
  loading: s.searchLoading,
})
export const selectModal = (s: CanvasStore) => ({
  open:   s.approveModalOpen,
  target: s.approveModalTarget,
})
export const selectBriefs = (s: CanvasStore) => ({
  pkg:       s.briefPackage,
  streaming: s.briefStreaming,
})
