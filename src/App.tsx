/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Chit } from "./types";
import { DEFAULT_CHITS } from "./data";

interface ScrollData {
  id: number;
  x: number;
  y: number;
  rotate: number;
  colorType: 'pink' | 'white';
  scale: number;
}

// 佛陀圖案裝飾 SVG 組件
const BuddhaIcon = () => (
  <svg 
    className="w-10 h-10 text-amber-300 drop-shadow-[0_2px_5px_rgba(212,163,115,0.6)] opacity-70 hover:opacity-100 transition-opacity" 
    viewBox="0 0 64 64" 
    fill="currentColor"
  >
    <circle cx="32" cy="16" r="5" className="opacity-40" />
    <path d="M32,11c1.2,0,1.8-0.8,1.8-1.2s-0.4-0.8-1.8-0.8s-1.8,0.4-1.8,0.8S30.8,11,32,11z" />
    <circle cx="32" cy="15" r="3.5" />
    <rect x="30.5" y="18.5" width="3" height="2" rx="0.5" />
    <path d="M32,21c-4,0-7.5,2.2-8.5,5.2c-0.4,1.3-0.2,2.6,0.4,3.5c0.8,1.3,2.2,1.8,3.5,2.2c2.2,0.7,2.6,1.3,2.6,2.6v1.8h4V34.5c0-1.3,0.4-1.9,2.6-2.6c1.3-0.4,2.6-0.9,3.5-2.2c0.6-0.9,0.9-2.2,0.4-3.5C39.5,23.2,36,21,32,21z" />
    <path d="M32,34c-1.8,0-3,0.4-3.8,1c-0.4,0.3-0.3,1,0.2,1.2C29,36.5,30.2,37,32,37s3-0.5,3.6-0.8c0.5-0.3,0.6-0.9,0.2-1.2C35,34.4,33.8,34,32,34z" />
    <path d="M21,37.5c-1.3,0-2.1,0.9-1.7,2.2c0.8,2.6,4.2,4.8,11.8,4.8s11-2.2,11.8-4.8c0.4-1.3-0.4-2.2-1.7-2.2c-2.6,0-4.2,1.8-10.1,1.8s-7.5-1.8-10.1-1.8z" />
    <path d="M16,42.5c0,0,0.8,3,5,3.4c1.7,0.2,3.4-0.4,5-0.8c1.7,0.4,3.4,0.8,5,0.8s3.4-0.4,5-0.8c1.7,0.4,3.4,1,5,0.8c4.2-0.4,5-3.4,5-3.4s-2.5,1.7-10,1.7c-3.4,0-5-0.8-10-0.8s-6.7,0.8-10,0.8C18.5,44.2,16,42.5,16,42.5z" />
  </svg>
);

