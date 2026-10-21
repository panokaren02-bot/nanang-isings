"use client"

import { celebrantName } from "@/lib/celebrant"
import { useState, useEffect, useMemo, useRef, type CSSProperties, type FormEvent, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { AlertCircle, CheckCircle, Heart, Mail, MessageSquare, Minus, Phone, Plus, ShieldCheck, User, Users, X } from "lucide-react"
import { Cinzel } from "next/font/google"
import localFont from "next/font/local"
import { useSiteConfig } from "@/hooks/use-site-config"
import { modalTitleSize, welcomeTitleSize } from "@/lib/section-typography"
import { invalidateInvitationData } from "@/lib/invitation-data"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const theSeasons = localFont({
  src: "../../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const aboveTheBeyond = localFont({
  src: "../../Font/above-the-beyond-script.otf",
  display: "swap",
  variable: "--font-above-beyond",
})

// Guestlist book: an ivory paper card with wine headings, gold accents and
// crimson → wine buttons (same vibe as the sections around it). Guests write their
// own name in — no search — and the entry goes straight to the guest list sheet.
const WINE = "var(--color-motif-deep)"
const PAPER =
  "radial-gradient(120% 50% at 50% 0%, color-mix(in srgb, white 70%, transparent) 0%, transparent 60%), linear-gradient(180deg, var(--color-motif-soft) 0%, var(--color-motif-cream) 100%)"
const DEEP_GRADIENT = "linear-gradient(180deg, var(--color-motif-accent) 0%, var(--color-motif-deep) 100%)"
const GOLD_INK = "color-mix(in srgb, var(--color-welcome-gold) 78%, var(--color-motif-deep))"
const HAIRLINE = "color-mix(in srgb, var(--color-welcome-gold) 45%, transparent)"
const SOFT_PANEL = "color-mix(in srgb, var(--color-motif-blush) 18%, var(--color-motif-soft))"
// Wine-tinted veil behind the modal
const OVERLAY = "color-mix(in srgb, color-mix(in srgb, var(--color-motif-deep) 50%, var(--color-coastal-deep)) 45%, transparent)"

// Solid (not see-through) inks so text stays crisp on the paper gradient
const palette = {
  body: "color-mix(in srgb, var(--color-welcome-text) 70%, var(--color-motif-deep))",
  heading: WINE,
  accent: GOLD_INK,
  muted: "color-mix(in srgb, var(--color-motif-deep) 78%, var(--color-welcome-text))",
} as const

const cardStyle = {
  background: PAPER,
  boxShadow:
    "0 30px 60px -24px color-mix(in srgb, var(--color-coastal-deep) 80%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--color-welcome-gold) 40%, transparent)",
} as const

// Plain sans at 16px: easy to read while typing, and iOS won't zoom in on focus
const inputClass =
  "h-11 w-full rounded-xl border bg-white/85 pl-10 pr-3 font-sans text-base text-[var(--color-motif-deep)] shadow-[inset_0_1px_2px_color-mix(in_srgb,var(--color-motif-deep)_8%,transparent)] transition-[border-color,box-shadow] duration-200 outline-none focus:border-[var(--color-welcome-gold)] focus:bg-white focus:ring-[3px] focus:ring-[color-mix(in_srgb,var(--color-welcome-gold)_30%,transparent)] placeholder:text-[0.9375rem] placeholder:text-[color-mix(in_srgb,var(--color-motif-deep)_55%,white)]"

const inputStyle = { borderColor: "color-mix(in srgb, var(--color-welcome-gold) 60%, transparent)" } as const

const labelClass = `${cinzel.className} flex items-baseline gap-1.5 text-[0.75rem] font-bold uppercase tracking-[0.1em] sm:text-[0.8rem]`

const dividerLineStyle = {
  background: "linear-gradient(to right, transparent, var(--color-welcome-gold), transparent)",
} as const

const primaryButtonStyle = {
  background: DEEP_GRADIENT,
  borderColor: "color-mix(in srgb, var(--color-welcome-gold) 65%, transparent)",
  color: "#fff",
  boxShadow: "0 12px 24px -10px color-mix(in srgb, var(--color-coastal-deep) 65%, transparent)",
} as const

const stepperButtonStyle = {
  borderColor: HAIRLINE,
  color: palette.heading,
  background: "var(--color-motif-soft)",
} as const

const noticeStyle = {
  background: "color-mix(in srgb, var(--color-motif-deep) 10%, var(--color-motif-soft))",
  borderColor: "color-mix(in srgb, var(--color-motif-deep) 40%, transparent)",
  color: WINE,
} as const

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMPTY_FORM = { name: "", additional: 0, phone: "", email: "" }

// "{count} additional {guests}" → filled string
function fillText(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{([a-zA-Z]+)\}/g, (match, key) => (key in values ? String(values[key]) : match))
}

function HeartDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`mx-auto flex items-center justify-center gap-1.5 ${className}`}>
      <span className="h-px w-8 sm:w-10" style={dividerLineStyle} />
      <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5" style={{ color: palette.accent, fill: palette.accent }} aria-hidden />
      <span className="h-px w-8 sm:w-10" style={dividerLineStyle} />
    </div>
  )
}

function Field({
  id,
  label,
  optional,
  icon,
  children,
}: {
  id: string
  label: string
  optional?: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div className="text-left">
      <label htmlFor={id} className={`${labelClass} mb-1`} style={{ color: palette.heading }}>
        {label}
        {optional ? (
          <span className="font-sans text-[0.75rem] font-normal normal-case tracking-normal" style={{ color: palette.muted }}>
            {optional}
          </span>
        ) : null}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: palette.accent }}>
          {icon}
        </span>
        {children}
      </div>
    </div>
  )
}

export function GuestList() {
  const siteConfig = useSiteConfig()
  // {celebrant} anywhere in the wording → the celebrant's nickname
  const copy = useMemo(() => {
    const name = JSON.stringify(celebrantName(siteConfig)).slice(1, -1)
    return JSON.parse(JSON.stringify(siteConfig.rsvp).split("{celebrant}").join(name)) as typeof siteConfig.rsvp
  }, [siteConfig])
  const maxAdditional = copy.form.maxAdditionalGuests

  const [form, setForm] = useState(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmedName, setConfirmedName] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const closeModal = () => setConfirmedName(null)

  // Thank-you modal: lock the page scroll and close on Escape
  useEffect(() => {
    if (!confirmedName) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [confirmedName])

  const setAdditional = (next: number) =>
    setForm((prev) => ({ ...prev, additional: Math.min(maxAdditional, Math.max(0, next)) }))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const name = form.name.trim().replace(/\s+/g, " ")
    const email = form.email.trim()
    const phone = form.phone.trim()

    if (!name) {
      setError(copy.messages.nameRequired)
      nameInputRef.current?.focus()
      return
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      setError(copy.messages.emailInvalid)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(30_000),
        body: JSON.stringify({
          name,
          email,
          contact: phone,
          // The guest plus everyone coming with them
          allowedGuests: 1 + form.additional,
          status: "confirmed",
          addedBy: "Guestlist form",
        }),
      })
      if (!response.ok) throw new Error(`Guestlist save failed: ${response.status}`)
    } catch (err) {
      console.error("Error saving guestlist entry:", err)
      setError(copy.messages.submitFailed)
      setIsSubmitting(false)
      return
    }

    invalidateInvitationData("/api/guests")
    window.dispatchEvent(new Event("rsvpUpdated"))
    setIsSubmitting(false)
    setForm(EMPTY_FORM)
    setConfirmedName(name)
  }

  const goToMessages = () => {
    closeModal()
    setTimeout(() => {
      document.getElementById("messages")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  const guestWord = form.additional === 1 ? copy.form.guestSingular : copy.form.guestPlural

  return (
    <div className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-visible`}>
      <section
        id="guest-list"
        className="relative z-30 scroll-mt-16 overflow-visible px-3 pb-8 pt-10 min-[375px]:px-4 sm:scroll-mt-20 sm:px-8 sm:pb-10 sm:pt-12 md:scroll-mt-24"
      >
        <div
          className="relative mx-auto w-full max-w-[25rem] overflow-visible rounded-[1.5rem] px-4 pb-5 pt-5 text-center @container/rsvp min-[375px]:px-5 sm:max-w-[28rem] sm:rounded-[1.75rem] sm:px-7 sm:pb-7 sm:pt-6"
          style={cardStyle}
        >
          {/* Inner frame line */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-1.5 rounded-[1.25rem] border sm:inset-2.5 sm:rounded-[1.5rem]"
            style={{ borderColor: HAIRLINE }}
          />
          {copy.headerOrnament ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={copy.headerOrnament}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="relative mx-auto mb-1.5 block h-auto w-16 select-none min-[375px]:w-20 sm:w-24"
            />
          ) : null}
          <h2
            className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
            style={
              {
                "--welcome-size": welcomeTitleSize.main,
                "--script-size": welcomeTitleSize.script,
              } as CSSProperties
            }
          >
            <span className="sr-only">{copy.title}. {copy.script}</span>
            <span
              aria-hidden
              className={`${theSeasons.className} block uppercase leading-[0.9] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em]`}
              style={{ fontSize: "var(--welcome-size)", color: WINE }}
            >
              {copy.title}
            </span>
            <span
              aria-hidden
              className={`${aboveTheBeyond.className} relative z-10 mx-auto mt-1.5 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2 sm:leading-[0.9]`}
              style={{
                fontSize: "var(--script-size)",
                color: GOLD_INK,
                textShadow: "0 1px 0 var(--color-motif-soft)",
              }}
            >
              {copy.script}
            </span>
          </h2>

          <p
            className="font-goudy-italic relative mx-auto mt-2 max-w-[20rem] text-[0.9375rem] font-semibold leading-[1.45] text-balance sm:text-base"
            style={{ color: palette.body }}
          >
            {copy.intro}
          </p>

          {siteConfig.details.rsvp.deadline ? (
            <p
              className={`${cinzel.className} relative mx-auto mt-3 inline-flex max-w-full flex-wrap items-center justify-center gap-x-1.5 rounded-full border px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] sm:text-xs`}
              style={{ color: WINE, borderColor: HAIRLINE, background: SOFT_PANEL }}
            >
              {copy.deadlineLabel}
              <span className="font-sans normal-case tracking-normal">
                {siteConfig.details.rsvp.deadline.replace(/\.\s*$/, "")}
              </span>
            </p>
          ) : null}

          <HeartDivider className="relative mt-3" />

          <form onSubmit={handleSubmit} noValidate className="relative mt-4 space-y-3 sm:space-y-3.5">
            <Field id="guestlist-name" label={copy.form.nameLabel} icon={<User className="h-4 w-4" />}>
              <input
                ref={nameInputRef}
                id="guestlist-name"
                type="text"
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={copy.form.namePlaceholder}
                className={inputClass}
                style={inputStyle}
              />
            </Field>

            {/* Additional guests: label + hint on the left, − count + on the right */}
            <div
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-xl border py-2 pl-3 pr-2 text-left min-[375px]:pl-3.5"
              style={{ borderColor: inputStyle.borderColor, background: SOFT_PANEL }}
            >
              <div className="flex min-w-[9rem] flex-1 items-center gap-2.5">
                <Users className="h-4 w-4 flex-shrink-0" style={{ color: palette.accent }} aria-hidden />
                <div className="min-w-0">
                  <p id="guestlist-additional-label" className={labelClass} style={{ color: palette.heading }}>
                    {copy.form.additionalLabel}
                  </p>
                  <p className="font-sans text-[0.8125rem] leading-tight" style={{ color: palette.muted }} aria-live="polite">
                    {form.additional === 0
                      ? copy.form.additionalNone
                      : fillText(copy.form.additionalHint, { count: form.additional, guests: guestWord })}
                  </p>
                </div>
              </div>
              <div className="ml-auto flex flex-shrink-0 items-center gap-1" role="group" aria-labelledby="guestlist-additional-label">
                <button
                  type="button"
                  onClick={() => setAdditional(form.additional - 1)}
                  disabled={form.additional <= 0}
                  className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-full border transition-all duration-200 hover:brightness-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
                  style={stepperButtonStyle}
                  aria-label="Remove a guest"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span
                  className="w-8 text-center font-sans text-lg font-semibold tabular-nums"
                  style={{ color: WINE }}
                >
                  {form.additional}
                </span>
                <button
                  type="button"
                  onClick={() => setAdditional(form.additional + 1)}
                  disabled={form.additional >= maxAdditional}
                  className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-full border text-white transition-all duration-200 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
                  style={{ ...stepperButtonStyle, background: DEEP_GRADIENT, color: "#fff" }}
                  aria-label="Add a guest"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Optional contact details side by side on wider screens */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              id="guestlist-phone"
              label={copy.form.phoneLabel}
              optional={copy.form.optional}
              icon={<Phone className="h-4 w-4" />}
            >
              <input
                id="guestlist-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                enterKeyHint="next"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder={copy.form.phonePlaceholder}
                className={inputClass}
                style={inputStyle}
              />
            </Field>

            <Field
              id="guestlist-email"
              label={copy.form.emailLabel}
              optional={copy.form.optional}
              icon={<Mail className="h-4 w-4" />}
            >
              <input
                id="guestlist-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="done"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder={copy.form.emailPlaceholder}
                className={inputClass}
                style={inputStyle}
              />
            </Field>
            </div>

            <p className="font-sans flex items-start gap-1.5 text-left text-[0.75rem] leading-snug" style={{ color: palette.muted }}>
              <ShieldCheck className="mt-px h-3.5 w-3.5 flex-shrink-0" style={{ color: palette.accent }} aria-hidden />
              {copy.form.privacyNote}
            </p>

            {error ? (
              <div className="flex items-start gap-2 rounded-xl border px-3 py-2 text-left" style={noticeStyle} role="alert">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span className="font-sans text-sm font-medium">{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`${cinzel.className} inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-center text-[0.75rem] font-bold uppercase leading-tight tracking-[0.08em] min-[375px]:text-[0.8rem] min-[375px]:tracking-[0.1em] transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 sm:text-sm`}
              style={primaryButtonStyle}
            >
              {isSubmitting ? (
                <span className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
              ) : (
                <Heart className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />
              )}
              {isSubmitting ? copy.form.submitting : copy.form.submit}
            </button>
          </form>
        </div>
      </section>

      {/* Thank-you modal */}
      {isMounted && confirmedName && createPortal(
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center overflow-y-auto overscroll-contain px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] backdrop-blur-[6px] animate-in fade-in min-[375px]:px-4 sm:px-6"
          style={{ background: OVERLAY }}
          onClick={closeModal}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="guestlist-thanks-title"
            className="relative my-auto w-full max-w-[24rem] @container/guest-modal animate-in zoom-in-95 sm:max-w-md"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-[1.5rem] px-4 pb-5 pt-6 text-center min-[375px]:px-5 sm:px-7 sm:pb-6" style={cardStyle}>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-2 rounded-[1.2rem] border"
                style={{ borderColor: HAIRLINE }}
              />
              <button
                type="button"
                onClick={closeModal}
                className="absolute right-2.5 top-2.5 z-10 rounded-full p-2 transition-colors hover:bg-[color-mix(in_srgb,var(--color-motif-deep)_10%,transparent)]"
                style={{ color: palette.heading }}
                aria-label="Close"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <div
                className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full border sm:h-14 sm:w-14"
                style={primaryButtonStyle}
              >
                <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
              </div>

              <h3
                id="guestlist-thanks-title"
                className="welcome-title-lockup relative mx-auto mt-3 w-full max-w-full text-center"
                style={
                  {
                    "--title-size": modalTitleSize.main,
                    "--script-size": modalTitleSize.script,
                  } as CSSProperties
                }
              >
                <span
                  className={`${theSeasons.className} block uppercase leading-[0.9] tracking-[0.08em] sm:tracking-[0.12em]`}
                  style={{ fontSize: "var(--title-size)", color: palette.heading }}
                >
                  {copy.success.title}
                </span>
                <span
                  className={`${aboveTheBeyond.className} mx-auto mt-1.5 block w-fit max-w-full px-1 leading-[0.9]`}
                  style={{ fontSize: "var(--script-size)", color: palette.accent }}
                >
                  {copy.success.script}
                </span>
              </h3>

              <HeartDivider className="relative mt-2.5" />

              <p
                className={`${cinzel.className} relative mt-3 text-base font-semibold tracking-[0.06em] [overflow-wrap:anywhere] sm:text-lg`}
                style={{ color: palette.heading }}
              >
                {confirmedName}
              </p>
              <p className="font-goudy-italic relative mx-auto mt-1.5 max-w-[19rem] text-[0.95rem] font-semibold leading-[1.45] sm:text-base" style={{ color: palette.body }}>
                {copy.success.text}
              </p>

              <div className="relative mt-4 rounded-2xl border px-3 py-3.5 min-[375px]:px-4" style={{ borderColor: HAIRLINE, background: SOFT_PANEL }}>
                <p className="font-goudy-italic text-[0.95rem] font-semibold leading-[1.4] sm:text-base" style={{ color: palette.body }}>
                  {copy.success.messagePrompt}
                </p>
                <a
                  href="#messages"
                  onClick={(event) => {
                    event.preventDefault()
                    goToMessages()
                  }}
                  className={`${cinzel.className} mt-3 inline-flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-center text-[0.75rem] font-bold uppercase leading-tight tracking-[0.08em] sm:text-[0.8rem] sm:tracking-[0.1em] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]`}
                  style={primaryButtonStyle}
                >
                  <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />
                  {copy.success.messageButton}
                </a>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className={`font-sans relative mt-2 min-h-10 px-3 text-sm font-medium underline decoration-[var(--color-welcome-gold)] underline-offset-4 transition-opacity hover:opacity-80`}
                style={{ color: palette.muted }}
              >
                {copy.success.laterButton}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
