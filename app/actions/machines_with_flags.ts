"use server"

import { getMachinesAllResult } from "./products_db"
import { hasProduct3D } from "@/lib/product-media"

/**
 * The local release manifest records the complete migrated Unity builds.
 * No storage probes or external catalogue request are needed while browsing.
 */
export const getMachinesWithFlagsResult = async () => {
  const { machines, isFallback } = await getMachinesAllResult()
  const machinesWithFlags = machines.map((machine: any) => {
    const folderName = machine.FolderName || machine.folderName
    const has3D = hasProduct3D(folderName)
    return { ...machine, has3D }
  })
  return { machines: machinesWithFlags, isFallback }
}

export const getMachinesWithFlags = async () => {
  const { machines } = await getMachinesWithFlagsResult()
  return machines
}
