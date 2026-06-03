import React, { useState, useEffect } from 'react'
import ReleaseCard from './ReleaseCard.jsx'
import BioText from '../entities/BioText.json'
import BioMedia from '../entities/BioMedia.json'
import ReleaseData from '../entities/Release.json'

export default function Releases() {
  const [releases, setReleases] = useState([])
  const biography = BioText?.biography || "Welcome to the official home of D.E.B.T-Music. Combining intimate folk acoustic storytelling with raw rock instrumentation."

  useEffect(() => {
    // Safely loading your authentic release files straight from your GitHub folder
    if (ReleaseData) {
      const formattedReleases = Array.isArray(ReleaseData) ? ReleaseData : [ReleaseData]
      setReleases(formattedReleases)
    }
  }, [])

  return (
    <div style={{ backgroundColor: '#111', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        
        {/* BRANDING HEADER */}
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '3rem', letterSpacing: '4px', margin: '0 0 10px 0', color: '#fff' }}>D E B T - M u s i c</h1>
          <p style={{ fontStyle: 'italic', color: '#aaa', fontSize: '1.2rem' }}>Singer / Songwriter • Rock • Folk</p>
        </header>

        {/* BIOGRAPHY AREA */}
        <section style={{ marginBottom: '40px', background: '#1c1c1c', padding: '30px', borderRadius: '8px', textAlign: 'left', border: '1px solid #333' }}>
          <h2 style={{ color: '#f5a623', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: '0' }}>Biography</h2>
          <p style={{ lineHeight: '1.6', color: '#ddd', fontSize: '1.1rem' }}>{biography}</p>
        </section>

        {/* RELEASES VISUAL RENDERING GRID */}
        <section style={{ textAlign: 'left' }}>
          <h2 style={{ color: '#f5a623', marginBottom: '20px' }}>Featured Releases</h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            {releases.length > 0 ? (
              releases.map((item, index) => (
                <ReleaseCard key={item.id || index} release={item} />
              ))
            ) : (
              <p style={{ color: '#666' }}>Loading album details...</p>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
