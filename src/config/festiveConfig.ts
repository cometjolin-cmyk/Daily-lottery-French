export interface FestiveTheme {
  id: string;
  name: string;
  nameEn?: string;
  nameFil?: string;
  startDate?: string;        // 定時排程生效開始日期時間 (支援 "MM-DD"、"MM-DD HH:mm"、"YYYY-MM-DD HH:mm")
  endDate?: string;          // 定時排程生效結束日期時間 (支援 "MM-DD"、"MM-DD HH:mm"、"YYYY-MM-DD HH:mm")
  // 1. 視覺與圖示資源
  heroIconUrl: string;       // 中央主題靈氣圖示/聖像網址
  coupletLeftUrl?: string;   // 左側對聯/裝飾圖檔 (選填)
  coupletRightUrl?: string;  // 右側對聯/裝飾圖檔 (選填)

  // 2. 色彩主題 (Canvas 粒子與 Glow 視覺)
  particleColors: string[];  // 粒子顏色陣列 (含中央常態飄散靈氣與噴發花火)
  glowColor: string;         // 背景氣場脈衝色系 (CSS rgba)

  // 3. 互動文案
  promptInitial: string;     // 初始提示文案 (中文)
  promptInitialEn?: string;  // 初始提示文案 (英文)
  promptInitialFil?: string; // 初始提示文案 (菲律賓/他加祿語)
  promptSuccess: string;     // 集滿 3 下提示文案 (中文)
  promptSuccessEn?: string;  // 集滿 3 下提示文案 (英文)
  promptSuccessFil?: string; // 集滿 3 下提示文案 (菲律賓/他加祿語)
  blessingText?: string;     // 爆發時出現的吉祥祝福語 (選填)
  blessingTextEn?: string;
  blessingTextFil?: string;

  // 4. 音效設定 (Web Audio API)
  sparkleFreqBase: number;   // 每次點擊清脆音效基礎頻率 (Hz)
  celebrationChords: number[]; // 滿 3 下慶賀四和音頻率陣列 (Hz)
}

