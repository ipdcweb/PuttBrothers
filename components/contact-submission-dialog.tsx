"use client"

import Image from "next/image"
import { Check, Flag, LoaderCircle, FileCheck2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

type ContactSubmissionDialogProps = {
  sending: boolean
  success: boolean
  withLayout: boolean
  onClose: () => void
  onRestoreFocus: () => void
}

export function ContactSubmissionDialog({ sending, success, withLayout, onClose, onRestoreFocus }: ContactSubmissionDialogProps) {
  return (
    <Dialog open={sending || success} onOpenChange={(open) => { if (!open && !sending) onClose() }}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-2xl border-0 bg-white p-0 text-center sm:max-w-[460px]"
        showCloseButton={!sending}
        aria-busy={sending}
        onEscapeKeyDown={(event) => { if (sending) event.preventDefault() }}
        onInteractOutside={(event) => { if (sending) event.preventDefault() }}
        onCloseAutoFocus={(event) => { event.preventDefault(); onRestoreFocus() }}
      >
        <div className="flex flex-col items-center gap-6 bg-[#41059a] px-7 pb-7 pt-8">
          <Image src="/images/design-mode/Logo-White.webp" alt="Putt Brothers" width={208} height={48} unoptimized className="h-10 w-48 object-contain" />
          {sending ? (
            <LoaderCircle className="h-14 w-14 animate-spin text-[#ffd400] motion-reduce:animate-none" aria-hidden="true" />
          ) : (
            <div className="relative grid h-20 w-20 place-items-center rounded-full bg-[#ffd400] text-[#41059a]">
              <Flag className="h-9 w-9" strokeWidth={1.8} aria-hidden="true" />
              <span className="absolute -bottom-1 -right-2 grid h-8 w-8 place-items-center rounded-full border-[3px] border-[#41059a] bg-white"><Check size={17} strokeWidth={3} aria-hidden="true" /></span>
            </div>
          )}
        </div>
        <div className="px-7 py-8 sm:px-9">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b35a4]" role="status" aria-live="polite">
            {sending ? "Your ideas are on their way" : "Enquiry sent successfully"}
          </p>
          <DialogTitle className="text-center text-2xl font-extrabold leading-tight text-[#151019] sm:text-3xl">
            {sending ? "Sending your enquiry…" : "You’re on course for something great."}
          </DialogTitle>
          <DialogDescription className="mt-4 text-center text-sm leading-7 text-[#655c6d]">
            {sending
              ? "Just a moment while we send your message to the Putt Brothers team."
              : "Thanks for getting in touch! We’ve received your enquiry. Our team will be in touch to explore your ideas and the next steps for your venue."}
          </DialogDescription>
          {!sending && withLayout && <p className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-[#f3eefb] px-3 py-3 text-xs font-semibold text-[#41059a]"><FileCheck2 size={17} aria-hidden="true" /> Your venue layout was included.</p>}
          {!sending && <button type="button" onClick={onClose} className="mt-7 w-full rounded-lg bg-[#ffd400] px-5 py-3.5 text-sm font-bold text-[#151019] transition-colors hover:bg-[#ffe159] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#41059a]">Great, thank you!</button>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
