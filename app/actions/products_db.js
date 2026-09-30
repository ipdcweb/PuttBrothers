"use server"

import { FALLBACK_MACHINES, isValidCatalog } from "@/lib/products-catalog"

const fetchData = async (url) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 3500)
  try {
    const response = await fetch(url, {
      next: { revalidate: 300 },
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    // Silently catch all errors and return null for fallback
    return null
  } finally {
    // Include downloading/parsing the response body in the timeout.
    clearTimeout(timeoutId)
  }
}

export const getMachinesAllResult = async () => {
  const data = await fetchData(
    "https://va0d7iedl5.execute-api.ap-southeast-2.amazonaws.com/listMachines?all=true"
  )
  const isFallback = !isValidCatalog(data)
  return { machines: isFallback ? FALLBACK_MACHINES : data, isFallback }
}

export const getMachinesAll = async () => {
  const { machines } = await getMachinesAllResult()
  return machines
}

export const getMachines = async () => {
  const data = await fetchData(
    "https://va0d7iedl5.execute-api.ap-southeast-2.amazonaws.com/listMachines"
  )
  return isValidCatalog(data) ? data : FALLBACK_MACHINES
}

export const getTerms = async (termID) => {
  const data = await fetchData(
    `https://va0d7iedl5.execute-api.ap-southeast-2.amazonaws.com/getTerms?termID=${termID}`
  )
  return data || []
}
