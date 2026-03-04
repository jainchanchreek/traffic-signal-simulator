import React from 'react'
import { SignalColor, SignalState } from '../types'

type Props = {
  autoMode: boolean
  switchMode: (value: boolean) => void
  manualClick: (id: 1 | 2 | 3 | 4, color: SignalColor) => void
  signalState: SignalState
}

export default function ControlsPanel({
  autoMode,
  switchMode,
  manualClick,
  signalState
}: Props) {
  const signals: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4]
  const labels = {
    1: '01 NORTH',
    2: '02 SOUTH',
    3: '03 EAST',
    4: '04 WEST'
  }

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', gap: 0 }}>
      
      {/* AUTO TOGGLE */}
      <div className="mode-toggle-container">
        <div>
          <span className="panel-title" style={{ color: '#fff', display: 'block' }}>
            AUTO-SEQUENCE
          </span>
          <span style={{ fontSize: '0.7rem', color: '#666' }}>
            ENABLE TIMER LOOPS
          </span>
        </div>

        <label className="switch">
          <input
            type="checkbox"
            checked={autoMode}
            onChange={(e) => switchMode(e.target.checked)}
          />
          <span className="slider-round"></span>
        </label>
      </div>

      {/* CONTROL CARDS */}
      <div className="hud-panel" style={{ borderTop: 'none', borderRadius: '0 0 4px 4px' }}>
        {signals.map((id) => (
          <div key={id} className="control-card" style={{ marginTop: id === 1 ? 0 : 10 }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="sig-label">{labels[id]}</div>

              {/* MANUAL BULBS */}
              <div
                className={`manual-light-housing ${autoMode ? 'bulbs-locked' : ''}`}
              >
                {(['red', 'yellow', 'green'] as SignalColor[]).map((color) => (
                  <div
                    key={color}
                    className={`manual-bulb ${color} ${
                      signalState[id] === color ? 'active' : ''
                    }`}
                    onClick={() => manualClick(id, color)}
                  />
                ))}
              </div>
            </div>

            {/* TIMING INPUTS */}
            <div className={`config-row ${!autoMode ? 'inputs-disabled' : ''}`}>
              <div className="input-box">
                <span className="input-label">Green (s)</span>
                <input
                  type="number"
                  className="micro-input"
                  defaultValue={5}
                  disabled={!autoMode}
                  id={`cfg-${id}-green`}
                />
              </div>

              <div className="input-box">
                <span className="input-label">Red (s)</span>
                <input
                  type="number"
                  className="micro-input"
                  defaultValue={2}
                  disabled={!autoMode}
                  id={`cfg-${id}-red`}
                />
              </div>
            </div>

          </div>
        ))}
      </div>
    </aside>
  )
}