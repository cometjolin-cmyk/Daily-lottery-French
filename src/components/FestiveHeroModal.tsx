import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { Volume2, VolumeX } from "lucide-react";
import { FESTIVE_CONFIGS, FestiveTheme, formatGoogleDriveUrl } from "../config/festiveConfig";

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
  const [videoError, setVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // 影片長寬比自適應 (預設為 16:9 橫式寬螢幕)
  const [aspectRatio, setAspectRatio] = useState<"16/9" | "9/16">("16/9");

  // 取得有效影片網址 (嚴格鎖定專案設定，一般訪客無法任意替換，維持神龕莊嚴)
  const [activeVideoUrl] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(`festive_video_${config.id}`);
      if (stored && !stored.startsWith("blob:") && stored.trim() !== "") {
        return stored;
      }
      return config.heroVideoUrl || "";
    } catch {
      return config.heroVideoUrl || "";
    }
  });

  const hasVideo = Boolean(activeVideoUrl && !videoError);
  const videoUrl = activeVideoUrl ? formatGoogleDriveUrl(activeVideoUrl, true) : "";

  // 確保在所有瀏覽器 (包含 iOS / Safari / Chrome) 自動啟動無聲秒播
  useEffect(() => {
    if (hasVideo && videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {
        // 瀏覽器若因策略阻擋，待首次點擊互動時自動解除
      });
    }
  }, [hasVideo, videoUrl, isMuted]);

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
        p.vy += 0.08; // 微重力下墜
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

  // B. Web Audio API 音效合成器 (模擬九環錫杖脆響與空靈頌缽深鳴)
  const playSparkleSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // 1. 九環錫杖清脆金屬微鳴 (環珮玲瓏)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const baseFreq = config.sparkleFreqBase || 587.33;
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.65, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);

      // 2. 空靈頌缽與引磬泛音 (Singing Bowl Resonance)
      const bowlOsc = ctx.createOscillator();
      const bowlGain = ctx.createGain();
      bowlOsc.type = "triangle";
      bowlOsc.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);
      bowlGain.gain.setValueAtTime(0.07, ctx.currentTime);
      bowlGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.65);

      bowlOsc.connect(bowlGain);
      bowlGain.connect(ctx.destination);
      bowlOsc.start();
      bowlOsc.stop(ctx.currentTime + 0.65);
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

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.8);
      });
    } catch {
      // Audio fallback
    }
  }, [config.celebrationChords]);

  // C. 手勢互動邏輯 (點擊 / 輕抹 / 滑動 dx/dy > 30)
  const handleInteract = (clientX: number, clientY: number) => {
    if (isBursting) return;

    spawnParticles(clientX, clientY, 35);
    playSparkleSound();

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (nextCount >= 3) {
      setIsBursting(true);
      playCelebrationChord();
      spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 140);

      setTimeout(() => {
        setIsBursting(false);
        if (onComplete) onComplete();
      }, 1300);
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
      className={`fixed inset-0 flex flex-col items-center justify-center cursor-pointer z-[99999] transition-all duration-700 animate-backdrop-fade select-none overflow-hidden ${
        hasVideo
          ? "bg-[radial-gradient(ellipse_at_center,rgba(40,24,18,0.96)_0%,rgba(16,9,8,0.99)_100%)] backdrop-blur-2xl"
          : "bg-[linear-gradient(180deg,rgba(255,253,242,0.95)_0%,rgba(249,231,179,0.95)_50%,rgba(239,206,136,0.95)_100%)] backdrop-blur-xl"
      }`}
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
        className={`absolute top-6 right-6 z-[100000] rounded-full p-2.5 transition-all shadow-lg backdrop-blur-md cursor-pointer ${
          hasVideo
            ? "text-amber-200 hover:text-amber-100 bg-stone-900/80 hover:bg-stone-800 border border-amber-600/50"
            : "text-amber-950 hover:text-amber-900 bg-white/80 hover:bg-white border border-amber-600/40"
        }`}
        title="關閉開場模組"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 初登場光芒閃耀爆發 (Light Bloom Transition) */}
      <div className="absolute w-96 h-96 sm:w-[32rem] sm:h-[32rem] rounded-full bg-gradient-to-r from-amber-200/50 via-amber-300/60 to-amber-400/40 animate-light-bloom pointer-events-none z-10" />

      {/* 主體 Portal 容器：從星光中心滑順膨脹開花 (animate-portal-scale-in) */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-2xl px-4 animate-portal-scale-in">
        {/* 1. Canvas 花火與甘露粒子繪製層 */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

        {/* 2. 背景柔光靈氣與雙層脈衝動畫 */}
        <div
          className="absolute w-72 h-72 sm:w-[32rem] sm:h-[32rem] rounded-full blur-3xl animate-pulse pointer-events-none"
          style={{ backgroundColor: config.glowColor || "rgba(245, 158, 11, 0.45)" }}
        />
        <div
          className="absolute w-64 h-64 sm:w-88 sm:h-88 rounded-full border-2 animate-hero-halo pointer-events-none"
          style={{ borderColor: config.particleColors[2] || "#D97706" }}
        />

        {/* 3. 滿 3 下慶賀爆發：衝擊波與萬道金光 */}
        {isBursting && (
          <>
            <div
              className="absolute w-72 h-72 sm:w-[28rem] sm:h-[28rem] rounded-full border-4 animate-gold-shockwave pointer-events-none z-15"
              style={{ borderColor: config.particleColors[0] || "#FEF08A" }}
            />
            <div className="absolute w-[22rem] h-[22rem] sm:w-[34rem] sm:h-[34rem] rounded-full bg-gradient-to-r from-amber-500/0 via-amber-300/70 to-amber-500/0 animate-sunburst blur-sm pointer-events-none z-10" />
          </>
        )}

        {/* 4. 主要呈現區域 (做法 B 佛龕景窗 或 靜態聖像 + 左右對聯) */}
        <div className="relative flex justify-center items-center select-none z-20 my-3">
          <div className="relative group flex items-center justify-center">
            {/* 點擊 >= 1 次時：左右對聯/裝飾帶彈簧動畫蹦出 (spring-bounce) */}
            {(clickCount >= 1 || isBursting) && (
              <>
                {config.coupletLeftUrl && (
                  <div className="absolute -left-20 sm:-left-32 md:-left-44 top-1/2 -translate-y-1/2 animate-spring-bounce-left pointer-events-none z-30">
                    <img
                      src={formatGoogleDriveUrl(config.coupletLeftUrl)}
                      alt="左側對聯/裝飾"
                      className="w-16 sm:w-24 md:w-32 h-auto object-contain filter drop-shadow-[0_10px_25px_rgba(217,119,6,0.6)] animate-unfold"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {config.coupletRightUrl && (
                  <div className="absolute -right-20 sm:-right-32 md:-right-44 top-1/2 -translate-y-1/2 animate-spring-bounce-right pointer-events-none z-30">
                    <img
                      src={formatGoogleDriveUrl(config.coupletRightUrl)}
                      alt="右側對聯/裝飾"
                      className="w-16 sm:w-24 md:w-32 h-auto object-contain filter drop-shadow-[0_10px_25px_rgba(217,119,6,0.6)] animate-unfold"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </>
            )}

            {/* 做法 B：典雅實木神龕／黑酸枝沉香景窗 (立體微縮神龕動態影片 - 支援 16:9 橫向寬螢幕與自適應) */}
            {hasVideo ? (
              <div className="relative group flex flex-col items-center justify-center">
                {/* 佛龕外層呼吸沉香光暈 (16:9 寬螢幕或 9:16 直式) */}
                <div
                  className={`absolute -inset-4 sm:-inset-6 blur-2xl opacity-75 animate-pulse pointer-events-none transition-all duration-700 ${
                    aspectRatio === "16/9"
                      ? "rounded-3xl sm:rounded-[36px]"
                      : "rounded-t-[76px] sm:rounded-t-[92px] rounded-b-[24px] sm:rounded-b-[28px]"
                  }`}
                  style={{
                    background: `radial-gradient(ellipse at center, #F59E0B 0%, rgba(180,83,9,0.45) 45%, rgba(69,26,3,0.3) 70%, transparent 85%)`,
                  }}
                />

                {/* 🌟 典雅黑酸枝／沉香木質神龕實木外框 (Wood Shrine Frame) */}
                <div
                  className={`wood-shrine-frame relative p-2 sm:p-2.5 transition-all duration-500 select-none active:scale-[0.99] ${
                    aspectRatio === "16/9"
                      ? "w-[94vw] max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl aspect-[16/9] rounded-2xl sm:rounded-3xl"
                      : "h-[55vh] max-h-[510px] sm:h-[62vh] sm:max-h-[570px] aspect-[9/16] w-auto rounded-t-[66px] sm:rounded-t-[80px] rounded-b-[20px] sm:rounded-b-[24px]"
                  } ${isBursting ? "animate-icon-burst" : ""}`}
                >
                  {/* 四角仿古銅流金雲紋護角包邊 (四個角落金屬加固飾件) */}
                  <div className="absolute top-1 left-1 w-4 sm:w-6 h-4 sm:h-6 border-t-2 border-l-2 border-amber-400/90 rounded-tl pointer-events-none z-30" />
                  <div className="absolute top-1 right-1 w-4 sm:w-6 h-4 sm:h-6 border-t-2 border-r-2 border-amber-400/90 rounded-tr pointer-events-none z-30" />
                  <div className="absolute bottom-1 left-1 w-4 sm:w-6 h-4 sm:h-6 border-b-2 border-l-2 border-amber-400/90 rounded-bl pointer-events-none z-30" />
                  <div className="absolute bottom-1 right-1 w-4 sm:w-6 h-4 sm:h-6 border-b-2 border-r-2 border-amber-400/90 rounded-br pointer-events-none z-30" />

                  {/* 實木框上的古銅金線勾邊 */}
                  <div
                    className={`absolute inset-1 border border-amber-500/40 pointer-events-none ${
                      aspectRatio === "16/9"
                        ? "rounded-xl sm:rounded-2xl"
                        : "rounded-t-[60px] sm:rounded-t-[72px] rounded-b-[14px] sm:rounded-b-[18px]"
                    }`}
                  />

                  {/* 佛龕頂部斗拱如意金牌標誌 */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-35 px-4 py-1 rounded-full bg-gradient-to-r from-stone-950 via-[#2A130B] to-stone-950 border border-amber-400/90 shadow-[0_6px_20px_rgba(0,0,0,0.85),0_0_10px_rgba(245,158,11,0.4)] backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap pointer-events-none">
                    <span className="text-amber-400 text-xs animate-pulse">🪷</span>
                    <span className="text-amber-200 font-serif text-[11px] sm:text-xs font-black tracking-widest drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                      {nameText}
                    </span>
                  </div>

                  {/* 景窗內部深凹倒角木龕聖殿 (wood-inner-bevel) */}
                  <div
                    className={`wood-inner-bevel relative w-full h-full overflow-hidden flex items-center justify-center ${
                      aspectRatio === "16/9"
                        ? "rounded-lg sm:rounded-xl"
                        : "rounded-t-[54px] sm:rounded-t-[66px] rounded-b-[12px] sm:rounded-b-[14px]"
                    }`}
                  >
                    {/* 自動循環播放 16:9 動態影片 */}
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover select-none pointer-events-none"
                      onError={() => setVideoError(true)}
                      onLoadedMetadata={(e) => {
                        const v = e.currentTarget;
                        if (v.videoHeight > v.videoWidth * 1.1) {
                          setAspectRatio("9/16");
                        } else {
                          setAspectRatio("16/9");
                        }
                      }}
                    />

                    {/* 景窗微距景深與香篆香煙漸層遮罩 (柔化邊緣，烘托木龕深邃感) */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-stone-950/85 via-transparent to-stone-950/30" />
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_24px_rgba(0,0,0,0.85)]" />

                    {/* 底部木龕古銅銘牌細紋 */}
                    <div className="absolute bottom-2.5 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent pointer-events-none" />
                    <div className="absolute bottom-1 inset-x-0 text-center pointer-events-none">
                      <span className="text-[10px] sm:text-xs text-amber-200/90 font-serif tracking-[0.25em] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                        慈光普照 ‧ 大願不空
                      </span>
                    </div>

                    {/* 右上角：音量開關 (放大圓形按鈕，僅保留純圖示) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted((prev) => !prev);
                        if (videoRef.current) {
                          videoRef.current.muted = !isMuted;
                        }
                      }}
                      className="absolute top-3 right-3 z-35 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-stone-950/90 hover:bg-stone-900 border-2 border-amber-400/80 hover:border-amber-300 text-amber-200 shadow-[0_4px_16px_rgba(0,0,0,0.85),0_0_12px_rgba(245,158,11,0.3)] backdrop-blur-md transition-all flex items-center justify-center cursor-pointer active:scale-90"
                      title={isMuted ? "開啟聲音" : "靜音"}
                      aria-label={isMuted ? "開啟聲音" : "靜音"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-stone-400 hover:text-amber-200 transition-colors" />
                      ) : (
                        <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 animate-pulse" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 滿 3 下集福完成顯示的吉祥話 (置頂或聖像下方) */}
                {isBursting && blessingText && config.blessingPosition !== "bottom" && (
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap animate-pulse z-40 ${
                      config.blessingPosition === "top"
                        ? "-top-14 sm:-top-16"
                        : "-bottom-14 sm:-bottom-16"
                    }`}
                  >
                    <span className="text-amber-950 font-serif text-base sm:text-xl md:text-2xl font-black drop-shadow-[0_2px_12px_rgba(255,255,255,0.95)] bg-amber-100/95 border-2 border-amber-500/80 px-5 py-1.5 rounded-full shadow-2xl">
                      {blessingText}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* 原有靜態靈氣聖像或蓮花圖示 */
              <>
                {config.heroIconUrl && !hasError ? (
                  <img
                    src={formatGoogleDriveUrl(config.heroIconUrl)}
                    alt={config.name}
                    onError={() => setHasError(true)}
                    className={`w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain transition-transform duration-300 active:scale-95 filter drop-shadow-[0_12px_36px_rgba(180,83,9,0.65)] ${
                      isBursting ? "animate-icon-burst" : "animate-pulse-glow"
                    }`}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`text-amber-800 ${isBursting ? "animate-icon-burst" : "animate-pulse-glow"}`}>
                    <svg className="w-48 h-48 sm:w-64 sm:h-64" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C11.5 4 9.5 6 7 6C4.5 6 2.5 4 2 2C2 7 6 11 12 11C18 11 22 7 22 2C21.5 4 19.5 6 17 6C14.5 6 12.5 4 12 2Z" />
                      <path d="M12 12C8 12 4 14.5 4 18C4 20 7.5 22 12 22C16.5 22 20 20 20 18C20 14.5 16 12 12 12Z" opacity="0.85" />
                    </svg>
                  </div>
                )}

                {/* 滿 3 下集福完成顯示的吉祥話 */}
                {isBursting && blessingText && config.blessingPosition !== "bottom" && (
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap animate-pulse z-30 ${
                      config.blessingPosition === "top"
                        ? "-top-10 sm:-top-14"
                        : "-bottom-10 sm:-bottom-12"
                    }`}
                  >
                    <span className="text-amber-950 font-serif text-base sm:text-xl md:text-2xl font-black drop-shadow-[0_2px_12px_rgba(255,255,255,0.95)] bg-amber-100/95 border border-amber-500/70 px-4 py-1 rounded-full shadow-lg">
                      {blessingText}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 5. 節日主題標題 + 提示文案與 3 階段進度指示器 */}
        <div className="mt-3 flex flex-col items-center gap-3 z-20">
          {!hasVideo && (
            <div className="text-amber-950 text-lg sm:text-2xl md:text-3xl font-black tracking-widest bg-amber-100/95 border-2 border-amber-600/50 px-6 py-2.5 rounded-full backdrop-blur-md shadow-md text-center">
              {nameText}
            </div>
          )}

          {/* 互動集福按鈕與引導文案 */}
          <div
            className={`px-8 py-3.5 rounded-2xl border text-lg sm:text-xl md:text-2xl font-black tracking-wide backdrop-blur-md transition-all duration-300 text-center whitespace-pre-line ${
              isBursting
                ? "bg-amber-600 text-amber-950 border-amber-400 shadow-[0_0_35px_rgba(239,206,136,0.95)] scale-105"
                : hasVideo
                  ? "bg-stone-900/90 border-amber-500/80 text-amber-200 shadow-[0_6px_25px_rgba(217,119,6,0.45)] animate-bounce"
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
                    ? "bg-amber-400 shadow-[0_0_14px_#F59E0B] scale-125"
                    : hasVideo
                      ? "bg-stone-800/80 border border-amber-600/40"
                      : "bg-amber-950/20 border border-amber-800/40"
                }`}
              />
            ))}
          </div>

          {/* 滿 3 下集福完成顯示的吉祥話 (bottom 視窗底部位置) */}
          {isBursting && blessingText && config.blessingPosition === "bottom" && (
            <div className="mt-2 whitespace-nowrap animate-pulse z-30">
              <span className="text-amber-950 font-serif text-base sm:text-xl md:text-2xl font-black drop-shadow-[0_2px_12px_rgba(255,255,255,0.95)] bg-amber-100/95 border border-amber-500/70 px-4 py-1 rounded-full shadow-lg">
                {blessingText}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

