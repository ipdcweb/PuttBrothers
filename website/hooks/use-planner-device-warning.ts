"use client"

import { useEffect, useState } from "react"

const PLANNER_MOBILE_WARNING_BREAKPOINT = 1024

export function useIsPlannerMobileDevice() {
  const [isMobileDevice, setIsMobileDevice] = useState(false)

  useEffect(() => {
    const checkMobileDevice = () => {
      setIsMobileDevice(window.innerWidth < PLANNER_MOBILE_WARNING_BREAKPOINT)
    }

    checkMobileDevice()
    window.addEventListener("resize", checkMobileDevice)
    return () => window.removeEventListener("resize", checkMobileDevice)
  }, [])

  return isMobileDevice
}
