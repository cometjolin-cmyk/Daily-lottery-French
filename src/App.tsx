/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Chit } from "./types";
import { DEFAULT_CHITS } from "./data";
import { ParticleNebulaCanvas } from "./components/ParticleNebulaCanvas";

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
  const [lang, setLang] = useState<"zh" | "en" | "fil">("zh");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [luckyScrollFlying, setLuckyScrollFlying] = useState<boolean>(false);
  const [luckyScrollColor, setLuckyScrollColor] = useState<'pink' | 'white'>('pink');
  const [selectedChit, setSelectedChit] = useState<Chit | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isScrollUnrolled, setIsScrollUnrolled] = useState<boolean>(false);
  const [isPreloading, setIsPreloading] = useState<boolean>(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState<boolean>(false);
  const [enlargedImgUrl, setEnlargedImgUrl] = useState<string | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number; scale: number; delay: number }>>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [nebulaAnimState, setNebulaAnimState] = useState<"idle" | "condensing" | "ascending">("idle");

  // Particle Nebula Extraction Logic (3-Stage Particle Condensation & Ascension)
  const handleNebulaDraw = () => {
    if (nebulaAnimState !== "idle" || showModal || isPreloading) return;

    // 1. Randomly pick a chit
    const luckyChit = chits[Math.floor(Math.random() * chits.length)];
    setIsPreloading(true);
    setSelectedChit(null);

    let isImgLoaded = false;
    let isAscendFinished = false;

    // 2. Preload image in background
    const img = new Image();
    img.crossOrigin = "anonymous";

    const checkAndReveal = () => {
      if (isImgLoaded && isAscendFinished) {
        setIsPreloading(false);
        setSelectedChit(luckyChit);
        setShowModal(true);
        setIsScrollUnrolled(false);
        playZenReveal();
        setTimeout(() => {
          setIsScrollUnrolled(true);
          setNebulaAnimState("idle");
        }, 120);
      }
    };

    img.onload = () => {
      isImgLoaded = true;
      checkAndReveal();
    };
    img.onerror = () => {
      isImgLoaded = true;
      checkAndReveal();
    };
    img.src = luckyChit.image_url;

    // Phase 1: Condensing 0.0s ~ 1.0s
    setNebulaAnimState("condensing");

    // Phase 2: Ascending 1.0s ~ 2.0s
    setTimeout(() => {
      setNebulaAnimState("ascending");
    }, 1000);

    // Phase 3: Flight finished
    setTimeout(() => {
      isAscendFinished = true;
      checkAndReveal();
    }, 2000);
  };

  // 自動清除 Toast 消息
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

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
    if (isShaking || showModal || luckyScrollFlying || isPreloading) return;
    
    // 立即隨機選擇一個法語 (Chit)，以極大化背景非同步預載時間
    const luckyChit = chits[Math.floor(Math.random() * chits.length)];
    setIsPreloading(true);

    // 建立新圖片物件並在背景非同步載入 (Preload)
    const img = new Image();
    img.crossOrigin = "anonymous";

    let isImgLoaded = false;
    let isFlightFinished = false;

    const triggerReveal = () => {
      setIsPreloading(false);
      setLuckyScrollFlying(false);
      setParticles([]);
      setSelectedChit(luckyChit);
      setShowModal(true);
      setIsScrollUnrolled(false); // 確保開頭為收攏狀態
      playZenReveal();

      // 隨後 120 毫秒平滑雙向推開轉軸，撐開宣紙
      setTimeout(() => {
        setIsScrollUnrolled(true);
      }, 120);
    };

    const checkAndReveal = () => {
      if (isImgLoaded && isFlightFinished) {
        triggerReveal();
      }
    };

    img.onload = () => {
      isImgLoaded = true;
      checkAndReveal();
    };

    img.onerror = () => {
      // 容錯防呆：如果圖片讀取失敗，依然要彈出以防介面卡死
      console.warn("Failed to preload image:", luckyChit.image_url);
      isImgLoaded = true;
      checkAndReveal();
    };

    // 觸發請求
    img.src = luckyChit.image_url;
    
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

      // C. 階段 3：等待飛升動畫完畢且圖片載入完畢後，才進行幻化與揭示
      setTimeout(() => {
        isFlightFinished = true;
        checkAndReveal();
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

  // ==========================================
  // 6. 新增「保存法語卡片」一鍵下載分享功能 (HTML5 Canvas)
  // ==========================================
  const handleSaveCard = async () => {
    if (!selectedChit || isGeneratingCard) return;
    setIsGeneratingCard(true);

    try {
      // 1. 創建高解析度畫布 (適合社群分享或手機保存，長寬比為 9:16)
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("無法取得 Canvas 2D Context");

      // 2. 繪製精緻宣紙/米白漸層背景
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
      bgGrad.addColorStop(0, "#fdfbf7");
      bgGrad.addColorStop(0.5, "#faf5e6");
      bgGrad.addColorStop(1, "#f5ebd0");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // 3. 繪製精緻古典花紋邊框 (金邊與深紅線條結合，莊嚴肅穆)
      ctx.strokeStyle = "#c5a059"; // 黃金漆色
      ctx.lineWidth = 14;
      ctx.strokeRect(35, 35, 1080 - 70, 1920 - 70);

      ctx.strokeStyle = "#8d6e63"; // 典雅紅褐色線條
      ctx.lineWidth = 3;
      ctx.strokeRect(55, 55, 1080 - 110, 1920 - 110);

      // 四個角落的中式祥瑞古典角花飾
      const drawCorner = (x: number, y: number, xDir: number, yDir: number) => {
        ctx.strokeStyle = "#c5a059";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, y + yDir * 55);
        ctx.lineTo(x, y);
        ctx.lineTo(x + xDir * 55, y);
        ctx.stroke();
      };
      drawCorner(65, 65, 1, 1);
      drawCorner(1080 - 65, 65, -1, 1);
      drawCorner(65, 1920 - 65, 1, -1);
      drawCorner(1080 - 65, 1920 - 65, -1, -1);

      // 4. 上方：書寫大師與主題資訊
      ctx.fillStyle = "#3e2723";
      ctx.textAlign = "center";
      
      if (lang === "zh") {
        // 標題：「佛光山開山祖師星雲大師」
        ctx.font = "bold 32px 'Noto Serif TC', 'PingFang TC', 'STSong', 'SimSun', serif";
        ctx.fillText("佛光山開山祖師星雲大師", 540, 130);
      } else {
        // Title: "Venerable Master Hsing Yun"
        ctx.font = "bold 30px 'Noto Serif TC', 'Playfair Display', serif";
        ctx.fillText("Venerable Master Hsing Yun", 540, 130);
      }

      // 裝飾分界金線
      ctx.strokeStyle = "#c5a059";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(410, 165);
      ctx.lineTo(670, 165);
      ctx.stroke();

      // 副標題：「星雲法語」
      ctx.fillStyle = "#a16b1a";
      ctx.font = "26px 'Noto Serif TC', 'PingFang TC', serif";
      ctx.fillText(lang === "zh" ? "• 星雲法語 •" : "• Dharma Words •", 540, 205);

      // 5. 繪製中央大師法語圖片
      const drawImageOnCanvas = () => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            // 繪製圖片框白底與立體陰影效果
            ctx.fillStyle = "#fcf9f2";
            ctx.shadowColor = "rgba(139, 90, 43, 0.12)";
            ctx.shadowBlur = 35;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 15;
            ctx.fillRect(85, 255, 910, 760);
            ctx.shadowColor = "transparent"; // 重置陰影設定以免影響文字

            // 繪製法語主圖 (寬 900, 高 750, 置中於 x=90, y=260)
            ctx.drawImage(img, 90, 260, 900, 750);

            // 繪製精緻的木色內襯細框
            ctx.strokeStyle = "#bd9a7a";
            ctx.lineWidth = 4;
            ctx.strokeRect(88, 258, 904, 754);
            resolve();
          };
          img.onerror = (err) => {
            console.warn("無法加載法語圖片至 Canvas (CORS/離線)，將顯示古典藝術蓮花插圖：", err);
            // 降級方案：即使圖片受 CORS 影響，依然產生絕美法語卡
            ctx.fillStyle = "#fcf9f2";
            ctx.fillRect(90, 260, 900, 750);
            ctx.strokeStyle = "#bd9a7a";
            ctx.lineWidth = 4;
            ctx.strokeRect(88, 258, 904, 754);
            
            // 畫一朵具有禪意的金色蓮花圖騰/卍字
            ctx.fillStyle = "#c5a059";
            ctx.font = "180px 'Noto Serif TC', serif";
            ctx.fillText("卍", 540, 640);
            ctx.font = "26px 'Noto Serif TC', serif";
            ctx.fillStyle = "#8d6e63";
            ctx.fillText(lang === "zh" ? "（ 萬德莊嚴 • 藏於心田 ）" : "（ Wisdom & Compassion in the Heart ）", 540, 720);
            resolve();
          };
          img.src = selectedChit.image_url;
        });
      };

      await drawImageOnCanvas();

      // 6. 繪製精緻的中英法文字與開示 (配合自動換行與斷句保護演算法)
      const wrapText = (
        text: string,
        startX: number,
        startY: number,
        maxWidth: number,
        lineHeight: number,
        fontStyle: string,
        colorStyle: string
      ) => {
        ctx.font = fontStyle;
        ctx.fillStyle = colorStyle;
        if (!text) return startY;

        const isWestern = /[a-zA-Z]/.test(text) && !/[\u4e00-\u9fa5]/.test(text);
        const lines: string[] = [];

        if (isWestern) {
          const words = text.split(' ');
          let line = '';
          for (let n = 0; n < words.length; n++) {
            const testLine = line + (line ? ' ' : '') + words[n];
            if (ctx.measureText(testLine).width > maxWidth && line !== '') {
              lines.push(line);
              line = words[n];
            } else {
              line = testLine;
            }
          }
          if (line) lines.push(line);
        } else {
          // 中文或混合文字：按標點與自然子句切分 (如 "慈悲喜捨，", "惜福結緣。") 保持語意完整，不隨意斷字
          const chunks = text.match(/[^，。；！？\n]+[，。；！？]?|./g) || [text];
          let currentLine = '';

          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const testLine = currentLine + chunk;
            if (ctx.measureText(testLine).width > maxWidth && currentLine !== '') {
              lines.push(currentLine);
              currentLine = chunk;
              while (ctx.measureText(currentLine).width > maxWidth) {
                let sub = '';
                for (const char of currentLine) {
                  if (ctx.measureText(sub + char).width > maxWidth && sub !== '') {
                    lines.push(sub);
                    sub = char;
                  } else {
                    sub += char;
                  }
                }
                currentLine = sub;
              }
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);
        }

        let currentY = startY;
        for (let l = 0; l < lines.length; l++) {
          ctx.fillText(lines[l], startX, currentY);
          if (l < lines.length - 1) currentY += lineHeight;
        }
        return currentY;
      };

      let lastTextY = 1090;

      if (lang === "zh") {
        // 6a. 經典中文字：法語內容 (字體更大、穩重典雅)
        const endChY = wrapText(
          selectedChit.chinese || "",
          540,
          1095,
          880,
          65,
          "bold 46px 'Noto Serif TC', 'PingFang TC', 'STSong', 'SimSun', serif",
          "#3e2723"
        );

        // 6b. 精緻英文對照翻譯
        const englishTranslation = selectedChit.english || selectedChit.filipino;
        lastTextY = wrapText(
          englishTranslation ? `"${englishTranslation}"` : "",
          540,
          endChY + 70,
          840,
          45,
          "italic 30px 'Georgia', 'Times New Roman', serif",
          "#5d4037"
        );
      } else if (lang === "fil") {
        // 6a. 菲律賓法語內容優先 (更大、更典雅)
        const endFilY = wrapText(
          selectedChit.filipino ? `"${selectedChit.filipino}"` : "",
          540,
          1090,
          840,
          50,
          "bold italic 36px 'Georgia', 'Times New Roman', serif",
          "#3e2723"
        );

        // 6b. 經典中文字：副標題
        lastTextY = wrapText(
          selectedChit.chinese || "",
          540,
          endFilY + 65,
          880,
          55,
          "bold 32px 'Noto Serif TC', 'PingFang TC', serif",
          "#6d4c41"
        );
      } else {
        // 6a. 英文法語內容優先 (更大、更典雅)
        const endEnY = wrapText(
          selectedChit.english ? `"${selectedChit.english}"` : (selectedChit.filipino ? `"${selectedChit.filipino}"` : ""),
          540,
          1090,
          840,
          50,
          "bold italic 36px 'Georgia', 'Times New Roman', serif",
          "#3e2723"
        );

        // 6b. 經典中文字：副標題
        lastTextY = wrapText(
          selectedChit.chinese || "",
          540,
          endEnY + 65,
          880,
          55,
          "bold 32px 'Noto Serif TC', 'PingFang TC', serif",
          "#6d4c41"
        );
      }

      // 裝飾性淡墨分界線
      ctx.strokeStyle = "rgba(189, 154, 122, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(340, lastTextY + 45);
      ctx.lineTo(740, lastTextY + 45);
      ctx.stroke();

      // 6c. 今日開示 (Interpretation)
      const interpTitleY = lastTextY + 95;
      ctx.font = "bold 26px 'Noto Serif TC', 'PingFang TC', serif";
      ctx.fillStyle = "#8d6e63";
      ctx.fillText(
        lang === "zh" 
          ? "【 今日開示 】" 
          : lang === "fil"
            ? "【 Gabay sa Araw-Araw 】"
            : "【 Daily Guidance 】",
        540,
        interpTitleY
      );

      const interpY = interpTitleY + 50;
      const endInterpY = wrapText(
        lang === "zh" 
          ? (selectedChit.interpretation || "") 
          : lang === "fil"
            ? (selectedChit.filipinoInterpretation || selectedChit.englishInterpretation || "")
            : (selectedChit.englishInterpretation || selectedChit.interpretation || ""),
        540,
        interpY,
        820,
        40,
        "24px 'Inter', 'Noto Sans TC', sans-serif",
        "#5c4a40"
      );

      // 6d. 統一規範的出處：— 佛光山開山祖師 星雲大師
      const attrY = endInterpY + 75;
      ctx.font = "bold 28px 'Noto Serif TC', 'PingFang TC', serif";
      ctx.fillStyle = "#795548";
      ctx.fillText(
        lang === "zh" 
          ? "— 佛光山開山祖師 星雲大師" 
          : lang === "fil"
            ? "— Venerable Master Hsing Yun, Tagapagtatag ng Fo Guang Shan"
            : "— Venerable Master Hsing Yun, Founder of Fo Guang Shan",
        540,
        attrY
      );

      // 7. 右下角：印章「佛光人間」(120x120 仿實體篆刻印章)
      const sealX = 860;
      const sealY = 1710;
      ctx.fillStyle = "#b71c1c"; // 大紅硃砂色
      ctx.fillRect(sealX, sealY, 120, 120);
      
      // 繪製印章黃色框邊
      ctx.strokeStyle = "#fff9c4";
      ctx.lineWidth = 3;
      ctx.strokeRect(sealX + 8, sealY + 8, 104, 104);

      // 篆刻文字
      ctx.fillStyle = "#fff9c4";
      ctx.font = "bold 24px 'Noto Serif TC', 'PingFang TC', serif";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText("佛光", sealX + 60, sealY + 38);
      ctx.fillText("人間", sealX + 60, sealY + 82);

      // 8. 觸發自動瀏覽器圖片下載
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      link.download = `Dharma_Words_${dateStr}_${selectedChit.id}.png`;
      link.href = dataUrl;
      link.click();

      setToastMessage(
        lang === "zh" 
          ? "法語圖卡已成功導出，請查收下載檔案！" 
          : lang === "fil"
            ? "Matagumpay na na-export ang Dharma card! Mangyaring suriin ang iyong mga download."
            : "Dharma card exported successfully! Please check your downloads."
      );

    } catch (err) {
      console.error("Canvas card generation failed:", err);
      setToastMessage(
        lang === "zh" 
          ? "圖卡下載失敗，請直接長按螢幕截圖保存法語。" 
          : lang === "fil"
            ? "Nabigo ang pag-save ng card. Mangyaring pindutin nang matagal o i-screenshot para i-save."
            : "Card save failed. Please long-press or screenshot to save."
      );
    } finally {
      setIsGeneratingCard(false);
    }
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

      {/* 右上角低調按鈕組 (Utility Controls - High Contrast for Seniors) */}
      <div className="absolute top-4 right-4 flex items-center space-x-2.5 z-30">
        <button
          id="lang-btn"
          onClick={() => setLang(lang === "zh" ? "en" : lang === "en" ? "fil" : "zh")}
          className="px-4 h-9 rounded-full bg-[#2B1D1D]/90 backdrop-blur-md border-2 border-[#E2C792]/70 flex items-center justify-center text-xs font-bold tracking-widest text-[#F5E6C8] hover:text-white hover:bg-[#3E2723] hover:border-[#E2C792] transition-all duration-300 cursor-pointer shadow-lg"
          title={lang === "zh" ? "Switch to English" : lang === "en" ? "Lumipat sa Filipino" : "切換至繁體中文"}
        >
          <i className="fa-solid fa-language text-sm mr-1.5 text-[#E2C792]"></i>
          <span>{lang === "zh" ? "EN" : lang === "en" ? "FIL" : "中文"}</span>
        </button>

        <button
          id="mute-btn"
          onClick={() => setIsMuted(!isMuted)}
          className="w-9 h-9 rounded-full bg-[#2B1D1D]/90 backdrop-blur-md border-2 border-[#E2C792]/70 flex items-center justify-center text-[#F5E6C8] hover:text-white hover:bg-[#3E2723] transition-all duration-300 cursor-pointer shadow-lg"
          title={isMuted ? "開啟音效" : "靜音模式"}
        >
          <i className={`fa-solid ${isMuted ? "fa-volume-xmark" : "fa-volume-high"} text-sm`}></i>
        </button>
      </div>

      {/* 居中神聖案几容器 (Main Altar Stage with 3D Particle Nebula) */}
      <div id="postcard-frame" className="relative z-10 w-full max-w-md flex flex-col items-center justify-center min-h-[520px] transition-all duration-300">
        
        {/* 核心內容區：3D Particle Nebula Canvas Stage */}
        <div id="core-content" className="flex flex-col items-center justify-center my-auto py-2 w-full relative">
          
          {/* 3D 粒子星雲動態引擎 */}
          <ParticleNebulaCanvas
            isMuted={isMuted}
            onStartExtraction={handleNebulaDraw}
            animState={nebulaAnimState}
            onAscensionComplete={() => {}}
            lang={lang}
          />

          {/* 東方禪意標題與文字 (Serene Calligraphy Style Titles - High Contrast & Senior Friendly) */}
          <div className="text-center mt-5 z-10 w-full px-3 max-w-xl mx-auto">
            <div 
              className="bg-[#2B1D1D]/90 rounded-2xl shadow-2xl w-full box-border overflow-visible transition-all"
              style={{
                padding: '18px 20px',
                border: '1px solid rgba(226, 199, 146, 0.5)',
                outline: '1px solid rgba(212, 163, 115, 0.3)',
                outlineOffset: '-5px',
                minHeight: 'auto'
              }}
            >
              <h1 
                className="font-extrabold text-[#F5E6C8] font-serif tracking-wide drop-shadow-md leading-relaxed my-1 select-none"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                {lang === "zh" ? (
                  <span style={{ whiteSpace: 'nowrap', fontSize: 'clamp(18px, 4.8vw, 28px)' }}>
                    星雲法語
                  </span>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <span 
                      className="text-[#E2C792] font-serif font-extrabold tracking-wider"
                      style={{
                        whiteSpace: 'nowrap',
                        fontSize: 'clamp(14px, 3.8vw, 22px)'
                      }}
                    >
                      {lang === "fil" ? "Mga Salita ng Dharma mula kay" : "Dharma Words from"}
                    </span>
                    <span 
                      className="text-[#F5E6C8] font-serif font-extrabold tracking-wide"
                      style={{
                        whiteSpace: 'nowrap',
                        fontSize: 'clamp(15px, 4.2vw, 25px)'
                      }}
                    >
                      Venerable Master Hsing Yun
                    </span>
                  </div>
                )}
              </h1>
              <div className="w-20 sm:w-28 h-[2px] bg-[#E2C792]/80 mx-auto my-2.5"></div>
              
              <h2 
                id="main-title" 
                className="font-serif text-[#E2C792] font-extrabold tracking-wide text-center leading-relaxed select-none"
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: 'clamp(13px, 3.4vw, 18px)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                }}
              >
                {lang === "zh" ? (
                  "佛光山開山祖師星雲大師"
                ) : (
                  <span className="whitespace-nowrap">
                    {lang === "fil" ? "Tagapagtatag ng Fo Guang Shan" : "Founder of Fo Guang Shan"}
                  </span>
                )}
              </h2>
            </div>
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
              <div className="scroll-paper font-serif bg-gradient-to-b from-[#fdfbf7] via-[#faf5e6] to-[#f5ebd0] relative border-[6px] md:border-[10px] border-[#c5a059] p-3 md:p-6 overflow-hidden">
                {/* 內襯紅褐色古典細框線 */}
                <div className="absolute inset-1.5 md:inset-3 border border-[#8d6e63] pointer-events-none z-10"></div>

                {/* 四角中式古典金角花飾 */}
                <div className="absolute top-2 left-2 md:top-3 md:left-3 w-5 h-5 md:w-6 md:h-6 border-t-[3px] border-l-[3px] border-[#c5a059] pointer-events-none z-10"></div>
                <div className="absolute top-2 right-2 md:top-3 md:right-3 w-5 h-5 md:w-6 md:h-6 border-t-[3px] border-r-[3px] border-[#c5a059] pointer-events-none z-10"></div>
                <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 w-5 h-5 md:w-6 md:h-6 border-b-[3px] border-l-[3px] border-[#c5a059] pointer-events-none z-10"></div>
                <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-5 h-5 md:w-6 md:h-6 border-b-[3px] border-r-[3px] border-[#c5a059] pointer-events-none z-10"></div>

                {/* 仿實體篆刻印章「佛光人間」 */}
                <div className="absolute bottom-4 right-4 md:bottom-7 md:right-7 w-9 h-9 md:w-12 md:h-12 bg-[#b71c1c] border border-[#fff9c4] flex flex-col items-center justify-center text-[7px] md:text-[9px] font-bold text-[#fff9c4] leading-tight select-none shadow-[0_3px_8px_rgba(0,0,0,0.15)] z-20 font-serif">
                  <span className="border-b border-[#fff9c4]/30 pb-0.5 mb-0.5">佛光</span>
                  <span>人間</span>
                </div>

                <div className="scroll-content text-[#1A1A1A] z-10 relative h-full flex flex-col justify-between py-1 px-1 md:px-2">
                  {/* 上方古典文字裝飾 (高對比深赭紅標題，保護排版不被遮擋) */}
                  <div className="flex flex-col items-center pt-2 sm:pt-3 px-3 sm:px-6 w-full max-w-full select-none z-20 relative overflow-visible">
                    <h2 
                      className="font-extrabold text-[#6B1E10] font-serif tracking-wide text-center leading-snug px-1 w-full drop-shadow-sm select-none"
                      style={{
                        whiteSpace: 'nowrap',
                        fontSize: 'clamp(15px, 3.8vw, 24px)',
                      }}
                    >
                      {lang === "zh" ? "佛光山開山祖師星雲大師" : <span className="whitespace-nowrap">Venerable Master Hsing Yun</span>}
                    </h2>
                    <div className="w-20 sm:w-24 h-[2px] bg-[#6B1E10]/70 my-1.5 opacity-80"></div>
                    <div 
                      className="text-[#6B1E10] font-serif tracking-widest uppercase font-extrabold text-center px-1 select-none"
                      style={{
                        whiteSpace: 'nowrap',
                        fontSize: 'clamp(13px, 3.2vw, 18px)',
                      }}
                    >
                      {lang === "zh" ? "• 星雲法語 •" : lang === "fil" ? "• Salita ng Dharma •" : "• Dharma Words •"}
                    </div>
                  </div>

                  {/* 宣紙中的 2D 圖片 (帶有古樸印章風格放大鏡提示，自然優雅) */}
                  <div 
                    onClick={() => setEnlargedImgUrl(selectedChit.image_url)}
                    className="w-full max-w-[350px] mx-auto my-2 overflow-hidden rounded-xl border border-[#BD9A7A] hover:border-[#8C241C] bg-[#FCF9F2] shadow-[0_4px_16px_rgba(140,36,28,0.12)] hover:shadow-xl relative p-0.5 flex items-center justify-center cursor-pointer group transition-all duration-300 active:scale-[0.98]"
                    style={{ 
                      aspectRatio: '6 / 5',
                    }}
                    title={lang === "zh" ? "點擊查看滿版大圖" : lang === "fil" ? "I-click para Palakihin" : "Click to view enlarged image"}
                  >
                    <img
                      id="result-image"
                      src={selectedChit.image_url}
                      alt="Zen Wisdom"
                      className="w-full h-full object-contain select-none transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
                    <div className="absolute top-1.5 right-2 text-[10px] tracking-widest uppercase font-mono text-[#2B1D1D] font-bold bg-[#FDF8EB]/90 px-2 py-0.5 rounded border border-[#BD9A7A]/40 shadow-sm z-10">
                      CHIT #{selectedChit.id}
                    </div>

                    {/* 古樸印章風格放大提示膠囊標籤 (Refined Zen Zoom Badge) */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#FDF8EB]/90 hover:bg-[#FDF8EB] text-[#8C241C] text-xs sm:text-sm font-bold px-3.5 py-1 rounded-full border border-[#8C241C]/60 shadow-md flex items-center gap-1.5 backdrop-blur-sm transition-all duration-200 group-hover:scale-105 z-10">
                      <i className="fa-solid fa-magnifying-glass-plus text-[#8C241C] text-xs"></i>
                      <span>{lang === "zh" ? "點擊看大圖" : lang === "fil" ? "I-click para Palakihin" : "Click to Enlarge"}</span>
                    </div>
                  </div>

                  {/* 籤詩與法語內容 (濃墨黑 #1A1A1A，極致高對比、行高 1.8 與自然斷句保護) */}
                  <div className="space-y-3 px-2 text-center my-2 overflow-y-auto max-h-[36vh] scrollbar-thin scrollbar-thumb-amber-800/40">
                    {lang === "zh" ? (
                      <>
                        <p id="result-chinese" className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1A1A1A] tracking-[1.5px] font-serif leading-[1.8] drop-shadow-sm text-balance [word-break:keep-all] overflow-wrap:break-word break-normal">
                          {selectedChit.chinese}
                        </p>
                        {(selectedChit.english || selectedChit.filipino) && (
                          <p id="result-english" className="text-sm sm:text-base md:text-lg italic font-semibold text-[#2C2C2C] font-serif leading-[1.7] mt-1.5 px-1 max-w-[440px] mx-auto text-pretty text-balance">
                            "{selectedChit.english || selectedChit.filipino}"
                          </p>
                        )}
                      </>
                    ) : lang === "fil" ? (
                      <>
                        <p id="result-filipino" className="text-xl sm:text-2xl md:text-3xl italic text-[#1A1A1A] font-serif leading-[1.8] font-bold drop-shadow-sm text-pretty text-balance">
                          "{selectedChit.filipino}"
                        </p>
                        <p id="result-chinese" className="text-base sm:text-lg md:text-xl font-bold text-[#8C241C] tracking-[1.5px] mt-1.5 text-balance [word-break:keep-all] overflow-wrap:break-word break-normal">
                          {selectedChit.chinese}
                        </p>
                      </>
                    ) : (
                      <>
                        <p id="result-english" className="text-xl sm:text-2xl md:text-3xl italic text-[#1A1A1A] font-serif leading-[1.8] font-bold drop-shadow-sm text-pretty text-balance">
                          "{selectedChit.english || selectedChit.filipino}"
                        </p>
                        <p id="result-chinese" className="text-base sm:text-lg md:text-xl font-bold text-[#8C241C] tracking-[1.5px] mt-1.5 text-balance [word-break:keep-all] overflow-wrap:break-word break-normal">
                          {selectedChit.chinese}
                        </p>
                      </>
                    )}

                    <div className="w-20 h-[1.5px] bg-[#8C241C]/30 mx-auto my-2.5"></div>
                    
                    <div className="text-sm sm:text-base md:text-lg font-bold text-[#8C241C] uppercase tracking-[0.15em] mb-1.5">
                      {lang === "zh" ? "【 今日開示 】" : lang === "fil" ? "【 Gabay sa Araw-Araw 】" : "【 Daily Guidance 】"}
                    </div>

                    <p id="result-interpretation" className="text-base sm:text-lg md:text-xl font-semibold text-[#1A1A1A] leading-[1.8] max-w-[460px] mx-auto tracking-[0.5px] text-pretty text-balance [word-break:keep-all] overflow-wrap:break-word break-normal">
                      {lang === "zh" 
                        ? selectedChit.interpretation 
                        : lang === "fil"
                          ? (selectedChit.filipinoInterpretation || selectedChit.englishInterpretation)
                          : selectedChit.englishInterpretation
                      }
                    </p>
                    <p className="text-xs sm:text-sm md:text-base text-[#5C3317] font-serif mt-2.5 font-semibold tracking-wider text-right pr-2">
                      {lang === "zh" ? (
                        "— 佛光山開山祖師 星雲大師"
                      ) : (
                        <>
                          — <span className="whitespace-nowrap">Venerable Master Hsing Yun</span>
                          {lang === "fil" ? ", Tagapagtatag ng Fo Guang Shan" : ", Founder of Fo Guang Shan"}
                        </>
                      )}
                    </p>
                  </div>

                  {/* 優雅古典印章風按鈕區塊 (Lightweight Refined Zen Buttons for Seniors) */}
                  <div className="border-t border-[#BD9A7A]/35 pt-3.5 flex flex-col items-center gap-1.5 z-20 relative">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full px-2">
                      {/* 宣紙微黃半透明印章風按鈕 */}
                      <button
                        id="save-card-button"
                        onClick={handleSaveCard}
                        disabled={isGeneratingCard}
                        className="bg-[#FDF8EB]/90 hover:bg-[#F7EED8] text-[#8C241C] active:scale-95 disabled:opacity-50 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-base sm:text-lg font-bold tracking-[0.1em] transition-all duration-300 shadow-sm hover:shadow-md border border-[#8C241C]/60 hover:border-[#8C241C] cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto min-w-[170px]"
                      >
                        <i className={`fa-solid ${isGeneratingCard ? "fa-spinner animate-spin" : "fa-download"} text-base sm:text-lg`}></i>
                        <span>
                          {isGeneratingCard 
                            ? (lang === "zh" ? "正在生成圖卡..." : lang === "fil" ? "Gumagawa..." : "Generating...") 
                            : (lang === "zh" ? "保存法語圖卡" : lang === "fil" ? "I-save ang Dharma Card" : "Save Dharma Card")
                          }
                        </span>
                      </button>
                      
                      {/* 典雅赭紅印章風按鈕 */}
                      <button
                        id="modal-close-button"
                        onClick={handleCloseModal}
                        className="bg-[#8C241C] hover:bg-[#721C16] text-[#FFF8E7] active:scale-95 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-base sm:text-lg font-bold tracking-[0.1em] uppercase transition-all duration-300 shadow-md hover:shadow-lg border border-[#8C241C] cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto min-w-[170px]"
                      >
                        <i className="fa-solid fa-circle-check text-base sm:text-lg text-amber-200"></i>
                        <span>
                          {lang === "zh" ? "收下此卜" : lang === "fil" ? "Tanggapin ang Biyaya" : "Receive Blessing"}
                        </span>
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-[#5C3317] font-semibold tracking-widest mt-1">
                      {lang === "zh" ? "收下此卜，遇見更好的自己" : lang === "fil" ? "Tanggapin ang biyayang ito upang makahanap ng mas magandang landas" : "Receive this blessing to find a better path"}
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

      {/* 全螢幕圖片放大檢視 Lightbox (Fullscreen Image Lightbox Modal - Instant Direct Display) */}
      <AnimatePresence>
        {enlargedImgUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-between p-4 sm:p-6 select-none cursor-pointer backdrop-blur-[8px]"
            style={{ backgroundColor: 'rgba(20, 15, 10, 0.85)' }}
            onClick={() => setEnlargedImgUrl(null)}
          >
            {/* 頂部控制列 (Senior-Friendly Close Header) */}
            <div 
              className="w-full max-w-4xl flex items-center justify-between z-10 pt-2 px-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 text-[#E2C792] font-serif text-base sm:text-lg md:text-xl font-bold">
                <i className="fa-solid fa-image text-amber-300 text-lg"></i>
                <span>{lang === "zh" ? "星雲法語" : lang === "fil" ? "Larawan ng Salita ng Dharma" : "Dharma Word Artwork"}</span>
              </div>

              {/* 極大且清晰的 ✕ 關閉按鈕 (High contrast 24px icon with gold border) */}
              <button
                onClick={() => setEnlargedImgUrl(null)}
                className="px-4 py-2 rounded-full bg-[#2B1D1D] hover:bg-[#3E2723] text-[#F5E6C8] border-2 border-[#E2C792] flex items-center gap-2 text-xl sm:text-2xl font-bold transition-all active:scale-95 shadow-2xl cursor-pointer"
                aria-label="Close modal"
              >
                <i className="fa-solid fa-xmark text-2xl text-amber-200"></i>
                <span className="text-base sm:text-lg">{lang === "zh" ? "關閉" : lang === "fil" ? "Isara" : "Close"}</span>
              </button>
            </div>

            {/* 核心大圖：寬度 90% (手機端) / 最大 800px (電腦端)，保持原始比例 */}
            <div 
              className="relative flex-1 w-full max-w-[800px] my-auto flex items-center justify-center p-2 sm:p-4 overflow-hidden"
              onClick={() => setEnlargedImgUrl(null)}
            >
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                src={enlargedImgUrl}
                alt="Enlarged Zen Wisdom Artwork"
                className="w-[90vw] max-w-[800px] max-h-[80vh] sm:max-h-[84vh] object-contain rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.9)] border-2 border-[#E2C792] bg-[#140C0A]"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
            </div>

            {/* 底部提示與關閉指引 */}
            <div className="w-full text-center pb-3 z-10 px-2">
              <span className="inline-flex items-center gap-2.5 bg-[#1A100C]/90 border border-[#D4AF37] text-[#F5E6C8] text-sm sm:text-base md:text-lg font-bold px-6 py-2.5 rounded-full shadow-2xl backdrop-blur-md">
                <i className="fa-solid fa-hand-pointer text-amber-300 text-lg"></i>
                <span>{lang === "zh" ? "點擊任意處即可關閉放大" : lang === "fil" ? "I-click kahit saan para isara" : "Click anywhere to close"}</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Toast 提示訊息 (Custom Toast Notification) */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: "-50%" }}
            className="fixed bottom-16 left-1/2 z-50 bg-[#3e2723]/95 text-[#fdf8eb] border border-[#d4af37]/40 px-6 py-3 rounded-full text-xs font-semibold tracking-widest shadow-[0_6px_20px_rgba(0,0,0,0.6)] flex items-center gap-2 whitespace-nowrap"
          >
            <i className="fa-solid fa-bell text-amber-300"></i>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>





    </div>
  );
}
