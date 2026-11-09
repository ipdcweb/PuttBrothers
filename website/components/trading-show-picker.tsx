"use client"

import Image from "next/image"
import { useState } from "react"
import { CalendarDays, Check, ChevronDown, Search, UserRound, UsersRound } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const standardOptions = [
  "Cinema Advertising",
  "Facebook",
  "Flyers",
  "Friends",
  "LinkedIn",
  "Global Events",
  "Google",
  "Instagram",
  "Market Place",
  "Radio Advertising",
  "TV Advertising",
  "Vehicles",
  "Others",
]

const tradingShows = ["IAAPA Expo", "IATP Annual Conference"] as const
const manualLeadMaxLength = 20

const teamMembers = [
  {
    name: "Douglas Tonsic",
    role: "Chief Operating Officer",
    image: "/images/directors/Douglas.png",
  },
  {
    name: "Imre Szenttornyay",
    role: "Partner & Chief Development Officer",
    image: "/images/directors/Imre-Szenttornyay.png",
  },
  {
    name: "João Nascimento",
    role: "Chief Strategy Officer",
    image: "/images/directors/John.png",
  },
  {
    name: "Luiz Tonsic",
    role: "Chief Executive Officer",
    image: "/images/directors/Eduardo.png",
  },
]

type TradingShow = (typeof tradingShows)[number]

interface TradingShowPickerProps {
  value: string
  lead: string
  onValueChange: (value: string, lead: string) => void
  error?: string
}

function selectedTradingLead(value: string, lead: string) {
  const show = tradingShows.find((tradingShow) => tradingShow === value)
  const member = teamMembers.find((person) => person.name === lead)

  if (show && lead) return { show, lead, member }

  return null
}

function firstName(name: string) {
  return name.split(" ")[0]
}

