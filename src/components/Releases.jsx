import React, { useState, useEffect } from 'react'
import ReleaseCard from './ReleaseCard.jsx'
import Layout from '../Layout.jsx'

// Importing your real album database records from your entities folder
import ReleaseData from '../entities/Release.json'
import BioText from '../entities/BioText.json'

export default function Releases() {
  const [releases, setReleases] = useState([])
  const biography = BioText?.biography || "D.E.B.T-Music: Custom singer-songwriter, rock, and folk compositions."

  useEffect(() => {
    // Safely mapping your real album data into your visual design loops
    if (ReleaseData) {
      const list = Array.isArray(ReleaseData) ? ReleaseData : [ReleaseData]
      setReleases(list)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* YOUR VISUAL BRAND HEADER */}
        <header className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-widest text-primary">D E B T - M u s i c</h1>
          <p className="text-xl text-muted-foreground font-medium">Singer / Songwriter • Rock • Folk</p>
        </header>

        {/* YOUR AUTHENTIC BIOGRAPHY LAYOUT */}
        <section className="bg-card text-card-foreground p-8 rounded-lg border shadow-sm">
          <h2 className="text-2xl font-semibold border-b pb-2 mb-4 text-primary">Biography</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">{biography}</p>
        </section>

        {/* YOUR TRUE RELEASES / ALBUM / EP LISTING GRID */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">Featured Releases</h2>
          <div className="grid gap-6">
            {releases.length > 0 ? (
              releases.map((item, index) => (
                <ReleaseCard key={item.id || index} release={item} />
              ))
            ) : (
              <p className="text-muted-foreground text-center">Loading your album tracks...</p>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
