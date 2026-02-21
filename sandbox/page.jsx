"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Heart, Calendar, MapPin, Mail, Phone, Instagram, Menu, X } from "lucide-react";
import FlipClockCountdown from '@leenguyen/react-flip-clock-countdown';
import '@leenguyen/react-flip-clock-countdown/dist/index.css';
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

/* ─── BOKEH DUST PARTICLES ─────────────────────────────────── */
function DustParticles({ count = 120 }) {
  const ref = useRef();
  const { positions, speeds, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
      speeds[i] = 0.08 + Math.random() * 0.15;
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, phases };
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      // Gentle float upward, wrap around
      arr[i * 3 + 1] += speeds[i] * 0.004;
      arr[i * 3] += Math.sin(t * 0.3 + phases[i]) * 0.001;
      if (arr[i * 3 + 1] > 5) arr[i * 3 + 1] = -5;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = mix(2.0, 6.0, (position.z + 4.0) / 8.0) * (300.0 / -mv.z);
            gl_Position  = projectionMatrix * mv;
          }
        `}
        fragmentShader={`
          void main() {
            vec2  uv   = gl_PointCoord - 0.5;
            float d    = length(uv);
            if (d > 0.5) discard;
            float a    = exp(-d * d * 10.0) * 0.5;
            gl_FragColor = vec4(0.95, 0.88, 0.75, a);
          }
        `}
      />
    </points>
  );
}

/* ─── GLOWING RING ──────────────────────────────────────────── */
function GlowRing({ radius = 2.2, tube = 0.018, color = "#c9a96e", speed = 0.18, tiltX = 0.4, tiltZ = 0.2, phase = 0 }) {
  const ref = useRef();
  const mat = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * speed + phase;
    // Pulse glow
    if (mat.current) mat.current.opacity = 0.55 + Math.sin(t * 1.4 + phase) * 0.2;
  });
  return (
    <mesh ref={ref} rotation={[tiltX, 0, tiltZ]}>
      <torusGeometry args={[radius, tube, 16, 120]} />
      <meshBasicMaterial ref={mat} color={color} transparent opacity={0.6} />
    </mesh>
  );
}

/* ─── OUTER GLOW HALO (flat billboard sprite) ───────────────── */
function Halo({ radius = 2.6, color = "#b8860b", opacity = 0.12 }) {
  return (
    <mesh>
      <ringGeometry args={[radius - 0.3, radius + 0.3, 80]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

/* ─── PHOTO CARD ─────────────────────────────────────────────── */
function PhotoCard({ imageSrc }) {
  const ref = useRef();
  const glowRef = useRef();
  const texture = useLoader(TextureLoader, imageSrc);

  // Card aspect — portrait
  const W = 2.2, H = 3.1;

  useFrame(({ clock, mouse }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    // Gentle float
    ref.current.position.y = Math.sin(t * 0.5) * 0.12;
    // Subtle mouse parallax tilt
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, mouse.x * 0.18, 0.05);
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -mouse.y * 0.1, 0.05);
    // Glow pulse
    if (glowRef.current) glowRef.current.material.opacity = 0.08 + Math.sin(t * 0.8) * 0.03;
  });

  return (
    <group ref={ref}>
      {/* Photo plane */}
      <mesh>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {/* Thin gold border frame */}
      {[
        [0, H / 2, 0, W + 0.04, 0.025, 0.01],
        [0, -H / 2, 0, W + 0.04, 0.025, 0.01],
        [-W / 2, 0, 0, 0.025, H, 0.01],
        [W / 2, 0, 0, 0.025, H, 0.01],
      ].map(([x, y, z, bw, bh, bd], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[bw, bh, bd]} />
          <meshBasicMaterial color="#d4af6a" />
        </mesh>
      ))}

      {/* Soft glow bloom behind card */}
      <mesh ref={glowRef} position={[0, 0, -0.05]}>
        <planeGeometry args={[W + 1.2, H + 1.2]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={`
            varying vec2 vUv;
            void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
          `}
          fragmentShader={`
            varying vec2 vUv;
            uniform float opacity;
            void main() {
              vec2  c = vUv - 0.5;
              float d = length(c) * 2.0;
              float a = exp(-d * d * 2.5) * opacity;
              gl_FragColor = vec4(0.85, 0.72, 0.4, a);
            }
          `}
          uniforms={{ opacity: { value: 0.1 } }}
        />
      </mesh>
    </group>
  );
}

/* ─── AMBIENT GLOW SPHERE (background orb like Hatom) ──────── */
function AmbientOrb() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.material.opacity = 0.04 + Math.sin(t * 0.4) * 0.015;
  });
  return (
    <mesh ref={ref} position={[0, 0, -3]}>
      <sphereGeometry args={[4, 32, 32]} />
      <meshBasicMaterial color="#8a6a2a" transparent opacity={0.05} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

/* ─── FULL 3D SCENE ─────────────────────────────────────────── */
function Scene({ imageSrc }) {
  return (
    <>
      <AmbientOrb />
      <DustParticles count={150} />

      {/* Three rings at different tilts and speeds — like orbiting halos */}
      <GlowRing radius={2.5} tube={0.016} color="#d4af6a" speed={0.22} tiltX={0.5} tiltZ={0.1} phase={0} />
      <GlowRing radius={2.8} tube={0.012} color="#c9a96e" speed={-0.14} tiltX={1.1} tiltZ={0.6} phase={2} />
      <GlowRing radius={2.3} tube={0.010} color="#e8d5a3" speed={0.10} tiltX={0.2} tiltZ={1.3} phase={4} />

      <Halo radius={2.65} color="#c8a030" opacity={0.10} />

      <PhotoCard imageSrc={imageSrc} />
    </>
  );
}

/* ─── LOADING SCREEN ────────────────────────────────────────── */
function LoadingScreen({ progress }) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 10,
      background: "#060606",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      transition: "opacity 0.8s ease",
      opacity: progress >= 100 ? 0 : 1,
      pointerEvents: progress >= 100 ? "none" : "all",
    }}>
      <div style={{ color: "#d4af6a", fontSize: "0.75rem", letterSpacing: "0.3em", marginBottom: "24px" }}>
        LOADING
      </div>
      <div style={{ width: "140px", height: "1px", background: "#222", position: "relative" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "1px",
          background: "linear-gradient(to right, #d4af6a, #fff8e1)",
          width: `${progress}%`, transition: "width 0.3s ease"
        }} />
      </div>
      <div style={{ color: "#555", fontSize: "0.65rem", letterSpacing: "0.2em", marginTop: "16px" }}>
        {progress}%
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─────────────────────────────────────────────── */
export default function WeddingWebsiteMobile() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const weddingDate = new Date("April 26, 2026 12:37:00").getTime();

  // Fake cinematic loading progress
  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18;
      if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => setLoaded(true), 800); }
      setProgress(Math.floor(p));
    }, 160);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ fontFamily: "'Georgia', serif", color: "#2c2c2c", background: "#fff" }}>

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, width: "100%", zIndex: 100,
        background: loaded ? "rgba(6,6,6,0.7)" : "transparent",
        backdropFilter: loaded ? "blur(12px)" : "none",
        padding: "16px 20px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
        transition: "background 1s ease",
      }}>
        <span style={{ fontSize: "1rem", letterSpacing: "0.2em", fontWeight: "400", color: "#d4af6a" }}>
          DEEPRAJ & GOURI
        </span>
        <button onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", color: "#d4af6a", cursor: "pointer" }}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {menuOpen && (
        <div style={{
          position: "fixed", top: "56px", left: 0, right: 0, zIndex: 99,
          background: "rgba(6,6,6,0.95)", backdropFilter: "blur(16px)",
          padding: "20px 0", borderBottom: "1px solid #d4af6a22"
        }}>
          {["Home", "Story", "Details", "Gallery", "RSVP"].map(item => (
            <div key={item} onClick={() => setMenuOpen(false)} style={{
              padding: "14px 30px", fontSize: "0.85rem",
              letterSpacing: "0.2em", cursor: "pointer", color: "#ccc",
              borderBottom: "1px solid #ffffff08"
            }}>{item}</div>
          ))}
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ height: "100vh", position: "relative", overflow: "hidden", background: "#060606" }}>

        <LoadingScreen progress={progress} />

        <Canvas
          style={{ position: "absolute", inset: 0 }}
          camera={{ position: [0, 0, 5.5], fov: 55 }}
          gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        >
          <Scene imageSrc="/hero_img.jpeg" />
        </Canvas>

        {/* Radial vignette overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 30%, #060606 100%)"
        }} />

        {/* Bottom text */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "0 24px 44px",
          display: "flex", flexDirection: "column", alignItems: "center",
          pointerEvents: "none",
        }}>
          <div style={{
            width: "40px", height: "1px",
            background: "linear-gradient(to right, transparent, #d4af6a, transparent)",
            marginBottom: "14px"
          }} />
          <h1 style={{
            fontSize: "1.2rem", fontWeight: "300", letterSpacing: "0.3em",
            textAlign: "center", color: "#f0e6d0", lineHeight: 1.6, margin: 0
          }}>
            DEEPRAJ weds GOURI
          </h1>
          <p style={{
            fontSize: "0.72rem", color: "#d4af6a",
            letterSpacing: "0.25em", marginTop: "10px",
          }}>
            APRIL 26, 2026
          </p>
          <div style={{
            width: "40px", height: "1px",
            background: "linear-gradient(to right, transparent, #d4af6a, transparent)",
            marginTop: "14px"
          }} />
        </div>
      </section>

      {/* ── COUNTDOWN ── */}
      <section style={{ padding: "70px 20px", textAlign: "center", background: "#0c0c0c" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.3em", color: "#d4af6a", marginBottom: "32px" }}>
          COUNTING DOWN TO FOREVER
        </p>
        <FlipClockCountdown
          to={weddingDate}
          labels={['DAYS', 'HOURS', 'MINUTES', 'SECONDS']}
          labelStyle={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', color: '#666' }}
          digitBlockStyle={{ width: 32, height: 62, fontSize: 32, background: '#111', color: '#d4af6a', borderRadius: 4 }}
          dividerStyle={{ color: '#333', height: 1 }}
          separatorStyle={{ color: '#d4af6a44', size: '6px' }}
          duration={0.5}
        />
      </section>

      {/* ── STORY ── */}
      <section style={{ padding: "80px 28px", background: "#080808" }}>
        <p style={{ fontSize: "0.65rem", letterSpacing: "0.3em", color: "#d4af6a", textAlign: "center", marginBottom: "20px" }}>
          OUR STORY
        </p>
        <h2 style={{
          fontSize: "1.6rem", fontWeight: "300", letterSpacing: "0.1em",
          textAlign: "center", marginBottom: "24px", color: "#f0e6d0"
        }}>
          Our Love Story
        </h2>
        <p style={{
          fontSize: "0.95rem", lineHeight: 2, color: "#888",
          textAlign: "center", maxWidth: "480px", margin: "0 auto"
        }}>
          He's collecting pinecones, she's collecting seashells... and somewhere in between,
          they found each other. A story written in laughter, late nights, and a thousand
          small moments that meant everything.
        </p>
      </section>

      {/* ── DETAILS ── */}
      <section style={{ padding: "80px 28px", background: "#060606" }}>
        <p style={{ fontSize: "0.65rem", letterSpacing: "0.3em", color: "#d4af6a", textAlign: "center", marginBottom: "40px" }}>
          THE DAY
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "380px", margin: "0 auto" }}>
          {[
            { title: "Ceremony", icon: <Calendar size={18} color="#d4af6a" />, content: "April 26, 2026 • 12:37 PM" },
            { title: "Location", icon: <MapPin size={18} color="#d4af6a" />, content: "The Grand Estate" }
          ].map((item, i) => (
            <div key={i} style={{
              background: "#0f0f0f", borderRadius: "8px", padding: "22px 24px",
              border: "1px solid #d4af6a22",
              display: "flex", alignItems: "flex-start", gap: "16px"
            }}>
              <div style={{ marginTop: "2px" }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight: "400", fontSize: "0.7rem", marginBottom: "6px", letterSpacing: "0.2em", color: "#d4af6a" }}>
                  {item.title.toUpperCase()}
                </div>
                <div style={{ color: "#999", fontSize: "0.9rem" }}>{item.content}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#040404", padding: "60px 24px", textAlign: "center", borderTop: "1px solid #d4af6a22" }}>
        <div style={{ fontSize: "0.75rem", letterSpacing: "0.3em", color: "#d4af6a", marginBottom: "28px" }}>
          DEEPRAJ & GOURI
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
          {[
            { icon: <Mail size={14} />, text: "contact@kissandbliss.com" },
            { icon: <Phone size={14} />, text: "+1 555 123 4567" },
            { icon: <Instagram size={14} />, text: "@kissandbliss" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555", fontSize: "0.82rem" }}>
              <span style={{ color: "#d4af6a44" }}>{item.icon}</span> {item.text}
            </div>
          ))}
        </div>
        <div style={{ marginTop: "36px", color: "#333", fontSize: "0.65rem", letterSpacing: "0.15em" }}>
          MADE WITH ♥ FOR OUR SPECIAL DAY
        </div>
      </footer>

    </div>
  );
}