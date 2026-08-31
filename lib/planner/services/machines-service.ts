/**
 * Machines Service - Centralized API client for machine data
 * 
 * This service handles all communication with the backend/AWS for machine data.
 * Update the API_BASE_URL and endpoints here when you connect to your AWS database.
 */

import { MachineCatalogItem } from "@/lib/planner/planner-types"

// TODO: Replace with your actual AWS API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

export interface MachinesServiceConfig {
  baseUrl?: string
  authToken?: string
}

class MachinesService {
  private baseUrl: string
  private authToken?: string

  constructor(config?: MachinesServiceConfig) {
    this.baseUrl = config?.baseUrl || API_BASE_URL
    this.authToken = config?.authToken
  }

  /**
   * Get all machines from the database
   * 
   * AWS Query:
   * SELECT id, name, category, width, depth, height, clearance, description, color, image 
   * FROM machines ORDER BY category, name
   */
  async getAllMachines(): Promise<MachineCatalogItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/machines`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch machines: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformMachinesData(data)
    } catch (error) {
      console.error("[MachinesService] Error fetching machines:", error)
      throw error
    }
  }

  /**
   * Get a single machine by ID
   */
  async getMachineById(id: string): Promise<MachineCatalogItem | null> {
    try {
      const response = await fetch(`${this.baseUrl}/machines/${id}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch machine: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformMachineData(data)
    } catch (error) {
      console.error("[MachinesService] Error fetching machine:", error)
      throw error
    }
  }

  /**
   * Get machines by category
   * 
   * AWS Query:
   * SELECT * FROM machines WHERE category = ? ORDER BY name
   */
  async getMachinesByCategory(category: string): Promise<MachineCatalogItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/machines?category=${encodeURIComponent(category)}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch machines by category: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformMachinesData(data)
    } catch (error) {
      console.error("[MachinesService] Error fetching machines by category:", error)
      throw error
    }
  }

  /**
   * Search machines by name or description
   * 
   * AWS Query:
   * SELECT * FROM machines 
   * WHERE name LIKE ? OR description LIKE ? 
   * ORDER BY name
   */
  async searchMachines(query: string): Promise<MachineCatalogItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/machines/search?q=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to search machines: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformMachinesData(data)
    } catch (error) {
      console.error("[MachinesService] Error searching machines:", error)
      throw error
    }
  }

  /**
   * Get all unique categories from machines
   * 
   * AWS Query:
   * SELECT DISTINCT category FROM machines ORDER BY category
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/machines/categories`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`)
      }

      const data = await response.json()
      return data.categories || []
    } catch (error) {
      console.error("[MachinesService] Error fetching categories:", error)
      throw error
    }
  }

  /**
   * Transform API response to MachineCatalogItem
   * Adapt this method if your AWS API returns different field names
   */
  private transformMachineData(raw: any): MachineCatalogItem {
    return {
      id: raw.id || raw.machineId,
      name: raw.name || "",
      category: raw.category || "Other",
      width: parseFloat(raw.width) || 0,
      depth: parseFloat(raw.depth) || 0,
      height: parseFloat(raw.height) || 1.5,
      clearance: parseFloat(raw.clearance) || 0,
      description: raw.description || "",
      color: raw.color || "#a855f7",
      image: raw.image || raw.imageUrl || "",
    }
  }

  /**
   * Transform multiple API responses
   */
  private transformMachinesData(rawArray: any[]): MachineCatalogItem[] {
    if (!Array.isArray(rawArray)) {
      return []
    }
    return rawArray.map((item) => this.transformMachineData(item))
  }

  /**
   * Get request headers including authentication if available
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`
    }

    return headers
  }

  /**
   * Set authentication token for subsequent requests
   */
  setAuthToken(token: string): void {
    this.authToken = token
  }

  /**
   * Update base URL (useful for environment changes)
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url
  }
}

// Export singleton instance
export const machinesService = new MachinesService()

// Export factory function for creating instances with custom config
export function createMachinesService(config?: MachinesServiceConfig): MachinesService {
  return new MachinesService(config)
}
