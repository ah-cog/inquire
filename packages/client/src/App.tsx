import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import SearchPage from './components/SearchPage'
import OrganizerPage from './components/OrganizerPage'
import InspectorPage from './components/InspectorPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="nav">
          <span className="nav-brand">Inquire</span>
          <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Search
          </NavLink>
          <NavLink to="/organizer" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Organizer
          </NavLink>
        </nav>
        <main className="main">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/organizer" element={<OrganizerPage />} />
            <Route path="/inspector/:id" element={<InspectorPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
