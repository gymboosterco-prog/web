"use client"

import { useState } from "react"
import Image from "next/image"

export function YouTubeEmbed({ ytId }: { ytId: string }) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    )
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className="relative w-full h-full group"
      aria-label="Videoyu oynat"
    >
      <Image
        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
        alt="Video"
        fill
        className="object-cover"
        sizes="(max-width: 672px) 100vw, 672px"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
        <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center transition-colors shadow-lg">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-black ml-1">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  )
}
