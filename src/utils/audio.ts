// 共享全域 Web Audio 音效引擎 (支援 iOS / Chrome / Safari 自動喚醒解鎖)
let sharedAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  try {
    const AudioCtxClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return null;

    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioCtxClass();
    }

    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }

    return sharedAudioCtx;
  } catch (e) {
    console.warn("無法初始化 Web Audio Context:", e);
    return null;
  }
}

// 任意使用者點擊手勢立即喚醒音效引擎
export function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

// 1. 頌缽與大磬深鳴 (Singing Bowl / 磬聲)
export function playSingingBowl(isMuted: boolean = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  try {
    const now = ctx.currentTime;
    const partials = [
      { freq: 216, gain: 0.35, decay: 3.5 },
      { freq: 432, gain: 0.28, decay: 3.0 },
      { freq: 576, gain: 0.18, decay: 2.4 },
      { freq: 864, gain: 0.12, decay: 1.8 },
      { freq: 1296, gain: 0.08, decay: 1.2 },
    ];

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

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(p.gain, now + 0.06);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + p.decay + 0.1);
    });
  } catch (err) {
    console.warn("播放頌缽音效失敗:", err);
  }
}

// 2. 九環錫杖清脆金屬微鳴 (環珮玲瓏與星光火花)
export function playSparkle(baseFreq: number = 587.33, isMuted: boolean = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  try {
    const now = ctx.currentTime;

    // A. 錫杖環珮微鳴
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.65, now + 0.15);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);

    // B. 空靈頌缽與引磬泛音 (Singing Bowl Resonance)
    const bowlOsc = ctx.createOscillator();
    const bowlGain = ctx.createGain();
    bowlOsc.type = "triangle";
    bowlOsc.frequency.setValueAtTime(baseFreq * 1.5, now);
    bowlGain.gain.setValueAtTime(0.1, now);
    bowlGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    bowlOsc.connect(bowlGain);
    bowlGain.connect(ctx.destination);
    bowlOsc.start(now);
    bowlOsc.stop(now + 0.65);
  } catch (err) {
    console.warn("播放錫杖音效失敗:", err);
  }
}

// 3. 圓滿和弦慶祝 (Celebration Chords)
export function playCelebration(chords: number[] = [523.25, 659.25, 783.99, 1046.5], isMuted: boolean = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  try {
    const now = ctx.currentTime;
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.85);
    });
  } catch (err) {
    console.warn("播放和弦音效失敗:", err);
  }
}

// 4. 揭示法語卷軸大磬迴盪音 (Zen Reveal Bloom)
export function playZenRevealSound(isMuted: boolean = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  try {
    const now = ctx.currentTime;
    const freqs = [144.0, 288.5, 433.0, 578.0, 866.0];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      const volume = idx === 0 ? 0.25 : 0.1 / idx;
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(volume, now + 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 3.3);
    });
  } catch (err) {
    console.warn("播放開籤音效失敗:", err);
  }
}
