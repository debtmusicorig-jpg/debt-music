import React from 'react'

export default function BioPage() {
  return (
    <div style={{ backgroundColor: '#111', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif', padding: '40px 20px', textAlign: 'center' }}>
      
      {/* BRANDING HEADER */}
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', letterSpacing: '4px', margin: '0 0 10px 0', color: '#fff' }}>D E B T - M u s i c</h1>
        <p style={{ fontStyle: 'italic', color: '#aaa', fontSize: '1.2rem' }}>Singer / Songwriter • Rock • Folk</p>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* BIOGRAPHY */}
        <section style={{ marginBottom: '40px', background: '#1c1c1c', padding: '30px', borderRadius: '8px', textAlign: 'left', border: '1px solid #333' }}>
          <h2 style={{ color: '#f5a623', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: '0' }}>Biography</h2>
          <p style={{ lineHeight: '1.6', color: '#ddd', fontSize: '1.1rem' }}>
            Welcome to the official home of D.E.B.T-Music. Combining intimate folk-style acoustic storytelling with raw rock instrumentation. 
            Explore our album details, listen to streaming preview tracks, and browse our physical merchandise below.
          </p>
        </section>

        {/* MUSIC STORAGE PLAYERS */}
        <section style={{ marginBottom: '40px', background: '#1c1c1c', padding: '30px', borderRadius: '8px', textAlign: 'left', border: '1px solid #333' }}>
          <h2 style={{ color: '#f5a623', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: '0', marginBottom: '20px' }}>Album Audio Tracks</h2>
          
          {/* TRACK 1 */}
          <div style={{ marginBottom: '20px', background: '#111', padding: '15px', borderRadius: '6px', border: '1px solid #222' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#fff' }}>1. Title Track (5:03)</p>
            <audio controls style={{ width: '100%' }}>
              <source src="/audio/title-track.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>

          {/* TRACK 2 */}
          <div style={{ marginBottom: '5px', background: '#111', padding: '15px', borderRadius: '6px', border: '1px solid #222' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#fff' }}>2. Album Track (3:30)</p>
            <audio controls style={{ width: '100%' }}>
              <source src="/audio/track2.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </section>

        {/* MERCH STORE */}
        <section style={{ background: '#1c1c1c', padding: '30px', borderRadius: '8px', textAlign: 'left', border: '1px solid #333' }}>
          <h2 style={{ color: '#f5a623', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: '0', marginBottom: '20px' }}>Band Merchandise</h2>
          <div style={{ background: '#111', padding: '20px', borderRadius: '6px', textAlign: 'center', border: '1px solid #222' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>D.E.B.T-Music Standard 12" Vinyl Record</h3>
            <p style={{ color: '#aaa', marginBottom: '15px' }}>Premium single LP cut. Audio optimized at 18 minutes maximum per side for deep rock bass and rich folk acoustics.</p>
            <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#f5a623' }}>£25.00</span>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer style={{ marginTop: '60px', color: '#555', fontSize: '0.9rem' }}>
        <p>&copy; {new Date().getFullYear()} D.E.B.T-Music. All Rights Reserved.</p>
      </footer>
    </div>
  )
}

