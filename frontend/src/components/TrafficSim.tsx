import React, { useEffect, useRef, useState } from 'react'
import { Car, SignalColor, SignalState } from '../types'
import ControlsPanel from './ControlsPanel'

const STOP_LINE = 90
const LANE_OFFSET = 20
const CRASH_DIST = 25
const OVERTAKE_SHIFT = 40
const MERGE_DIST = 60

export default function TrafficSim() {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const carLayerRef = useRef<HTMLDivElement | null>(null)
  const carsRef = useRef<Car[]>([])
  const rafRef = useRef<number | null>(null)
  const spawnTimeoutRef = useRef<number | null>(null)

  const [running, setRunning] = useState(false)
  const [autoMode, setAutoMode] = useState(false)
  const [modeBadge, setModeBadge] = useState('MODE: MANUAL OVERRIDE')
  const [modeColor, setModeColor] = useState('#666')
  const [signalState, setSignalState] = useState<SignalState>({1: 'red',2:'red',3:'red',4:'red'})

  // Utility to update both UI bulbs (manual) and sim bulbs
  function setLightState(id: 1|2|3|4, color: SignalColor) {
    setSignalState(prev => ({ ...prev, [id]: color }))
    // Update manual bulbs (if present in DOM) and sim bulbs:
    const sb = document.getElementById(`b${id}-${color}`)
    // Keep DOM class toggles for the manual bulbs and sim bulbs if you prefer,
    // but react-driven classes are preferred. For brevity we're toggling DOM for the sim bulbs:
    ;['red','yellow','green'].forEach(c => {
      const sbEl = document.getElementById(`b${id}-${c}`)
      const simEl = document.getElementById(`s${id}-${c}`)
      if (sbEl) sbEl.classList.toggle('active', c === color)
      if (simEl) simEl.classList.toggle('active', c === color)
    })
  }

  function resetAllLights() { [1,2,3,4].forEach(id => setLightState(id as 1|2|3|4, 'red')) }
  function forceCrash() { [1,2,3,4].forEach(id => setLightState(id as 1|2|3|4, 'green')) }

  // Manual click handler (wired to manual bulbs)
  function manualClick(id: 1|2|3|4, color: SignalColor) {
    if (autoMode) return
    setLightState(id, color)
  }

  // Auto sequencer
  function runStep(sigId: number, phase: 'GREEN'|'YELLOW'|'RED') {
    if (!autoMode || !running) return
    setLightState(sigId as 1|2|3|4, phase.toLowerCase() as SignalColor)

    const cfgGreenEl = document.getElementById(`cfg-${sigId}-green`) as HTMLInputElement | null
    const cfgRedEl = document.getElementById(`cfg-${sigId}-red`) as HTMLInputElement | null
    const greenTime = ((cfgGreenEl?.value ? Number(cfgGreenEl.value) : 5) * 1000)
    const redTime = ((cfgRedEl?.value ? Number(cfgRedEl.value) : 2) * 1000)

    let duration = 0
    let nextPhase: 'GREEN'|'YELLOW'|'RED' = 'GREEN'
    let nextSig = sigId

    if (phase === 'GREEN') { duration = greenTime; nextPhase = 'YELLOW' }
    else if (phase === 'YELLOW') { duration = 2000; nextPhase = 'RED' }
    else { duration = redTime; nextPhase = 'GREEN'; nextSig = sigId + 1; if (nextSig > 4) nextSig = 1 }

    window.setTimeout(() => { if (autoMode && running) runStep(nextSig, nextPhase) }, duration)
  }

  // Mode toggle
  function switchMode(isAuto: boolean) {
    setAutoMode(isAuto)
    if (isAuto) {
      setModeBadge('MODE: AUTOMATED SEQUENCE')
      setModeColor('var(--neon-green)')
      // enable inputs (we keep them in DOM; class toggles could be used)
      runStep(1, 'GREEN')
    } else {
      setModeBadge('MODE: MANUAL OVERRIDE')
      setModeColor('#666')
      resetAllLights()
    }
  }

  // Spawn car (creates DOM element)
  function spawnCar() {
    const sigId = Math.floor(Math.random() * 4) + 1
    const map: Record<number,string> = {1:'north',2:'south',3:'east',4:'west'}
    const dir = map[sigId] as 'north'|'south'|'east'|'west'
    const layer = carLayerRef.current!
    const view = viewportRef.current!
    const el = document.createElement('div')
    el.className = `car ${dir}`
    layer.appendChild(el)

    const w = view.clientWidth, h = view.clientHeight
    const cx = w/2, cy = h/2
    let x=0,y=0,dx=0,dy=0
    if (sigId===1) { x = cx + LANE_OFFSET; y = -40; dy = 3 }
    if (sigId===2) { x = cx - LANE_OFFSET; y = h + 40; dy = -3 }
    if (sigId===3) { x = w + 40; y = cy + LANE_OFFSET; dx = -3 }
    if (sigId===4) { x = -40; y = cy - LANE_OFFSET; dx = 3 }

    const car: Car = { el, x, y, dx, dy, sigId: sigId as 1|2|3|4, dir: dir as any, crashed:false, overtaking:false, origLane:(sigId<=2 ? x : y), mergeTarget: null }
    carsRef.current.push(car)
  }

  // Spawn loop uses setTimeout chain
  function spawnLoop() {
    if (!running) return
    if (Math.random() > 0.4) spawnCar()
    const t = 800 + Math.random() * 1000
    spawnTimeoutRef.current = window.setTimeout(spawnLoop, t) as unknown as number
  }

  // Simulation loop using requestAnimationFrame
  function simLoop() {
    if (!running) return
    const view = viewportRef.current
    if (!view) return
    const cx = view.clientWidth / 2
    const cy = view.clientHeight / 2

    carsRef.current.forEach((car, i) => {
      if (car.crashed) return
      let move = true
      let distToCenter = 0
      if (car.sigId === 1) distToCenter = cy - car.y
      if (car.sigId === 2) distToCenter = car.y - cy
      if (car.sigId === 3) distToCenter = car.x - cx
      if (car.sigId === 4) distToCenter = cx - car.x

      // Merge back logic
      if (car.overtaking && car.mergeTarget !== null) {
        let passed = false
        if (car.sigId===1 && car.y > car.mergeTarget) passed = true
        if (car.sigId===2 && car.y < car.mergeTarget) passed = true
        if (car.sigId===3 && car.x < car.mergeTarget) passed = true
        if (car.sigId===4 && car.x > car.mergeTarget) passed = true
        if (passed) {
          if (car.sigId <= 2) car.x = car.origLane; else car.y = car.origLane
          car.overtaking = false; car.mergeTarget = null; car.el.style.opacity = "1"
        }
      }

      // Stop logic
      const myLight = signalState[car.sigId]
      const atStop = (distToCenter > 0 && distToCenter < STOP_LINE + 15 && distToCenter > STOP_LINE - 10)
      if (myLight !== 'green' && atStop && !car.overtaking) move = false

      // Crash detection
      if (Math.abs(distToCenter) < 40) {
        carsRef.current.forEach(other => {
          if (car === other || other.crashed || car.crashed || car.dir === other.dir) return
          const d = Math.hypot(car.x - other.x, car.y - other.y)
          if (d < CRASH_DIST) {
            triggerCrash(car, other)
          }
        })
      }

      // Queue / overtake
      carsRef.current.forEach(other => {
        if (car === other || car.crashed) return
        // only same dir cars matter for queueing
        if (!car.overtaking && car.dir !== other.dir) return
        let d = 999
        if (car.sigId===1 && other.y > car.y) d = other.y - car.y
        if (car.sigId===2 && other.y < car.y) d = car.y - other.y
        if (car.sigId===3 && other.x < car.x) d = car.x - other.x
        if (car.sigId===4 && other.x > car.x) d = other.x - car.x

        if (d < 50 && d > 0) {
          if (other.crashed && !car.overtaking && d < 60) {
            startOvertake(car, other); move = true
          } else {
            if (!car.overtaking) move = false
          }
        }
      })

      if (move) { car.x += car.dx; car.y += car.dy; car.el.classList.remove('stopped') }
      else { car.el.classList.add('stopped') }
      car.el.style.left = car.x + 'px'; car.el.style.top = car.y + 'px'

      // remove off-screen
      if (car.x > 2000 || car.x < -200 || car.y > 2000 || car.y < -200) {
        car.el.remove()
        carsRef.current.splice(i, 1)
      }
    })

    rafRef.current = requestAnimationFrame(simLoop)
  }

  function triggerCrash(c1: Car, c2: Car) {
    c1.crashed = true; c2.crashed = true
    c1.el.classList.add('wrecked'); c2.el.classList.add('wrecked')
    const b = document.createElement('div'); b.className = 'crash-marker'; b.innerText = '💥'
    b.style.left = ((c1.x + c2.x) / 2) + 'px'; b.style.top = ((c1.y + c2.y) / 2) + 'px'
    viewportRef.current!.appendChild(b)
  }

  function startOvertake(car: Car, ob: Car) {
    car.overtaking = true; car.el.style.opacity = "0.8"
    if (car.sigId===1) { car.x -= OVERTAKE_SHIFT; car.mergeTarget = ob.y + MERGE_DIST }
    if (car.sigId===2) { car.x += OVERTAKE_SHIFT; car.mergeTarget = ob.y - MERGE_DIST }
    if (car.sigId===3) { car.y -= OVERTAKE_SHIFT; car.mergeTarget = ob.x - MERGE_DIST }
    if (car.sigId===4) { car.y += OVERTAKE_SHIFT; car.mergeTarget = ob.x + MERGE_DIST }
  }

  // Controls: start/stop
  function toggleSim(state: boolean) {
    if (state && !running) {
      setRunning(true)
      spawnLoop()
      simLoop()
      if (autoMode) runStep(1, 'GREEN')
    } else if (!state) {
      setRunning(false)
      // cleanup cars
      carsRef.current.forEach(c => c.el.remove())
      carsRef.current = []
      document.querySelectorAll('.crash-marker').forEach(e => e.remove())
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current)
    }
  }

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current)
    }
  }, [])

  return (
    <section className="hud-panel" style={{ flex: 1, padding: 0 }}>
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, textAlign: 'right' }}>
        <div className="panel-title" style={{ color: 'var(--neon-blue)' }}>● LIVE SIMULATION</div>
        <div style={{ fontSize: '0.7rem', color: '#666' }} id="mode-badge">{modeBadge}</div>
      </div>

      <div className="sim-viewport" id="viewport" ref={viewportRef}>
        <div className="car-layer" id="car-layer" ref={carLayerRef}></div>
        {/* copy your road-layer/intersection markup here, keeping ids for lights (s1-red etc) */}
        <div className="road-layer">
          <div className="crossing-box"></div>
          {/* ... copy your road arms / pedestrians markup ... */}
        </div>

        <div className="intersection-anchor">
          <div className="signal-badge sb-north">01</div>
          <div className="light-housing lh-north">
            <div id="s1-red" className="bulb red active"></div>
            <div id="s1-yellow" className="bulb yellow"></div>
            <div id="s1-green" className="bulb green"></div>
          </div>
          {/* Repeat for s2/s3/s4 */}
        </div>
      </div>

      <div style={{ padding: 20, background: '#08080a', borderTop: '1px solid #222', display:'flex', gap:10 }}>
        <button className="btn" onClick={() => toggleSim(true)}>▶ START ENGINE</button>
        <button className="btn btn-secondary" onClick={() => toggleSim(false)}>⏹ KILL ENGINE</button>
        <button className="btn btn-secondary" onClick={() => forceCrash()}>💥 FORCE CRASH</button>
      </div>

      <ControlsPanel
        autoMode={autoMode}
        switchMode={switchMode}
        manualClick={manualClick}
        signalState={signalState}
        />

      
    </section>
  )
}