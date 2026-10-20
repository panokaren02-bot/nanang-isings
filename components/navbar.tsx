"use client"

import { celebrantName } from "@/lib/celebrant"
import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { useSiteConfig } from "@/hooks/use-site-config"
import StaggeredMenu from "./StaggeredMenu"
import { Cormorant_Garamond } from "next/font/google"
import { siteConfig } from "@/content/site"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400"],
})

// Palette lives in globals.css → @theme inline → --color-motif-*
// Edit there once to update every component.


const NAV_MONOGRAM = siteConfig.celebrant.monogram

// Link labels and order live in content/site.ts → nav.links.
// Links whose section isn't on the page are hidden automatically.
const navLinks: { href: string; label: string; wideOnly?: boolean }[] = siteConfig.nav.links

export function Navbar() {
  const siteConfig = useSiteConfig()
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("#home")
  // Only links whose section exists on the page (sections mount after the loader)
  const [visibleLinks, setVisibleLinks] = useState(navLinks)

  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    const onScroll = () => {
      if (rafIdRef.current != null) return
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null
        setIsScrolled(window.scrollY > 50)
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current)
      window.removeEventListener("scroll", onScroll as EventListener)
    }
  }, [])

  // Track which sections exist (they're lazy-loaded) and which one is on screen
  useEffect(() => {
    if (typeof window === "undefined") return

    const intersection = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const topMost = visible[0]
        if (topMost?.target.id) {
          const newActive = `#${topMost.target.id}`
          setActiveSection(prev => (prev === newActive ? prev : newActive))
        }
      },
      { root: null, rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    )

    const observed = new Set<Element>()
    let frame: number | null = null

    const sync = () => {
      frame = null
      const present = navLinks.filter(l => document.getElementById(l.href.substring(1)))
      setVisibleLinks(prev =>
        prev.length === present.length && prev.every((l, i) => l.href === present[i].href) ? prev : present,
      )
      present.forEach(l => {
        const el = document.getElementById(l.href.substring(1))
        if (el && !observed.has(el)) {
          observed.add(el)
          intersection.observe(el)
        }
      })
    }

    sync()
    // Re-check whenever new sections mount
    const mutations = new MutationObserver(() => {
      if (frame == null) frame = window.requestAnimationFrame(sync)
    })
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      if (frame != null) cancelAnimationFrame(frame)
      mutations.disconnect()
      intersection.disconnect()
    }
  }, [])

  const menuItems = useMemo(
    () => visibleLinks.map((l) => ({ label: l.label, ariaLabel: `Go to ${l.label}`, link: l.href })),
    [visibleLinks],
  )

  const monogramSrc = siteConfig.celebrant?.monogram || NAV_MONOGRAM

  return (
    <nav
      // Frosted ivory → blush bar; firmer and softly shadowed once scrolled
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-700 ease-out ${
        isScrolled
          ? "shadow-[0_10px_30px_color-mix(in_srgb,var(--color-motif-deep)_16%,transparent)]"
          : "shadow-[0_4px_14px_color-mix(in_srgb,var(--color-motif-deep)_8%,transparent)]"
      }`}
      style={{
        background: isScrolled
          ? "linear-gradient(180deg, color-mix(in srgb, var(--color-motif-soft) 94%, transparent) 0%, color-mix(in srgb, var(--color-motif-blush) 55%, var(--color-motif-cream)) 100%)"
          : "linear-gradient(180deg, color-mix(in srgb, var(--color-motif-soft) 82%, transparent) 0%, color-mix(in srgb, var(--color-motif-cream) 78%, transparent) 100%)",
      }}
    >
      {/* Gold hairline along the bottom edge, fading out at the sides */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--color-welcome-gold)_75%,transparent)] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 relative">
        <div className="flex justify-between items-center h-12 sm:h-14 md:h-16 gap-3">
          <Link
            href="#home"
            className="flex-shrink-0 group relative z-10 flex items-center justify-center py-0 pl-1 pr-2.5 sm:pl-1.5 sm:pr-3 md:pl-2 md:pr-3.5 -ml-0.5 sm:ml-0 self-stretch"
            aria-label={`${celebrantName(siteConfig)} — Home`}
          >
            <div className="relative h-[2.5rem] w-[3.2rem] sm:h-[2.85rem] sm:w-[3.65rem] md:h-[3.35rem] md:w-[4.15rem] shrink-0 my-0">
              {/* Monogram tinted deep mauve: the artwork is used as a mask over a solid fill */}
              <div
                className="absolute inset-0 bg-[var(--color-motif-deep)] group-hover:scale-105 group-active:scale-100 transition-transform duration-500"
                style={{
                  maskImage: `url("${monogramSrc}")`,
                  WebkitMaskImage: `url("${monogramSrc}")`,
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                }}
              />
            </div>
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[color-mix(in_srgb,var(--color-motif-blush)_45%,transparent)] blur-md -z-10" />
          </Link>

          <div className="hidden xl:flex gap-0.5 items-center">
            {visibleLinks.map((link) => {
              const isActive = activeSection === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${link.wideOnly ? "hidden 2xl:inline-block" : ""} whitespace-nowrap px-2.5 py-1.5 text-sm lg:px-3 lg:text-[0.95rem] ${cormorant.className} font-semibold tracking-wide rounded-full transition-all duration-500 relative group ${
                    isActive
                      ? "text-[var(--color-motif-deep)] bg-[color-mix(in_srgb,var(--color-motif-blush)_70%,white)] shadow-[0_4px_12px_color-mix(in_srgb,var(--color-motif-deep)_14%,transparent)] border border-[color-mix(in_srgb,var(--color-welcome-gold)_55%,transparent)]"
                      : "text-[var(--color-welcome-text)] hover:text-[var(--color-motif-deep)] hover:bg-[color-mix(in_srgb,var(--color-motif-blush)_40%,transparent)] active:scale-95 bg-transparent border border-transparent"
                  }`}
                >
                  {link.label}
                  {/* Gold underline grows in on hover (hidden on the active pill) */}
                  {!isActive && (
                    <span className="absolute bottom-0.5 left-1/2 h-px w-0 -translate-x-1/2 bg-[var(--color-welcome-gold)] transition-all duration-500 rounded-full group-hover:w-2/3" />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="xl:hidden flex items-center justify-end h-full">
            <StaggeredMenu
              position="right"
              items={menuItems}
              socialItems={[]}
              displaySocials={false}
              menuButtonColor="var(--color-motif-deep)"
              // deep mauve X on the ivory menu panel
              openMenuButtonColor="var(--color-motif-deep)"
              changeMenuColorOnOpen={true}
              // layers that sweep in before the panel: blush → dusty rose → mauve
              colors={[
                "var(--color-motif-blush)",
                "var(--color-motif-accent)",
                "var(--color-welcome-gold)",
                "var(--color-coastal-light)",
              ]}
              accentColor="var(--color-motif-deep)"
              fontFamily={cormorant.style.fontFamily}
              isFixed={true}
              activeLink={activeSection}
              onMenuOpen={() => {}}
              onMenuClose={() => {}}
            />
          </div>
        </div>

      </div>
    </nav>
  )
}
