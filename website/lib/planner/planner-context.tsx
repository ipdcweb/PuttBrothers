"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { PlannerState, Point, Polygon, PlacedMachine, Unit, TextLabel, MachineCatalogItem } from "./planner-types"
import { loadState, saveState, generateId } from "./planner-store"
import { MACHINE_CATALOG, setMachineCatalog } from "./machine-catalog"

interface PlannerContextValue {
  state: PlannerState
  catalog: MachineCatalogItem[]
  isCatalogLoading: boolean
  catalogError: string
  setUnit: (u: Unit) => void
  addBoundary: (b: Polygon) => void
  removeBoundary: (id: string) => void
  addObstacle: (o: Polygon) => void
  removeObstacle: (id: string) => void
  addRestricted: (r: Polygon) => void
  removeRestricted: (id: string) => void
  placeMachine: (m: PlacedMachine) => void
  updateMachine: (id: string, updates: Partial<PlacedMachine>) => void
  removeMachine: (id: string) => void
  setPlacedMachines: (machines: PlacedMachine[]) => void
  addTextLabel: (label: TextLabel) => void
  updateTextLabel: (id: string, updates: Partial<TextLabel>) => void
  removeTextLabel: (id: string) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  resetPlannerState: () => void
}

const PlannerContext = createContext<PlannerContextValue | null>(null)

export function usePlanner() {
  const ctx = useContext(PlannerContext)
  if (!ctx) throw new Error("usePlanner must be used inside PlannerProvider")
  return ctx
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlannerState>(() => loadState())
  const [catalog, setCatalog] = useState<MachineCatalogItem[]>(() => [...MACHINE_CATALOG])
  const [isCatalogLoading, setIsCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState("")
  const [history, setHistory] = useState<PlacedMachine[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  useEffect(() => {
    let cancelled = false

    async function loadCatalog() {
      try {
        setIsCatalogLoading(true)
        setCatalogError("")
        const response = await fetch("/api/planner/machines", { cache: "no-store" })
        if (!response.ok) {
          throw new Error("Unable to load machines")
        }
        const data = await response.json()
        const nextCatalog = Array.isArray(data) && data.length > 0 ? data : MACHINE_CATALOG

        if (!cancelled) {
          setMachineCatalog(nextCatalog)
          setCatalog([...nextCatalog])
        }
      } catch (error) {
        if (!cancelled) {
          setMachineCatalog(MACHINE_CATALOG)
          setCatalog([...MACHINE_CATALOG])
          setCatalogError(error instanceof Error ? error.message : "Unable to load machines")
        }
      } finally {
        if (!cancelled) {
          setIsCatalogLoading(false)
        }
      }
    }

    loadCatalog()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    saveState(state)
  }, [state])

  const setUnit = useCallback((unit: Unit) => {
    setState((s) => ({ ...s, unit }))
  }, [])

  const addBoundary = useCallback((boundary: Polygon) => {
    setState((s) => ({ ...s, boundaries: [...s.boundaries, boundary] }))
  }, [])

  const removeBoundary = useCallback((id: string) => {
    setState((s) => ({ ...s, boundaries: s.boundaries.filter((b) => b.id !== id) }))
  }, [])

  const addObstacle = useCallback((o: Polygon) => {
    setState((s) => ({ ...s, obstacles: [...s.obstacles, o] }))
  }, [])

  const removeObstacle = useCallback((id: string) => {
    setState((s) => ({ ...s, obstacles: s.obstacles.filter((o) => o.id !== id) }))
  }, [])

  const addRestricted = useCallback((r: Polygon) => {
    setState((s) => ({ ...s, restricted: [...s.restricted, r] }))
  }, [])

  const removeRestricted = useCallback((id: string) => {
    setState((s) => ({ ...s, restricted: s.restricted.filter((r) => r.id !== id) }))
  }, [])

  const placeMachine = useCallback((m: PlacedMachine) => {
    setState((s) => {
      const newMachines = [...s.placedMachines, m]
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1)
        newHistory.push(s.placedMachines)
        setHistoryIndex(newHistory.length - 1)
        return newHistory
      })
      return { ...s, placedMachines: newMachines }
    })
  }, [historyIndex])

  const updateMachine = useCallback((id: string, updates: Partial<PlacedMachine>) => {
    setState((s) => {
      const newMachines = s.placedMachines.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      )
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1)
        newHistory.push(s.placedMachines)
        setHistoryIndex(newHistory.length - 1)
        return newHistory
      })
      return { ...s, placedMachines: newMachines }
    })
  }, [historyIndex])

  const removeMachine = useCallback((id: string) => {
    setState((s) => {
      const newMachines = s.placedMachines.filter((m) => m.id !== id)
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1)
        newHistory.push(s.placedMachines)
        setHistoryIndex(newHistory.length - 1)
        return newHistory
      })
      return { ...s, placedMachines: newMachines }
    })
  }, [historyIndex])

  const setPlacedMachines = useCallback((machines: PlacedMachine[]) => {
    setState((s) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1)
        newHistory.push(s.placedMachines)
        setHistoryIndex(newHistory.length - 1)
        return newHistory
      })
      return { ...s, placedMachines: machines }
    })
  }, [historyIndex])

  const addTextLabel = useCallback((label: TextLabel) => {
    setState((s) => ({ ...s, textLabels: [...s.textLabels, label] }))
  }, [])

  const updateTextLabel = useCallback((id: string, updates: Partial<TextLabel>) => {
    setState((s) => ({
      ...s,
      textLabels: s.textLabels.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }))
  }, [])

  const removeTextLabel = useCallback((id: string) => {
    setState((s) => ({ ...s, textLabels: s.textLabels.filter((l) => l.id !== id) }))
  }, [])

  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    const prevIndex = historyIndex - 1
    const previousMachines = history[prevIndex]
    setState((s) => ({ ...s, placedMachines: previousMachines }))
    setHistoryIndex(prevIndex)
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return
    const nextIndex = historyIndex + 1
    const nextMachines = history[nextIndex]
    setState((s) => ({ ...s, placedMachines: nextMachines }))
    setHistoryIndex(nextIndex)
  }, [history, historyIndex])

  const resetPlannerState = useCallback(() => {
    const defaultState: PlannerState = {
      unit: "m",
      boundaries: [],
      obstacles: [],
      restricted: [],
      placedMachines: [],
      textLabels: [],
    }
    setState(defaultState)
    setHistory([])
    setHistoryIndex(-1)
    saveState(defaultState)
  }, [])

  return (
    <PlannerContext.Provider
      value={{
        state,
        catalog,
        isCatalogLoading,
        catalogError,
        setUnit,
        addBoundary,
        removeBoundary,
        addObstacle,
        removeObstacle,
        addRestricted,
        removeRestricted,
        placeMachine,
        updateMachine,
        removeMachine,
        setPlacedMachines,
        addTextLabel,
        updateTextLabel,
        removeTextLabel,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        resetPlannerState,
      }}
    >
      {children}
    </PlannerContext.Provider>
  )
}
