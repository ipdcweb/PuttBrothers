export type CatalogMachine = {
  MachineID: number
  Machine: string
  Advertising: string
  FolderName: string
  has3D?: boolean
  [key: string]: unknown
}

// Real published designs, verified against the public catalogue on 2026-10-01.
// Keep a small usable first view when the live catalogue is unavailable.
export const FALLBACK_MACHINES: CatalogMachine[] = [
  {
    MachineID: 1,
    Machine: "Bowling",
    Advertising: "A hole in one and a strike at the same time could just be the perfect fist pump moment. Remember the bowling alleys of your youth? Take a putt down memory lane.",
    FolderName: "JN1-BOWLING",
  },
  {
    MachineID: 2,
    Machine: "Grand Prix",
    Advertising: "Ladies and Gentleman start your engines. Take corners at a more leisurely pace as you putt your way to victory. It’s not about being first on this track but arriving in as few strokes as possible.",
    FolderName: "JN2-GRAND_PRIX",
  },
  {
    MachineID: 3,
    Machine: "Skate the Bowl",
    Advertising: "Traditionally kickflips, shove it’s and big air is seen at the ramp, but that has been replaced with accuracy, finesse and poise as you aim for the elusive hole in one, remember the weight of the shot must be perfect! No pressure…..Dude",
    FolderName: "JN3-SKATE_THE_BOWL",
  },
  {
    MachineID: 39,
    Machine: "Soccer",
    Advertising: "The beautiful game meets the perfect shot. Navigate the pitch where world cups are won and dreams come true. Dribble through the obstacles, avoid the defenders, and score the goal that echoes through eternity.",
    FolderName: "SOCCER",
  },
]

export function isValidCatalog(data: unknown): data is CatalogMachine[] {
  return Array.isArray(data) && data.length > 0 && data.every((machine) => (
    machine !== null && typeof machine === "object"
    && typeof machine.Machine === "string" && machine.Machine.trim().length > 0
    && typeof machine.FolderName === "string" && /^[A-Za-z0-9_-]+$/.test(machine.FolderName)
    && (machine.Advertising == null || typeof machine.Advertising === "string")
  ))
}
