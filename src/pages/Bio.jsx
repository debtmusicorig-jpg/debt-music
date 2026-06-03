import React from 'react'

export default function BioPage() {
  return (
    <div style={{ backgroundColor: '#111', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif', padding: '40px 20px', textAlign: 'center' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', letterSpacing: '4px', margin: '0 0 10px 0' }}>D E B T - M u s i c</h1>
        <p style={{ fontStyle: 'italic', color: '#aaa' }}>Singer / Songwriter • Rock • Folk</p>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        <section style={{ marginBottom: '50px', background: '#222', padding: '30px', borderRadius: '8px' }}>
          <h2 style={{ borderBottom: '1px solid #444', paddingBottom: '10px' }}>Biography</h2>
          <p style={{ lineHeight: '1.6', color: '#ddd', fontSize: '1.1rem' }}>
            Welcome to the official home of D.E.B.T-Music. Custom singer-songwriter, rock, and folk compositions. 
            Stream our latest tracks and browse our physical store items below.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ marginBottom: '20px' }}>Latest Music</h2>
          <p style={{ color: '#888' }}>Streaming players loading directly from your track files...</p>
        </section>

        <section>
          <h2>Merchandise & Vinyl</h2>
          <p style={{ color: '#888' }}>Physical record releases and band items catalog...</p>
        </section>
      </main>

      <footer style={{ marginTop: '60px', color: '#555', fontSize: '0.9rem' }}>
        <p>&copy; {new Date().getFullYear()} D.E.B.T-Music. All Rights Reserved.</p>
      </footer>
    </div>
  )
}