export const FESTIVE_CONFIGS: Record<string, FestiveTheme> = {
  // ----------------------------------------------------------------
  // 0. 原始主題 (日常無節日)
  // ----------------------------------------------------------------
  original: {
    id: "original",
    name: "原始主題 (日常無節日)",
    nameEn: "Original Theme (Standard)",
    nameFil: "Orihinal na Tema (Karaniwan)",
    heroIconUrl: "https://lh3.googleusercontent.com/d/1cOuKbewg_I6qoUwLh3EqIKv2A_Sap2XI",
    particleColors: ["#FFFDF2", "#F9E7B3", "#EFCE88", "#F59E0B", "#FFFFFF"],
    glowColor: "rgba(245, 158, 11, 0.45)",
    promptInitial: "🪷 點擊三下",
    promptInitialEn: "🪷 Click 3 times",
    promptInitialFil: "🪷 Pindutin nang 3 beses",
    promptSuccess: "✨ 心常清淨，福慧圓滿！✨",
    promptSuccessEn: "✨ Pure Heart & Peace, Full of Wisdom! ✨",
    promptSuccessFil: "✨ Malingap at Payapa, Kaligayahan sa Puso! ✨",
    sparkleFreqBase: 987.77,
    celebrationChords: [523.25, 659.25, 783.99, 1046.5],
  },

  // ----------------------------------------------------------------
  // 1. 觀世音菩薩三大殊勝紀念日
  // ----------------------------------------------------------------
  
  // 🪷 觀世音菩薩成道紀念日 (農曆六月十九) - 預設
  guanyinEnlightenment: {
    id: "guanyinEnlightenment",
    name: "觀世音菩薩成道紀念日",
    nameEn: "Guanyin Bodhisattva's Enlightenment Day",
    nameFil: "Kaarawan ng Pagkakaliwanag ni Guanyin Bodhisattva",
    startDate: "08-01 00:00",
    endDate: "08-02 00:00",
    heroIconUrl: "https://lh3.googleusercontent.com/d/1cOuKbewg_I6qoUwLh3EqIKv2A_Sap2XI",
    particleColors: ["#FEF3C7", "#FDE047", "#F59E0B", "#D97706", "#FEF08A", "#FB923C", "#FFFFFF"], // 暖琥珀金、暖光黃與慈光金
    glowColor: "rgba(245, 158, 11, 0.55)",
    promptInitial: "🪷 點擊三下",
    promptInitialEn: "🪷 Click 3 times",
    promptInitialFil: "🪷 Pindutin nang 3 beses",
    promptSuccess: "✨大慈大悲，甘露潤心！✨",
    promptSuccessEn: "✨ Great Compassion & Mercy, \nNectar Moistens the Heart! ✨",
    promptSuccessFil: "✨ Dakilang Habag at Awa, \nBinabasbasan ang Puso! ✨",
    sparkleFreqBase: 987.77, // B5 頻率 (清澈水滴與靈磬)
    celebrationChords: [523.25, 659.25, 783.99, 1046.5], // C5, E5, G5, C6 甘露和音
  },

  // 🪷 觀世音菩薩誕辰 (農曆二月十九)
  guanyinBirthday: {
    id: "guanyinBirthday",
    name: "觀世音菩薩聖誕",
    startDate: "03-20",
    endDate: "04-05",
    heroIconUrl: "https://lh3.googleusercontent.com/d/1hmqfPlNlIc9d09RTxaBN6H03x_y4MP85",
    particleColors: ["#FCE7F3", "#F472B6", "#FB7185", "#FEF08A", "#FFFFFF"], // 白蓮粉紅與佛光金
    glowColor: "rgba(244, 114, 182, 0.45)",
    promptInitial: "🪷 輕點蓮花聖像，恭迎觀音聖誕誕辰",
    promptSuccess: "🌸 慈悲救苦，福慧圓滿！✨",
    blessingText: "✨ 慈航普渡 ‧ 澤被蒼生 ✨",
    sparkleFreqBase: 880.0, // A5 頻率
    celebrationChords: [523.25, 659.25, 783.99, 1046.5],
  },

  // 🪷 觀世音菩薩出家紀念日 (農曆九月十九)
  guanyinRenunciation: {
    id: "guanyinRenunciation",
    name: "觀世音菩薩出家紀念日",
    startDate: "10-15",
    endDate: "10-30",
    heroIconUrl: "https://lh3.googleusercontent.com/d/1ljbXT_oHZIU8zdavR_U7ZrdZ0pZfHjYA",
    particleColors: ["#FEF3C7", "#FDE047", "#CA8A04", "#E0F2FE", "#FFFFFF"], // 智慧琥珀金與清淨水藍
    glowColor: "rgba(234, 179, 8, 0.5)",
    promptInitial: "🪷 點擊圖示，發菩提心結法緣",
    promptSuccess: "✨ 放下執著，清淨自在！✨",
    blessingText: "✨ 捨己利他 ‧ 大願永續 ✨",
    sparkleFreqBase: 783.99, // G5 頻率
    celebrationChords: [440.0, 554.37, 659.25, 880.0],
  },

  // ----------------------------------------------------------------
  // 2. 傳統民俗與佛教重大人道節慶
  // ----------------------------------------------------------------

  // 🧧 農曆新年 (正月初一 彌勒菩薩聖誕)
  lunarNewYear: {
    id: "lunarNewYear",
    name: "農曆新年 (彌勒菩薩聖誕)",
    startDate: "01-20",
    endDate: "02-15",
    heroIconUrl: "https://lh3.googleusercontent.com/d/1SYDwUp2PltjQnZHJOHGpKwuIJeb66u-3",
    coupletLeftUrl: "https://lh3.googleusercontent.com/d/1OG1yZiif76uIjzNkIFCP9ZVw-p2TrxhG",
    coupletRightUrl: "https://lh3.googleusercontent.com/d/1OG1yZiif76uIjzNkIFCP9ZVw-p2TrxhG",
    particleColors: ["#FFD700", "#FFF8DC", "#FF8C00", "#FFA500", "#FFE4B5", "#FFFFFF"], // 喜慶赤金與富貴金
    glowColor: "rgba(255, 215, 0, 0.55)",
    promptInitial: "✨ 點擊或輕抹開運福印，匯聚新年福氣",
    promptSuccess: "🎉 福氣滿載，大吉大利！✨",
    blessingText: "✨ 吉星高照 ‧ 法喜充滿 ✨",
    sparkleFreqBase: 600,
    celebrationChords: [523.25, 659.25, 783.99, 1046.5],
  },

  // 🥮 中秋佳節 (八月十五)
  midAutumn: {
    id: "midAutumn",
    name: "中秋佳節",
    startDate: "09-15",
    endDate: "10-05",
    heroIconUrl: "https://lh3.googleusercontent.com/d/1KpDc6bkeJnJRwEVqomd-k77vGLHysLMh",
    particleColors: ["#FEF08A", "#FDE047", "#F59E0B", "#FB923C", "#FFE4B5", "#FFFFFF"], // 月光金與琥珀暖光
    glowColor: "rgba(253, 224, 71, 0.45)",
    promptInitial: "🌕 點擊或輕抹月印，匯聚中秋團圓福氣",
    promptSuccess: "🥮 月圓人團圓，花好月圓！✨",
    blessingText: "✨ 丹桂飄香 ‧ 團圓吉祥 ✨",
    sparkleFreqBase: 660,
    celebrationChords: [587.33, 739.99, 880.00, 1174.66],
  },

  // 🌸 佛誕節 / 浴佛節 (四月初八 釋迦牟尼佛聖誕)
  buddhaBirthday: {
    id: "buddhaBirthday",
    name: "佛誕節 (浴佛勝會)",
    startDate: "05-10",
    endDate: "05-25",
    heroIconUrl: "https://lh3.googleusercontent.com/d/1z5EAYxCludS7r-EKHTsueGpH7GBmpakK",
    particleColors: ["#FDE047", "#F472B6", "#FB7185", "#FAE8FF", "#FFFFFF"], // 佛光金與蓮花粉
    glowColor: "rgba(250, 204, 21, 0.5)",
    promptInitial: "🪷 點擊或輕抹蓮花，洗滌心塵結佛緣",
    promptSuccess: "🌸 佛光普照，福慧增長！✨",
    blessingText: "✨ 慈悲喜捨 ‧ 歡喜自在 ✨",
    sparkleFreqBase: 523.25,
    celebrationChords: [440.00, 554.37, 659.25, 880.00],
  },

  // 🏮 地藏王菩薩聖誕 (七月三十)
  jizangBirthday: {
    id: "jizangBirthday",
    name: "地藏王菩薩聖誕",
    startDate: "08-25",
    endDate: "09-10",
    heroIconUrl: "https://lh3.googleusercontent.com/d/1awGr1mIfutj4WlTlB9pVEWr1SpZ4cIc9",
    particleColors: ["#FEF08A", "#F59E0B", "#B45309", "#FFFFFF"], // 明珠金與錫杖銅黃
    glowColor: "rgba(245, 158, 11, 0.5)",
    promptInitial: "🕯️ 誠心點亮心燈，感念菩薩大願",
    promptSuccess: "✨ 大願宏深，度脫一切！✨",
    blessingText: "✨ 地獄不空 ‧ 誓不成佛 ✨",
    sparkleFreqBase: 440.0, // A4 低沉莊嚴音
    celebrationChords: [349.23, 440.0, 523.25, 698.46], // F4, A4, C5, F5 孝親大願和音
  }
};

