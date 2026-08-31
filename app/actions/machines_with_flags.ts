"use server"

import { getMachinesAll } from "./products_db"

const S3_BASE = "https://puttbrothers-images.s3.ap-southeast-2.amazonaws.com"

const check3DExists = async (folderName: string): Promise<boolean> => {
  try {
    const response = await fetch(`${S3_BASE}/${folderName}/build/index.html`, {
      method: "HEAD",
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Fetches all machines from the Lambda endpoint and enriches each with
 * a has3D flag checked server-side against S3 (no browser CORS issues).
 */
export const getMachinesWithFlags = async () => {
  const machines = await getMachinesAll()

  if (!machines || machines.length === 0) return []

  const enriched = await Promise.all(
    machines.map(async (machine: any) => {
      const folderName = machine.FolderName || machine.folderName
      const has3D = folderName ? await check3DExists(folderName) : false
      return { ...machine, has3D }
    })
  )

  return enriched
}
