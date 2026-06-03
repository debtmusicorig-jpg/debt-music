import React, { useState, useEffect } from 'react'
import ReleaseCard from './ReleaseCard.jsx'
import Layout from '../Layout.jsx'
import BioText from '../entities/BioText.json'
import ReleaseData from '../entities/Release.json'

export default function Releases() {
  const [releases, setReleases] = useState([])
  const biography = BioText?.biography || "Welcome to the official home of D.E.B.T-Music. Custom singer-songwriter, rock, and folk compositions."

  useEffect(() => {
    // Reading your true album lists directly from your local file records
    if (ReleaseData) {
      const formatted = Array.isArray(ReleaseData) ? ReleaseData : [ReleaseData]
      setReleases(formatted)
    }
  }, [])

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* DESIGN TITLE BANNER */}
        <header className="text-center space-y-2 py-6">
          <h1 className="text-5xl font-black tracking-widest text-white uppercase">D E B T - M u s i c</h1>
          <p className="text-xl text-neutral-400 font-medium tracking-wide">Singer / Songwriter • Rock • Folk</p>
        </header>

        {/* YOUR MAIN BIOGRAPHY LAYER */}
        <section className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold tracking-wide border-b border-neutral-800 pb-3 mb-4 text-neutral-200">Biography</h2>
          <p className="text-lg leading-relaxed text-neutral-300">{biography}</p>
        </section>

        {/* CLASSIFIED MUSIC STATIONS GRID */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-wide text-neutral-200">Featured Releases & Stores</h2>
          <div className="grid gap-6">
            {releases.length > 0 ? (
              releases.map((item, index) => (
                <ReleaseCard key={item.id || index} release={item} />
              ))
            ) : (
              <p className="text-neutral-500 text-center py-12">Loading music cards mapping framework...</p>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
