import { useState } from "react";

export default function IntroVideo() {
  const [autoplay] = useState(() => (
    typeof window !== "undefined" &&
    !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
  ));

  return (
    <section
      className="intro-video-card"
      aria-label="Presentación en vídeo de ViaNordTrans"
      data-testid="intro-video-section"
    >
      <video
        className="intro-video-media"
        src="/vnt-intro.mp4"
        poster="/vnt-intro-poster.jpg"
        autoPlay={autoplay}
        muted
        playsInline
        controls
        preload="auto"
        aria-label="Vídeo de presentación de ViaNordTrans"
        data-testid="intro-video-player"
      >
        Tu navegador no puede reproducir este vídeo.
      </video>
      <div className="intro-video-accent" aria-hidden="true" />
    </section>
  );
}