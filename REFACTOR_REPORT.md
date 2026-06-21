# Byte Brainiacs — 2D Performance Refactor

Removed all heavy 3D/WebGL work and rebuilt the experience as a fast,
GPU-light 2D "command center" while keeping the purple/magenta *Afterglow*
identity. Mobile-first, 60 FPS target, readable hero.

---

## 1. What was removed (the heavy stuff)

| Removed | Where | Why it hurt |
|---|---|---|
| **Three.js + @react-three/fiber + @react-three/drei** | `LaptopScene.tsx` (628-line WebGL scene) | A live render loop drawing a 3D laptop, dynamic lighting, contact shadows, two `Sparkles` particle systems and a per-frame `<canvas>` terminal texture — constant GPU + main-thread cost, slow on mobile. |
| **WebGL real-time render loop** | `LaptopScene.tsx` | `requestAnimationFrame` ran forever, re-uploading a canvas texture every frame. |
| **Canvas particle network** | `NeuralBackground.tsx` | Permanent rAF loop with **O(n²)** edge-distance math over up to 110 nodes, every frame, behind the CTA. |
| **Animated SVG lattice** | `GeometricViz.tsx` | Dozens of infinitely-animating framer-motion nodes/lines (unused, now a no-op stub). |
| **Lenis smooth-scroll** | `SmoothScroll.tsx` | Hijacked scrolling with a permanent rAF loop on every frame — a classic source of scroll jank, especially on touch. |
| **3D perspective tilt** | `Tilt.tsx` | `rotateX/rotateY` + `transformPerspective` on cards forced 3D compositing layers. |

Dependencies dropped from `package.json`: `three`, `@react-three/fiber`,
`@react-three/drei`, `@types/three`, `lenis`. These are by far the largest
client modules in the project (three.js alone is ~150 KB gzipped; r3f + drei
add substantially more), so initial JS download + parse + execute drops
sharply.

---

## 2. What replaced it (lightweight 2D)

- **`TerminalPanel.tsx`** — a 100% server-rendered, zero-JS command-center
  panel: title bar, boot/log lines, three data readouts (`STATUS / TRACKS /
  ENTRY`), an "Execute Registration" CTA, an inner CSS grid overlay and CSS
  scanlines. Static terminal aesthetic, no animation loop, SSR-friendly.
- **`.cta-grid`** — pure-CSS masked grid backdrop replacing the neural canvas
  in the Contact CTA.
- **`Tilt.tsx`** — same API, now a **2D translate of max 3px** toward the
  cursor (`translate` only, spring-damped, no 3D rotation). Disabled on touch.
- **Cursor spotlight (`MouseGlow`)** and the **custom cursor ring** now use
  **self-halting rAF loops**: they animate only while easing toward the cursor,
  then stop completely when settled. Idle cursor = zero animation frames.
- **Native smooth scrolling** via CSS `scroll-behavior: smooth` (respects
  `prefers-reduced-motion`), replacing the Lenis rAF loop entirely.

The futuristic AI look is preserved: grid overlays, scanlines, soft radial
gradients, terminal prompts, glass data panels, neon edges.

---

## 3. Before vs After

### Concrete, measured deltas
| Metric | Before | After |
|---|---|---|
| Heavy client deps | three, @react-three/fiber, @react-three/drei, lenis | **0** (all removed) |
| Permanent `requestAnimationFrame` loops at rest | 4 (WebGL scene, neural canvas, Lenis, cursor ring) | **0** — all either deleted or self-halting |
| WebGL contexts created | 1 (+ offscreen canvas texture) | **0** |
| O(n²) per-frame computations | 1 (neural edges) | **0** |
| Hero centerpiece JS | dynamic WebGL bundle | **0 (static HTML/CSS)** |
| TypeScript compile (`tsc --noEmit`) | — | **passes, 0 source errors** |

### Projected Lighthouse / runtime (needs a real Lighthouse run on your host to confirm)
| Metric | Before (typical for this build) | After (target) |
|---|---|---|
| Performance score | ~55–70 (WebGL + particles + Lenis) | **90+** |
| Main-thread blocking / TBT | High (WebGL init + per-frame work) | Low |
| Sustained FPS while idle | <60, GPU pinned | **60, ~0% idle GPU** |
| Input latency | janky (Lenis + loops) | **< 50 ms** |
| Mobile experience | heavy, drains battery | smooth, mobile-first |

