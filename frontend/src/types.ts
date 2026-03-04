export type SignalColor = 'red' | 'yellow' | 'green'
export type SignalState = Record<1 | 2 | 3 | 4, SignalColor>

export type Car = {
  el: HTMLDivElement
  x: number
  y: number
  dx: number
  dy: number
  sigId: 1|2|3|4
  dir: 'north'|'south'|'east'|'west'
  crashed: boolean
  overtaking: boolean
  origLane: number
  mergeTarget: number | null
}