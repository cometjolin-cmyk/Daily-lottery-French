import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { FESTIVE_CONFIGS, FestiveTheme } from "../config/festiveConfig";

export interface FestiveHeroModalProps {
  festiveKey?: string;
  lang?: "zh" | "en" | "fil";
  customConfig?: Partial<FestiveTheme>;
  onComplete?: () => void;
  onClose?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export const FestiveHeroModal: React.FC<FestiveHeroModalProps> = ({
  festiveKey = "guanyinEnlightenment",
  lang = "zh",
  customConfig,
  onComplete,
  onClose,
}) => {
  const baseConfig = FESTIVE_CONFIGS[festiveKey] || FESTIVE_CONFIGS.guanyinEnlightenment;
  const config: FestiveTheme = { ...baseConfig, ...customConfig };

  const getLocalizedText = (
    zhText: string,
    enText?: string,
    filText?: string
  ) => {
    if (lang === "en" && enText) return enText;
    if (lang === "fil" && filText) return filText;
    return zhText;
  };

  const nameText = getLocalizedText(config.name, config.nameEn, config.nameFil);
  const promptInitialText = getLocalizedText(config.promptInitial, config.promptInitialEn, config.promptInitialFil);
  const promptSuccessText = getLocalizedText(config.promptSuccess, config.promptSuccessEn, config.promptSuccessFil);
  const blessingText = getLocalizedText(config.blessingText || "", config.blessingTextEn, config.blessingTextFil);

  const [clickCount, setClickCount] = useState(0);
  const [isBursting, setIsBursting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // A. Canvas 物理粒子系統 (點擊與爆炸觸發)
  const spawnParticles = useCallback(
    (cx: number, cy: number, count = 25) => {
      const colors = config.particleColors;
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        newParticles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          size: Math.random() * 4 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          life: 0,
          maxLife: Math.random() * 45 + 30,
        });
      }

      particlesRef.current = [...particlesRef.current, ...newParticles];
    },
    [config.particleColors]
  );

  // 常態中央自動飄散向上微光粒子 (Ambient Aura Particles)
  const spawnAmbientParticle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2 + (Math.random() - 0.5) * 220;
    const cy = canvas.height / 2 + (Math.random() - 0.5) * 220;
    const colors = config.particleColors;
    particlesRef.current.push({
      x: cx,
      y: cy,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -Math.random() * 1.8 - 0.5,
      size: Math.random() * 3 + 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.8,
      life: 0,
      maxLife: Math.random() * 60 + 40,
    });
  }, [config.particleColors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let frame = 0;
    const render = () => {
      frame++;
      if (frame % 3 === 0) {
        spawnAmbientParticle();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // 微重力下墜 (vy += 0.08)
        p.life += 1;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return p.life < p.maxLife;
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [spawnAmbientParticle]);

  // B. Web Audio API 音效合成器 (零外部 MP3 依賴)
  const playSparkleSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      const baseFreq = config.sparkleFreqBase || 987.77;
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio fallback
    }
  }, [config.sparkleFreqBase]);

  const playCelebrationChord = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const chords = config.celebrationChords || [523.25, 659.25, 783.99, 1046.5];

      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.6);
      });
    } catch {
      // Audio fallback
    }
  }, [config.celebrationChords]);

  // C. 手勢互動邏輯 (點擊 / 輕抹 / 滑動 dx/dy > 30)
  const handleInteract = (clientX: number, clientY: number) => {
    if (isBursting) return;

    spawnParticles(clientX, clientY, 30);
    playSparkleSound();

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (nextCount >= 3) {
      setIsBursting(true);
      playCelebrationChord();
      spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 130);

      setTimeout(() => {
        setIsBursting(false);
        if (onComplete) onComplete();
      }, 1200);
    }
  };

  const modalContent = (
    <div
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        handleInteract(e.clientX, e.clientY);
      }}
      onTouchStart={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        if (e.touches.length > 0) {
          const t = e.touches[0];
          touchStartRef.current = { x: t.clientX, y: t.clientY };
          handleInteract(t.clientX, t.clientY);
        }
      }}
      onTouchMove={(e) => {
        if (e.touches.length > 0 && touchStartRef.current) {
          const t = e.touches[0];
          const dx = Math.abs(t.clientX - touchStartRef.current.x);
          const dy = Math.abs(t.clientY - touchStartRef.current.y);
          if (dx > 30 || dy > 30) {
            touchStartRef.current = { x: t.clientX, y: t.clientY };
            handleInteract(t.clientX, t.clientY);
          }
        }
      }}
      className="fixed inset-0 flex flex-col items-center justify-center cursor-pointer z-[99999] transition-all duration-700 animate-backdrop-fade bg-[linear-gradient(180deg,rgba(255,253,242,0.95)_0%,rgba(249,231,179,0.95)_50%,rgba(239,206,136,0.95)_100%)] backdrop-blur-xl select-none overflow-hidden"
      title={config.promptInitial}
    >
      {/* 關閉按鈕 */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onClose) onClose();
          else if (onComplete) onComplete();
        }}
        className="absolute top-6 right-6 z-[100000] text-amber-950 hover:text-amber-900 bg-white/80 hover:bg-white border border-amber-600/40 hover:border-amber-700 rounded-full p-2.5 transition-all shadow-lg backdrop-blur-md cursor-pointer"
        title="關閉開場模組"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 初登場光芒閃耀爆發 (Light Bloom Transition) */}
      <div className="absolute w-96 h-96 sm:w-[32rem] sm:h-[32rem] rounded-full bg-gradient-to-r from-amber-200/60 via-amber-300/70 to-amber-400/50 animate-light-bloom pointer-events-none z-10" />

      {/* 主體 Portal 容器：從星光中心滑順膨脹開花 (animate-portal-scale-in) */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-2xl px-4 animate-portal-scale-in">
        {/* 1. Canvas 花火與甘露粒子繪製層 */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

        {/* 2. 背景柔光靈氣與雙層脈衝動畫 */}
        <div
          className="absolute w-72 h-72 sm:w-[32rem] sm:h-[32rem] rounded-full blur-3xl animate-pulse pointer-events-none"
          style={{ backgroundColor: config.glowColor || "rgba(245, 158, 11, 0.4)" }}
        />
        <div
          className="absolute w-64 h-64 sm:w-88 sm:h-88 rounded-full border-2 animate-hero-halo pointer-events-none"
          style={{ borderColor: config.particleColors[2] || "#D97706" }}
        />

        {/* 3. 滿 3 下慶賀爆發：衝擊波與萬道金光 */}
        {isBursting && (
          <>
            <div
              className="absolute w-72 h-72 sm:w-[26rem] sm:h-[26rem] rounded-full border-4 animate-gold-shockwave pointer-events-none z-15"
              style={{ borderColor: config.particleColors[0] || "#FEF08A" }}
            />
            <div className="absolute w-[22rem] h-[22rem] sm:w-[32rem] sm:h-[32rem] rounded-full bg-gradient-to-r from-amber-500/0 via-amber-300/60 to-amber-500/0 animate-sunburst blur-sm pointer-events-none z-10" />
          </>
        )}

        {/* 4. 主要呈現區域 (主題圖示 + 左右對聯) */}
        <div className="relative flex justify-center items-center select-none z-20 my-4">
          <div className="relative group flex items-center justify-center">
            {/* 點擊 >= 1 次時：左右對聯/裝飾帶彈簧動畫蹦出 (spring-bounce) */}
            {(clickCount >= 1 || isBursting) && (
              <>
                {config.coupletLeftUrl && (
                  <div className="absolute -left-20 sm:-left-32 md:-left-44 top-1/2 -translate-y-1/2 animate-spring-bounce-left pointer-events-none z-30">
                    <img
                      src={config.coupletLeftUrl}
                      alt="左側對聯/裝飾"
                      className="w-16 sm:w-24 md:w-32 h-auto object-contain filter drop-shadow-[0_10px_25px_rgba(217,119,6,0.6)] animate-unfold"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
                  </div>
                )}

                {config.coupletRightUrl && (
                  <div className="absolute -right-20 sm:-right-32 md:-right-44 top-1/2 -translate-y-1/2 animate-spring-bounce-right pointer-events-none z-30">
                    <img
                      src={config.coupletRightUrl}
                      alt="右側對聯/裝飾"
                      className="w-16 sm:w-24 md:w-32 h-auto object-contain filter drop-shadow-[0_10px_25px_rgba(217,119,6,0.6)] animate-unfold"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
                  </div>
                )}
              </>
            )}

            {/* 中央靈氣主題圖示 */}
            {!hasError ? (
              <img
                src={config.heroIconUrl}
                alt={config.name}
                onError={() => setHasError(true)}
                className={`w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain transition-transform duration-300 active:scale-95 filter drop-shadow-[0_12px_36px_rgba(180,83,9,0.65)] ${
                  isBursting ? "animate-icon-burst" : "animate-pulse-glow"
                }`}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
            ) : (
              <div className={`text-amber-800 ${isBursting ? "animate-icon-burst" : "animate-pulse-glow"}`}>
                <svg className="w-48 h-48 sm:w-64 sm:h-64" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C11.5 4 9.5 6 7 6C4.5 6 2.5 4 2 2C2 7 6 11 12 11C18 11 22 7 22 2C21.5 4 19.5 6 17 6C14.5 6 12.5 4 12 2Z" />
                  <path d="M12 12C8 12 4 14.5 4 18C4 20 7.5 22 12 22C16.5 22 20 20 20 18C20 14.5 16 12 12 12Z" opacity="0.85" />
                </svg>
              </div>
            )}

            {/* 滿 3 下集福完成顯示的吉祥話 (如有設定) */}
            {isBursting && blessingText && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap animate-pulse z-30">
                <span className="text-amber-950 font-serif text-lg sm:text-xl md:text-2xl font-black drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)]">
                  {blessingText}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 5. 節日主題標題 + 提示文案與 3 階段進度指示器 */}
        <div className="mt-4 flex flex-col items-center gap-3 z-20">
          <div className="text-amber-950 text-lg sm:text-2xl md:text-3xl font-black tracking-widest bg-amber-100/95 border-2 border-amber-600/50 px-6 py-2.5 rounded-full backdrop-blur-md shadow-md text-center">
            {nameText}
          </div>

          <div
            className={`px-8 py-3.5 rounded-2xl border text-lg sm:text-xl md:text-2xl font-black tracking-wide backdrop-blur-md transition-all duration-300 text-center whitespace-pre-line ${
              isBursting
                ? "bg-amber-600 text-amber-950 border-amber-400 shadow-[0_0_35px_rgba(239,206,136,0.95)] scale-105"
                : "bg-amber-950/90 border-amber-500/80 text-amber-50 shadow-[0_4px_20px_rgba(180,83,9,0.35)] animate-bounce"
            }`}
          >
            {isBursting ? promptSuccessText : `${promptInitialText} (${clickCount}/3)`}
          </div>

          {/* 進度指標 (1/3, 2/3, 3/3) */}
          <div className="flex gap-3 items-center mt-1">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  clickCount >= step || isBursting
                    ? "bg-amber-800 shadow-[0_0_12px_#92400E] scale-125"
                    : "bg-amber-950/20 border border-amber-800/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