export default function App() {
  const [chits] = useState<Chit[]>(DEFAULT_CHITS);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [luckyScrollFlying, setLuckyScrollFlying] = useState<boolean>(false);
  const [luckyScrollColor, setLuckyScrollColor] = useState<'pink' | 'white'>('pink');
  const [selectedChit, setSelectedChit] = useState<Chit | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isScrollUnrolled, setIsScrollUnrolled] = useState<boolean>(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number; scale: number; delay: number }>>([]);

  // ==========================================
  // 2. 靜態生成 90 個內部籤條捲軸 (Pile Generator - 90 Scrolls)
  // ==========================================
  // 重現實體飽滿、有機的層次，下寬上窄、完美貼合玻璃圓球弧度
  const scrollsPile = useMemo(() => {
    const list: ScrollData[] = [];
    let seed = 24680;
    const pseudoRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const layers = [
      { yMin: 116, yMax: 132, count: 12, xSpan: 46 }, // 底層
      { yMin: 96, yMax: 116, count: 18, xSpan: 76 },
      { yMin: 76, yMax: 96, count: 20, xSpan: 94 },
      { yMin: 56, yMax: 76, count: 18, xSpan: 104 },
      { yMin: 36, yMax: 56, count: 14, xSpan: 110 },
      { yMin: 20, yMax: 36, count: 10, xSpan: 100 }, // 最頂層
    ];

    let id = 0;
    layers.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        const fraction = layer.count > 1 ? i / (layer.count - 1) : 0.5;
        const baseX = -layer.xSpan + fraction * 2 * layer.xSpan;
        const xJitter = (pseudoRandom() - 0.5) * 8;
        const x = baseX + xJitter;

        const y = layer.yMin + pseudoRandom() * (layer.yMax - layer.yMin);
        const rotate = -110 + pseudoRandom() * 220; // 大範圍旋轉
        const colorType = pseudoRandom() > 0.45 ? 'pink' : 'white';
        const scale = 0.78 + pseudoRandom() * 0.22;

        list.push({ id: id++, x, y, rotate, colorType, scale });
      }
    });

    return list.sort((a, b) => a.y - b.y);
  }, []);

  // ==========================================
  // 3. 高質感音效合成器 (Clacking & Shuffling Web Audio)
  // ==========================================
  // 完美模擬清脆玻璃、紙張摩擦、風鈴與佛堂大磬/頌缽深鳴聲
  const playZenClack = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      
      // A. 清脆玻璃撞擊聲 (Glass clinks)
      for (let i = 0; i < 5; i++) {
        const startTime = audioCtx.currentTime + i * 0.08 + Math.random() * 0.02;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = "sine"; 
        osc.frequency.setValueAtTime(750 + Math.random() * 850, startTime);
        osc.frequency.exponentialRampToValueAtTime(160, startTime + 0.08);
        
        gainNode.gain.setValueAtTime(0.08, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.1);
      }

      // B. 紙張沙沙摩擦聲 (Paper rustle noise)
      const bufferSize = audioCtx.sampleRate * 0.12; 
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      for (let i = 0; i < 3; i++) {
        const startTime = audioCtx.currentTime + i * 0.12;
        const noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = buffer;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1200 + Math.random() * 1000;
        filter.Q.value = 2.5;
        
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.025, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
        
        noiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        noiseNode.start(startTime);
        noiseNode.stop(startTime + 0.1);
      }
    } catch (err) {
      console.warn("Web Audio 播放失敗:", err);
    }
  };

  // 飛升：祥瑞的風鈴風拂聲 (Chime swoop)
  const playZenSwoop = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;

      // 妙音和弦上升 (C6 -> D6 -> E6 -> G6 -> A6 -> C7)
      const notes = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00];
      notes.forEach((freq, idx) => {
        const time = now + idx * 0.07;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);
        
        gainNode.gain.setValueAtTime(0.05, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.55);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(time);
        osc.stop(time + 0.6);
      });
    } catch (e) {
      console.warn("Swoop fail:", e);
    }
  };

  // 揭示籤詩的和弦與佛堂大磬/頌缽深鳴聲 (Singing Bowl Bowl deep bloom)
  const playZenReveal = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;
      
      const freqs = [144.0, 288.5, 433.0, 578.0, 866.0];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        
        const volume = idx === 0 ? 0.2 : 0.08 / idx;
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(now);
        osc.stop(now + 2.0);
      });
    } catch (err) {
      console.warn("Reveal sound fail:", err);
    }
  };



  // ==========================================
  // 5. 抽籤互動邏輯 (Draw Animation)
  // ==========================================
  const handleDraw = () => {
    if (isShaking || showModal || luckyScrollFlying) return;
    
    // A. 階段 1：劇烈左右搖擺，筒內 90 個粉白捲軸同步高頻抖動
    setIsShaking(true);
    setSelectedChit(null);
    setParticles([]);
    
    playZenClack();
    const t1 = setTimeout(() => playZenClack(), 200);
    const t2 = setTimeout(() => playZenClack(), 400);
    const t3 = setTimeout(() => playZenClack(), 600);
    const t4 = setTimeout(() => playZenClack(), 800);
    const t5 = setTimeout(() => playZenClack(), 1000);

    setTimeout(() => {
      setIsShaking(false);
      
      // B. 階段 2：飛升出岫 (The Rising Scroll)
      setLuckyScrollColor(Math.random() > 0.45 ? 'pink' : 'white');
      setLuckyScrollFlying(true);
      playZenSwoop();

      // 動態生成 20 個金色粒子微光 (Gold Sparkle trail)
      const pList = [];
      for (let i = 0; i < 22; i++) {
        pList.push({
          id: i,
          x: (Math.random() - 0.5) * 50,
          y: 30,
          vx: (Math.random() - 0.5) * 4,
          vy: -4 - Math.random() * 5,
          scale: 0.6 + Math.random() * 0.8,
          delay: Math.random() * 0.3,
        });
      }
      setParticles(pList);

      // C. 階段 3：幻化 (3D Morph)
      setTimeout(() => {
        setLuckyScrollFlying(false);
        setParticles([]);
        const luckyChit = chits[Math.floor(Math.random() * chits.length)];
        setSelectedChit(luckyChit);
        setShowModal(true);
        setIsScrollUnrolled(false); // 確保開頭為收攏狀態
        playZenReveal();

        // 隨後 120 毫秒平滑雙向推開轉軸，撐開宣紙
        setTimeout(() => {
          setIsScrollUnrolled(true);
        }, 120);
      }, 850);

    }, 1200);
  };

  const handleCloseModal = () => {
    setIsScrollUnrolled(false); // 先雙向合攏卷軸
    setTimeout(() => {
      setShowModal(false);
      setTimeout(() => {
        setSelectedChit(null);
      }, 400);
    }, 850); // 等待合攏的 0.85s CSS 動畫完成後再徹底關閉背景
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-[#140c0a] via-[#2d1b10] to-[#140c0a] flex flex-col items-center justify-center p-4 md:p-8 font-sans text-[#EAE3DB] relative selection:bg-amber-500/20 selection:text-white overflow-x-hidden">
      
      {/* 禪意光暈亮斑與竹格屏風背景 (Atmospheric Lighting) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-amber-500/10 to-transparent rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* 背景金色佛像虛影 (Sacred Buddha Backdrop Silhouette) */}
      <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-80 h-80 opacity-[0.06] pointer-events-none z-0 flex items-center justify-center select-none">
        <svg className="w-full h-full text-amber-500 filter blur-[1px]" viewBox="0 0 64 64" fill="currentColor">
          <path d="M32,4 C34,4 36,6 36,8 C36,10 34,12 32,12 C30,12 28,10 28,8 C28,6 30,4 32,4 Z M26,14 C28,14 29,15 30,16 L34,16 C35,15 36,14 38,14 C42,14 46,18 46,24 C46,28 42,32 38,34 C36,35 34,36 32,38 C30,36 28,35 26,34 C22,32 18,28 18,24 C18,18 22,14 26,14 Z M32,39 C34,39 36,41 38,43 C42,47 48,50 48,54 C48,56 46,58 32,58 C18,58 16,56 16,54 C16,50 22,47 26,43 C28,41 30,39 32,39 Z" />
        </svg>
      </div>

      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 80px"
        }}
      />

      {/* 蘭花盆栽優雅剪影 (Floral Orchid Accents) */}
      <div className="absolute -bottom-10 -left-10 w-64 h-64 opacity-[0.14] pointer-events-none z-0 select-none">
        <svg className="w-full h-full text-[#E6C2BF]" viewBox="0 0 100 100" fill="currentColor">
          <path d="M10,90 Q30,50 60,80 Q40,40 20,90 Z" />
          <path d="M20,90 Q45,30 80,70 Q55,20 30,90 Z" />
          <path d="M50,80 C60,70 70,70 75,65 Q80,50 65,55 Z" />
          <path d="M65,70 C75,60 85,60 90,55 Q95,40 80,45 Z" />
        </svg>
      </div>
      
      <div className="absolute -bottom-10 -right-10 w-64 h-64 opacity-[0.14] pointer-events-none z-0 select-none scale-x-[-1]">
        <svg className="w-full h-full text-[#E6C2BF]" viewBox="0 0 100 100" fill="currentColor">
          <path d="M10,90 Q30,50 60,80 Q40,40 20,90 Z" />
          <path d="M20,90 Q45,30 80,70 Q55,20 30,90 Z" />
          <path d="M50,80 C60,70 70,70 75,65 Q80,50 65,55 Z" />
          <path d="M65,70 C75,60 85,60 90,55 Q95,40 80,45 Z" />
        </svg>
      </div>

      {/* 右上角低調按鈕組 (Utility Controls) */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-30 opacity-70 hover:opacity-100 transition-opacity duration-300">
        <button
          id="mute-btn"
          onClick={() => setIsMuted(!isMuted)}
          className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
          title={isMuted ? "開啟音效" : "靜音模式"}
        >
          <i className={`fa-solid ${isMuted ? "fa-volume-xmark" : "fa-volume-high"} text-xs`}></i>
        </button>
      </div>

      {/* 居中神聖案几容器 (Main Altar Stage) */}
      <div id="postcard-frame" className="relative z-10 w-full max-w-md flex flex-col items-center justify-center min-h-[580px] transition-all duration-300">
        
        {/* 核心內容區 (Core Scene) */}
        <div id="core-content" className="flex flex-col items-center justify-center my-auto py-6 w-full relative">
          
          {/* 【高度逼真、全透明的玻璃圓球容器籤筒】組件結構 */}
          <div 
            id="pot-container"
            onClick={handleDraw}
            className="relative w-72 h-80 mb-6 select-none cursor-pointer group flex items-center justify-center animate-fade-in"
          >
            {/* 案几桌面投影 */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-52 h-4 bg-black/50 rounded-full blur-[10px] z-0 pointer-events-none transition-transform duration-300 group-hover:scale-105"></div>

            {/* 圓形斜口玻璃球外框 (Crystal Clear Glass Sphere - NOT FROSTED) */}
            <div
              id="glass-sphere"
              className="absolute bottom-10 w-64 h-36 rounded-b-[128px] rounded-t-none border-b border-l border-r border-white/25 bg-gradient-to-b from-transparent via-white/5 to-white/10 shadow-[inset_0_-20px_40px_rgba(0,0,0,0.75),_0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden z-20 flex items-center justify-center transition-all duration-300 group-hover:border-white/40 group-hover:shadow-[inset_0_-20px_45px_rgba(255,255,255,0.15),_0_25px_50px_rgba(212,163,115,0.15)]"
            >
              {/* 數百個 (堆疊 92 個) 精緻粉白相間紙捲軸 (Scrolls Pile - 92 Scrolls) */}
              <div className={`absolute inset-0 z-10 pointer-events-none transition-all duration-300 ${isShaking ? "is-shaking-pool" : ""}`}>
                {scrollsPile.map((sc) => {
                  const leftPos = 128 + sc.x - 16;
                  const topPos = sc.y - 6;
                  return (
                    <div
                      key={sc.id}
                      style={{
                        left: `${leftPos}px`,
                        top: `${topPos}px`,
                        transform: `rotate(${sc.rotate}deg) scale(${sc.scale})`,
                        '--rot': `${sc.rotate}deg`,
                      } as React.CSSProperties}
                      className={`absolute w-8 h-3 rounded-full border border-black/15 shadow-[0_1.5px_3px_rgba(0,0,0,0.3)] transition-all duration-300 z-10 ${
                        sc.colorType === 'pink'
                          ? "bg-gradient-to-r from-[#FFD2CC] via-[#FFA899] to-[#FFC4BA]"
                          : "bg-gradient-to-r from-[#FFFDFD] via-[#F4E3E0] to-[#FFFDFD]"
                      } ${isShaking ? "is-shaking-scroll" : ""}`}
                    >
                      {/* 紙邊捲曲層次 */}
                      <div className="absolute inset-y-0 left-0.5 w-[2px] bg-black/10 rounded-full"></div>
                      <div className="absolute inset-y-0 right-0.5 w-[2px] bg-black/10 rounded-full"></div>
                      
                      {/* 綁帶與細小裝飾線 */}
                      <div className={`absolute inset-y-0 left-1/2 w-[2.2px] -translate-x-1/2 ${
                        sc.colorType === 'pink' ? "bg-white/60" : "bg-red-400/80"
                      }`}></div>
                    </div>
                  );
                })}
              </div>

              {/* 玻璃球正面金色字樣與佛陀徽章 (Metallic Gold Leaf Curved Overlay) */}
              <div className="absolute bottom-0 left-0 w-full h-64 z-25 pointer-events-none select-none">
                <svg viewBox="0 0 256 256" className="w-full h-full">
                  <defs>
                    <linearGradient id="gold-leaf-gradient-render" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFE082" />
                      <stop offset="30%" stopColor="#FFC107" />
                      <stop offset="70%" stopColor="#FF8F00" />
                      <stop offset="100%" stopColor="#FFE082" />
                    </linearGradient>
                    {/* Top text curved path */}
                    <path id="curve-top-render" d="M 45,115 A 83,83 0 0,1 211,115" fill="none" />
                    {/* Bottom text curved path */}
                    <path id="curve-bottom-render" d="M 211,141 A 83,83 0 0,1 45,141" fill="none" />
                  </defs>

                  {/* 上方依半圓弧形彎曲中文字：「人生卜筮」 */}
                  <text className="font-serif text-[17px] font-semibold fill-[url(#gold-leaf-gradient-render)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase tracking-[6px]" textAnchor="middle">
                    <textPath href="#curve-top-render" startOffset="50%">人生卜筮</textPath>
                  </text>

                  {/* 下方依反向圓弧英文字：「DIVINATION WORDS」 */}
                  <text className="font-serif text-[8.5px] font-medium fill-[url(#gold-leaf-gradient-render)] drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] uppercase tracking-[3px]" textAnchor="middle">
                    <textPath href="#curve-bottom-render" startOffset="50%">DIVINATION WORDS</textPath>
                  </text>
                </svg>
              </div>

              {/* 玻璃球正中央淡雅、半透明金色佛陀徽章 */}
              <div className="absolute bottom-0 left-0 w-full h-36 flex items-center justify-center z-25 pointer-events-none select-none opacity-25">
                <svg className="w-12 h-12 text-amber-300 filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" viewBox="0 0 64 64" fill="currentColor">
                  <circle cx="32" cy="16" r="4" />
                  <path d="M32,20 C26,20 22,24 22,28 C22,32 26,34 32,38 C38,34 42,32 42,28 C42,24 38,20 32,20 Z" />
                  <path d="M22,38 C18,41 16,45 16,48 C16,50 18,52 32,52 C46,52 48,50 48,48 C48,45 44,41 40,38 Z" stroke="white" strokeWidth="0.5" fill="none" />
                </svg>
              </div>

              {/* 玻璃球表面反光與物理光斑 (Specular Reflection Highlights) */}
              <div className="absolute inset-0 glass-specular-highlight pointer-events-none z-30 opacity-70"></div>
              <div className="absolute top-4 left-6 w-14 h-6 bg-white/25 rounded-full rotate-[-30deg] blur-[1px] pointer-events-none z-30"></div>
              <div className="absolute bottom-6 right-8 w-10 h-4 bg-white/5 rounded-full rotate-[-30deg] blur-[2px] pointer-events-none z-30"></div>
            </div>

            {/* 🌟 3D 橢圓立體瓶口：立體斜切橢圓 (Sibling of glass sphere to avoid overflow clipping) */}
            <div className="bowl-opening"></div>

            {/* 中央佛陀水晶： nestled in the scrolls pile, translucent pale pink crystal seated Buddha */}
            <div className={`absolute left-[calc(50%-20px)] top-[172px] z-28 pointer-events-none select-none transition-transform duration-300 group-hover:scale-105 ${isShaking ? "is-shaking-pool" : ""}`}>
              <svg viewBox="0 0 60 70" className="w-10 h-12 drop-shadow-[0_4px_8px_rgba(255,182,193,0.65)]">
                <defs>
                  <radialGradient id="crystal-pink-buddha" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="rgba(255, 230, 235, 0.95)" />
                    <stop offset="60%" stopColor="rgba(255, 182, 193, 0.7)" />
                    <stop offset="100%" stopColor="rgba(255, 105, 180, 0.45)" />
                  </radialGradient>
                </defs>
                {/* Seated Crystal Buddha Outline */}
                <path d="M 12 55 Q 30 48, 48 55 Q 30 65, 12 55 Z" fill="url(#crystal-pink-buddha)" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
                <path d="M 16 48 C 18 38, 42 38, 44 48 C 35 52, 25 52, 16 48 Z" fill="url(#crystal-pink-buddha)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" />
                <circle cx="30" cy="22" r="7.5" fill="url(#crystal-pink-buddha)" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
                <path d="M 28 14 Q 30 11 32 14 Z" fill="url(#crystal-pink-buddha)" stroke="rgba(255,255,255,0.8)" />
                {/* Hand Mudra shimmer */}
                <circle cx="30" cy="45" r="2.5" fill="white" opacity="0.65" />
              </svg>
            </div>

            {/* 精緻金色雕花佛像蓮花底座裝飾 (Gold Lotus Pedestal Base) */}
            <div className="absolute bottom-7 left-1/2 -translate-x-1/2 w-48 h-10 z-10 select-none pointer-events-none shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
              <svg viewBox="0 0 120 30" fill="currentColor" className="w-full h-full text-amber-500/80 drop-shadow-[0_4px_10px_rgba(212,163,115,0.4)]">
                <path d="M60,2 C70,2 85,10 90,14 C80,14 70,12 60,10 C50,12 40,14 30,14 C35,10 50,2 60,2 Z" fill="#D4A373" className="brightness-125" />
                <path d="M60,6 C75,6 95,14 105,20 C90,20 75,18 60,15 C45,18 30,20 15,20 C25,14 45,6 60,6 Z" fill="#C99C4A" />
                <path d="M5,22 C15,22 25,25 60,25 C95,25 105,22 115,22 C110,26 95,30 60,30 C25,30 10,26 5,22 Z" fill="#9C7334" />
              </svg>
            </div>

            {/* 精緻木紋鏡面案几桌面 (Reflective Altar Tabletop with Symmetric Mandala Stamps) */}
            <div className="absolute bottom-0 inset-x-2 h-14 altar-table rounded-xl z-0 pointer-events-none overflow-hidden border-t border-white/10 shadow-2xl">
              {/* 桌面高光邊 */}
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"></div>
              
              {/* 鏡面反射效果 (CSS Reflection Mirror Overlay) */}
              <div className="absolute inset-x-0 bottom-1 flex justify-center opacity-[0.14] blur-[3px] scale-y-[-0.65] -translate-y-4 pointer-events-none">
                <div className="w-48 h-48 rounded-full border border-white/20 bg-gradient-to-b from-amber-500/20 to-transparent"></div>
              </div>

              {/* 左側：精緻對稱藍綠色曼陀羅花紋圖章 */}
              <div className="absolute left-4 top-2 w-10 h-10 opacity-30 text-teal-400">
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="50" cy="50" r="44" strokeDasharray="3,3" />
                  <circle cx="50" cy="50" r="30" />
                  <circle cx="50" cy="50" r="15" />
                  <path d="M 50,6 L 50,94 M 6,50 L 94,50" />
                  <path d="M 19,19 L 81,81 M 19,81 L 81,19" />
                  <path d="M 50,20 C 53,28 47,28 50,20 Z" fill="currentColor" fillOpacity="0.2" />
                  <path d="M 50,80 C 53,72 47,72 50,80 Z" fill="currentColor" fillOpacity="0.2" />
                  <path d="M 20,50 C 28,53 28,47 20,50 Z" fill="currentColor" fillOpacity="0.2" />
                  <path d="M 80,50 C 72,53 72,47 80,50 Z" fill="currentColor" fillOpacity="0.2" />
                </svg>
              </div>

              {/* 右側：精緻對稱藍綠色曼陀羅花紋圖章 */}
              <div className="absolute right-4 top-2 w-10 h-10 opacity-30 text-teal-400">
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="50" cy="50" r="44" strokeDasharray="3,3" />
                  <circle cx="50" cy="50" r="30" />
                  <circle cx="50" cy="50" r="15" />
                  <path d="M 50,6 L 50,94 M 6,50 L 94,50" />
                  <path d="M 19,19 L 81,81 M 19,81 L 81,19" />
                  <path d="M 50,20 C 53,28 47,28 50,20 Z" fill="currentColor" fillOpacity="0.2" />
                  <path d="M 50,80 C 53,72 47,72 50,80 Z" fill="currentColor" fillOpacity="0.2" />
                  <path d="M 20,50 C 28,53 28,47 20,50 Z" fill="currentColor" fillOpacity="0.2" />
                  <path d="M 80,50 C 72,53 72,47 80,50 Z" fill="currentColor" fillOpacity="0.2" />
                </svg>
              </div>
            </div>

            {/* Golden Sparkles Trail Layer */}
            <div className="absolute inset-0 pointer-events-none z-30">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ x: p.x, y: 130, scale: p.scale, opacity: 0 }}
                  animate={{
                    x: p.x + p.vx * 30,
                    y: -140 + p.vy * 20,
                    opacity: [0, 1, 0.8, 0],
                    scale: [p.scale, p.scale * 1.5, p.scale * 0.5]
                  }}
                  transition={{ duration: 0.85, ease: "easeOut", delay: p.delay }}
                  className="absolute left-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-yellow-300 to-amber-500 shadow-[0_0_8px_#F59E0B]"
                />
              ))}
            </div>

            {/* 飛升紙捲軸動畫組件 (Lucky Scroll Flying Path) */}
            <AnimatePresence>
              {luckyScrollFlying && (
                <motion.div
                  initial={{ y: 50, x: 0, rotate: 0, scale: 0.8, opacity: 0 }}
                  animate={{
                    y: [-10, -180],
                    rotate: [0, 540],
                    scale: [0.8, 2.4],
                    opacity: [0, 1, 1],
                  }}
                  exit={{ scale: 3.5, opacity: 0 }}
                  transition={{ duration: 0.85, ease: "easeInOut" }}
                  className={`absolute left-1/2 -translate-x-1/2 w-10 h-4 rounded-full border border-black/20 shadow-[0_5px_15px_rgba(0,0,0,0.5)] z-40 ${
                    luckyScrollColor === 'pink'
                      ? "bg-gradient-to-r from-[#FFD2CC] via-[#FFA899] to-[#FFC4BA]"
                      : "bg-gradient-to-r from-[#FFFDFD] via-[#F4E3E0] to-[#FFFDFD]"
                  }`}
                  style={{ top: "110px" }}
                >
                  <div className="absolute inset-y-0 left-0.5 w-[3px] bg-black/15 rounded-full"></div>
                  <div className="absolute inset-y-0 right-0.5 w-[3px] bg-black/15 rounded-full"></div>
                  <div className={`absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 ${
                    luckyScrollColor === 'pink' ? "bg-white/60" : "bg-red-400"
                  }`}></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 案幾底部木座 (Altar rosewood bottom shelf decorator) */}
          <div className="w-80 h-3 altar-table rounded-full opacity-65 mb-6 shadow-md border-t border-white/5 pointer-events-none"></div>

          {/* 東方禪意標題與文字 (Serene Calligraphy Style Titles) */}
          <div className="text-center mt-2 z-10">
            <p className="text-[10px] tracking-[0.42em] uppercase mb-1 opacity-50 font-sans text-amber-200/60">
              La Divination de la Vie
            </p>
            <h1 className="text-2xl md:text-3xl font-light italic text-[#FDFCFC] font-serif tracking-wider">
              Sagesse du Jour
            </h1>
            <div className="w-10 h-[1.5px] bg-amber-400/50 mx-auto my-3"></div>
            
            <h2 id="main-title" className="text-sm font-serif text-[#EAE3DB] font-medium tracking-widest text-center uppercase">
              人生卜筮系統
            </h2>
            <p id="sub-title" className="text-[11px] text-amber-200/40 tracking-widest text-center mt-3 font-light min-h-[20px]">
              {isShaking 
                ? "— 正在為您求取佛法語，請心無雜念 —" 
                : luckyScrollFlying
                  ? "— 佛法語已現，心光正引領幻化 —"
                  : "— 點擊玻璃圓球，抽取人生卜筮 —"
              }
            </p>
          </div>
        </div>
      </div>

      {/* ==========================================
          7. 古典雙向「左右拉開」卷軸彈窗 (Scroll Unroll Popover)
         ========================================== */}
      <AnimatePresence>
        {showModal && selectedChit && (
          <div
            id="modal-overlay"
            className={`popover-overlay ${showModal ? "show" : ""}`}
            onClick={handleCloseModal}
          >
            <div
              id="scroll-container"
              className={`scroll-container ${isScrollUnrolled ? "unrolled" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 左軸心 */}
              <div className="scroll-rod rod-left"></div>

              {/* 中間宣紙 */}
              <div className="scroll-paper font-serif">
                <div className="scroll-content text-[#3e2723]">
                  {/* 上方古典文字裝飾 */}
                  <div className="flex flex-col items-center">
                    <div className="text-[9px] tracking-[0.3em] text-[#8d6e63] uppercase mb-1 font-sans">
                      La Sagesse de la Vie
                    </div>
                    <h2 className="text-xl md:text-2xl font-light italic text-[#3e2723] font-serif mb-1 leading-none">
                      Sagesse du Jour
                    </h2>
                    <div className="text-[10px] text-[#8d6e63]/60 tracking-[0.2em] uppercase font-serif">
                      人生卜筮系統
                    </div>
                    <div className="w-12 h-[1px] bg-[#bd9a7a]/40 mx-auto my-2"></div>
                  </div>

                  {/* 宣紙中的 2D 圖片 (帶有精緻古典邊框與宣紙背景襯托) */}
                  <div 
                    className="flex-1 flex items-center justify-center my-2 overflow-hidden rounded-xl border-2 border-[#bd9a7a]/20 bg-[#faf5e6] shadow-md relative p-1.5 w-full mx-auto"
                    style={{ 
                      aspectRatio: '1375 / 1144',
                      maxHeight: 'min(420px, 48vh)'
                    }}
                  >
                    <img
                      id="result-image"
                      src={selectedChit.image_url}
                      alt="Zen Wisdom"
                      className="w-full h-full object-cover rounded-lg select-none"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-3 text-[8px] tracking-widest uppercase opacity-40 font-mono text-amber-900">
                      CHIT #{selectedChit.id}
                    </div>
                  </div>

                  {/* 籤詩與法語內容 */}
                  <div className="space-y-1.5 px-2 text-center my-2">
                    <p id="result-french" className="text-sm md:text-base italic text-[#4e2f25] font-serif leading-relaxed font-semibold">
                      "{selectedChit.french}"
                    </p>
                    <p id="result-chinese" className="text-xs md:text-sm font-bold text-[#8c4f2b] tracking-wider">
                      {selectedChit.chinese}
                    </p>
                    <p id="result-interpretation" className="text-[10px] md:text-xs text-[#5c4a40]/90 leading-relaxed max-w-[340px] mx-auto font-light">
                      {selectedChit.interpretation}
                    </p>
                  </div>

                  {/* 收下此卜按鈕與備註 */}
                  <div className="border-t border-[#bd9a7a]/20 pt-2 flex flex-col items-center">
                    <button
                      id="modal-close-button"
                      onClick={handleCloseModal}
                      className="bg-[#3e2723] hover:bg-[#52332c] text-[#fdf8eb] active:scale-95 px-8 py-2 rounded-full text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-md font-semibold border border-[#d4af37]/40 cursor-pointer"
                    >
                      收下此卜
                    </button>
                    <p className="text-[9px] text-[#8d6e63]/50 tracking-widest mt-1.5">
                      收下此卜，遇見更好的自己
                    </p>
                  </div>
                </div>
              </div>

              {/* 右軸心 */}
              <div className="scroll-rod rod-right"></div>
            </div>
          </div>
        )}
      </AnimatePresence>



      {/* 底部極簡裝飾 (Decorative Zen Footer) */}
      <footer className="mt-8 w-full max-w-2xl flex justify-between items-center px-4 z-10 text-white/30 text-[9px] tracking-widest uppercase">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
            <div className="w-1 h-1 bg-white/40 rounded-full mx-[1px]"></div>
            <div className="w-1 h-2 bg-white/40 rounded-full mx-[1px]"></div>
            <div className="w-1 h-3 bg-white/40 rounded-full mx-[1px]"></div>
          </div>
          <span>Atmosphère: Calme</span>
        </div>
        <span>Propulsé par la Sérénité</span>
      </footer>



    </div>
  );
}
