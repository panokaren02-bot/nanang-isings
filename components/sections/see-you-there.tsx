"use client"

import { fillCelebrant } from "@/lib/celebrant"
import { Cinzel, Cormorant_Garamond } from "next/font/google"
import localFont from "next/font/local"
import Image from "next/image"
import { useEffect, useState } from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { PlainAtmosphere } from "@/components/loader/PlainAtmosphere"
import { PlainBubbles } from "@/components/loader/PlainBubbles"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

// Body copy (.font-goudy-italic → love-story-red.css .details-pastel) in Cormorant Garamond,
// same as the story / details sections
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--details-font-body",
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

const IVORY = "#fffaf4"
const entryEase = [0.22, 1, 0.36, 1] as const
// Photo background: each photo holds this long before crossfading to the next
const PHOTO_HOLD_MS = 6000

const titleSize = "clamp(2.85rem, 13.5vw, 6.75rem)"
const photoTitleShadow =
  "0 1px 0 rgb(255 250 244 / 28%), 0 2px 18px rgb(42 34 28 / 55%), 0 12px 36px rgb(42 34 28 / 40%)"

// Text sitting directly on the pastel pattern: plum with a soft ivory glow
const textLift = "0 0 10px rgba(255, 249, 242, 0.95), 0 0 2px rgba(255, 249, 242, 0.9)"
const onBg = { color: "#4f3646", textShadow: textLift } as const

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
}

const rise: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.85, ease: entryEase } },
}


