import { create } from 'zustand'
import scene1Data from '../data/traces/scene1.json'
import scene2Data from '../data/traces/scene2.json'

const traces = {
  1: scene1Data,
  2: scene2Data,
}

const useSceneStore = create((set, get) => ({
  currentScene: 1,
  isPlaying: false,
  steps: [],
  currentStepIndex: -1,
  trace: null,

  // Ingestion phase: 'ingest' → 'ready' → 'query-embed' → 'playing'
  phase: 'ingest',
  visibleVectorIds: new Set(),
  ingestingProductId: null, // which product is currently being chunked/embedded
  ingestStep: null, // 'card' | 'chunk' | 'embed' | 'place' | null
  ingestProductIndex: 0, // which product in the list we're on
  queryEmbedStep: null, // 'card' | 'chunk' | 'embed' | 'place' | null
  queryVectorVisible: false, // whether query vector diamond is shown in 3D
  sceneCompleted: {}, // { 1: true, 2: true, ... }

  loadScene: (sceneId) => {
    const trace = traces[sceneId]
    if (!trace) return
    set({
      currentScene: sceneId,
      trace,
      steps: [],
      currentStepIndex: -1,
      isPlaying: false,
      phase: sceneId === 1 ? 'ingest' : 'ready',
      visibleVectorIds: new Set(),
      ingestingProductId: null,
      ingestStep: null,
      ingestProductIndex: 0,
      queryEmbedStep: null,
      queryVectorVisible: false,
    })
  },

  // Store one product — show the card, user clicks "Next" to advance steps
  storeOne: () => {
    const { trace, ingestProductIndex } = get()
    if (!trace) return

    const vec = trace.all_vectors[ingestProductIndex]
    if (!vec) return

    set({ ingestingProductId: vec.product_id, ingestStep: 'card' })
  },

  // Advance through ingest steps: card → chunk → embed → place → done
  advanceIngest: () => {
    const { ingestStep, ingestingProductId, trace, ingestProductIndex } = get()
    if (!ingestStep || !trace) return

    const stepOrder = ['card', 'chunk', 'embed', 'place']
    const currentIdx = stepOrder.indexOf(ingestStep)

    if (currentIdx < stepOrder.length - 1) {
      // Move to next step
      const nextStep = stepOrder[currentIdx + 1]
      set({ ingestStep: nextStep })

      // When reaching 'place', add the vector to the 3D scene
      if (nextStep === 'place') {
        const vec = trace.all_vectors.find((v) => v.product_id === ingestingProductId)
        if (vec) {
          set((state) => ({
            visibleVectorIds: new Set([...state.visibleVectorIds, vec.id]),
          }))
        }
      }
    } else {
      // Done with this product — reset and advance index
      set({
        ingestStep: null,
        ingestingProductId: null,
        ingestProductIndex: ingestProductIndex + 1,
      })
    }
  },

  // Store all — fast-forward, add all vectors rapidly
  storeAll: () => {
    const { trace } = get()
    if (!trace) return

    const allIds = trace.all_vectors.map((v) => v.id)
    const batchSize = 4
    const delay = 120

    for (let i = 0; i < allIds.length; i += batchSize) {
      const batch = allIds.slice(i, i + batchSize)
      setTimeout(() => {
        set((state) => ({
          visibleVectorIds: new Set([...state.visibleVectorIds, ...batch]),
        }))
      }, (i / batchSize) * delay)
    }

    // Transition to ready after all are placed
    const totalTime = Math.ceil(allIds.length / batchSize) * delay + 200
    setTimeout(() => {
      set({ phase: 'ready', ingestStep: null, ingestingProductId: null })
    }, totalTime)
  },

  finishIngest: () => {
    set({ phase: 'ready' })
  },

  // Play starts with query embedding, then trace replay
  play: () => {
    const { trace, isPlaying } = get()
    if (!trace || isPlaying) return
    set({
      isPlaying: true,
      steps: [],
      currentStepIndex: -1,
      phase: 'query-embed',
      queryEmbedStep: 'card',
      queryVectorVisible: false,
    })
  },

  // Advance query embedding: card → chunk → embed → place → start trace
  advanceQueryEmbed: () => {
    const { queryEmbedStep, trace } = get()
    if (!queryEmbedStep || !trace) return

    const stepOrder = ['card', 'chunk', 'embed', 'place']
    const currentIdx = stepOrder.indexOf(queryEmbedStep)

    if (currentIdx < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIdx + 1]
      set({ queryEmbedStep: nextStep })

      // Show query vector in 3D when reaching 'place'
      if (nextStep === 'place') {
        set({ queryVectorVisible: true })
      }
    } else {
      // Done — transition to playing and start trace replay
      set({ queryEmbedStep: null, phase: 'playing' })

      const traceSteps = trace.steps
      traceSteps.forEach((step, i) => {
        setTimeout(() => {
          set((state) => ({
            steps: [...state.steps, step],
            currentStepIndex: i,
          }))
          if (i === traceSteps.length - 1) {
            set((s) => ({
              isPlaying: false,
              sceneCompleted: { ...s.sceneCompleted, [s.currentScene]: true },
            }))
          }
        }, step.t)
      })
    }
  },

  reset: () => {
    set({
      steps: [],
      currentStepIndex: -1,
      isPlaying: false,
      phase: 'ingest',
      visibleVectorIds: new Set(),
      ingestingProductId: null,
      ingestStep: null,
      ingestProductIndex: 0,
      queryEmbedStep: null,
      queryVectorVisible: false,
    })
  },

  nextScene: () => {
    const { currentScene } = get()
    const next = currentScene + 1
    if (traces[next]) {
      get().loadScene(next)
    }
  },
}))

export default useSceneStore
