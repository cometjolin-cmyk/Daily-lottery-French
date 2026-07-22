import React, { useEffect, useRef, useCallback } from "react";

interface ParticleNebulaCanvasProps {
  isMuted: boolean;
  onStartExtraction: () => void;
  animState: "idle" | "condensing" | "ascending";
  onAscensionComplete: () => void;
  lang: "zh" | "en" | "fil";
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  origR: number;
  theta: number;
  phi: number;
  size: number;
  color: string;
  glowColor: string;
  type: "pink" | "gold" | "white";
  jitterSeed: number;
}

interface LotusRipple {
  r: number;
  maxR: number;
  opacity: number;
  lineWidth: number;
}

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

export const ParticleNebulaCanvas: React.FC<ParticleNebulaCanvasProps> = ({
  isMuted,
  onStartExtraction,
  animState,
  onAscensionComplete,
  lang,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic animation state references
  const stateRef = useRef<{
    animState: "idle" | "condensing" | "ascending";
    rotX: number;
    rotY: number;
    condenseProgress: number; // 0 -> 1
    ascendProgress: number; // 0 -> 1
    time: number;
    particles: Particle3D[];
    ripples: LotusRipple[];
    sparkles: Sparkle[];
  }>({
    animState: "idle",
    rotX: 0,
    rotY: 0,
    condenseProgress: 0,
    ascendProgress: 0,
    time: 0,
    particles: [],
    ripples: [],
    sparkles: [],
  });

  // Sync prop state to Ref
  useEffect(() => {
    stateRef.current.animState = animState;
    if (animState === "idle") {
      stateRef.current.condenseProgress = 0;
      stateRef.current.ascendProgress = 0;
    }
  }, [animState]);

  // Web Audio API - Deep Resonant Singing Bowl Sound (頌缽聲 / 磬聲)
  const playSingingBowlSound = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      // Authentic singing bowl harmonics (432Hz scale base)
      const partials = [
        { freq: 216, gain: 0.35, decay: 3.5 },
        { freq: 432, gain: 0.28, decay: 3.0 },
        { freq: 576, gain: 0.18, decay: 2.4 },
        { freq: 864, gain: 0.12, decay: 1.8 },
        { freq: 1296, gain: 0.08, decay: 1.2 },
      ];

      // Subtle vibrato LFO (5.2 Hz gentle pulsation)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 5.2;
      lfoGain.gain.value = 6.0;
      lfo.start(now);

      partials.forEach((p) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(p.freq, now);
        lfo.connect(osc.frequency);

        // Smooth attack & long exponential decay
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(p.gain, now + 0.06);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + p.decay + 0.1);
      });
    } catch (err) {
      console.warn("Singing bowl audio warning:", err);
    }
  }, [isMuted]);

  // Initialize 280 3D Sphere Particles
  useEffect(() => {
    const particleCount = 280;
    const baseRadius = 95; // Sphere radius in px
    const pList: Particle3D[] = [];

    const pinkColors = ["#FFB6C1", "#FFA899", "#FF99AC", "#FFC4BA"];
    const goldColors = ["#E2C792", "#FFD700", "#F3E5AB", "#F5E6C8"];
    const whiteColors = ["#FFFFFF", "#FFFDFD", "#FDFBF7"];

    for (let i = 0; i < particleCount; i++) {
      // Golden ratio spherical distribution
      const theta = Math.acos(1 - (2 * (i + 0.5)) / particleCount);
      const phi = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = baseRadius * Math.pow(Math.random(), 0.33);

      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);

      const colorRand = Math.random();
      let type: "pink" | "gold" | "white" = "gold";
      let color = goldColors[Math.floor(Math.random() * goldColors.length)];
      let glowColor = "rgba(226, 199, 146, 0.8)";

      if (colorRand < 0.45) {
        type = "pink";
        color = pinkColors[Math.floor(Math.random() * pinkColors.length)];
        glowColor = "rgba(255, 168, 153, 0.8)";
      } else if (colorRand > 0.8) {
        type = "white";
        color = whiteColors[Math.floor(Math.random() * whiteColors.length)];
        glowColor = "rgba(255, 255, 255, 0.9)";
      }

      pList.push({
        x,
        y,
        z,
        origR: r,
        theta,
        phi,
        size: 1.8 + Math.random() * 2.2,
        color,
        glowColor,
        type,
        jitterSeed: Math.random() * 100,
      });
    }

    stateRef.current.particles = pList;
  }, []);

  // Click Handler - Phase 1 Condensation
  const handleClick = (e?: React.MouseEvent) => {
    if (stateRef.current.animState !== "idle") return;

    // Trigger singing bowl sound
    playSingingBowlSound();

    // Trigger Lotus Ripple & Sparkle burst
    stateRef.current.ripples.push({
      r: 10,
      maxR: 130,
      opacity: 0.9,
      lineWidth: 3,
    });
    stateRef.current.ripples.push({
      r: 5,
      maxR: 90,
      opacity: 0.7,
      lineWidth: 2,
    });

    const sparkles: Sparkle[] = [];
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4.5;
      sparkles.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.5 ? "#FFD700" : "#FFC4BA",
      });
    }
    stateRef.current.sparkles = sparkles;

    // Start extraction trigger
    onStartExtraction();
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const state = stateRef.current;
      state.time += 0.016;
      const centerX = width / 2;
      const centerY = height / 2 - 10; // Slightly suspended above pedestal

      // Camera 3D perspective setup
      const fov = 320;

      // Update rotation angles
      if (state.animState === "idle") {
        state.rotY += 0.005;
        state.rotX += 0.002;
      } else if (state.animState === "condensing") {
        state.rotY += 0.035; // Accelerate rotation on condensation
        state.rotX += 0.015;
        state.condenseProgress = Math.min(1, state.condenseProgress + 0.018);
      } else if (state.animState === "ascending") {
        state.ascendProgress = Math.min(1, state.ascendProgress + 0.022);
      }

      const cosY = Math.cos(state.rotY);
      const sinY = Math.sin(state.rotY);
      const cosX = Math.cos(state.rotX);
      const sinX = Math.sin(state.rotX);

      // Breathing scale rhythm in idle phase
      const breathe =
        state.animState === "idle"
          ? 1 + 0.04 * Math.sin(state.time * 2.2)
          : 1;

      // Calculate radius multiplier for condensation
      let radiusMult = breathe;
      if (state.animState === "condensing") {
        // Cubic ease in to shrink toward origin
        const easeCondense = Math.pow(state.condenseProgress, 2.5);
        radiusMult = breathe * (1 - easeCondense * 0.96);
      } else if (state.animState === "ascending") {
        radiusMult = 0.04; // Fully condensed core
      }

      // Draw subtle ambient lotus pedestal ring below sphere
      if (state.animState !== "ascending" || state.ascendProgress < 0.8) {
        ctx.save();
        ctx.translate(centerX, centerY + 115);
        ctx.scale(1, 0.3);
        ctx.beginPath();
        ctx.arc(0, 0, 90, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(226, 199, 146, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 110, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(212, 163, 115, 0.15)";
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.restore();
      }

      // Render Lotus Ripples
      state.ripples.forEach((rp, idx) => {
        rp.r += 3.5;
        rp.opacity -= 0.02;
        if (rp.opacity > 0) {
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.scale(1, 0.45);
          ctx.beginPath();
          ctx.arc(0, 0, rp.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 215, 0, ${rp.opacity})`;
          ctx.lineWidth = rp.lineWidth;
          ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.restore();
        }
      });
      state.ripples = state.ripples.filter((rp) => rp.opacity > 0);

      // Render Sparkles
      state.sparkles.forEach((sp) => {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.96;
        sp.vy *= 0.96;
        sp.alpha -= 0.025;

        if (sp.alpha > 0) {
          ctx.save();
          ctx.fillStyle = sp.color;
          ctx.globalAlpha = sp.alpha;
          ctx.beginPath();
          ctx.arc(centerX + sp.x, centerY + sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
      state.sparkles = state.sparkles.filter((sp) => sp.alpha > 0);

      // Project & Sort 3D Particles
      const projected = state.particles.map((p) => {
        // Apply jitter
        const jitter =
          state.animState === "idle"
            ? Math.sin(state.time * 3 + p.jitterSeed) * 1.5
            : 0;

        const curR = p.origR * radiusMult;

        let px = curR * Math.sin(p.theta) * Math.cos(p.phi) + jitter;
        let py = curR * Math.sin(p.theta) * Math.sin(p.phi) + jitter;
        let pz = curR * Math.cos(p.theta);

        // 3D Rotations
        // Rotate Y
        let x1 = px * cosY - pz * sinY;
        let z1 = px * sinY + pz * cosY;
        // Rotate X
        let y2 = py * cosX - z1 * sinX;
        let z2 = py * sinX + z1 * cosX;

        const scale = fov / (fov + z2);
        const screenX = centerX + x1 * scale;
        const screenY = centerY + y2 * scale;
        const alpha = Math.max(0.15, Math.min(1, (z2 + 130) / 260));

        return {
          p,
          screenX,
          screenY,
          scale,
          alpha,
          z2,
        };
      });

      // Sort by Z for depth rendering
      projected.sort((a, b) => a.z2 - b.z2);

      // Draw particle constellation connections in idle mode
      if (state.animState === "idle") {
        ctx.strokeStyle = "rgba(226, 199, 146, 0.08)";
        ctx.lineWidth = 0.8;
        for (let i = 0; i < projected.length; i += 4) {
          for (let j = i + 1; j < projected.length && j < i + 12; j += 3) {
            const dx = projected[i].screenX - projected[j].screenX;
            const dy = projected[i].screenY - projected[j].screenY;
            const distSq = dx * dx + dy * dy;
            if (distSq < 1200) {
              ctx.beginPath();
              ctx.moveTo(projected[i].screenX, projected[i].screenY);
              ctx.lineTo(projected[j].screenX, projected[j].screenY);
              ctx.stroke();
            }
          }
        }
      }

      // Draw Particles
      projected.forEach((pt) => {
        const drawSize = Math.max(0.8, pt.p.size * pt.scale);
        const finalAlpha =
          state.animState === "condensing"
            ? Math.min(1, pt.alpha + state.condenseProgress * 0.5)
            : pt.alpha;

        ctx.save();
        ctx.globalAlpha = finalAlpha;

        // Glow aura
        const gradient = ctx.createRadialGradient(
          pt.screenX,
          pt.screenY,
          0,
          pt.screenX,
          pt.screenY,
          drawSize * 2.8
        );
        gradient.addColorStop(0, pt.p.color);
        gradient.addColorStop(0.5, pt.p.glowColor);
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pt.screenX, pt.screenY, drawSize * 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Bright Core
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(pt.screenX, pt.screenY, drawSize * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Phase 2: Central Super-Radiant Platinum-Gold Fusion Energy Core (極致耀眼白金光核)
      if (state.animState === "condensing" && state.condenseProgress > 0.4) {
        const coreAlpha = Math.min(1, (state.condenseProgress - 0.4) / 0.5);
        ctx.save();
        ctx.translate(centerX, centerY);

        // Use 'lighter' (additive blending) for ultra-intense celestial light fusion
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = coreAlpha;

        // Layer 1: Massive Outer Golden Aura Flare
        const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 75);
        outerGlow.addColorStop(0, "rgba(255, 255, 255, 1)");
        outerGlow.addColorStop(0.2, "rgba(255, 235, 170, 0.95)");
        outerGlow.addColorStop(0.5, "rgba(255, 190, 110, 0.7)");
        outerGlow.addColorStop(0.8, "rgba(255, 140, 100, 0.3)");
        outerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 75, 0, Math.PI * 2);
        ctx.fill();

        // Layer 2: Core Brilliant Platinum Fusion Center
        const innerCore = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
        innerCore.addColorStop(0, "rgba(255, 255, 255, 1)");
        innerCore.addColorStop(0.3, "rgba(255, 250, 220, 1)");
        innerCore.addColorStop(0.7, "rgba(255, 215, 0, 0.9)");
        innerCore.addColorStop(1, "rgba(255, 160, 80, 0)");

        ctx.fillStyle = innerCore;
        ctx.shadowColor = "#FFFFFF";
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();

        // Layer 3: Ultra-Bright Pure Diamond White Point
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 35;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        // Layer 4: Four Cross Lens Flare Rays (十字神光)
        const rayLen = 55 * coreAlpha;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-rayLen, 0);
        ctx.lineTo(rayLen, 0);
        ctx.moveTo(0, -rayLen);
        ctx.lineTo(0, rayLen);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 224, 130, 0.6)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-rayLen * 0.6, -rayLen * 0.6);
        ctx.lineTo(rayLen * 0.6, rayLen * 0.6);
        ctx.moveTo(rayLen * 0.6, -rayLen * 0.6);
        ctx.lineTo(-rayLen * 0.6, rayLen * 0.6);
        ctx.stroke();

        ctx.restore();
      }

      // Phase 2: Ascension Trajectory Flying Scroll Core
      if (state.animState === "ascending") {
        const ascendY = centerY - state.ascendProgress * 170;
        const scaleVal = 1 + state.ascendProgress * 1.2;

        ctx.save();
        ctx.translate(centerX, ascendY);

        // Flying golden aura trail
        const trailGlow = ctx.createRadialGradient(
          0,
          20,
          0,
          0,
          20,
          40 * scaleVal
        );
        trailGlow.addColorStop(0, "rgba(255, 215, 0, 0.8)");
        trailGlow.addColorStop(0.6, "rgba(255, 168, 153, 0.4)");
        trailGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = trailGlow;
        ctx.beginPath();
        ctx.arc(0, 20, 40 * scaleVal, 0, Math.PI * 2);
        ctx.fill();

        // Entity Scroll representation
        ctx.rotate((state.ascendProgress * Math.PI * 4) % (Math.PI * 2));
        ctx.fillStyle = "linear-gradient(to right, #FFD2CC, #FFA899)";

        // Golden halo ring around scroll
        ctx.beginPath();
        ctx.arc(0, 0, 22 * scaleVal, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 215, 0, 0.9)";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 15;
        ctx.stroke();

        ctx.restore();

        // Trigger reveal when ascension is finished
        if (state.ascendProgress >= 0.98) {
          onAscensionComplete();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [onAscensionComplete]);

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none">
      {/* 3D Particle Nebula Canvas Stage */}
      <div
        className="relative w-80 h-80 flex items-center justify-center cursor-pointer group"
        onClick={handleClick}
        title={
          lang === "zh"
            ? "輕點心靈星雲，凝聚能量抽取法語"
            : lang === "fil"
            ? "Pindutin ang Nebulang Diwa"
            : "Tap the Mind Nebula to draw Dharma Wisdom"
        }
      >
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="w-80 h-80 pointer-events-auto transition-transform duration-500 group-hover:scale-105"
        />

        {/* Outer ambient glow aura behind canvas */}
        <div className="absolute inset-8 rounded-full bg-gradient-to-r from-amber-500/15 via-rose-400/15 to-yellow-300/15 blur-2xl pointer-events-none z-0 group-hover:from-amber-500/25 group-hover:to-rose-400/25 transition-all duration-500"></div>
      </div>

      {/* Senior-Friendly Eye-Safe Hint Block */}
      <div
        className="mt-2 z-20 cursor-pointer transition-transform duration-300 active:scale-95"
        onClick={handleClick}
      >
        <div
          className="px-6 py-3 rounded-full shadow-2xl backdrop-blur-md flex items-center justify-center gap-2 border border-[#E2C792]/70"
          style={{
            background: "rgba(43, 29, 29, 0.7)",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.45)",
          }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping shrink-0"></span>
          <p className="text-lg sm:text-xl md:text-[20px] font-serif font-extrabold text-[#F5E6C8] tracking-wider text-center leading-relaxed">
            {animState === "idle" ? (
              lang === "zh" ? (
                "👉 輕點點點星光，抽取今日星雲法語"
              ) : lang === "fil" ? (
                "👉 I-tap ang mga liwanag para kumuha ng gabay sa araw na ito"
              ) : (
                "👉 Tap the glowing lights to receive today's Dharma word"
              )
            ) : animState === "condensing" ? (
              lang === "zh" ? (
                "✨ 誠心祈福中，為您凝聚智慧..."
              ) : lang === "fil" ? (
                "✨ Nag-iipon ng magagandang kaisipan at karunungan..."
              ) : (
                "✨ Gathering good thoughts and wisdom..."
              )
            ) : (
              lang === "zh" ? (
                "🌸 靈感降臨，正在為您打開法語..."
              ) : lang === "fil" ? (
                "🌸 Nagbubukas na ang iyong espesyal na gabay..."
              ) : (
                "🌸 Your wisdom message is opening..."
              )
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