export function TradingShowPicker({ value, lead, onValueChange, error }: TradingShowPickerProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeShow, setActiveShow] = useState<TradingShow | null>(null)
  const [manualLeadName, setManualLeadName] = useState("")
  const selectedLead = selectedTradingLead(value, lead)

  const selectOption = (option: string) => {
    if (tradingShows.includes(option as TradingShow)) {
      setIsMenuOpen(false)
      setActiveShow(option as TradingShow)
      setManualLeadName(value === option && !teamMembers.some((member) => member.name === lead) ? lead.slice(0, manualLeadMaxLength) : "")
      return
    }

    onValueChange(option, "")
    setIsMenuOpen(false)
    setManualLeadName("")
  }

  const selectTeamMember = (member: (typeof teamMembers)[number]) => {
    if (!activeShow) return

    onValueChange(activeShow, member.name)
    setManualLeadName("")
    setActiveShow(null)
  }

  const addManualLead = () => {
    const name = manualLeadName.trim()

    if (!activeShow || !name) return

    onValueChange(activeShow, name)
    setManualLeadName("")
    setActiveShow(null)
  }

  return (
    <>
      <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <PopoverTrigger asChild>
          <button
            id="FindUs"
            type="button"
            aria-labelledby="FindUs-label"
            aria-describedby={error ? "FindUs-error" : undefined}
            aria-invalid={Boolean(error)}
            className={`mt-1 flex h-12 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-left text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#512bb2] focus:ring-offset-1 sm:text-sm ${
              error ? "border-red-500" : "border-gray-300 hover:border-[#512bb2]/60"
            }`}
          >
            {selectedLead ? (
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#512bb2]/10 text-[#512bb2]">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="truncate font-medium text-gray-700">{selectedLead.show}</span>
                <span className="h-5 w-px shrink-0 bg-gray-200" aria-hidden="true" />
                {selectedLead.member ? (
                  <Image
                    src={selectedLead.member.image}
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 shrink-0 rounded-full border border-[#ffcc00] object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#41059a] p-1">
                    <Image src="/favicon-puttbrothers.png" alt="" width={20} height={20} className="h-5 w-5 object-contain" />
                  </span>
                )}
                <span className="truncate font-semibold text-[#41059a]">{firstName(selectedLead.lead)}</span>
              </span>
            ) : value ? (
              <span className="flex min-w-0 items-center gap-2">
                <Search className="h-4 w-4 shrink-0 text-[#512bb2]" aria-hidden="true" />
                <span className="truncate font-medium text-gray-700">{value}</span>
              </span>
            ) : (
              <span className="text-gray-500">Select an option</span>
            )}
            <ChevronDown className={`ml-3 h-5 w-5 shrink-0 text-[#512bb2] transition-transform ${isMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[min(32rem,calc(100vw-2rem))] border-[#512bb2]/20 bg-white p-1.5 shadow-xl"
        >
          <div role="listbox" aria-label="How did you find us?" className="max-h-80 overflow-y-auto py-1">
            <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#512bb2]">Trading shows</p>

            {tradingShows.map((show) => {
              const selectedLeadForShow = selectedLead?.show === show ? selectedLead : null

              return (
                <button
                  key={show}
                  type="button"
                  role="option"
                  aria-selected={selectedLead?.show === show}
                  onClick={() => selectOption(show)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-[#ffcc00]/20 focus:bg-[#ffcc00]/20 focus:outline-none"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ffcc00] text-[#41059a] shadow-sm">
                    <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold leading-5 text-gray-800">{show}</span>
                    <span className="block truncate text-[11px] leading-4 text-gray-500">
                      {selectedLeadForShow ? `Selected: ${selectedLeadForShow.lead}` : "Choose the person you met"}
                    </span>
                  </span>
                  {selectedLeadForShow?.member ? (
                    <Image
                      src={selectedLeadForShow.member.image}
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6 shrink-0 rounded-full border border-[#ffcc00] object-cover"
                    />
                  ) : selectedLeadForShow ? (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#41059a] p-1">
                      <Image src="/favicon-puttbrothers.png" alt="" width={16} height={16} className="h-4 w-4 object-contain" />
                    </span>
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 -rotate-90 text-[#512bb2]" aria-hidden="true" />
                  )}
                </button>
              )
            })}

            <div className="my-1 border-t border-[#512bb2]/10" />
            <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Other sources</p>

            {standardOptions.map((option) => (
              <OptionButton key={option} label={option} selected={value === option} onClick={() => selectOption(option)} />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {error && <p id="FindUs-error" className="mt-2 text-sm font-medium text-red-600">{error}</p>}

      <Dialog
        open={Boolean(activeShow)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveShow(null)
            setManualLeadName("")
          }
        }}
      >
        {activeShow && (
          <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-2rem)] max-w-[min(42rem,calc(100%-2rem))] overflow-y-auto border-0 bg-[#41059a] p-0 text-white shadow-2xl">
            <div className="relative overflow-hidden px-6 py-7 sm:px-9 sm:py-9">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-[#ffcc00]/30" />
              <div className="pointer-events-none absolute -bottom-24 -left-20 h-44 w-44 rounded-full border border-white/10" />

              <button
                type="button"
                onClick={() => setActiveShow(null)}
                className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#ffcc00]"
                aria-label="Close team member selection"
              >
                <span aria-hidden="true">×</span>
              </button>

              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#ffcc00] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-[#41059a]">
                  <UsersRound className="h-4 w-4" aria-hidden="true" />
                  {activeShow}
                </span>
                <DialogTitle className="mt-5 text-3xl font-extrabold leading-tight text-white sm:text-4xl">Who did you meet?</DialogTitle>
                <DialogDescription className="mt-3 max-w-xl text-base leading-7 text-white/75">
                  Choose the Putt Brothers team member who spoke with you at the event. This helps us make sure the right person follows up.
                </DialogDescription>

                <div
                  role="list"
                  aria-label="Putt Brothers team members"
                  className="trading-team-scroll mt-7 max-h-[min(20rem,42dvh)] space-y-3 overflow-y-auto pr-3"
                >
                  {teamMembers.map((member) => {
                    const isSelected = value === activeShow && lead === member.name

                    return (
                      <button
                        key={member.name}
                        type="button"
                        onClick={() => selectTeamMember(member)}
                        className={`group flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[#ffcc00] ${
                          isSelected
                            ? "border-[#ffcc00] bg-[#ffcc00] text-[#41059a]"
                            : "border-white/15 bg-white/[0.08] text-white hover:border-[#ffcc00]/75 hover:bg-white/[0.14]"
                        }`}
                      >
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={64}
                          height={64}
                          className="h-14 w-14 shrink-0 rounded-full border-2 border-white object-cover shadow-md"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-lg font-extrabold">{member.name}</span>
                          <span className={`mt-0.5 block text-sm ${isSelected ? "text-[#41059a]/75" : "text-white/65"}`}>{member.role}</span>
                        </span>
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-[#41059a] bg-[#41059a] text-[#ffcc00]" : "border-white/25 text-transparent group-hover:border-[#ffcc00] group-hover:text-[#ffcc00]"}`}>
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </button>
                    )
                  })}

                  <div className="rounded-2xl border border-[#ffcc00]/75 bg-[#ffcc00]/[0.12] p-3">
                    <div className="flex items-center gap-4">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#41059a] p-2 ring-2 ring-[#ffcc00]">
                        <Image src="/favicon-puttbrothers.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-lg font-extrabold text-white">Someone else?</span>
                        <span className="mt-0.5 block text-sm text-white/70">Enter their name below</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pb-1 sm:flex-row">
                  <label className="sr-only" htmlFor="manual-event-lead">Name of the person you met</label>
                  <div className="min-w-0 flex-1">
                    <input
                      id="manual-event-lead"
                      type="text"
                      value={manualLeadName}
                      maxLength={manualLeadMaxLength}
                      onChange={(event) => setManualLeadName(event.target.value.slice(0, manualLeadMaxLength))}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault()
                          addManualLead()
                        }
                      }}
                      placeholder="Name of the person you met"
                      aria-describedby="manual-event-lead-limit"
                      className="h-12 w-full rounded-xl border border-white/20 bg-white px-4 text-sm font-medium text-[#25114f] outline-none placeholder:text-gray-400 focus:border-[#ffcc00] focus:ring-2 focus:ring-[#ffcc00]"
                    />
                    <p id="manual-event-lead-limit" className="sr-only">Maximum {manualLeadMaxLength} characters</p>
                  </div>
                  <button
                    type="button"
                    onClick={addManualLead}
                    disabled={!manualLeadName.trim()}
                    className="h-12 shrink-0 rounded-xl bg-[#ffcc00] px-6 text-sm font-extrabold text-[#41059a] transition hover:bg-[#ffdc42] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#41059a] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

interface OptionButtonProps {
  label: string
  selected: boolean
  onClick: () => void
}

function OptionButton({ label, selected, onClick }: OptionButtonProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition focus:bg-[#512bb2]/10 focus:outline-none ${
        selected ? "bg-[#512bb2]/10 font-semibold text-[#41059a]" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
      {selected && <Check className="h-4 w-4 text-[#512bb2]" aria-hidden="true" />}
    </button>
  )
}
