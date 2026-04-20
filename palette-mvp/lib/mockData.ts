import type {
  IntakeCard,
  DimensionCardData,
  DimensionKey,
  TeamMember,
} from './types'

// ─── Brand profile ────────────────────────────────────────────────────────────

export const BRAND_PROFILE = {
  name: 'Maison Palette',
  season: "Jacket Dystopia — Winter '26",
  approvedSilhouettes: ['structured biker', 'oversized shell', 'cinched trench'],
  colorSignature: {
    terracotta:   '#D15521',
    burntCaramel: '#C9824C',
    dust:         '#CFAB89',
    void:         '#1a1a1a',
  },
  hardware: 'minimal matte black',
  keyFabrics: [
    'selvedge denim',
    'terracotta wool',
    'bonded leather',
    'bonded neoprene',
  ],
  factories: [
    { name: 'Guangdong',     specialty: 'primary outerwear', country: 'China'  },
    { name: 'Porto Alegre',  specialty: 'knitwear',          country: 'Brazil' },
    { name: 'Biella',        specialty: 'premium wool',      country: 'Italy'  },
  ],
  decisionsCaptures: 847,
  /** Full-text string used as context in every Claude prompt */
  get promptContext(): string {
    return `Brand: ${this.name} | Season: ${this.season}
Approved silhouettes: ${this.approvedSilhouettes.join(', ')}
Color signature: terracotta #D15521, burnt caramel #C9824C, dust #CFAB89, void #1a1a1a
Hardware: ${this.hardware}
Key fabrics: ${this.keyFabrics.join(', ')}
Factories: Guangdong (primary outerwear, China), Porto Alegre (knitwear, Brazil), Biella (premium wool, Italy)
847 decisions captured in brand memory`
  },
} as const

// ─── Team members ─────────────────────────────────────────────────────────────

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name:        'Raina Pettellier',
    role:        'Production Lead',
    initials:    'RP',
    avatarColor: '#7C5CBF',
    briefKey:    'productionLead',
  },
  {
    name:        'Marcus Kwon',
    role:        'Sourcing Manager',
    initials:    'MK',
    avatarColor: '#4A90D9',
    briefKey:    'sourcingManager',
  },
  {
    name:        'Sophie Vega',
    role:        'Merchandising',
    initials:    'SV',
    avatarColor: '#D15521',
    briefKey:    'merchandising',
  },
]

// ─── Logistics dimension templates ───────────────────────────────────────────
// Scores and explanations are fixed for the prototype.
// computeLogistics() in store.ts applies isActive based on canvas state.

export const LOGISTICS_TEMPLATES: Record<DimensionKey, Omit<DimensionCardData, 'isActive'>> = {
  moqAlignment: {
    key:         'moqAlignment',
    label:       'MOQ Alignment',
    score:       47,
    status:      'watch',
    explanation: 'Denim quantity 11% below minimum for Guangdong factory. Add SKUs or combine with SS26 reorder to close gap.',
  },
  leadTime: {
    key:         'leadTime',
    label:       'Lead Time Window',
    score:       23,
    status:      'risk',
    explanation: '17 calendar days of buffer remain. Closest historical analog (FW23 biker) overran by 9 days at similar gate.',
  },
  materialAvailability: {
    key:         'materialAvailability',
    label:       'Material Availability',
    score:       88,
    status:      'clear',
    explanation: 'Selvedge denim and terracotta wool both On Hand at approved mills within current price range. No re-order risk today.',
  },
  factoryCapacity: {
    key:         'factoryCapacity',
    label:       'Factory Capacity',
    score:       61,
    status:      'watch',
    explanation: 'Primary factory 63% utilized through Apr 31st. Outerwear line opens May 2–3rd. 3-day slip from current calendar target.',
  },
  sustainabilityScore: {
    key:         'sustainabilityScore',
    label:       'Sustainability Score',
    score:       82,
    status:      'clear',
    explanation: 'Selvedge denim scores above brand ESG threshold. Terracotta colorway adds +4% water vs brand avg. Within tolerance.',
  },
  sampleIterationRisk: {
    key:         'sampleIterationRisk',
    label:       'Sample Iteration Risk',
    score:       31,
    status:      'risk',
    explanation: 'Complexity on this silhouette has driven avg 3.2 sample rounds historically. Each round = +3–4 weeks.',
  },
  machineComplexity: {
    key:         'machineComplexity',
    label:       'Machine Complexity',
    score:       79,
    status:      'clear',
    explanation: 'Denim and terracotta management for structured silhouettes map to 3–4 existing factory machines. Orientation transferrable.',
  },
}

