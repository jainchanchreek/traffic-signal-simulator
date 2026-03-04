import React from 'react'

export default function Sidebar() {
  return (
    <nav className="sidebar-nav">
      <div className="brand"><span>⚡ SignalMind</span></div>
      <a href="index.html" className="nav-link"><span>[01] RL AGENT</span></a>
      <a href="fixed.html" className="nav-link active"><span>[02] MASTER CONTROL</span></a>
    </nav>
  )
}