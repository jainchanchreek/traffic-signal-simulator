import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import TrafficSim from './components/TrafficSim'
import ControlsPanel from './components/ControlsPanel'

export default function App() {
  return (
    <div className="app-root">
      <Sidebar />
      <main className="main-content">
        <TrafficSim />
      </main>
    </div>
  )
}