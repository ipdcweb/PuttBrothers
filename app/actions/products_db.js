"use server"

import machines from "@/lib/catalog/machines.json"

export const getMachinesAllResult = async () => {
  // The versioned catalogue is bundled with this Cloudflare release. Returning
  // copies keeps callers from mutating the shared imported snapshot.
  return { machines: machines.map((machine) => ({ ...machine })), isFallback: false }
}

export const getMachinesAll = async () => {
  const { machines } = await getMachinesAllResult()
  return machines
}

export const getMachines = async () => {
  // Both former public endpoints returned this same collection at migration.
  return getMachinesAll()
}