> The Lighthouse figures are projections from the nature of the changes
> (eliminating the WebGL bundle and all idle rAF work). Run
> `npx next build && npx next start` then Lighthouse on `/` to capture exact
> numbers on your hardware.

---

## 4. Mobile responsiveness fixes

- 3D laptop (the biggest mobile offender) replaced with a static panel that
  costs nothing on a phone GPU.
- Cursor/parallax effects are gated behind `(pointer: coarse)` /
  `(hover: hover)` — touch devices never run them.
- Ambient blur radii reduced (Hero `170px→110px`, `150px→100px`; CTA
  `130px→100px`) — large blurs are expensive to composite on mobile.
- Hero heading line-height/weight tuned per breakpoint (see §5).

---

## 5. Hero / heading readability fix

The "machine intelligence" heading (in `About.tsx`, class `.text-gradient-cyan`)
was a low-contrast lilac-on-dark gradient — hard to read on mobile, laptops and
low-brightness screens. Kept the **purple identity** (no gold, per your call)
but made it legible:

- Brightened the gradient stops toward white/haze (`#ffffff → #f3eeff →
  #cba8ff → #e6dbff`) instead of bottoming out at mid-purple `#b98cff`.
- Added a readability **drop-shadow** (contrast + soft glow). `drop-shadow()`
  is used instead of `text-shadow` because it respects clipped
  (transparent-fill) gradient text.
- **`@media (max-width: 768px)`**: even brighter gradient, `font-weight: 800`,
  tightened letter-spacing, stronger shadow.
- Heading line-height relaxed to `1.08` on mobile (`1.0` desktop) and added
  `pb-[0.12em]` so descenders (g, p) are never clipped.

---

## 6. Latency & responsiveness improvements

- **No idle work:** every animation loop is gone or self-halting, so the main
  thread is free between interactions → input response well under 50 ms.
- **Passive listeners** kept/maintained on all `mousemove`/scroll handlers
  (`{ passive: true }`) so they never block scrolling.
- **Native smooth scroll** removes Lenis's per-frame scroll interception.
- **rAF-driven, transform-only** cursor effects (`translate3d`,
  `will-change: transform`) stay on the GPU compositor — no layout/paint.
- **Reduced-motion** respected throughout (scroll, cursor, glow).
- **Bundle/loading:** dropped the 4 heavy deps; added
  `compiler.removeConsole` in production, `optimizePackageImports` for
  `lucide-react` / `framer-motion` / `recharts`, AVIF/WebP images with a long
  cache TTL. The hero centerpiece is now SSR HTML (no client hydration cost,
  no dynamic import waterfall).
- Animation durations/easing follow the premium spec (200–350 ms,
  `cubic-bezier(0.22, 1, 0.36, 1)`).

---

## Files changed
- `src/components/TerminalPanel.tsx` *(new)* — static 2D command center
- `src/components/Hero.tsx` — use TerminalPanel, lighter blurs, no WebGL import
- `src/components/sections/About.tsx` — readable heading
- `src/components/sections/Contact.tsx` — CSS grid backdrop (no canvas)
- `src/components/Tilt.tsx` — 2D drift (no 3D rotation)
- `src/components/MouseGlow.tsx`, `src/components/CustomCursor.tsx` — self-halting loops
- `src/components/SmoothScroll.tsx` — no-op (native smooth scroll)
- `src/components/NeuralBackground.tsx`, `GeometricViz.tsx`, `three/LaptopScene.tsx` — deprecated stubs
- `src/app/globals.css` — readability gradient + 2D command-center primitives
- `package.json` — removed three / r3f / drei / lenis
- `next.config.mjs` — production console strip, image caching, package-import optimization

## Cleanup note
`node_modules` still physically contains the removed packages until you run
`npm install` (or `npm prune`) to sync with the updated `package.json`. The
empty `src/components/three/` stub can be deleted once you confirm nothing
imports it.
