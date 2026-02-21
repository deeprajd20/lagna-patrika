"use client";
import { Environment } from "@react-three/drei";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MapPin, Clock, Calendar } from "lucide-react";

/* ══════════════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════════════ */
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@200;300;400;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #fdf8f2; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(32px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes floatY {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-8px); }
    }
    @keyframes preloaderPulse {
      0%,100% { opacity: 0.5; transform: scale(0.97); }
      50%      { opacity: 1;   transform: scale(1.03); }
    }
    .reveal {
      opacity: 0; transform: translateY(40px);
      transition: opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1);
    }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .card-inner {
      transition: transform 0.6s cubic-bezier(0.22,1,0.36,1), box-shadow 0.6s ease;
    }
    .card-inner:hover {
      transform: translateY(-6px) scale(1.01);
      box-shadow: 0 24px 60px rgba(0,0,0,0.12) !important;
    }

    /* ── HALDI: marigold petals drift down ── */
    @keyframes haldi-petal {
      0%   { transform: translateY(-10px) rotate(0deg) scale(0.6); opacity: 0; }
      10%  { opacity: 1; }
      80%  { opacity: 0.8; }
      100% { transform: translateY(320px) rotate(360deg) scale(0.9); opacity: 0; }
    }

    /* ── SANGEET: sparkles pop upward ── */
    @keyframes sangeet-sparkle {
      0%   { transform: scale(0) translateY(0px);    opacity: 0; }
      20%  { transform: scale(1.3) translateY(-10px); opacity: 1; }
      80%  { transform: scale(0.8) translateY(-40px); opacity: 0.7; }
      100% { transform: scale(0) translateY(-65px);  opacity: 0; }
    }

    /* ── SAPTAPADI: embers float up ── */
    @keyframes saptapadi-ember {
      0%   { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0; }
      10%  { opacity: 1; }
      60%  { opacity: 0.9; }
      100% { transform: translateY(-280px) scale(0.3) rotate(180deg); opacity: 0; }
    }

    /* ── VARMALA: petals rain diagonally ── */
    @keyframes varmala-petal {
      0%   { transform: translateY(-10px) translateX(0px) rotate(0deg); opacity: 0; }
      10%  { opacity: 1; }
      85%  { opacity: 0.7; }
      100% { transform: translateY(350px) translateX(60px) rotate(270deg); opacity: 0; }
    }
  `}</style>
);

/* ══════════════════════════════════════════════════════
   PRELOADER
══════════════════════════════════════════════════════ */
function Preloader({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 14;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => { setHiding(true); setTimeout(onDone, 700); }, 350);
      }
      setProgress(Math.min(p, 100));
    }, 80);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999, background: "#fdf8f2",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "32px",
      transition: "opacity 0.7s ease", opacity: hiding ? 0 : 1, pointerEvents: hiding ? "none" : "all",
    }}>
      {/* <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 8vw, 3.5rem)", fontWeight: 300, color: "#2a1f14", letterSpacing: "0.08em", animation: "preloaderPulse 2s ease-in-out infinite", textAlign: "center", lineHeight: 1.3 }}>
        Deepraj<br />
        <span style={{ fontStyle: "italic", color: "#8a6a40", fontSize: "0.55em", letterSpacing: "0.25em" }}>&amp;</span><br />
        Gouri
      </div> */}
      <div style={{ width: "180px", height: "1px", background: "#e8d8c0", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(to right, #c9a96e, #d4a017)", transition: "width 0.1s ease", borderRadius: "2px" }} />
      </div>
      {/* <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.6rem", letterSpacing: "0.4em", color: "#c9a96e", textTransform: "uppercase", fontWeight: 300 }}>April 24 – 26, 2026</div> */}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   EVENT DATA
══════════════════════════════════════════════════════ */
const EVENTS = [
  {
    key: "haldi",
    label: "Haldi",
    hindi: "हल्दी",
    tagline: "Golden beginnings",
    desc: "Where turmeric meets tradition — a morning of laughter, blessings, and the warm glow of marigolds as family gathers to anoint the couple with love.",
    date: "April 25, 2026",
    time: "11:00 AM onwards",
    pastel: "#FFF3C4",
    accent: "#D4A017",
    dot: "#e6b800",
    icon: "🌼",
  },
  {
    key: "sangeet",
    label: "Sangeet",
    hindi: "संगीत",
    tagline: "An evening of music & soul",
    desc: "Families come alive — through song, dance, and stories. The night hums with nostalgia, joy, and performances that will be talked about for years.",
    date: "April 25, 2026",
    time: "7:00 PM onwards",
    pastel: "#F0E6FF",
    accent: "#8B5CF6",
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
    time: "07:00 AM onwards",
    pastel: "#FFE8E8",
    accent: "#C0394B",
    dot: "#e05060",
    icon: "🔥",
  },
  {
    key: "varmala",
    label: "Varmala",
    hindi: "वरमाला",
    tagline: "The auspicious moment",
    desc: "As the stars align and the priest recites ancient mantras, two families become one. The most sacred and still moment of the entire celebration.",
    date: "April 26, 2026",
    time: "12:37 PM ",
    pastel: "#E8F5E9",
    accent: "#2E7D52",
    dot: "#3d9e6a",
    icon: "✨",
  },
];

/* ══════════════════════════════════════════════════════
   THREE.JS BACKGROUND
══════════════════════════════════════════════════════ */
function Heart({ position, velocity, scale }) {
  const ref = useRef();
  const shape = useMemo(() => {
    const heart = new THREE.Shape();
    heart.moveTo(0, 1);
    heart.bezierCurveTo(0, 1.8, -1.2, 1.8, -1.2, 0.8);
    heart.bezierCurveTo(-1.2, 0, 0, -0.6, 0, -0.9);
    heart.bezierCurveTo(0, -0.6, 1.2, 0, 1.2, 0.8);
    heart.bezierCurveTo(1.2, 1.8, 0, 1.8, 0, 1);
    return heart;
  }, []);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.x += velocity[0];
    ref.current.position.y += velocity[1];
    ref.current.position.z += velocity[2];
    ref.current.rotation.y += 0.003;
    ref.current.rotation.x = 0; ref.current.rotation.z = 0;
    const limit = 9;
    ["x", "y", "z"].forEach(a => {
      if (ref.current.position[a] > limit) ref.current.position[a] = -limit;
      if (ref.current.position[a] < -limit) ref.current.position[a] = limit;
    });
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <extrudeGeometry args={[shape, { depth: 0.4, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08 }]} />
      <meshPhysicalMaterial color="#ff4d4d" roughness={0} transmission={0.8} thickness={0.6} transparent opacity={0.35} metalness={0} reflectivity={0.8} clearcoat={0.6} clearcoatRoughness={0} ior={1.5} />
    </mesh>
  );
}
function TunnelScene() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)); }, []);
  const COUNT = 40;
  const hearts = useMemo(() => Array.from({ length: COUNT }).map(() => ({
    position: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14],
    velocity: [(Math.random() - 0.5) * 0.015, (Math.random() - 0.5) * 0.015, (Math.random() - 0.5) * 0.015],
    scale: 0.18 + Math.random() * 0.3,
  })), [COUNT]);
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <Environment preset="studio" />
      {hearts.map((h, i) => <Heart key={i} {...h} />)}
    </>
  );
}
function BackgroundCanvas() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "#fdf8f2" }}>
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 6], fov: 50 }} gl={{ powerPreference: "high-performance", antialias: false }}>
        <TunnelScene />
      </Canvas>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════ */
function useReveal() {
  useEffect(() => {
    const t = setTimeout(() => {
      const els = document.querySelectorAll(".reveal");
      const obs = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
        { threshold: 0.1 }
      );
      els.forEach(el => obs.observe(el));
    }, 100);
    return () => clearTimeout(t);
  }, []);
}

/* ══════════════════════════════════════════════════════
   PARTICLE EFFECTS — one component per event type
══════════════════════════════════════════════════════ */

/* HALDI — golden turmeric powder + marigold petals drift & shimmer */
function HaldiParticles() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    setItems(Array.from({ length: 22 }).map((_, i) => {
      const isPetal = i < 10;
      return {
        id: i,
        isPetal,
        left: `${5 + Math.random() * 90}%`,
        top: `-${5 + Math.random() * 30}px`,
        size: isPetal ? 10 + Math.random() * 10 : 4 + Math.random() * 6,
        delay: `${(Math.random() * 4).toFixed(2)}s`,
        duration: `${(3 + Math.random() * 3).toFixed(2)}s`,
        rotate: Math.random() * 360,
        // petals are orange/gold, powder puffs are yellow
        color: isPetal
          ? ["#f5a623", "#e8850a", "#ffc845", "#ff8c00"][Math.floor(Math.random() * 4)]
          : ["#FFD700", "#FFC200", "#ffe066", "#fff0a0"][Math.floor(Math.random() * 4)],
      };
    }));
  }, []);

  return (
    <>
      {items.map(d => (
        <div key={d.id} style={{
          position: "absolute",
          left: d.left,
          top: d.top,
          width: `${d.size}px`,
          height: d.isPetal ? `${d.size * 1.6}px` : `${d.size}px`,
          background: d.isPetal
            ? `radial-gradient(ellipse at 40% 30%, ${d.color} 0%, ${d.color}aa 60%, transparent 100%)`
            : `radial-gradient(circle, ${d.color} 0%, ${d.color}88 50%, transparent 100%)`,
          borderRadius: d.isPetal ? "50% 50% 50% 50% / 60% 60% 40% 40%" : "50%",
          boxShadow: `0 0 ${d.size}px ${d.color}88`,
          pointerEvents: "none",
          zIndex: 5,
          animation: `haldi-petal ${d.duration} ${d.delay} ease-in infinite`,
          transform: `rotate(${d.rotate}deg)`,
        }} />
      ))}
    </>
  );
}

/* SANGEET — colourful music note sparkles + glitter */
function SangeetParticles() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const colors = ["#ffffff", "#e0c8ff", "#ffd6fa", "#ffe599", "#c084fc", "#f9a8d4", "#a5f3fc", "#86efac"];
    setItems(Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${5 + Math.random() * 90}%`,
      top: `${10 + Math.random() * 85}%`,
      size: 5 + Math.random() * 9,
      delay: `${(Math.random() * 4).toFixed(2)}s`,
      duration: `${(1.4 + Math.random() * 2).toFixed(2)}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
      // some are star shapes via clip-path
      isStar: i < 8,
    })));
  }, []);

  return (
    <>
      {items.map(d => (
        <div key={d.id} style={{
          position: "absolute",
          left: d.left,
          top: d.top,
          width: `${d.size}px`,
          height: `${d.size}px`,
          background: d.color,
          clipPath: d.isStar
            ? "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)"
            : undefined,
          borderRadius: d.isStar ? "0" : "50%",
          boxShadow: `0 0 ${d.size * 1.5}px ${d.color}, 0 0 ${d.size * 3}px ${d.color}80`,
          pointerEvents: "none",
          zIndex: 5,
          animation: `sangeet-sparkle ${d.duration} ${d.delay} ease-in-out infinite`,
        }} />
      ))}
    </>
  );
}

/* SAPTAPADI — fire embers & sparks drift upward */
function SaptapadiParticles() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    setItems(Array.from({ length: 20 }).map((_, i) => {
      const isLargeEmber = i < 6;
      return {
        id: i,
        left: `${15 + Math.random() * 70}%`,
        bottom: `${5 + Math.random() * 30}%`,
        size: isLargeEmber ? 8 + Math.random() * 8 : 3 + Math.random() * 5,
        delay: `${(Math.random() * 3).toFixed(2)}s`,
        duration: `${(2 + Math.random() * 2.5).toFixed(2)}s`,
        color: ["#FF6B00", "#FF4500", "#FF8C00", "#FFD700", "#FF2200", "#ffaa00"][Math.floor(Math.random() * 6)],
        wobble: (Math.random() - 0.5) * 30,
      };
    }));
  }, []);

  return (
    <>
      {items.map(d => (
        <div key={d.id} style={{
          position: "absolute",
          left: d.left,
          bottom: d.bottom,
          width: `${d.size}px`,
          height: `${d.size * 1.5}px`,
          background: `radial-gradient(ellipse at 50% 70%, ${d.color} 0%, ${d.color}cc 40%, transparent 100%)`,
          borderRadius: "50% 50% 40% 40%",
          boxShadow: `0 0 ${d.size * 2}px ${d.color}, 0 0 ${d.size * 4}px ${d.color}60`,
          pointerEvents: "none",
          zIndex: 5,
          animation: `saptapadi-ember ${d.duration} ${d.delay} ease-out infinite`,
          filter: "blur(0.4px)",
        }} />
      ))}
    </>
  );
}

/* VARMALA — rose petals + flower confetti fall */
function VarmalaParticles() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    setItems(Array.from({ length: 22 }).map((_, i) => {
      const isPetal = i < 14;
      return {
        id: i,
        isPetal,
        left: `${Math.random() * 100}%`,
        top: `-${10 + Math.random() * 40}px`,
        size: isPetal ? 8 + Math.random() * 12 : 5 + Math.random() * 7,
        delay: `${(Math.random() * 5).toFixed(2)}s`,
        duration: `${(3.5 + Math.random() * 3).toFixed(2)}s`,
        rotate: Math.random() * 360,
        color: isPetal
          ? ["#ff6b9d", "#ff8fab", "#ffb3c6", "#ffc8dd", "#ff4d79", "#e91e8c"][Math.floor(Math.random() * 6)]
          : ["#86efac", "#4ade80", "#fde047", "#fb923c", "#c084fc"][Math.floor(Math.random() * 5)],
      };
    }));
  }, []);

  return (
    <>
      {items.map(d => (
        <div key={d.id} style={{
          position: "absolute",
          left: d.left,
          top: d.top,
          width: `${d.size}px`,
          height: d.isPetal ? `${d.size * 1.8}px` : `${d.size}px`,
          background: d.isPetal
            ? `radial-gradient(ellipse at 40% 20%, ${d.color}ff 0%, ${d.color}bb 50%, transparent 100%)`
            : d.color,
          borderRadius: d.isPetal ? "50% 50% 50% 50% / 70% 70% 30% 30%" : "30%",
          boxShadow: d.isPetal ? `0 2px 8px ${d.color}60` : "none",
          pointerEvents: "none",
          zIndex: 5,
          animation: `varmala-petal ${d.duration} ${d.delay} ease-in infinite`,
          transform: `rotate(${d.rotate}deg)`,
        }} />
      ))}
    </>
  );
}

/* Map event key → particle component */
function CardParticles({ eventKey }) {
  switch (eventKey) {
    case "haldi": return <HaldiParticles />;
    case "sangeet": return <SangeetParticles />;
    case "saptapadi": return <SaptapadiParticles />;
    case "varmala": return <VarmalaParticles />;
    default: return null;
  }
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
        marginBottom: "clamp(60px, 10vh, 120px)",
        position: "relative",
      }}
    >
      <div
        className="card-inner"
        style={{
          width: "min(420px, 88vw)",
          background: ev.pastel,
          borderRadius: "24px",
          padding: "clamp(28px, 5vw, 44px)",
          boxShadow: `0 8px 36px ${ev.dot}44, 0 2px 12px rgba(0,0,0,0.06)`,
          position: "relative",
          overflow: "visible",   // lets particles escape card boundary
        }}
      >
        {/* Decorative rings */}
        <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "160px", height: "160px", borderRadius: "50%", border: `2px solid ${ev.accent}22`, pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", top: "-10px", right: "-10px", width: "100px", height: "100px", borderRadius: "50%", border: `1.5px solid ${ev.accent}30`, pointerEvents: "none", zIndex: 0 }} />

        {/* ✨ Themed particles — rendered client-side only */}
        <CardParticles eventKey={ev.key} />

        {/* All content above particles */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: "2rem", marginBottom: "18px", display: "inline-block", animation: "floatY 4s ease-in-out infinite" }}>{ev.icon}</div>

          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: ev.accent, letterSpacing: "0.15em", marginBottom: "4px", opacity: 0.75 }}>{ev.hindi}</div>

          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 6vw, 2.8rem)", fontWeight: 300, color: "#2a1f14", letterSpacing: "0.04em", lineHeight: 1.1, marginBottom: "6px" }}>{ev.label}</h2>

          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.25em", color: ev.accent, textTransform: "uppercase", marginBottom: "20px" }}>{ev.tagline}</p>

          <div style={{ width: "40px", height: "1px", background: `linear-gradient(to right, ${ev.accent}, transparent)`, marginBottom: "20px" }} />

          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(0.95rem, 2.5vw, 1.05rem)", fontWeight: 300, lineHeight: 1.85, color: "#4a3728", marginBottom: "28px" }}>{ev.desc}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[{ icon: <Calendar size={13} />, text: ev.date }, { icon: <Clock size={13} />, text: ev.time }].map((row, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "'Jost', sans-serif", fontSize: "0.8rem", fontWeight: 300, color: "#5a4535" }}>
                <span style={{ color: ev.accent, opacity: 0.8, display: "flex" }}>{row.icon}</span>
                {row.text}
              </div>
            ))}
          </div>

          <div style={{ position: "absolute", bottom: "-8px", right: "0px", width: "8px", height: "8px", borderRadius: "50%", background: ev.dot, opacity: 0.5 }} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   VENUE
══════════════════════════════════════════════════════ */
function VenueSection() {
  return (
    <div className="reveal" style={{ padding: "0 5vw", marginBottom: "clamp(60px, 10vh, 110px)" }}>
      <div className="card-inner" style={{ width: "min(860px, 92vw)", margin: "0 auto", background: "#EEF4FF", borderRadius: "24px", padding: "clamp(32px, 5vw, 52px)", boxShadow: "0 8px 32px rgba(0,0,0,0.07)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-40px", left: "-40px", width: "200px", height: "200px", borderRadius: "50%", border: "1.5px solid #6a8ed422", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-20px", right: "-20px", width: "120px", height: "120px", borderRadius: "50%", border: "1.5px solid #6a8ed433", pointerEvents: "none" }} />

        <div style={{ fontSize: "1.8rem", marginBottom: "14px" }}>📍</div>
        <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", letterSpacing: "0.28em", color: "#4a6db5", textTransform: "uppercase", marginBottom: "6px" }}>The Venue</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 5vw, 2.6rem)", fontWeight: 300, color: "#1a2a4a", letterSpacing: "0.04em", lineHeight: 1.15, marginBottom: "8px" }}>Sherbaug A Theme Park & Resort</h2>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", fontWeight: 200, letterSpacing: "0.2em", color: "#4a6db5", textTransform: "uppercase", marginBottom: "20px" }}>A celebration befitting the moment</p>
        <div style={{ width: "40px", height: "1px", background: "linear-gradient(to right, #4a6db5, transparent)", marginBottom: "22px" }} />
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(0.95rem, 2.5vw, 1.05rem)", fontWeight: 300, lineHeight: 1.85, color: "#2a3a5a", marginBottom: "30px", maxWidth: "560px" }}>
          Nestled among ancient banyan groves, The Grand Estate is where history meets festivity. Its pillared halls and open courtyards have witnessed a hundred weddings, and now it will witness yours.
        </p>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", fontWeight: 300, color: "#3a4a6a", marginBottom: "28px" }}>
          <MapPin size={15} style={{ color: "#4a6db5", marginTop: "2px", flexShrink: 0 }} />
          <span>Wai-Panchgani Rd, Dhandeghar, Panchgani, Maharashtra 412805</span>
        </div>

        <div style={{ width: "100%", borderRadius: "14px", overflow: "hidden", height: "clamp(200px, 35vw, 300px)", background: "linear-gradient(135deg, #dce8f5, #e8d8f5)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", border: "1px solid #4a6db520" }}>
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.25 }}>
            {Array.from({ length: 8 }).map((_, i) => <line key={`h${i}`} x1="0" y1={`${i * 14}%`} x2="100%" y2={`${i * 14}%`} stroke="#4a6db5" strokeWidth="0.5" />)}
            {Array.from({ length: 12 }).map((_, i) => <line key={`v${i}`} x1={`${i * 9}%`} y1="0" x2={`${i * 9}%`} y2="100%" stroke="#4a6db5" strokeWidth="0.5" />)}
            <line x1="0" y1="60%" x2="45%" y2="20%" stroke="#4a6db5" strokeWidth="1.5" opacity="0.4" />
            <line x1="55%" y1="80%" x2="100%" y2="30%" stroke="#4a6db5" strokeWidth="1.5" opacity="0.4" />
          </svg>
          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", animation: "floatY 3s ease-in-out infinite" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50% 50% 50% 0", background: "#4a6db5", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(74,109,181,0.4)" }}>
              <div style={{ transform: "rotate(45deg)", fontSize: "1rem" }}>📍</div>
            </div>
            <div style={{ marginTop: "6px", fontFamily: "'Jost', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", color: "#1a2a4a", fontWeight: 400, background: "rgba(255,255,255,0.85)", padding: "4px 10px", borderRadius: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>Sherbaug A Theme Park & Resort</div>
          </div>
        </div>

        <a href="https://maps.app.goo.gl/VDoCPqc8wDdu4dej9" target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "22px", fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#fff", background: "#4a6db5", padding: "12px 28px", borderRadius: "40px", textDecoration: "none", boxShadow: "0 4px 18px rgba(74,109,181,0.3)", transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
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
   DIVIDER & HERO
══════════════════════════════════════════════════════ */
function ChapterDivider({ label }) {
  return (
    <div className="reveal" style={{ textAlign: "center", padding: "clamp(40px, 7vh, 80px) 0 clamp(30px, 5vh, 56px)" }}>
      <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.42em", textTransform: "uppercase", color: "#a08060" }}>{label}</div>
    </div>
  );
}

function Hero() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 6vw", position: "relative" }}>
      <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.65rem", letterSpacing: "0.30em", fontWeight: 700, textTransform: "uppercase", color: "#c9a96e", marginBottom: "22px", animation: "fadeIn 1.5s ease both" }}>With joy and blessings we invite you to celebrate the wedding of</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.6rem, 10vw, 5.5rem)", fontWeight: 300, lineHeight: 1.1, color: "#2a1f14", letterSpacing: "0.04em", animation: "fadeUp 1.2s ease 0.2s both" }}>
        Deepraj<br />
        <span style={{ fontStyle: "italic", color: "#8a6a40" }}>&amp;</span><br />
        Gouri
      </h1>
      <div style={{ width: "1px", height: "48px", background: "linear-gradient(to bottom, #c9a96e, transparent)", margin: "24px auto", animation: "fadeIn 1.2s ease 0.6s both" }} />
      <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.35em", color: "#7a6a52", animation: "fadeIn 1.2s ease 0.8s both" }}>April 25 – 26, 2026</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function WeddingEventsPage() {
  const [ready, setReady] = useState(false);
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
      {!ready && <Preloader onDone={() => setReady(true)} />}

      <div style={{ opacity: ready ? 1 : 0, transition: "opacity 0.8s ease", pointerEvents: ready ? "all" : "none" }}>
        <BackgroundCanvas />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Hero />
          <ChapterDivider label="The Ceremonies" />
          {EVENTS.map((ev, i) => <EventCard key={ev.key} ev={ev} index={i} />)}
          <ChapterDivider label="Where It All Happens" />
          <VenueSection />
          <footer style={{ textAlign: "center", padding: "clamp(50px, 10vh, 90px) 24px clamp(40px, 8vh, 70px)", fontFamily: "'Cormorant Garamond', serif" }}>
            <div className="reveal" style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 300, color: "#3a2e1e", letterSpacing: "0.1em", marginBottom: "14px" }}>Deepraj &amp; Gouri</div>
            <div className="reveal" style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.65rem", fontWeight: 200, letterSpacing: "0.38em", color: "#c9a96e", textTransform: "uppercase" }}>April 26, 2026 · With love</div>
            <div style={{ width: "1px", height: "48px", background: "linear-gradient(to bottom, #c9a96e44, transparent)", margin: "28px auto 0" }} />
          </footer>
        </div>
      </div>
    </>
  );
}