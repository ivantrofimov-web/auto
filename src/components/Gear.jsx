import { useEffect, useRef } from 'react'

const TEETH = 14
const LAYERS = 9

const f = (n) => Number(n.toFixed(2))
const polar = (r, a) => `${f(r * Math.cos(a))} ${f(r * Math.sin(a))}`
const circle = (cx, cy, r) =>
  `M${f(cx + r)} ${f(cy)}a${r} ${r} 0 1 0 ${-2 * r} 0a${r} ${r} 0 1 0 ${2 * r} 0Z`

// Контур шестерни: трапециевидные зубья, посадочное отверстие со шпонкой, шесть окон облегчения.
function gearPath() {
  const step = (Math.PI * 2) / TEETH
  const [root, tip] = [78, 97]
  let d = ''
  for (let i = 0; i < TEETH; i++) {
    const a = i * step
    d += `${i ? 'L' : 'M'}${polar(root, a)}L${polar(root, a + step * 0.16)}L${polar(tip, a + step * 0.3)}L${polar(tip, a + step * 0.62)}L${polar(root, a + step * 0.76)}`
  }
  d += 'Z'
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + Math.PI / 6
    d += circle(47 * Math.cos(a), 47 * Math.sin(a), 13)
  }
  return d + circle(0, 0, 15) + 'M-4 -21h8v8h-8Z'
}

const PATH = gearPath()

export default function Gear() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0

    const apply = () => {
      frame = 0
      el.style.setProperty('--turn', (window.scrollY * 0.14).toFixed(1))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply)
    }
    const sync = () => {
      window.removeEventListener('scroll', onScroll)
      if (reduced.matches) el.style.removeProperty('--turn')
      else {
        window.addEventListener('scroll', onScroll, { passive: true })
        apply()
      }
    }

    sync()
    reduced.addEventListener('change', sync)
    return () => {
      window.removeEventListener('scroll', onScroll)
      reduced.removeEventListener('change', sync)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="gear-scene" aria-hidden="true">
      <div className="gear" ref={ref}>
        {Array.from({ length: LAYERS }, (_, i) => (
          <svg key={i} className="gear-layer" style={{ '--i': i }} viewBox="-100 -100 200 200">
            <path fillRule="evenodd" d={PATH} />
            {i === LAYERS - 1 && (
              <g className="gear-marks">
                <circle r="68" />
                <circle r="24" />
              </g>
            )}
          </svg>
        ))}
      </div>
    </div>
  )
}
