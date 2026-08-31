/**
 * Hook for fetching Course Holes data
 * This hook is designed to be easily switched between local data and AWS API calls
 * 
 * Current: Returns local data from course-holes-data.ts (fallback)
 * Production: Fetches from AWS API via machinesService
 */

import { useState, useEffect } from "react"
import type { MachineCatalogItem } from "@/lib/planner/planner-types"
import { machinesService } from "@/lib/planner/services/machines-service"
import { COURSE_HOLES_DATA, COURSE_HOLES_CATEGORIES } from "@/lib/planner/course-holes-data"

interface UseCourseHolesReturn {
  courseHoles: MachineCatalogItem[]
  categories: string[]
  isLoading: boolean
  error: Error | null
  getCourseHole: (id: string) => MachineCatalogItem | undefined
  refetch: () => Promise<void>
}

/**
 * Hook to fetch and manage Course Holes data
 * 
 * Data Source Priority:
 * 1. AWS API (if NEXT_PUBLIC_API_URL is configured)
 * 2. Local fallback data (COURSE_HOLES_DATA)
 * 
 * @example
 * const { courseHoles, categories, isLoading, error, getCourseHole, refetch } = useCourseHoles()
 * 
 * To integrate with AWS:
 * 1. Set NEXT_PUBLIC_API_URL environment variable to your AWS API endpoint
 * 2. The API should implement GET /api/machines endpoint
 * 3. Response should return MachineCatalogItem[] with fields: id, name, category, width, depth, height, clearance, description, color, image
 * 4. Optionally implement: GET /api/machines/:id, GET /api/machines/search?q=, GET /api/machines/categories
 */
export function useCourseHoles(): UseCourseHolesReturn {
  const [courseHoles, setCourseHoles] = useState<MachineCatalogItem[]>([])
  const [categories, setCategories] = useState<string[]>(COURSE_HOLES_CATEGORIES)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCourseHoles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Check if API is configured
      const hasApiUrl = process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== "http://localhost:3000/api"
      
      if (hasApiUrl) {
        console.log("[useCourseHoles] Fetching from AWS API:", process.env.NEXT_PUBLIC_API_URL)
        try {
          // Try to fetch from AWS API
          const data = await machinesService.getAllMachines()
          setCourseHoles(data)
          
          // Try to fetch categories from API
          try {
            const apiCategories = await machinesService.getCategories()
            if (apiCategories.length > 0) {
              setCategories(apiCategories)
            }
          } catch (err) {
            console.warn("[useCourseHoles] Failed to fetch categories from API, using local categories")
            setCategories(COURSE_HOLES_CATEGORIES)
          }
        } catch (apiError) {
          console.warn("[useCourseHoles] AWS API fetch failed, falling back to local data:", apiError)
          setCourseHoles(COURSE_HOLES_DATA)
          setCategories(COURSE_HOLES_CATEGORIES)
        }
      } else {
        console.log("[useCourseHoles] Using local data (no API configured)")
        // Use local data
        setCourseHoles(COURSE_HOLES_DATA)
        setCategories(COURSE_HOLES_CATEGORIES)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch course holes")
      console.error("[useCourseHoles] Error:", error)
      setError(error)
      // Fallback to local data on any error
      setCourseHoles(COURSE_HOLES_DATA)
      setCategories(COURSE_HOLES_CATEGORIES)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCourseHoles()
  }, [])

  const getCourseHole = (id: string): MachineCatalogItem | undefined => {
    return courseHoles.find((m) => m.id === id)
  }

  return {
    courseHoles,
    categories,
    isLoading,
    error,
    getCourseHole,
    refetch: fetchCourseHoles,
  }
}

