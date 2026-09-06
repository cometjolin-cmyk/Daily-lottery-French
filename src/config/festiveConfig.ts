export interface FestiveTheme {
  id: string;
  name: string;
  nameEn?: string;
  nameFil?: string;
  startDate?: string;        // 定時排程生效開始日期時間 (支援 "MM-DD"、"MM-DD HH:mm"、"YYYY-MM-DD HH:mm")
  endDate?: string;          // 定時排程生效結束日期時間 (支援 "MM-DD"、"MM-DD HH:mm"、"YYYY-MM-DD HH:mm")
  
  // 1. 視覺與圖示資源
  heroIconUrl: string;       // 中央主題靈氣圖示/聖像網址
  heroVideoUrl?: string;     // 中央主題動態影片網址 (選填，如 MP4 / WebM，支援佛龕海棠景窗自動循環播放)
  coupletLeftUrl?: string;   // 左側對聯/裝飾圖檔 (選填)
  coupletRightUrl?: string;  // 右側對聯/裝飾圖檔 (選填)

  // 2. 色彩主題 (Canvas 粒子與 Glow 視覺)
  particleColors: string[];  // 粒子顏色陣列 (含中央常態飄散靈氣與噴發花火)
  glowColor: string;         // 背景氣場脈衝色系 (CSS rgba)

  // 3. 互動文案與顯示位置
  promptInitial: string;     // 初始提示文案 (中文)
  promptInitialEn?: string;  // 初始提示文案 (英文)
  promptInitialFil?: string; // 初始提示文案 (菲律賓/他加祿語)
  promptSuccess: string;     // 集滿 3 下提示文案 (中文)
  promptSuccessEn?: string;  // 集滿 3 下提示文案 (英文)
  promptSuccessFil?: string; // 集滿 3 下提示文案 (菲律賓/他加祿語)
  blessingText?: string;     // 爆發時出現的吉祥祝福語 (選填)
  blessingTextEn?: string;
  blessingTextFil?: string;
  blessingPosition?: "top" | "middle" | "bottom"; // 祝福語顯示位置 (top: 聖像正上方, middle: 聖像下方, bottom: 視窗底部)

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
    heroIconUrl: "", // 空字串代表無開場節慶圖示與無 Modal 動畫
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
  
  // 🪷 觀世音菩薩成道紀念日 (農曆六月十九)
  guanyinEnlightenment: {
    id: "guanyinEnlightenment",
    name: "觀世音菩薩成道紀念日",
    nameEn: "Guanyin Bodhisattva's Enlightenment Day",
    nameFil: "Kaarawan ng Pagkakaliwanag ni Guanyin Bodhisattva",
    startDate: "07-15 00:00",
    endDate: "08-11 23:59",
    heroIconUrl: "https://lh3.googleusercontent.com/d/1cOuKbewg_I6qoUwLh3EqIKv2A_Sap2XI",
    particleColors: ["#FEF3C7", "#FDE047", "#F59E0B", "#D97706", "#FEF08A", "#FB923C", "#FFFFFF"],
    glowColor: "rgba(245, 158, 11, 0.55)",
    promptInitial: "🪷 點擊三下",
    promptInitialEn: "🪷 Click 3 times",
    promptInitialFil: "🪷 Pindutin nang 3 beses",
    promptSuccess: "✨ 大慈大悲，甘露潤心！✨",
    promptSuccessEn: "✨ Great Compassion & Mercy, \nNectar Moistens the Heart! ✨",
    promptSuccessFil: "✨ Dakilang Habag at Awa, \nBinabasbasan ang Puso! ✨",
    blessingText: "✨ 聞聲救苦 ‧ 悲智雙運 ✨",
    blessingTextEn: "✨ Hearing the Cries of the World ‧ Compassion & Wisdom ✨",
    blessingTextFil: "✨ Dinarinig ang Daing ng Mundo ‧ Habag at Karunungan ✨",
    blessingPosition: "top",
    sparkleFreqBase: 987.77,
    celebrationChords: [523.25, 659.25, 783.99, 1046.5],
  },

  // 🪷 觀世音菩薩誕辰 (農曆二月十九)
  guanyinBirthday: {
    id: "guanyinBirthday",
    name: "觀世音菩薩聖誕",
    nameEn: "Guanyin Bodhisattva's Birthday",
    nameFil: "Kaarawan ni Guanyin Bodhisattva",
    startDate: "03-20",
    endDate: "04-05",
    heroIconUrl: "https://lh3.googleusercontent.com/d/1hmqfPlNlIc9d09RTxaBN6H03x_y4MP85",
    particleColors: ["#FCE7F3", "#F472B6", "#FB7185", "#FEF08A", "#FFFFFF"],
    glowColor: "rgba(244, 114, 182, 0.45)",
    promptInitial: "🪷 輕點蓮花聖像，恭迎觀音聖誕誕辰",
    promptInitialEn: "🪷 Tap the holy lotus to welcome Guanyin's Birthday",
    promptInitialFil: "🪷 Pindutin ang lotus upang salubungin ang Kaarawan ni Guanyin",
    promptSuccess: "🌸 慈悲救苦，福慧圓滿！✨",
    promptSuccessEn: "🌸 Relieving Suffering with Mercy, Full of Blessings & Wisdom! ✨",
    promptSuccessFil: "🌸 Puspos ng Awa at Tulong, Sagana sa Karunungan! ✨",
    blessingText: "✨ 慈航普渡 ‧ 澤被蒼生 ✨",
    blessingTextEn: "✨ Ferry of Compassion ‧ Blessing All Sentient Beings ✨",
    blessingTextFil: "✨ Bangka ng Habag ‧ Pagpapala sa Lahat ng Nilalang ✨",
    blessingPosition: "top",
    sparkleFreqBase: 880.0,
    celebrationChords: [523.25, 659.25, 783.99, 1046.5],
  },

  // 🪷 觀世音菩薩出家紀念日 (農曆九月十九)
  guanyinRenunciation: {
    id: "guanyinRenunciation",
    name: "觀世音菩薩出家紀念日",
    nameEn: "Guanyin Bodhisattva's Renunciation Day",
    nameFil: "Araw ng Pagpapari ni Guanyin Bodhisattva",
    startDate: "10-15",
    endDate: "10-30",
    heroIconUrl: "https://lh3.googleusercontent.com/d/1ljbXT_oHZIU8zdavR_U7ZrdZ0pZfHjYA",
    particleColors: ["#FEF3C7", "#FDE047", "#CA8A04", "#E0F2FE", "#FFFFFF"],
    glowColor: "rgba(234, 179, 8, 0.5)",
    promptInitial: "🪷 點擊圖示，發菩提心結法緣",
    promptInitialEn: "🪷 Tap the icon to awaken Bodhicitta and connect Dharma affinity",
    promptInitialFil: "🪷 Pindutin ang imahe upang pukawin ang puso ng kaliwanagan",
    promptSuccess: "✨ 放下執著，清淨自在！✨",
    promptSuccessEn: "✨ Let Go of Attachments, Pure & Free! ✨",
    promptSuccessFil: "✨ Bitawan ang mga Pasanin, Malinis at Payapa! ✨",
    blessingText: "✨ 捨己利他 ‧ 大願永續 ✨",
    blessingTextEn: "✨ Selfless Altruism ‧ Boundless Great Vows ✨",
    blessingTextFil: "✨ Pagsasakripisyo para sa Kapwa ‧ Walang Hanggang Panata ✨",
    blessingPosition: "top",
    sparkleFreqBase: 783.99,
    celebrationChords: [440.0, 554.37, 659.25, 880.0],
  },

  // ----------------------------------------------------------------
  // 2. 傳統民俗與佛教重大人道節慶
  // ----------------------------------------------------------------

  // 🧧 農曆新年 (正月初一 彌勒菩薩聖誕)
  lunarNewYear: {
    id: "lunarNewYear",
    name: "農曆新年 (彌勒菩薩聖誕)",
    nameEn: "Lunar New Year (Maitreya's Birthday)",
    nameFil: "Bagong Taon ng Kalendaryong Lunar",
    startDate: "01-20",
    endDate: "02-15",
    heroIconUrl: "https://lh3.googleusercontent.com/d/1SYDwUp2PltjQnZHJOHGpKwuIJeb66u-3",
    coupletLeftUrl: "https://lh3.googleusercontent.com/d/1OG1yZiif76uIjzNkIFCP9ZVw-p2TrxhG",
    coupletRightUrl: "https://lh3.googleusercontent.com/d/1OG1yZiif76uIjzNkIFCP9ZVw-p2TrxhG",
    particleColors: ["#FFD700", "#FFF8DC", "#FF8C00", "#FFA500", "#FFE4B5", "#FFFFFF"],
    glowColor: "rgba(255, 215, 0, 0.55)",
    promptInitial: "✨ 點擊或輕抹開運福印，匯聚新年福氣",
    promptInitialEn: "✨ Tap or swipe the seal to gather New Year blessings",
    promptInitialFil: "✨ Pindutin o ikumpas ang selyo upang tipunin ang suwerte sa Bagong Taon",
    promptSuccess: "🎉 福氣滿載，大吉大利！✨",
    promptSuccessEn: "🎉 Abundant Blessings & Great Auspiciousness! ✨",
    promptSuccessFil: "🎉 Masaganang Pagpapala at Manigong Bagong Taon! ✨",
    blessingText: "✨ 吉星高照 ‧ 法喜充滿 ✨",
    blessingTextEn: "✨ Lucky Stars Shine Bright ‧ Full of Dharma Joy ✨",
    blessingTextFil: "✨ Nagniningning na Bituin ‧ Puspos ng Kagalakan ✨",
    blessingPosition: "top",
    sparkleFreqBase: 600,
    celebrationChords: [523.25, 659.25, 783.99, 1046.5],
  },

  // 🥮 中秋佳節 (八月十五)
  midAutumn: {
    id: "midAutumn",
    name: "中秋佳節",
    nameEn: "Mid-Autumn Festival",
    nameFil: "Pista ng Gitnang Taglagas",
    startDate: "09-15",
    endDate: "10-05",
    heroIconUrl: "https://lh3.googleusercontent.com/d/1KpDc6bkeJnJRwEVqomd-k77vGLHysLMh",
    particleColors: ["#FEF08A", "#FDE047", "#F59E0B", "#FB923C", "#FFE4B5", "#FFFFFF"],
    glowColor: "rgba(253, 224, 71, 0.45)",
    promptInitial: "🌕 點擊或輕抹月印，匯聚中秋團圓福氣",
    promptInitialEn: "🌕 Tap or swipe the moon seal to gather reunion blessings",
    promptInitialFil: "🌕 Pindutin ang buwan upang tipunin ang pagkakaisa at suwerte",
    promptSuccess: "🥮 月圓人團圓，花好月圓！✨",
    promptSuccessEn: "🥮 Full Moon & Warm Reunion, Perfect Harmony! ✨",
    promptSuccessFil: "🥮 Bilog ang Buwan, Buo ang Pamilya! ✨",
    blessingText: "✨ 丹桂飄香 ‧ 團圓吉祥 ✨",
    blessingTextEn: "✨ Osmanthus Fragrance ‧ Auspicious Reunion ✨",
    blessingTextFil: "✨ Mabangong Hangin ‧ Masayang Pagsasama ✨",
    blessingPosition: "top",
    sparkleFreqBase: 660,
    celebrationChords: [587.33, 739.99, 880.00, 1174.66],
  },

  // 🌸 佛誕節 / 浴佛節 (四月初八 釋迦牟尼佛聖誕)
  buddhaBirthday: {
    id: "buddhaBirthday",
    name: "佛誕節 (浴佛勝會)",
    nameEn: "Buddha's Birthday (Vesak Day)",
    nameFil: "Kaarawan ng Buddha (Araw ng Vesak)",
    startDate: "05-10",
    endDate: "05-25",
    heroIconUrl: "https://lh3.googleusercontent.com/d/1z5EAYxCludS7r-EKHTsueGpH7GBmpakK",
    particleColors: ["#FDE047", "#F472B6", "#FB7185", "#FAE8FF", "#FFFFFF"],
    glowColor: "rgba(250, 204, 21, 0.5)",
    promptInitial: "🪷 點擊或輕抹蓮花，洗滌心塵結佛緣",
    promptInitialEn: "🪷 Tap the lotus to cleanse the heart and connect with the Buddha",
    promptInitialFil: "🪷 Pindutin ang lotus upang hugasan ang isip at kumonekta sa Buddha",
    promptSuccess: "🌸 佛光普照，福慧增長！✨",
    promptSuccessEn: "🌸 Buddha's Light Shines, Blessing & Wisdom Grow! ✨",
    promptSuccessFil: "🌸 Liwanag ng Buddha ay Lumalaganap, Karunungan ay Lumalago! ✨",
    blessingText: "✨ 慈悲喜捨 ‧ 歡喜自在 ✨",
    blessingTextEn: "✨ Compassion, Joy & Equanimity ‧ Blissful Freedom ✨",
    blessingTextFil: "✨ Habag, Saya at Pagkakapantay ‧ Malinis na Kalayaan ✨",
    blessingPosition: "top",
    sparkleFreqBase: 523.25,
    celebrationChords: [440.00, 554.37, 659.25, 880.00],
  },

  // 🏮 地藏王菩薩聖誕當天 (農曆七月廿九正日 / 國曆 09-10)
  jizangBirthday: {
    id: "jizangBirthday",
    name: "地藏王菩薩聖誕 (正日)",
    nameEn: "Ksitigarbha Bodhisattva's Birthday",
    nameFil: "Kaarawan ni Ksitigarbha Bodhisattva",
    startDate: "09-10 00:00",
    endDate: "09-10 23:59",
    heroIconUrl: "https://lh3.googleusercontent.com/d/1l_S7fKQL1cqh7DnLju77V4BQ3AYqLVDe",
    heroVideoUrl: "/videos/jizang_birthday.mp4", // 內建高畫質仰角微距巡禮影片，支援自動循環播放與 Google Drive 直連網址替換
    particleColors: ["#FEF08A", "#F59E0B", "#B45309", "#FFFFFF"],
    glowColor: "rgba(245, 158, 11, 0.55)",
    promptInitial: "🪷 誠心點擊心燈 ‧ 集福三次",
    promptInitialEn: "🪷 Sincerity lights the lamp of the heart, tap 3 times",
    promptInitialFil: "🪷 Sindihan ang ilawan ng puso, pindutin nang 3 beses",
    promptSuccess: "✨ 摩尼放光，度脫一切！✨",
    promptSuccessEn: "✨ Mani Jewel Radiates Light, Delivering All Beings! ✨",
    promptSuccessFil: "✨ Liwanag ng Mani Jewel, Kaligtasan para sa Lahat! ✨",
    blessingText: "✨ 地獄不空 ‧ 誓不成佛 ✨",
    blessingTextEn: "✨ Not Until Hells Are Emptied Will I Attain Buddhahood ✨",
    blessingTextFil: "✨ Hangga't May Naghihirap, Hindi Ako Titigil sa Pagtulong ✨",
    blessingPosition: "top", // 指定置於聖像正上方
    sparkleFreqBase: 440.0,
    celebrationChords: [349.23, 440.0, 523.25, 698.46],
  },

  // 🏮 地藏王菩薩聖誕慶期 (孝親月 / 國曆 08-12 ~ 09-09)
  jizangMonth: {
    id: "jizangMonth",
    name: "地藏王菩薩聖誕慶期 (孝親月)",
    nameEn: "Ksitigarbha Filial Piety Month",
    nameFil: "Buwan ng Paggunita kay Ksitigarbha",
    startDate: "08-12 00:00",
    endDate: "09-09 23:59",
    heroIconUrl: "https://lh3.googleusercontent.com/d/11vKXvOsss3gXT6waK4bG5K6MCWTu7SGu",
    particleColors: ["#FEF08A", "#F59E0B", "#B45309", "#FFFFFF"],
    glowColor: "rgba(245, 158, 11, 0.5)",
    promptInitial: "🕯️ 誠心點亮心燈，感念菩薩大願",
    promptInitialEn: "🕯️ Sincerity lights the lamp of the heart, honoring the great vows",
    promptInitialFil: "🕯️ Sindihan ang ilawan ng puso, alalahanin ang dakilang panata",
    promptSuccess: "✨ 大願宏深，度脫一切！✨",
    promptSuccessEn: "✨ Vast & Profound Vows, Delivering All Beings! ✨",
    promptSuccessFil: "✨ Dakilang Panata, Kaligtasan para sa Lahat! ✨",
    blessingText: "✨ 孝親感恩 ‧ 廣積善根 ✨",
    blessingTextEn: "✨ Filial Gratitude ‧ Cultivating Wholesome Roots ✨",
    blessingTextFil: "✨ Pasasalamat sa Magulang ‧ Pagtatanim ng Kabutihan ✨",
    blessingPosition: "top", // 指定置於聖像正上方
    sparkleFreqBase: 440.0,
    celebrationChords: [349.23, 440.0, 523.25, 698.46],
  },
};