/**
  根據當前日期時間自動取得定時排程對應的節慶主題 ID
  支援以下時間排程格式：
  - "MM-DD" (全天，如 "08-01")
  - "MM-DD HH:mm" (精準時分，如 "08-01 08:00" 或 "08-01 22:30")
  - "YYYY-MM-DD" (指定年份全天，如 "2026-08-01")
  - "YYYY-MM-DD HH:mm" (指定年份精準時分，如 "2026-08-01 08:00")
 */
export function getScheduledThemeId(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const mmdd = `${month}-${day}`;
  const mmddhhmm = `${mmdd} ${hours}:${minutes}`;
  const yyyymmdd = `${year}-${mmdd}`;
  const yyyymmddhhmm = `${yyyymmdd} ${hours}:${minutes}`;

  for (const key of Object.keys(FESTIVE_CONFIGS)) {
    if (key === "original") continue;
    const cfg = FESTIVE_CONFIGS[key];
    if (cfg.startDate && cfg.endDate) {
      const start = cfg.startDate.replace("T", " ").trim();
      const end = cfg.endDate.replace("T", " ").trim();

      // 1. 年月日 + 時分 (例: "2026-08-01 08:00")
      if (start.length === 16 && end.length === 16) {
        if (yyyymmddhhmm >= start && yyyymmddhhmm <= end) return key;
      }
      // 2. 月日 + 時分 (例: "08-01 08:00")
      else if (start.length === 11 && end.length === 11) {
        if (mmddhhmm >= start && mmddhhmm <= end) return key;
      }
      // 3. 年月日 (例: "2026-08-01")
      else if (start.length === 10 && end.length === 10) {
        if (yyyymmdd >= start && yyyymmdd <= end) return key;
      }
      // 4. 月日 (例: "08-01")
      else if (start.length === 5 && end.length === 5) {
        if (mmdd >= start && mmdd <= end) return key;
      }
    }
  }
  return "original";
}

