"use server"

const mockMachines = [
  {
    id: 1,
    name: "Golf Series Pro",
    description: "Professional mini golf course with premium features",
    image: "/images/courses/hole-1.png",
    category: "Premium",
  },
  {
    id: 2,
    name: "Golf Series Classic",
    description: "Classic mini golf experience for all ages",
    image: "/images/courses/hole-2.png",
    category: "Standard",
  },
  {
    id: 3,
    name: "Golf Series Elite",
    description: "Elite championship-grade mini golf course",
    image: "/images/courses/hole-3.png",
    category: "Premium",
  },
  {
    id: 4,
    name: "Golf Series Family",
    description: "Family-friendly mini golf entertainment",
    image: "/images/courses/hole-4.png",
    category: "Family",
  },
]

const fetchData = async (url) => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    // Silently catch all errors and return null for fallback
    return null
  }
}

export const getMachinesAll = async () => {
  const data = await fetchData(
    "https://va0d7iedl5.execute-api.ap-southeast-2.amazonaws.com/listMachines?all=true"
  )
  return data || mockMachines
}

export const getMachines = async () => {
  const data = await fetchData(
    "https://va0d7iedl5.execute-api.ap-southeast-2.amazonaws.com/listMachines"
  )
  return data || mockMachines
}

export const getTerms = async (termID) => {
  const data = await fetchData(
    `https://va0d7iedl5.execute-api.ap-southeast-2.amazonaws.com/getTerms?termID=${termID}`
  )
  return data || []
}