// "!" and other symbols in Cinzel, letters in The Seasons
function SpecialCharFont({ text }: { text: string }) {
  return (
    <>
      {text.split(/([^\p{L}\s]+)/u).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={`${cinzel.className} relative -top-[0.06em] inline-block font-normal tracking-normal`}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

function PlainSeeYouThere() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.seeYouThere
  const plain = content.plain
  const reduceMotion = useReducedMotion()
  const fill = (text: string) => fillCelebrant(text, siteConfig)

  return (
    <section
      id="see-you-there"
      className={`details-pastel ${theSeasons.variable} ${aboveTheBeyond.variable} ${cormorant.variable} relative isolate w-full overflow-hidden`}
    >
      {/* Same pastel backdrop as the home hero */}
      <PlainAtmosphere baseColor="var(--color-welcome-bg)" />
      <PlainBubbles />

      <motion.div
        className="relative z-20 mx-auto flex min-h-[78svh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center sm:min-h-[88svh] sm:py-28"
        variants={stagger}
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        {plain.eyebrow ? (
          <motion.p
            variants={rise}
            className={`${cinzel.className} text-[0.7rem] font-semibold uppercase tracking-[0.3em] sm:text-sm`}
            style={{ color: "#b46f86", textShadow: textLift }}
          >
            {plain.eyebrow}
          </motion.p>
        ) : null}

        <motion.h2 variants={rise} className="relative mt-3 sm:mt-4">
          <span className="sr-only">
            {content.titleLine1} {content.titleLine2}
          </span>
          <span
            aria-hidden
            className={`${theSeasons.className} love-story-title-gold block pb-2 uppercase leading-[1.05] tracking-[0.06em] sm:tracking-[0.08em]`}
            style={{ fontSize: titleSize }}
          >
            <SpecialCharFont text={content.titleLine1} />
            <br />
            <SpecialCharFont text={content.titleLine2} />
          </span>
        </motion.h2>

        {plain.script ? (
          <motion.p
            variants={rise}
            className={`${aboveTheBeyond.className} mt-3 px-2 pb-1 text-[1.6rem] leading-[1.25] sm:mt-4 sm:text-[2.2rem] md:text-[2.6rem]`}
            style={{ color: "var(--color-motif-deep)", textShadow: textLift }}
          >
            {fill(plain.script)}
          </motion.p>
        ) : null}

        <motion.div variants={rise} className="my-5 flex items-center justify-center gap-2 sm:my-6" aria-hidden>
          <span className="h-px w-12 sm:w-20" style={{ background: "var(--color-welcome-gold)" }} />
          <span className="h-1.5 w-1.5 rotate-45" style={{ background: "var(--color-welcome-gold)" }} />
          <span className="h-px w-12 sm:w-20" style={{ background: "var(--color-welcome-gold)" }} />
        </motion.div>

        {plain.message ? (
          <motion.p
            variants={rise}
            className="font-goudy-italic mx-auto mt-4 max-w-md text-[1.1rem] leading-relaxed sm:mt-5 sm:text-[1.3rem]"
            style={{ ...onBg, fontWeight: 600 }}
          >
            {fill(plain.message)}
          </motion.p>
        ) : null}

      </motion.div>
    </section>
  )
}

// One stack of full-bleed photos that crossfade (with a slow zoom) on a shared clock
function PhotoStack({
  photos,
  activeIndex,
  alt,
  className,
  imageClassName,
  sizes,
}: {
  photos: readonly string[]
  activeIndex: number
  alt: string
  className: string
  imageClassName: string
  sizes: string
}) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      {photos.map((src, i) => {
        const active = i === activeIndex % photos.length
        return (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-[1800ms] ease-in-out ${active ? "opacity-100" : "opacity-0"}`}
            aria-hidden={!active}
          >
            <Image
              src={encodeURI(src)}
              alt={active ? alt : ""}
              fill
              sizes={sizes}
              priority={i === 0}
              loading={i === 0 ? undefined : "eager"}
              className={`object-cover transition-transform duration-[7000ms] ease-out ${active ? "scale-[1.06]" : "scale-100"} ${imageClassName}`}
            />
          </div>
        )
      })}
    </div>
  )
}

function PhotoSeeYouThere() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.seeYouThere
  const alt = fillCelebrant(content.photoAlt, siteConfig)
  const { mobile, desktop } = content.photos
  const reduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const slideCount = Math.max(mobile.length, desktop.length)

  useEffect(() => {
    if (reduceMotion || slideCount <= 1) return
    const timer = setInterval(() => setActiveIndex((i) => (i + 1) % slideCount), PHOTO_HOLD_MS)
    return () => clearInterval(timer)
  }, [reduceMotion, slideCount])

  return (
    <section id="see-you-there" className={`${theSeasons.variable} relative isolate w-full overflow-hidden`}>
      <div className="relative min-h-[100svh] w-full">
        {/* Phones: portrait photos · tablets / desktops: landscape photos */}
        {mobile.length > 0 && (
          <PhotoStack
            photos={mobile}
            activeIndex={activeIndex}
            alt={alt}
            className="md:hidden"
            imageClassName="object-[center_35%]"
            sizes="100vw"
          />
        )}
        {desktop.length > 0 && (
          <PhotoStack
            photos={desktop}
            activeIndex={activeIndex}
            alt={alt}
            className="hidden md:block"
            imageClassName="object-[center_12%]"
            sizes="100vw"
          />
        )}

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgb(20 16 12 / 38%) 0%, rgb(20 16 12 / 18%) 38%, rgb(20 16 12 / 12%) 58%, rgb(20 16 12 / 42%) 100%)",
          }}
          aria-hidden
        />

        <div className="absolute inset-0 flex items-center justify-center px-5 pb-[18vh] pt-16 sm:pb-[14vh]">
          <motion.h2
            className="relative text-center"
            initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.9, ease: entryEase }}
          >
            <span className="sr-only">
              {content.titleLine1} {content.titleLine2}
            </span>
            <span
              aria-hidden
              className={`${theSeasons.className} block uppercase leading-[0.88] tracking-[0.06em] sm:tracking-[0.08em]`}
              style={{ fontSize: titleSize, color: IVORY, textShadow: photoTitleShadow }}
            >
              <SpecialCharFont text={content.titleLine1} />
              <br />
              <SpecialCharFont text={content.titleLine2} />
            </span>
          </motion.h2>
        </div>
      </div>
    </section>
  )
}

export function SeeYouThere() {
  const siteConfig = useSiteConfig()
  const isPlain = siteConfig.loadingScreen?.display === "plain"
  return isPlain ? <PlainSeeYouThere /> : <PhotoSeeYouThere />
}