// ─── Search result bank ───────────────────────────────────────────────────────
// 5 themes × 8 cards each. Claude /api/search returns fresh JSON;
// these act as a typed fallback and as seed context for the prompt.

export const SEARCH_RESULT_BANK: Record<string, IntakeCard[]> = {

  // ── Theme: dystopian jacket ─────────────────────────────────────────────────
  'dystopian jacket': [
    {
      id:             'dj-rw-01',
      type:           'runway',
      label:          'FW23 Biker — Rick Owens ref',
      sublabel:       'Brand Archive · FW23',
      source:         'Brand Archive',
      thumbnailColor: '#1c1410',
      alignmentHint:  { silhouette: 84, palette: 52, hardware: 38, material: 44 },
    },
    {
      id:             'dj-rw-02',
      type:           'runway',
      label:          'AW24 Structured Shell — Balenciaga archive',
      sublabel:       'Brand Archive · AW24',
      source:         'Brand Archive',
      thumbnailColor: '#1a1a1a',
      alignmentHint:  { silhouette: 78, palette: 41, hardware: 55, material: 37 },
    },
    {
      id:             'dj-rw-03',
      type:           'runway',
      label:          'SS24 Cinched Trench — Yohji ref',
      sublabel:       'Brand Archive · SS24',
      source:         'Brand Archive',
      thumbnailColor: '#2b1f15',
      alignmentHint:  { silhouette: 91, palette: 48, hardware: 29, material: 52 },
    },
    {
      id:             'dj-sk-01',
      type:           'sketch',
      label:          'Biker v3 — London Studio',
      sublabel:       'Studio London · Mar \'26',
      source:         'Studio London',
      thumbnailColor: '#0d1f33',
      alignmentHint:  { silhouette: 93, palette: 82, hardware: 77, material: 69 },
    },
    {
      id:             'dj-sk-02',
      type:           'sketch',
      label:          'Oversized Shell v7 — Paris Office',
      sublabel:       'Paris Office · Feb \'26',
      source:         'Paris Office',
      thumbnailColor: '#152840',
      alignmentHint:  { silhouette: 88, palette: 79, hardware: 71, material: 65 },
    },
    {
      id:             'dj-sk-03',
      type:           'sketch',
      label:          'Cinched Trench v2 — London Studio',
      sublabel:       'Studio London · Jan \'26',
      source:         'Studio London',
      thumbnailColor: '#1a2a3d',
      alignmentHint:  { silhouette: 85, palette: 74, hardware: 68, material: 61 },
    },
    {
      id:             'dj-mt-01',
      type:           'material',
      label:          '14oz Selvedge Denim — Candiani Mill',
      sublabel:       'Material Library · 2.3m available',
      source:         'Material Library',
      thumbnailColor: '#2c4a7c',
      alignmentHint:  { silhouette: 22, palette: 58, hardware: 18, material: 94 },
    },
    {
      id:             'dj-mt-02',
      type:           'material',
      label:          'Terracotta Wool Bouclé — Biella',
      sublabel:       'Material Library · On hand',
      source:         'Material Library',
      thumbnailColor: '#D15521',
      alignmentHint:  { silhouette: 18, palette: 97, hardware: 12, material: 91 },
    },
  ],

  // ── Theme: terracotta outerwear ─────────────────────────────────────────────
  'terracotta outerwear': [
    {
      id:             'to-rw-01',
      type:           'runway',
      label:          'FW22 Terracotta Coat — Internal Archive',
      sublabel:       'Brand Archive · FW22',
      source:         'Brand Archive',
      thumbnailColor: '#8B3A1A',
      alignmentHint:  { silhouette: 76, palette: 91, hardware: 42, material: 63 },
    },
    {
      id:             'to-rw-02',
      type:           'runway',
      label:          "SS25 Burnt Orange Jacket — Paris ref",
      sublabel:       'Brand Archive · SS25',
      source:         'Brand Archive',
      thumbnailColor: '#C9824C',
      alignmentHint:  { silhouette: 69, palette: 88, hardware: 35, material: 58 },
    },
    {
      id:             'to-sk-01',
      type:           'sketch',
      label:          "Terracotta Shell v4 — Paris Office",
      sublabel:       'Paris Office · Mar \'26',
      source:         'Paris Office',
      thumbnailColor: '#152840',
      alignmentHint:  { silhouette: 87, palette: 93, hardware: 74, material: 71 },
    },
    {
      id:             'to-sk-02',
      type:           'sketch',
      label:          'Burnt Caramel Biker v2 — London Studio',
      sublabel:       "Studio London · Feb '26",
      source:         'Studio London',
      thumbnailColor: '#0d1f33',
      alignmentHint:  { silhouette: 91, palette: 89, hardware: 79, material: 68 },
    },
    {
      id:             'to-sk-03',
      type:           'sketch',
      label:          'Oversized Coat v12 — Paris Office',
      sublabel:       "Paris Office · Jan '26",
      source:         'Paris Office',
      thumbnailColor: '#1a2a3d',
      alignmentHint:  { silhouette: 83, palette: 85, hardware: 66, material: 62 },
    },
    {
      id:             'to-mt-01',
      type:           'material',
      label:          'Terracotta Wool Bouclé — Biella',
      sublabel:       'Material Library · On hand',
      source:         'Material Library',
      thumbnailColor: '#D15521',
      alignmentHint:  { silhouette: 18, palette: 97, hardware: 12, material: 91 },
    },
    {
      id:             'to-mt-02',
      type:           'material',
      label:          'Burnt Caramel Cashmere Blend — Como',
      sublabel:       'Material Library · MOQ 400m',
      source:         'Material Library',
      thumbnailColor: '#C9824C',
      alignmentHint:  { silhouette: 15, palette: 94, hardware: 10, material: 88 },
    },
    {
      id:             'to-mt-03',
      type:           'material',
      label:          'Double-Face Wool — Manteco Biella',
      sublabel:       'Material Library · 1.8m available',
      source:         'Material Library',
      thumbnailColor: '#CFAB89',
      alignmentHint:  { silhouette: 20, palette: 86, hardware: 14, material: 85 },
    },
  ],

  // ── Theme: structured knitwear ──────────────────────────────────────────────
  'structured knitwear': [
    {
      id:             'sk-rw-01',
      type:           'runway',
      label:          'FW24 Structured Knit — Issey archive',
      sublabel:       'Brand Archive · FW24',
      source:         'Brand Archive',
      thumbnailColor: '#1a1a1a',
      alignmentHint:  { silhouette: 73, palette: 47, hardware: 31, material: 61 },
    },
    {
      id:             'sk-rw-02',
      type:           'runway',
      label:          'AW23 Rib Knit — Porto Alegre origin',
      sublabel:       'Brand Archive · AW23',
      source:         'Brand Archive',
      thumbnailColor: '#2b1f15',
      alignmentHint:  { silhouette: 68, palette: 55, hardware: 28, material: 74 },
    },
    {
      id:             'sk-sk-01',
      type:           'sketch',
      label:          'Rib Knit Biker v1 — Porto Alegre',
      sublabel:       "Studio London · Mar '26",
      source:         'Studio London',
      thumbnailColor: '#0d1f33',
      alignmentHint:  { silhouette: 82, palette: 76, hardware: 65, material: 79 },
    },
    {
      id:             'sk-sk-02',
      type:           'sketch',
      label:          'Cable Knit Shell v5 — Paris Office',
      sublabel:       "Paris Office · Feb '26",
      source:         'Paris Office',
      thumbnailColor: '#152840',
      alignmentHint:  { silhouette: 86, palette: 71, hardware: 63, material: 77 },
    },
    {
      id:             'sk-sk-03',
      type:           'sketch',
      label:          'Oversized Knit Trench v3 — London Studio',
      sublabel:       "Studio London · Jan '26",
      source:         'Studio London',
      thumbnailColor: '#1a2a3d',
      alignmentHint:  { silhouette: 90, palette: 69, hardware: 59, material: 72 },
    },
    {
      id:             'sk-mt-01',
      type:           'material',
      label:          '12gg Merino Rib — Porto Alegre Mill',
      sublabel:       'Material Library · MOQ 600m',
      source:         'Material Library',
      thumbnailColor: '#8B6045',
      alignmentHint:  { silhouette: 16, palette: 72, hardware: 11, material: 93 },
    },
    {
      id:             'sk-mt-02',
      type:           'material',
      label:          'Bouclé Knit Panel — Biella',
      sublabel:       'Material Library · On hand',
      source:         'Material Library',
      thumbnailColor: '#CFAB89',
      alignmentHint:  { silhouette: 19, palette: 84, hardware: 13, material: 89 },
    },
    {
      id:             'sk-mt-03',
      type:           'material',
      label:          'Bonded Neoprene-Knit Composite — Milan',
      sublabel:       'Material Library · 3.1m available',
      source:         'Material Library',
      thumbnailColor: '#2a2a2a',
      alignmentHint:  { silhouette: 24, palette: 61, hardware: 17, material: 87 },
    },
  ],

  // ── Theme: bonded leather ───────────────────────────────────────────────────
  'bonded leather': [
    {
      id:             'bl-rw-01',
      type:           'runway',
      label:          'FW25 Bonded Leather — Internal ref',
      sublabel:       'Brand Archive · FW25',
      source:         'Brand Archive',
      thumbnailColor: '#1a1a1a',
      alignmentHint:  { silhouette: 81, palette: 44, hardware: 63, material: 77 },
    },
    {
      id:             'bl-rw-02',
      type:           'runway',
      label:          'SS23 Leather Shell — Helmut Lang archive',
      sublabel:       'Brand Archive · SS23',
      source:         'Brand Archive',
      thumbnailColor: '#141414',
      alignmentHint:  { silhouette: 75, palette: 38, hardware: 68, material: 72 },
    },
    {
      id:             'bl-rw-03',
      type:           'runway',
      label:          'AW22 Cinched Leather — Alaïa ref',
      sublabel:       'Brand Archive · AW22',
      source:         'Brand Archive',
      thumbnailColor: '#1c1410',
      alignmentHint:  { silhouette: 88, palette: 41, hardware: 59, material: 69 },
    },
    {
      id:             'bl-sk-01',
      type:           'sketch',
      label:          'Bonded Leather Biker v6 — London Studio',
      sublabel:       "Studio London · Mar '26",
      source:         'Studio London',
      thumbnailColor: '#0d1f33',
      alignmentHint:  { silhouette: 92, palette: 78, hardware: 84, material: 81 },
    },
    {
      id:             'bl-sk-02',
      type:           'sketch',
      label:          'Leather Shell v3 — Paris Office',
      sublabel:       "Paris Office · Feb '26",
      source:         'Paris Office',
      thumbnailColor: '#152840',
      alignmentHint:  { silhouette: 86, palette: 73, hardware: 81, material: 76 },
    },
    {
      id:             'bl-mt-01',
      type:           'material',
      label:          '1.2mm Bonded Leather — Incas Premium',
      sublabel:       'Material Library · 4.0m available',
      source:         'Material Library',
      thumbnailColor: '#1a1a1a',
      alignmentHint:  { silhouette: 21, palette: 49, hardware: 16, material: 96 },
    },
    {
      id:             'bl-mt-02',
      type:           'material',
      label:          '0.8mm Nappa Lamb — Marroquin',
      sublabel:       'Material Library · MOQ 500m',
      source:         'Material Library',
      thumbnailColor: '#3d2b1f',
      alignmentHint:  { silhouette: 17, palette: 53, hardware: 14, material: 93 },
    },
    {
      id:             'bl-mt-03',
      type:           'material',
      label:          'Bonded Neoprene Backing — Korea',
      sublabel:       'Material Library · 2.7m available',
      source:         'Material Library',
      thumbnailColor: '#2a2a2a',
      alignmentHint:  { silhouette: 23, palette: 44, hardware: 19, material: 88 },
    },
  ],

  // ── Theme: default (shown before any search) ────────────────────────────────
  default: [
    {
      id:             'df-rw-01',
      type:           'runway',
      label:          'FW23 Biker — Rick Owens ref',
      sublabel:       'Brand Archive · FW23',
      source:         'Brand Archive',
      thumbnailColor: '#1c1410',
      alignmentHint:  { silhouette: 84, palette: 52, hardware: 38, material: 44 },
    },
    {
      id:             'df-rw-02',
      type:           'runway',
      label:          "SS24 Shell — Maison Margiela archive",
      sublabel:       'Brand Archive · SS24',
      source:         'Brand Archive',
      thumbnailColor: '#1a1a1a',
      alignmentHint:  { silhouette: 77, palette: 45, hardware: 43, material: 39 },
    },
    {
      id:             'df-rw-03',
      type:           'runway',
      label:          "AW25 Trench — Internal reference",
      sublabel:       "Brand Archive · AW25",
      source:         'Brand Archive',
      thumbnailColor: '#2b1f15',
      alignmentHint:  { silhouette: 82, palette: 61, hardware: 34, material: 55 },
    },
    {
      id:             'df-sk-01',
      type:           'sketch',
      label:          'Biker v3 — London Studio',
      sublabel:       "Studio London · Mar '26",
      source:         'Studio London',
      thumbnailColor: '#0d1f33',
      alignmentHint:  { silhouette: 93, palette: 82, hardware: 77, material: 69 },
    },
    {
      id:             'df-sk-02',
      type:           'sketch',
      label:          'Oversized Shell v7 — Paris Office',
      sublabel:       "Paris Office · Feb '26",
      source:         'Paris Office',
      thumbnailColor: '#152840',
      alignmentHint:  { silhouette: 88, palette: 79, hardware: 71, material: 65 },
    },
    {
      id:             'df-mt-01',
      type:           'material',
      label:          '14oz Selvedge Denim — Candiani Mill',
      sublabel:       'Material Library · 2.3m available',
      source:         'Material Library',
      thumbnailColor: '#2c4a7c',
      alignmentHint:  { silhouette: 22, palette: 58, hardware: 18, material: 94 },
    },
    {
      id:             'df-mt-02',
      type:           'material',
      label:          'Terracotta Wool Bouclé — Biella',
      sublabel:       'Material Library · On hand',
      source:         'Material Library',
      thumbnailColor: '#D15521',
      alignmentHint:  { silhouette: 18, palette: 97, hardware: 12, material: 91 },
    },
    {
      id:             'df-mt-03',
      type:           'material',
      label:          '1.2mm Bonded Leather — Incas Premium',
      sublabel:       'Material Library · 4.0m available',
      source:         'Material Library',
      thumbnailColor: '#1a1a1a',
      alignmentHint:  { silhouette: 21, palette: 49, hardware: 16, material: 96 },
    },
  ],
}

// ─── Helper: find the closest theme match for a query string ─────────────────
// Used as a fallback by the API route if Claude fails to parse.

export function getFallbackResults(query: string): IntakeCard[] {
  const q = query.toLowerCase()
  if (q.includes('terracotta') || q.includes('orange')) return SEARCH_RESULT_BANK['terracotta outerwear']
  if (q.includes('knitwear') || q.includes('knit'))      return SEARCH_RESULT_BANK['structured knitwear']
  if (q.includes('leather') || q.includes('bonded'))     return SEARCH_RESULT_BANK['bonded leather']
  if (q.includes('biker') || q.includes('dystop') || q.includes('jacket')) return SEARCH_RESULT_BANK['dystopian jacket']
  return SEARCH_RESULT_BANK['default']
}