/**
 * 根據當前日期時間自動取得定時排程對應的節慶主題 ID
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

  const keys = Object.keys(FESTIVE_CONFIGS).filter((k) => k !== "original");

  for (const key of keys) {
    const cfg = FESTIVE_CONFIGS[key];
    if (cfg.startDate && cfg.endDate) {
      let start = cfg.startDate.replace("T", " ").trim();
      let end = cfg.endDate.replace("T", " ").trim();

      // 正規化擴展時間格式，防呆不同長度混用 (例如 "09-10" 與 "09-10 23:59")
      if (start.length === 5) start = `${start} 00:00`;
      if (end.length === 5) end = `${end} 23:59`;
      if (start.length === 10) start = `${start} 00:00`;
      if (end.length === 10) end = `${end} 23:59`;

      // 年月日時分比對 (16 字元)
      if (start.length === 16 && end.length === 16) {
        if (yyyymmddhhmm >= start && yyyymmddhhmm <= end) return key;
      }
      // 月日時分比對 (11 字元)
      else if (start.length === 11 && end.length === 11) {
        if (start <= end) {
          if (mmddhhmm >= start && mmddhhmm <= end) return key;
        } else {
          // 跨年區間 (如過年 12-30 ~ 01-15)
          if (mmddhhmm >= start || mmddhhmm <= end) return key;
        }
      }
      // 純日期回退比對
      else if (mmdd >= cfg.startDate.slice(0, 5) && mmdd <= cfg.endDate.slice(0, 5)) {
        return key;
      }
    }
  }

  return "original";
}

/**
 * 自動將 Google Drive 的分享或預覽網址轉換為免驗證、直連串流的網址
 * @param url 輸入網址 (支援 Google Drive 分享連結或一般 MP4 / 圖片網址)
 * @param isVideo 是否為影片串流
 */
export function formatGoogleDriveUrl(url: string, isVideo = false): string {
  if (!url) return "";
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    const fileId = match[1];
    if (isVideo) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  return url;
}
