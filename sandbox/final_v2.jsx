"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { MapPin, Clock, Calendar } from "lucide-react";

/* ══════════════════════════════════════════════════════
   GOOGLE FONTS — Cormorant Garamond + Jost
══════════════════════════════════════════════════════ */
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@200;300;400&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #fdf8f2; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(32px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes lineGrow {
      from { width: 0; }
      to   { width: 48px; }
    }
    @keyframes floatY {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-8px); }
    }
    .reveal {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1);
    }
    .reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .card-inner {
      transition: transform 0.6s cubic-bezier(0.22,1,0.36,1), box-shadow 0.6s ease;
    }
    .card-inner:hover {
      transform: translateY(-6px) scale(1.01);
      box-shadow: 0 24px 60px rgba(0,0,0,0.10) !important;
    }
  `}</style>
);

/* ══════════════════════════════════════════════════════
   PASTEL PALETTE per event
══════════════════════════════════════════════════════ */
const EVENTS = [
  {
    key: "haldi",
    label: "Haldi",
    hindi: "हल्दी",
    tagline: "Golden beginnings",
    desc: "Where turmeric meets tradition — a morning of laughter, blessings, and the warm glow of marigolds as family gathers to anoint the couple with love.",
    date: "April 24, 2026",
    time: "9:00 AM onwards",
    venue: "The Garden Courtyard",
    pastel: "#FFF3C4",      // warm saffron-yellow
    accent: "#D4A017",
    arch: "#f0c94a",
    dot: "#e6b800",
    icon: "🌼",
  },
  {
    key: "sangeet",
    label: "Sangeet",
    hindi: "संगीत",
    tagline: "An evening of music & soul",
    desc: "Families come alive — through song, dance, and stories. The night hums with nostalgia, joy, and performances that will be talked about for years.",
    date: "April 24, 2026",
    time: "7:00 PM — midnight",
    venue: "The Grand Ballroom",
    pastel: "#F0E6FF",      // soft lavender
    accent: "#8B5CF6",
    arch: "#c4a0f5",
    dot: "#9b72ef",
    icon: "🎶",
  },
  {
    key: "saptapadi",
    label: "Saptapadi",
    hindi: "सप्तपदी",
    tagline: "Seven steps into forever",
    desc: "The sacred walk around the fire — seven vows, seven promises, seven steps that bind two souls across every lifetime that will ever be.",
    date: "April 26, 2026",
    time: "12:37 PM",
    venue: "The Sacred Mandap",
    pastel: "#FFE8E8",      // blush rose
    accent: "#C0394B",
    arch: "#f4a0a8",
    dot: "#e05060",
    icon: "🔥",
  },
  {
    key: "muhurt",
    label: "Muhurt",
    hindi: "मुहूर्त",
    tagline: "The auspicious moment",
    desc: "As the stars align and the priest recites ancient mantras, two families become one. The most sacred and still moment of the entire celebration.",
    date: "April 26, 2026",
    time: "12:37 PM sharp",
    venue: "The Sacred Mandap",
    pastel: "#E8F5E9",      // mint sage
    accent: "#2E7D52",
    arch: "#8ecfa8",
    dot: "#3d9e6a",
    icon: "✨",
  },
];

/* ══════════════════════════════════════════════════════
   THREE.JS — INFINITE TUNNEL BACKGROUND
══════════════════════════════════════════════════════ */
function TunnelArch({ position, scale, color, opacity }) {
  const ref = useRef();
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <torusGeometry args={[2.4, 0.04, 8, 60, Math.PI]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function TunnelScene({ scrollY }) {
  const groupRef = useRef();
  const ARCH_COUNT = 18;
  const SPACING = 3.2;

  // Pastel colors cycling per arch
  const archColors = [
    "#f9d5d3", "#f7e5c5", "#e8d5f5", "#d5ede0",
    "#fce4d6", "#dde8fb", "#fdf0d5", "#e0f0e8",
  ];

  useFrame(() => {
    if (!groupRef.current) return;
    // Drive tunnel depth from scroll
    const depth = (scrollY.current / window.innerHeight) * SPACING * 2;
    groupRef.current.position.z = (depth % SPACING);
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: ARCH_COUNT }).map((_, i) => {
        const z = -i * SPACING;
        const fade = Math.max(0.04, 0.55 - i * 0.028);
        const color = archColors[i % archColors.length];
        // Arch sits at top half (rotate so opening faces viewer)
        return (
          <group key={i} position={[0, -0.6, z]} rotation={[0, 0, 0]}>
            <TunnelArch position={[0, 0, 0]} scale={1} color={color} opacity={fade} />
            {/* Subtle side pillars */}
            <mesh position={[-2.4, -1.2, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 2.4, 8]} />
              <meshBasicMaterial color={color} transparent opacity={fade * 0.7} />
            </mesh>
            <mesh position={[2.4, -1.2, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 2.4, 8]} />
              <meshBasicMaterial color={color} transparent opacity={fade * 0.7} />
            </mesh>
          </group>
        );
      })}

      {/* Floor plane receding into depth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, -SPACING * ARCH_COUNT / 2]}>
        <planeGeometry args={[8, SPACING * ARCH_COUNT]} />
        <meshBasicMaterial
          color="#fdf5ec"
          transparent opacity={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Soft ambient particles */}
      <FloatParticles />
    </group>
  );
}

function FloatParticles() {
  const ref = useRef();
  const count = 60;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 5;
      arr[i * 3 + 2] = -Math.random() * 40;
    }
    return arr;
  }, []);
  const speeds = useMemo(() => Array.from({ length: count }, () => 0.003 + Math.random() * 0.005), []);

  useFrame(() => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 2] += speeds[i] * 4;
      if (arr[i * 3 + 2] > 2) arr[i * 3 + 2] = -40;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial
        transparent depthWrite={false} blending={THREE.AdditiveBlending}
        vertexShader={`void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=mix(2.0,5.0,clamp(-mv.z/40.0,0.0,1.0))*(200.0/-mv.z);gl_Position=projectionMatrix*mv;}`}
        fragmentShader={`void main(){vec2 u=gl_PointCoord-0.5;if(length(u)>0.5)discard;gl_FragColor=vec4(0.9,0.78,0.6,exp(-length(u)*u.y*8.0)*0.35);}`}
      />
    </points>
  );
}

/* ══════════════════════════════════════════════════════
   STICKY 3JS CANVAS (fixed behind content)
══════════════════════════════════════════════════════ */
function BackgroundCanvas({ scrollY }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0,
      background: "linear-gradient(160deg, #fdf8f2 0%, #fef3ea 40%, #f8f0fb 100%)",
    }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 62 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <TunnelScene scrollY={scrollY} />
      </Canvas>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SCROLL-REVEAL HOOK
══════════════════════════════════════════════════════ */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("visible"); }
      }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ══════════════════════════════════════════════════════
   EVENT CARD
══════════════════════════════════════════════════════ */
function EventCard({ ev, index }) {
  const isEven = index % 2 === 0;

  return (
    <div
      className="reveal"
      style={{
        transitionDelay: `${index * 0.08}s`,
        display: "flex",
        justifyContent: isEven ? "flex-start" : "flex-end",
        padding: "0 5vw",
        marginBottom: "clamp(60px, 10vh, 110px)",
      }}
    >
      <div
        className="card-inner"
        style={{
          width: "min(420px, 88vw)",
          background: ev.pastel,
          borderRadius: "24px",
          padding: "clamp(28px, 5vw, 44px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.07)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative arch echo inside card */}
        <div style={{
          position: "absolute", top: "-30px", right: "-30px",
          width: "160px", height: "160px",
          borderRadius: "50%",
          border: `2px solid ${ev.accent}18`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "-10px", right: "-10px",
          width: "100px", height: "100px",
          borderRadius: "50%",
          border: `1.5px solid ${ev.accent}25`,
          pointerEvents: "none",
        }} />

        {/* Icon */}
        <div style={{
          fontSize: "2rem",
          marginBottom: "18px",
          display: "inline-block",
          animation: "floatY 4s ease-in-out infinite",
        }}>{ev.icon}</div>

        {/* Hindi label */}
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "0.8rem",
          color: ev.accent,
          letterSpacing: "0.15em",
          marginBottom: "4px",
          opacity: 0.7,
        }}>{ev.hindi}</div>

        {/* Main title */}
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(2rem, 6vw, 2.8rem)",
          fontWeight: 300,
          color: "#2a1f14",
          letterSpacing: "0.04em",
          lineHeight: 1.1,
          marginBottom: "6px",
        }}>{ev.label}</h2>

        {/* Tagline */}
        <p style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: "0.72rem",
          fontWeight: 200,
          letterSpacing: "0.25em",
          color: ev.accent,
          textTransform: "uppercase",
          marginBottom: "20px",
        }}>{ev.tagline}</p>

        {/* Gold rule */}
        <div style={{
          width: "40px", height: "1px",
          background: `linear-gradient(to right, ${ev.accent}, transparent)`,
          marginBottom: "20px",
        }} />

        {/* Description */}
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(0.95rem, 2.5vw, 1.05rem)",
          fontWeight: 300,
          lineHeight: 1.85,
          color: "#4a3728",
          marginBottom: "28px",
        }}>{ev.desc}</p>

        {/* Date / time / venue chips */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { icon: <Calendar size={13} />, text: ev.date },
            { icon: <Clock size={13} />, text: ev.time },
            { icon: <MapPin size={13} />, text: ev.venue },
          ].map((row, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "10px",
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.8rem", fontWeight: 300,
              color: "#5a4535",
            }}>
              <span style={{ color: ev.accent, opacity: 0.8, display: "flex" }}>{row.icon}</span>
              {row.text}
            </div>
          ))}
        </div>

        {/* Bottom accent dot */}
        <div style={{
          position: "absolute", bottom: "20px", right: "24px",
          width: "8px", height: "8px", borderRadius: "50%",
          background: ev.dot, opacity: 0.5,
        }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   VENUE SECTION
══════════════════════════════════════════════════════ */
function VenueSection() {
  return (
    <div
      className="reveal"
      style={{
        padding: "0 5vw",
        marginBottom: "clamp(60px, 10vh, 110px)",
      }}
    >
      <div
        className="card-inner"
        style={{
          width: "min(860px, 92vw)",
          margin: "0 auto",
          background: "#EEF4FF",
          borderRadius: "24px",
          padding: "clamp(32px, 5vw, 52px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.07)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Deco circles */}
        <div style={{ position: "absolute", top: "-40px", left: "-40px", width: "200px", height: "200px", borderRadius: "50%", border: "1.5px solid #6a8ed422", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-20px", right: "-20px", width: "120px", height: "120px", borderRadius: "50%", border: "1.5px solid #6a8ed433", pointerEvents: "none" }} />

        <div style={{ fontSize: "1.8rem", marginBottom: "14px" }}>📍</div>

        <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", letterSpacing: "0.28em", color: "#4a6db5", textTransform: "uppercase", marginBottom: "6px" }}>The Venue</div>

        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
          fontWeight: 300, color: "#1a2a4a",
          letterSpacing: "0.04em", lineHeight: 1.15,
          marginBottom: "8px",
        }}>The Grand Estate</h2>

        <p style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: "0.72rem", fontWeight: 200, letterSpacing: "0.2em",
          color: "#4a6db5", textTransform: "uppercase", marginBottom: "20px",
        }}>A celebration befitting the moment</p>

        <div style={{ width: "40px", height: "1px", background: "linear-gradient(to right, #4a6db5, transparent)", marginBottom: "22px" }} />

        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(0.95rem, 2.5vw, 1.05rem)",
          fontWeight: 300, lineHeight: 1.85, color: "#2a3a5a",
          marginBottom: "30px", maxWidth: "560px",
        }}>
          Nestled among ancient banyan groves, The Grand Estate is where history meets festivity.
          Its pillared halls and open courtyards have witnessed a hundred weddings, and now it will
          witness yours.
        </p>

        {/* Address */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "10px",
          fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", fontWeight: 300,
          color: "#3a4a6a", marginBottom: "28px",
        }}>
          <MapPin size={15} style={{ color: "#4a6db5", marginTop: "2px", flexShrink: 0 }} />
          <span>12 Heritage Road, Old City Quarter, Kolkata — 700 001</span>
        </div>

        {/* MAP placeholder */}
        <div style={{
          width: "100%", borderRadius: "14px", overflow: "hidden",
          height: "clamp(200px, 35vw, 300px)",
          background: "linear-gradient(135deg, #dce8f5, #e8d8f5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
          border: "1px solid #4a6db520",
        }}>
          {/* Fake map grid lines */}
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.25 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={`${i * 14}%`} x2="100%" y2={`${i * 14}%`} stroke="#4a6db5" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`v${i}`} x1={`${i * 9}%`} y1="0" x2={`${i * 9}%`} y2="100%" stroke="#4a6db5" strokeWidth="0.5" />
            ))}
            {/* Diagonal accent roads */}
            <line x1="0" y1="60%" x2="45%" y2="20%" stroke="#4a6db5" strokeWidth="1.5" opacity="0.4" />
            <line x1="55%" y1="80%" x2="100%" y2="30%" stroke="#4a6db5" strokeWidth="1.5" opacity="0.4" />
          </svg>
          {/* Pin marker */}
          <div style={{
            position: "relative", zIndex: 2,
            display: "flex", flexDirection: "column", alignItems: "center",
            animation: "floatY 3s ease-in-out infinite",
          }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "50% 50% 50% 0",
              background: "#4a6db5", transform: "rotate(-45deg)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(74,109,181,0.4)",
            }}>
              <div style={{ transform: "rotate(45deg)", fontSize: "1rem" }}>📍</div>
            </div>
            <div style={{
              marginTop: "6px",
              fontFamily: "'Jost', sans-serif", fontSize: "0.65rem",
              letterSpacing: "0.15em", color: "#1a2a4a", fontWeight: 400,
              background: "rgba(255,255,255,0.85)", padding: "4px 10px",
              borderRadius: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}>THE GRAND ESTATE</div>
          </div>
        </div>

        {/* Get Directions button */}
        <a
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            marginTop: "22px",
            fontFamily: "'Jost', sans-serif", fontSize: "0.72rem",
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "#fff",
            background: "#4a6db5",
            padding: "12px 28px", borderRadius: "40px",
            textDecoration: "none",
            boxShadow: "0 4px 18px rgba(74,109,181,0.3)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(74,109,181,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 18px rgba(74,109,181,0.3)"; }}
        >
          <MapPin size={13} /> Get Directions
        </a>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION DIVIDER — floating chapter number
══════════════════════════════════════════════════════ */
function ChapterDivider({ num, label }) {
  return (
    <div className="reveal" style={{
      textAlign: "center",
      padding: "clamp(40px, 7vh, 80px) 0 clamp(30px, 5vh, 56px)",
    }}>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(4rem, 12vw, 7rem)",
        fontWeight: 300, lineHeight: 1,
        color: "transparent",
        WebkitTextStroke: "1px rgba(180,140,80,0.18)",
        letterSpacing: "0.05em",
        userSelect: "none",
      }}>{String(num).padStart(2, "0")}</div>
      <div style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: "0.62rem", fontWeight: 200,
        letterSpacing: "0.42em", textTransform: "uppercase",
        color: "#a08060", marginTop: "-8px",
      }}>{label}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════════ */
function Hero() {
  return (
    <div style={{
      height: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center",
      padding: "0 6vw",
      position: "relative",
    }}>
      {/* Eyebrow */}
      <div style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: "0.65rem", fontWeight: 200, letterSpacing: "0.45em",
        textTransform: "uppercase", color: "#c9a96e",
        marginBottom: "22px",
        animation: "fadeIn 1.5s ease both",
      }}>With joy & blessings we invite you</div>

      {/* Main names */}
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(2.6rem, 10vw, 5.5rem)",
        fontWeight: 300,
        lineHeight: 1.1,
        color: "#2a1f14",
        letterSpacing: "0.04em",
        animation: "fadeUp 1.2s ease 0.2s both",
      }}>
        Deepraj
        <br />
        <span style={{ fontStyle: "italic", color: "#8a6a40" }}>&amp;</span>
        <br />
        Gouri
      </h1>

      {/* Rule */}
      <div style={{
        width: "1px", height: "48px",
        background: "linear-gradient(to bottom, #c9a96e, transparent)",
        margin: "24px auto",
        animation: "fadeIn 1.2s ease 0.6s both",
      }} />

      {/* Date */}
      <div style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: "0.72rem", fontWeight: 200, letterSpacing: "0.35em",
        color: "#7a6a52",
        animation: "fadeIn 1.2s ease 0.8s both",
      }}>April 24 – 26, 2026</div>

      {/* Scroll hint */}
      <div style={{
        position: "absolute", bottom: "36px", left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
        animation: "fadeIn 2s ease 1.5s both",
      }}>
        <div style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: "0.52rem", letterSpacing: "0.4em",
          color: "#c9a96e", textTransform: "uppercase",
        }}>Scroll</div>
        <div style={{
          width: "1px", height: "36px",
          background: "linear-gradient(to bottom, #c9a96e, transparent)",
          animation: "floatY 2s ease-in-out infinite",
        }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function WeddingEventsPage() {
  const scrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => { scrollY.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useReveal();

  return (
    <>
      <FontLink />

      {/* Fixed 3JS tunnel background */}
      <BackgroundCanvas scrollY={scrollY} />

      {/* Scrollable foreground content */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── HERO ── */}
        <Hero />

        {/* ── CEREMONIES ── */}
        <ChapterDivider num={1} label="The Ceremonies" />

        {EVENTS.map((ev, i) => (
          <EventCard key={ev.key} ev={ev} index={i} />
        ))}

        {/* ── VENUE ── */}
        <ChapterDivider num={2} label="Where It All Happens" />

        <VenueSection />

        {/* ── FOOTER ── */}
        <footer style={{
          textAlign: "center",
          padding: "clamp(50px, 10vh, 90px) 24px clamp(40px, 8vh, 70px)",
          fontFamily: "'Cormorant Garamond', serif",
        }}>
          <div className="reveal" style={{
            fontSize: "clamp(1.4rem, 4vw, 2rem)",
            fontWeight: 300, color: "#3a2e1e",
            letterSpacing: "0.1em", marginBottom: "14px",
          }}>
            Deepraj &amp; Gouri
          </div>
          <div className="reveal" style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.65rem", fontWeight: 200,
            letterSpacing: "0.38em", color: "#c9a96e",
            textTransform: "uppercase",
          }}>
            April 26, 2026 · With love
          </div>
          <div style={{
            width: "1px", height: "48px",
            background: "linear-gradient(to bottom, #c9a96e44, transparent)",
            margin: "28px auto 0",
          }} />
        </footer>

      </div>
    </>
  );
}