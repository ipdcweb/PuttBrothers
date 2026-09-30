"use server"

import { getMachinesAllResult } from "./products_db"

// These are the currently published 3D builds in the Putt Brothers S3 bucket.
// Keeping the manifest here avoids one S3 HEAD request per product on every visit.
const THREE_D_FOLDERS = new Set([
  "JN5-RACK_EM_UP",
  "JN18-QUACK_ATTACK",
  "JN25-WINDMILL",
  "JN29_CRANK_TO_11",
  "JN30_THE_DANCE_OFF",
  "BRIDGE",
  "BULLS_EYES",
  "CHESS",
  "PACKMAN",
  "SUPER_BOWL",
])

/**
 * Fetches all machines from the Lambda endpoint and enriches each with
 * the current 3D availability manifest without blocking on dozens of S3 checks.
 */
export const getMachinesWithFlagsResult = async () => {
  const { machines, isFallback } = await getMachinesAllResult()
  const machinesWithFlags = machines.map((machine: any) => {
    const folderName = machine.FolderName || machine.folderName
    const has3D = machine.has3D === true || (folderName ? THREE_D_FOLDERS.has(folderName) : false)
    return { ...machine, has3D }
  })
  return { machines: machinesWithFlags, isFallback }
}

export const getMachinesWithFlags = async () => {
  const { machines } = await getMachinesWithFlagsResult()
  return machines
}
