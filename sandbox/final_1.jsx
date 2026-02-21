"use client";
import React, { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   WEDDING PAGE — Deepraj & Gouri
   
   Structure:
   · Full-screen hero with parallax name layers
   · Horizontal drag-scroll row for each ceremony section
   · Venue card
   · Each card floats with ground shadow
   · Smooth parallax via rAF on scroll
───────────────────────────────────────────────────────────── */

const FONT = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Outfit:wght@200;300;400&display=swap');
`;

/* ── Ceremony data ── */
const CEREMONIES = [
  {
    id: "haldi",
    name: "Haldi",
    native: "हल्दी",
    sub: "Golden Morning",
    description: "Turmeric, marigolds, and the warmth of family — an ancient ritual that colours the beginning of forever.",
    date: "April 24, 2026",
    time: "9:00 AM",
    place: "Garden Courtyard",
    emoji: "🌼",
    cardBg: "#FFFDF0",
    cardBorder: "#EDD87A",
    accent: "#A07810",
    chipBg: "#FFF7CC",
  },
  {
    id: "sangeet",
    name: "Sangeet",
    native: "संगीत",
    sub: "Night of Music",
    description: "When two families forget the boundary between them and dance together until the stars dim.",
    date: "April 24, 2026",
    time: "7:30 PM",
    place: "The Grand Ballroom",
    emoji: "🎶",
    cardBg: "#F8F0FF",
    cardBorder: "#C4A0F0",
    accent: "#6D28D9",
    chipBg: "#EDE0FF",
  },
  {
    id: "saptapadi",
    name: "Saptapadi",
    native: "सप्तपदी",
    sub: "Seven Sacred Steps",
    description: "Seven vows around the sacred fire — each step a promise that echoes across every life to come.",
    date: "April 26, 2026",
    time: "12:37 PM",
    place: "The Sacred Mandap",
    emoji: "🔥",
    cardBg: "#FFF5F5",
    cardBorder: "#F0A0AA",
    accent: "#9B1B30",
    chipBg: "#FFE4E8",
  },
  {
    id: "muhurt",
    name: "Muhurt",
    native: "मुहूर्त",
    sub: "The Auspicious Moment",
    description: "As the priest recites the final mantra and the stars align, two souls step into forever together.",
    date: "April 26, 2026",
    time: "12:37 PM",
    place: "The Sacred Mandap",
    emoji: "✨",
    cardBg: "#F0FBF5",
    cardBorder: "#80D0A0",
    accent: "#1A6B40",
    chipBg: "#D0F0E0",
  },
];

/* ─────────────────────────────────────────────────────────────
   ROOT COMPONENT
───────────────────────────────────────────────────────────── */
export default function WeddingPage() {
  const scrollY = useRef(0);
  const rafId = useRef(null);

  // All parallax targets: { el, rate }
  // Positive rate = moves DOWN slower than scroll (background feel)
  // Negative rate = moves UP faster (foreground feel)
  const targets = useRef([]);

  function addParallax(el, rate) {
    if (!el) return;
    targets.current = targets.current.filter(t => t.el !== el);
    targets.current.push({ el, rate });
  }

  useEffect(() => {
    const onScroll = () => { scrollY.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });

    function tick() {
      const sy = scrollY.current;
      targets.current.forEach(({ el, rate }) => {
        el.style.transform = `translateY(${sy * rate}px)`;
      });
      rafId.current = requestAnimationFrame(tick);
    }
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      <style>{FONT + globalStyles}</style>
      <div className="page">

        {/* Fixed warm gradient background */}
        <div className="bg-fixed">
          <BgBlobs addParallax={addParallax} />
        </div>

        <main>
          <Hero addParallax={addParallax} />
          <CeremoniesSection addParallax={addParallax} />
          <VenueSection addParallax={addParallax} />
          <Footer />
        </main>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   BACKGROUND BLOBS — fixed, parallax at slow rate
───────────────────────────────────────────────────────────── */
function BgBlobs({ addParallax }) {
  const b1 = useRef(); const b2 = useRef();
  const b3 = useRef(); const b4 = useRef();

  useEffect(() => {
    addParallax(b1.current, 0.06);
    addParallax(b2.current, -0.04);
    addParallax(b3.current, 0.08);
    addParallax(b4.current, -0.05);
  }, []);

  return (
    <>
      <div ref={b1} className="blob" style={{ top: "-10%", left: "-8%", width: "55vw", height: "55vw", background: "radial-gradient(circle, #FFF3C0 0%, transparent 70%)" }} />
      <div ref={b2} className="blob" style={{ top: "5%", right: "-5%", width: "40vw", height: "40vw", background: "radial-gradient(circle, #EDE0FF 0%, transparent 70%)" }} />
      <div ref={b3} className="blob" style={{ top: "50%", left: "-5%", width: "35vw", height: "35vw", background: "radial-gradient(circle, #FFE4E8 0%, transparent 70%)" }} />
      <div ref={b4} className="blob" style={{ top: "55%", right: "-8%", width: "45vw", height: "45vw", background: "radial-gradient(circle, #D0F0E0 0%, transparent 70%)" }} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   HERO — layered parallax text
───────────────────────────────────────────────────────────── */
function Hero({ addParallax }) {
  const eyebrow = useRef(); const names = useRef();
  const amp = useRef(); const date = useRef();
  const line = useRef();

  useEffect(() => {
    // Different rates create depth as you scroll
    addParallax(eyebrow.current, -0.12);
    addParallax(names.current, -0.22);  // names move fastest — feel closest
    addParallax(amp.current, -0.18);
    addParallax(date.current, -0.10);
    addParallax(line.current, -0.08);
  }, []);

  return (
    <section className="hero">

      {/* Eyebrow */}
      <div ref={eyebrow} className="will-parallax">
        <p className="eyebrow">With joy &amp; blessings · April 2026</p>
      </div>

      {/* Names */}
      <div ref={names} className="will-parallax hero-names-wrap">
        <h1 className="hero-name">Deepraj</h1>
      </div>

      {/* Ampersand in between — slowest, feels furthest back */}
      <div ref={amp} className="will-parallax">
        <p className="hero-amp">&amp;</p>
      </div>

      <div ref={names} className="will-parallax hero-names-wrap" style={{ marginTop: 0 }}>
        <h1 className="hero-name">Gouri</h1>
      </div>

      {/* Date */}
      <div ref={date} className="will-parallax" style={{ marginTop: "2.5rem" }}>
        <p className="hero-date">April 24 – 26 · Kolkata</p>
      </div>

      {/* Vertical line */}
      <div ref={line} className="will-parallax" style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
        <div className="hero-line" />
      </div>

      <p className="scroll-hint">scroll to explore</p>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   CEREMONIES SECTION
───────────────────────────────────────────────────────────── */
function CeremoniesSection({ addParallax }) {
  const headRef = useRef();
  useEffect(() => { addParallax(headRef.current, -0.05); }, []);

  const trackRef = useRef();
  const dragging = useRef(false);
  const startX = useRef(0);
  const scrollL = useRef(0);

  function onMouseDown(e) {
    dragging.current = true;
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollL.current = trackRef.current.scrollLeft;
    trackRef.current.style.cursor = "grabbing";
  }
  function onMouseMove(e) {
    if (!dragging.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    trackRef.current.scrollLeft = scrollL.current - (x - startX.current);
  }
  function onMouseUp() {
    dragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = "grab";
  }

  return (
    <section className="section">
      <div ref={headRef} className="section-head will-parallax">
        <span className="section-tag">01 · The Celebrations</span>
        <h2 className="section-title">Each Ceremony</h2>
      </div>

      <div
        ref={trackRef}
        className="card-track"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {CEREMONIES.map((c, i) => (
          <CeremonyCard key={c.id} data={c} index={i} />
        ))}
        {/* End spacer */}
        <div style={{ flex: "0 0 clamp(24px,5vw,60px)" }} />
      </div>

      <p className="drag-hint">← drag to explore →</p>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   CEREMONY CARD — floating 3D look
───────────────────────────────────────────────────────────── */
function CeremonyCard({ data: d, index }) {
  return (
    <div className="card-slot" style={{ animationDelay: `${index * 0.9}s` }}>
      {/* The card */}
      <div
        className="card"
        style={{
          background: d.cardBg,
          border: `1px solid ${d.cardBorder}`,
          marginTop:20
        }}
      >
        {/* Corner glow */}
        <div style={{
          position: "absolute", top: 0, right: 0, width: 140, height: 140,
          background: `radial-gradient(circle at top right, ${d.cardBorder}60, transparent 68%)`,
          borderRadius: "0 24px 0 0", pointerEvents: "none",
        }} />

        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: "0.8rem", color: d.accent, opacity: 0.55, letterSpacing: "0.06em" }}>
            {d.native}
          </span>
          <span style={{ fontSize: "1.4rem" }}>{d.emoji}</span>
        </div>

        {/* Name */}
        <h3 className="card-name" style={{ color: "#1A120A" }}>{d.name}</h3>
        <p className="card-sub" style={{ color: d.accent }}>{d.sub}</p>

        {/* Divider */}
        <div style={{ height: 1, background: `linear-gradient(to right, ${d.cardBorder}, transparent)`, margin: "16px 0" }} />

        {/* Description */}
        <p className="card-desc">{d.description}</p>

        {/* Info chips */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 22 }}>
          {[
            { label: d.date },
            { label: d.time },
            { label: d.place },
          ].map((chip, i) => (
            <span key={i} className="chip" style={{ background: d.chipBg, color: d.accent }}>
              {chip.label}
            </span>
          ))}
        </div>
      </div>

      {/* Ground shadow — gives floating illusion */}
      <div className="card-shadow" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VENUE SECTION
───────────────────────────────────────────────────────────── */
function VenueSection({ addParallax }) {
  const headRef = useRef();
  useEffect(() => { addParallax(headRef.current, -0.05); }, []);

  return (
    <section className="section">
      <div ref={headRef} className="section-head will-parallax">
        <span className="section-tag">02 · The Location</span>
        <h2 className="section-title">Where It Happens</h2>
      </div>

      {/* Single card, centered */}
      <div style={{ padding: "0 clamp(20px,5vw,60px)" }}>
        <div className="venue-card">
          {/* Corner glow */}
          <div style={{ position: "absolute", top: 0, right: 0, width: 180, height: 180, background: "radial-gradient(circle at top right, #B8D0F060, transparent 68%)", borderRadius: "0 28px 0 0", pointerEvents: "none" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: "0.8rem", color: "#3D60A0", opacity: 0.55, letterSpacing: "0.06em" }}>स्थान</span>
            <span style={{ fontSize: "1.4rem" }}>📍</span>
          </div>

          <h3 className="card-name" style={{ color: "#101828", fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>The Grand Estate</h3>
          <p className="card-sub" style={{ color: "#3D60A0" }}>Kolkata, West Bengal</p>

          <div style={{ height: 1, background: "linear-gradient(to right, #B8D0F0, transparent)", margin: "16px 0" }} />

          <p className="card-desc" style={{ maxWidth: 480 }}>
            Nestled among ancient banyan groves, The Grand Estate blends timeless architecture with open courtyards that breathe. A space that has held a hundred celebrations — and is ready to hold yours.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 22, marginBottom: 28 }}>
            {["12 Heritage Road, Kolkata 700 001", "April 24 – 26, 2026"].map((t, i) => (
              <span key={i} className="chip" style={{ background: "#DDEAFF", color: "#3D60A0" }}>{t}</span>
            ))}
          </div>

          {/* Illustrated map placeholder */}
          <div className="map-box">
            {/* Grid */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }}>
              {Array.from({ length: 9 }).map((_, i) => <line key={`h${i}`} x1="0" y1={`${i * 12.5}%`} x2="100%" y2={`${i * 12.5}%`} stroke="#3D60A0" strokeWidth="0.8" />)}
              {Array.from({ length: 13 }).map((_, i) => <line key={`v${i}`} x1={`${i * 8.5}%`} y1="0" x2={`${i * 8.5}%`} y2="100%" stroke="#3D60A0" strokeWidth="0.8" />)}
              <line x1="0%" y1="60%" x2="45%" y2="15%" stroke="#3D60A0" strokeWidth="2.5" opacity="0.4" />
              <line x1="55%" y1="85%" x2="100%" y2="32%" stroke="#3D60A0" strokeWidth="2.5" opacity="0.4" />
            </svg>
            {/* Pin */}
            <div className="map-pin">
              <div className="pin-head">📍</div>
              <div className="pin-label">THE GRAND ESTATE</div>
            </div>
          </div>

          <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="directions-btn">
            Get Directions →
          </a>
        </div>

        {/* Ground shadow for venue card */}
        <div className="card-shadow" style={{ width: "60%", margin: "0 auto", marginTop: 4 }} />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-line" />
      <p className="footer-names">Deepraj &amp; Gouri</p>
      <p className="footer-date">26 · 04 · 2026</p>
      <p className="footer-note">Made with love for our special day</p>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────────── */
const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  body {
    background: #FAF7F2;
    color: #1A120A;
    -webkit-font-smoothing: antialiased;
  }

  .page { position: relative; min-height: 100vh; }

  /* Fixed background */
  .bg-fixed {
    position: fixed;
    inset: 0;
    z-index: 0;
    background: #FAF7F2;
    overflow: hidden;
  }
  .blob {
    position: absolute;
    border-radius: 50%;
    will-change: transform;
  }

  main { position: relative; z-index: 1; }

  .will-parallax { will-change: transform; }

  /* ── HERO ── */
  .hero {
    height: 100vh;
    min-height: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 5vw;
    position: relative;
    overflow: hidden;
  }
  .eyebrow {
    font-family: 'Outfit', sans-serif;
    font-weight: 200;
    font-size: clamp(0.6rem, 1.5vw, 0.75rem);
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #C9A96E;
    margin-bottom: 2rem;
  }
  .hero-names-wrap { display: flex; flex-direction: column; align-items: center; }
  .hero-name {
    font-family: 'Playfair Display', serif;
    font-weight: 400;
    font-size: clamp(3.5rem, 12vw, 7rem);
    color: #1A120A;
    letter-spacing: 0.02em;
    line-height: 1;
  }
  .hero-amp {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    color: #C9A96E;
    letter-spacing: 0.1em;
    margin: 0.4rem 0;
  }
  .hero-date {
    font-family: 'Outfit', sans-serif;
    font-weight: 200;
    font-size: clamp(0.7rem, 1.8vw, 0.88rem);
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: #7A6A52;
  }
  .hero-line {
    width: 1px;
    height: 48px;
    background: linear-gradient(to bottom, #C9A96E, transparent);
  }
  .scroll-hint {
    position: absolute;
    bottom: 28px;
    font-family: 'Outfit', sans-serif;
    font-weight: 200;
    font-size: 0.55rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #C9A96E66;
    animation: fadeUpDown 2.4s ease-in-out infinite;
  }
  @keyframes fadeUpDown {
    0%,100% { opacity: 0.4; transform: translateY(0); }
    50%      { opacity: 1;   transform: translateY(-5px); }
  }

  /* ── SECTIONS ── */
  .section {
    padding: clamp(80px, 14vh, 130px) 0 clamp(60px, 10vh, 100px);
  }
  .section-head {
    padding: 0 clamp(20px, 5vw, 72px);
    margin-bottom: clamp(36px, 5vw, 56px);
  }
  .section-tag {
    font-family: 'Outfit', sans-serif;
    font-weight: 200;
    font-size: 0.62rem;
    letter-spacing: 0.38em;
    text-transform: uppercase;
    color: #C9A96E;
    display: block;
    margin-bottom: 10px;
  }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-weight: 400;
    font-size: clamp(2rem, 5vw, 3.2rem);
    color: #1A120A;
    letter-spacing: 0.02em;
    line-height: 1.1;
  }

  /* ── CARD TRACK (horizontal scroll) ── */
  .card-track {
    display: flex;
    gap: clamp(18px, 2.5vw, 28px);
    overflow-x: auto;
    overflow-y: visible;
    padding-left: clamp(20px, 5vw, 72px);
    padding-right: clamp(20px, 5vw, 72px);
    padding-bottom: 52px;   /* room for shadows */
    cursor: grab;
    user-select: none;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .card-track::-webkit-scrollbar { display: none; }

  .drag-hint {
    font-family: 'Outfit', sans-serif;
    font-weight: 200;
    font-size: 0.56rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #C9A96E66;
    text-align: center;
    margin-top: -20px;
    animation: fadeUpDown 2s ease-in-out infinite;
  }

  /* ── CARD SLOT (card + shadow together) ── */
  .card-slot {
    flex: 0 0 auto;
    width: min(320px, 80vw);
    display: flex;
    flex-direction: column;
    animation: floatUp 5s ease-in-out infinite;
  }
  @keyframes floatUp {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-12px); }
  }

  /* ── CARD ── */
  .card {
    position: relative;
    border-radius: 24px;
    padding: clamp(26px, 4vw, 36px);
    /* Multi-layer shadow for air floating illusion */
    box-shadow:
      0 1px 3px rgba(0,0,0,0.04),
      0 6px 16px rgba(0,0,0,0.07),
      0 20px 40px rgba(0,0,0,0.10),
      0 44px 72px rgba(0,0,0,0.07);
    transition: box-shadow 0.5s ease;
  }
  .card:hover {
    box-shadow:
      0 2px 6px rgba(0,0,0,0.05),
      0 12px 28px rgba(0,0,0,0.10),
      0 32px 56px rgba(0,0,0,0.13),
      0 60px 90px rgba(0,0,0,0.09);
  }

  /* Ground shadow — breathes opposite to card float */
  .card-shadow {
    width: 70%;
    height: 20px;
    background: radial-gradient(ellipse, rgba(0,0,0,0.22) 0%, transparent 70%);
    border-radius: 50%;
    margin: 6px auto 0;
    filter: blur(4px);
    animation: shadowBreath 5s ease-in-out infinite;
  }
  @keyframes shadowBreath {
    0%,100% { transform: scaleX(1);    opacity: 0.22; }
    50%      { transform: scaleX(0.80); opacity: 0.11; }
  }

  .card-name {
    font-family: 'Playfair Display', serif;
    font-weight: 400;
    font-size: clamp(1.8rem, 4vw, 2.3rem);
    letter-spacing: 0.02em;
    line-height: 1.05;
    margin-bottom: 4px;
  }
  .card-sub {
    font-family: 'Outfit', sans-serif;
    font-weight: 200;
    font-size: 0.65rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    margin-bottom: 0;
  }
  .card-desc {
    font-family: 'Playfair Display', serif;
    font-weight: 400;
    font-size: 0.97rem;
    line-height: 1.85;
    color: #4A3728;
  }

  .chip {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 20px;
    font-family: 'Outfit', sans-serif;
    font-weight: 300;
    font-size: 0.74rem;
    letter-spacing: 0.02em;
  }

  /* ── VENUE CARD ── */
  .venue-card {
    position: relative;
    border-radius: 28px;
    background: #EEF3FF;
    border: 0px solid #B8D0F0;
    padding: clamp(28px, 4vw, 44px);
    max-width: 680px;
    box-shadow:
      0 1px 3px rgba(0,0,0,0.04),
      0 6px 16px rgba(0,0,0,0.07),
      0 20px 40px rgba(0,0,0,0.10),
      0 44px 72px rgba(0,0,0,0.07);
    animation: floatUp 6s ease-in-out 1s infinite;
  }

  /* ── MAP ── */
  .map-box {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    height: clamp(180px, 30vw, 240px);
    background: linear-gradient(135deg, #DCE8F8, #E8D8F8);
    border: 1px solid #B8D0F055;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .map-pin {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    animation: floatUp 4s ease-in-out infinite;
    position: relative;
    z-index: 1;
  }
  .pin-head {
    width: 44px; height: 44px;
    border-radius: 50% 50% 50% 0;
    background: #4A6DB5;
    transform: rotate(-45deg);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 24px rgba(74,109,181,0.4);
    font-size: 1rem;
  }
  .pin-label {
    font-family: 'Outfit', sans-serif;
    font-size: 0.6rem;
    letter-spacing: 0.18em;
    color: #1A2A4A;
    background: rgba(255,255,255,0.9);
    padding: 4px 12px;
    border-radius: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    white-space: nowrap;
  }

  .directions-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 22px;
    font-family: 'Outfit', sans-serif;
    font-weight: 300;
    font-size: 0.72rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #fff;
    background: #4A6DB5;
    padding: 12px 28px;
    border-radius: 40px;
    text-decoration: none;
    box-shadow: 0 4px 20px rgba(74,109,181,0.35);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .directions-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(74,109,181,0.45);
  }

  /* ── FOOTER ── */
  .footer {
    text-align: center;
    padding: clamp(60px,10vh,100px) 24px clamp(50px,8vh,80px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .footer-line {
    width: 1px;
    height: 52px;
    background: linear-gradient(to bottom, #C9A96E, transparent);
    margin-bottom: 8px;
  }
  .footer-names {
    font-family: 'Playfair Display', serif;
    font-weight: 400;
    font-size: clamp(1.6rem, 4vw, 2.2rem);
    color: #1A120A;
    letter-spacing: 0.04em;
  }
  .footer-date {
    font-family: 'Outfit', sans-serif;
    font-weight: 200;
    font-size: 0.72rem;
    letter-spacing: 0.4em;
    color: #C9A96E;
    text-transform: uppercase;
  }
  .footer-note {
    font-family: 'Outfit', sans-serif;
    font-weight: 200;
    font-size: 0.6rem;
    letter-spacing: 0.25em;
    color: #A09080;
    text-transform: uppercase;
    margin-top: 8px;
  }
`;