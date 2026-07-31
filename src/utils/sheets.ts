/**
 * Google Sheets CSV & GViz Zero-Backend Data Pipeline Engine
 * 支援非同步 Fetch、強健 CSV/JSON 解析、預設籤詩 Fallback 與欄位健康檢查
 */

import { ExtendedChit, SheetDataStatus } from "../types";
import { DEFAULT_CHITS } from "../data";

export const DEFAULT_SPREADSHEET_ID = "1-Uh6P1tMkMEmJ-T39sXACGy-NiMZJT_iqeZ2h16eX3Y";

/**
 * 從網址或純 ID 中解析出正確的 Spreadsheet ID
 */
export function extractSpreadsheetId(input: string): string {
  if (!input) return DEFAULT_SPREADSHEET_ID;
  const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return input.trim();
}

/**
 * 強健 CSV 解析器：正確處理多行引號、雙引號跳脫與欄位切割
 */
export function parseCSVData(csvText: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentCell += '"';
          i++; // 跳過下一個引號
        } else {
          inQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if (char === "\n" || (char === "\r" && nextChar === "\n")) {
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c !== "")) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentCell = "";
        if (char === "\r") i++;
      } else {
        currentCell += char;
      }
    }
  }

  if (currentCell !== "" || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c !== "")) {
      lines.push(currentRow);
    }
  }

  return lines;
}

/**
 * 從 Google Sheets 抓取法語資料庫 (CSV API + GViz JSON Fallback + 本地 DEFAULT_CHITS 雙層備援)
 */
export async function fetchChitsFromSheet(rawIdOrUrl: string): Promise<SheetDataStatus> {
  const spreadsheetId = extractSpreadsheetId(rawIdOrUrl);
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv`;

  try {
    const res = await fetch(csvUrl, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Google Sheet 讀取失敗 (HTTP ${res.status})。請確認該試算表已開啟「知道連結的人皆可檢視」權限。`);
    }

    const csvText = await res.text();
    const rows = parseCSVData(csvText);

    if (rows.length < 2) {
      throw new Error("試算表內容為空或無法找到欄位標題行。");
    }

    const headers = rows[0].map((h) => h.toLowerCase().replace(/[\s_#-]+/g, ""));
    const colMap: Record<string, number> = {};
    headers.forEach((h, idx) => {
      colMap[h] = idx;
    });

    const getVal = (row: string[], ...keys: string[]): string => {
      for (const k of keys) {
        const normKey = k.toLowerCase().replace(/[\s_#-]+/g, "");
        if (colMap[normKey] !== undefined && row[colMap[normKey]] !== undefined) {
          return row[colMap[normKey]].trim();
        }
      }
      return "";
    };

    const parsedChits: ExtendedChit[] = [];
    let publishedCount = 0;
    let draftCount = 0;
    let warningCount = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const rawId = getVal(row, "id", "籤號", "編號", "no", "#") || String(i);
      const chinese = getVal(row, "chinese", "text", "法語", "中文", "內容", "dharma");
      const interpretation = getVal(row, "interpretation", "解析", "中文解析", "白話文", "說明");
      const english = getVal(row, "english", "英文", "english_text");
      const englishInterpretation = getVal(row, "englishinterpretation", "英文解析", "english_interpretation");
      const filipino = getVal(row, "filipino", "他加祿語", "菲律賓語", "filipino_text");
      const filipinoInterpretation = getVal(row, "filipinointerpretation", "他加祿語解析", "菲律賓語解析");
      const image_url = getVal(row, "image_url", "image", "圖片", "圖片網址", "img_url", "photo");
      const rawStatus = getVal(row, "status", "狀態", "發布狀態", "state").toLowerCase();

      if (!chinese && !english && !filipino && !image_url) continue;

      const status = rawStatus.includes("draft") || rawStatus.includes("草稿") || rawStatus.includes("暫存") ? "draft" : "published";

      const issues: any[] = [];
      if (!chinese && !english && !filipino) {
        issues.push({ field: "chinese", message: "缺少法語本文內容", severity: "error" });
      }
      if (!image_url) {
        issues.push({ field: "image_url", message: "缺少圖片網址", severity: "warning" });
      }
      if (chinese && !interpretation) {
        issues.push({ field: "interpretation", message: "未填寫中文白話解析", severity: "warning" });
      }

      const hasWarning = issues.length > 0;
      if (hasWarning) warningCount++;
      if (status === "draft") draftCount++;
      else publishedCount++;

      parsedChits.push({
        id: rawId,
        image_url: image_url || "https://lh3.googleusercontent.com/d/13IvO7jyHqSk6MeNz0EVcKVnRS8rGV9lE",
        chinese: chinese || "",
        interpretation: interpretation || "",
        english: english || "",
        englishInterpretation: englishInterpretation || "",
        filipino: filipino || "",
        filipinoInterpretation: filipinoInterpretation || "",
        status,
        rowIndex: i + 1,
        issues,
        hasWarning,
      });
    }

    if (parsedChits.length === 0) {
      throw new Error("試算表中未發現有效的法語資料列，請確認標題行欄位名稱。");
    }

    const nowStr = new Date().toLocaleString("zh-TW", { hour12: false });

    return {
      source: "sheet",
      spreadsheetId,
      lastUpdated: nowStr,
      totalCount: parsedChits.length,
      publishedCount,
      draftCount,
      warningCount,
      errorDetails: null,
      chits: parsedChits,
    };
  } catch (err: any) {
    // 網路或 API 異常，無縫切換至本地 DEFAULT_CHITS 備援庫
    const fallbackChits: ExtendedChit[] = DEFAULT_CHITS.map((c, idx) => ({
      ...c,
      status: "published",
      rowIndex: idx + 1,
      issues: [],
      hasWarning: false,
    }));

    return {
      source: "error",
      spreadsheetId,
      lastUpdated: null,
      totalCount: fallbackChits.length,
      publishedCount: fallbackChits.length,
      draftCount: 0,
      warningCount: 0,
      errorDetails: err?.message || "無法連線至 Google Sheets，已自動啟用本地備援法語庫。",
      chits: fallbackChits,
    };
  }
}
