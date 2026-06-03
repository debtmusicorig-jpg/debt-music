import React from 'react'

export default function ReleaseCard({ release }) {
  if (!release) return null;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col md:flex-row gap-6 shadow-md items-center md:items-start text-left">
      
      {/* ARTWORK PREVIEW CONTAINER */}
      <div className="w-40 h-40 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-neutral-700">
        {release.cover_art_url ? (
          <img src={release.cover_art_url} alt={release.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-neutral-500 text-sm">No Cover Art</span>
        )}
      </div>

      {/* CORE TEXT DETAILS */}
      <div className="flex-grow space-y-3 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-2xl font-bold text-white">{release.title || 'Untitled Release'}</h3>
          <span className="px-3 py-1 bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-full border border-neutral-700 uppercase tracking-wider">
            {release.type}
          </span>
        </div>

        {release.album_name && (
          <p className="text-sm text-neutral-400">From the album: <span className="text-white italic">{release.album_name}</span></p>
        )}

        {release.release_date && (
          <p className="text-xs text-neutral-500">Released: {release.release_date}</p>
        )}

        {/* STREAMING / LINK ACTION HUB */}
        {release.streaming_links && release.streaming_links.length > 0 && (
          <div className="pt-3 border-t border-neutral-800 space-y-2">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Listen / Buy:</p>
            <div className="flex flex-wrap gap-2">
              {release.streaming_links.map((link, i) => (
                <a 
                  key={i} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm rounded-lg border border-neutral-700 transition-colors inline-block font-medium"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
