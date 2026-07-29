/**
 * Google Sheets Data Integration & Inspection Service
 */

import { ExtendedChit, ChitIssue, SheetDataStatus } from "../types";

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

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[\s_#-]+/g, "");
}

/**
 * 驗證單筆法語資料，自動偵測缺少或異常欄位
 */
function validateChit(chit: Partial<ExtendedChit>, rowIndex: number): { issues: ChitIssue[]; hasWarning: boolean } {
  const issues: ChitIssue[] = [];

  if (!chit.chinese && !chit.english && !chit.filipino) {
    issues.push({
      field: "chinese",
      message: "缺少法語本文內容 (Chinese / English / Filipino 均空白)",
      severity: "error",
    });
  }

  if (!chit.image_url) {
    issues.push({
      field: "image_url",
      message: "缺少圖片網址 (image_url 空白)",
      severity: "warning",
    });
  } else if (!chit.image_url.startsWith("http://") && !chit.image_url.startsWith("https://") && !chit.image_url.startsWith("/")) {
    issues.push({
      field: "image_url",
      message: "圖片網址格式可能不正確 (需為 http/https 連結或相對路徑)",
      severity: "warning",
    });
  }

  if (chit.chinese && !chit.interpretation) {
    issues.push({
      field: "interpretation",
      message: "未填寫中文法語白話解析",
      severity: "warning",
    });
  }

  if (!chit.english) {
    issues.push({
      field: "english",
      message: "未填寫英文翻譯 (English)",
      severity: "warning",
    });
  }

  if (!chit.filipino) {
    issues.push({
      field: "filipino",
      message: "未填寫他加祿語翻譯 (Filipino)",
      severity: "warning",
    });
  }

  const hasWarning = issues.length > 0;
  return { issues, hasWarning };
}

/**
 * 從 Google Sheets GViz API 取得資料並解析
 */
export async function fetchChitsFromSheet(rawIdOrUrl: string): Promise<SheetDataStatus> {
  const spreadsheetId = extractSpreadsheetId(rawIdOrUrl);
  const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;

  try {
    const res = await fetch(gvizUrl, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Google Sheet 讀取失敗 (HTTP ${res.status})。請確認該試算表已開啟「知道連結的人皆可檢視」權限。`);
    }

    const text = await res.text();
    const startIdx = text.indexOf("{");
    const endIdx = text.lastIndexOf("}");

    if (startIdx === -1 || endIdx === -1) {
      throw new Error("試算表回傳格式無效，無法解析 GViz JSON 數據");
    }

    const jsonString = text.substring(startIdx, endIdx + 1);
    const parsedData = JSON.parse(jsonString);

    if (parsedData.status === "error") {
      const msg = parsedData.errors?.[0]?.detailed_message || parsedData.errors?.[0]?.message || "Google Sheets API 回傳錯誤";
      throw new Error(msg);
    }

    const table = parsedData.table;
    if (!table || !table.rows) {
      throw new Error("試算表內容為空或無法抓取資料表");
    }

    const colIndexMap: Record<string, number> = {};
    const cols = table.cols || [];

    cols.forEach((col: any, idx: number) => {
      if (col && col.label) {
        const norm = normalizeHeader(col.label);
        colIndexMap[norm] = idx;
      }
    });

    let startRowIndex = 0;
    const firstRowCells = table.rows[0]?.c || [];
    const hasRowZeroHeaders = firstRowCells.some((cell: any) => {
      if (!cell || !cell.v) return false;
      const str = String(cell.v).toLowerCase();
      return str.includes("id") || str.includes("chinese") || str.includes("text") || str.includes("image") || str.includes("法語") || str.includes("解析");
    });

    if (hasRowZeroHeaders && Object.keys(colIndexMap).length === 0) {
      startRowIndex = 1;
      firstRowCells.forEach((cell: any, idx: number) => {
        if (cell && cell.v) {
          const norm = normalizeHeader(String(cell.v));
          colIndexMap[norm] = idx;
        }
      });
    }

    const getCellValue = (rowCells: any[], ...possibleKeys: string[]): string => {
      for (const key of possibleKeys) {
        const normKey = normalizeHeader(key);
        if (colIndexMap[normKey] !== undefined) {
          const cell = rowCells[colIndexMap[normKey]];
          if (cell && cell.v !== null && cell.v !== undefined) {
            return String(cell.v).trim();
          }
        }
      }
      return "";
    };

    const parsedChits: ExtendedChit[] = [];
    let publishedCount = 0;
    let draftCount = 0;
    let warningCount = 0;

    for (let r = startRowIndex; r < table.rows.length; r++) {
      const row = table.rows[r];
      if (!row || !row.c) continue;
      const cells = row.c;

      const rawId = getCellValue(cells, "id", "籤號", "編號", "no", "#") || String(r + 1);
      const chinese = getCellValue(cells, "chinese", "text", "法語", "中文", "內容", "title", "dharma");
      const interpretation = getCellValue(cells, "interpretation", "解析", "中文解析", "白話文", "說明");
      const english = getCellValue(cells, "english", "英文", "英文法語", "english_text");
      const englishInterpretation = getCellValue(cells, "englishinterpretation", "英文解析", "english_interpretation");
      const filipino = getCellValue(cells, "filipino", "他加祿語", "菲律賓語", "filipino_text");
      const filipinoInterpretation = getCellValue(cells, "filipinointerpretation", "他加祿語解析", "菲律賓語解析");
      const image_url = getCellValue(cells, "image_url", "image", "圖片", "圖片網址", "img_url", "photo");
      const rawStatus = getCellValue(cells, "status", "狀態", "發布狀態", "state").toLowerCase();

      if (!chinese && !english && !filipino && !image_url) {
        continue;
      }

      const status = (rawStatus.includes("draft") || rawStatus.includes("草稿") || rawStatus.includes("暫存")) ? "draft" : "published";

      const partialChit: ExtendedChit = {
        id: rawId,
        image_url: image_url || "/test_jul2.png",
        chinese: chinese || "",
        interpretation: interpretation || "",
        english: english || "",
        englishInterpretation: englishInterpretation || "",
        filipino: filipino || "",
        filipinoInterpretation: filipinoInterpretation || "",
        status,
        rowIndex: r + 1,
      };

      const { issues, hasWarning } = validateChit(partialChit, r + 1);
      partialChit.issues = issues;
      partialChit.hasWarning = hasWarning;

      if (hasWarning) warningCount++;
      if (status === "draft") draftCount++;
      else publishedCount++;

      parsedChits.push(partialChit);
    }

    if (parsedChits.length === 0) {
      throw new Error("試算表中未發現有效的法語資料列，請檢查欄位格式與標題名稱。");
    }

    const nowStr = new Date().toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

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
    return {
      source: "error",
      spreadsheetId,
      lastUpdated: null,
      totalCount: 0,
      publishedCount: 0,
      draftCount: 0,
      warningCount: 0,
      errorDetails: err?.message || "無法連線至 Google Sheets，請檢查網路或權限",
      chits: [],
    };
  }
}
