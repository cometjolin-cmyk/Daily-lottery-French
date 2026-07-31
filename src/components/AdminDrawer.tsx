import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SheetDataStatus } from "../types";
import { DEFAULT_SPREADSHEET_ID } from "../services/sheets";
import { FESTIVE_CONFIGS, getScheduledThemeId } from "../config/festiveConfig";

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  status: SheetDataStatus;
  onRefresh: () => void;
  onUpdateSheetId: (newId: string) => void;
  isFetching: boolean;
  onExitAdminMode?: () => void;
  festiveKey?: string;
  onSelectFestiveKey?: (key: string) => void;
  onTriggerPortal?: () => void;
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({
  isOpen,
  onClose,
  status,
  onRefresh,
  onUpdateSheetId,
  isFetching,
  onExitAdminMode,
  festiveKey = "guanyinEnlightenment",
  onSelectFestiveKey,
  onTriggerPortal,
}) => {
  const [inputSheetId, setInputSheetId] = useState<string>(status.spreadsheetId || DEFAULT_SPREADSHEET_ID);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "published" | "draft" | "warning">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const rawSheetUrl = `https://docs.google.com/spreadsheets/d/${status.spreadsheetId || DEFAULT_SPREADSHEET_ID}/edit`;

  const handleSheetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSheetId.trim()) {
      onUpdateSheetId(inputSheetId.trim());
    }
  };

  const filteredChits = status.chits.filter((item) => {
    if (filterType === "published" && item.status === "draft") return false;
    if (filterType === "draft" && item.status !== "draft") return false;
    if (filterType === "warning" && !item.hasWarning) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      (item.chinese && item.chinese.toLowerCase().includes(q)) ||
      (item.english && item.english.toLowerCase().includes(q)) ||
      (item.interpretation && item.interpretation.toLowerCase().includes(q))
    );
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99990] flex justify-end bg-black/70 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative z-10 w-full max-w-2xl h-full bg-stone-900 border-l border-stone-800 text-stone-100 flex flex-col shadow-2xl overflow-hidden"
        >
          {/* 儀表板頁首 */}
          <div className="p-4 border-b border-stone-800 bg-stone-950 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">⚙️</span>
              <div>
                <h2 className="text-lg font-bold text-amber-200">管理員診斷儀表板 (Admin Drawer)</h2>
                <p className="text-xs text-amber-200/60">節慶 Portal 切換 ‧ Google Sheets 零後端 pipeline 診斷</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* 內容區 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 1. 節慶主題切換與即時測試 Portal 觸發區 */}
            <div className="bg-stone-800/90 border border-amber-500/40 rounded-xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 tracking-wider flex items-center gap-1.5">
                  <span>🪷</span> 節慶全螢幕 Portal 主題切換 (Festive Theme)
                </label>
                <span className="text-[11px] px-2 py-0.5 rounded bg-stone-950 text-amber-300 border border-amber-700/60 font-mono">
                  {festiveKey}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                <select
                  value={festiveKey}
                  onChange={(e) => onSelectFestiveKey && onSelectFestiveKey(e.target.value)}
                  className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-amber-200 focus:outline-none focus:border-amber-400 cursor-pointer font-medium"
                >
                  <option value="auto">
                    📅 [自動定時排程] 依當前國曆/節慶日期自動觸發 (目前當前: {FESTIVE_CONFIGS[getScheduledThemeId()]?.name || '原始主題'})
                  </option>
                  {Object.values(FESTIVE_CONFIGS).map((config) => (
                    <option key={config.id} value={config.id}>
                      {config.name} {config.startDate ? `(${config.startDate} ~ ${config.endDate})` : ""}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    if (onTriggerPortal) onTriggerPortal();
                  }}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>✨</span> 即時測試並喚醒 Portal Modal
                </button>
              </div>
            </div>

            {/* 2. Google Sheets 試算表設定卡片 */}
            <div className="bg-stone-800/80 border border-stone-700/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 tracking-wider">
                  GOOGLE SPREADSHEET ID / 試算表連結
                </label>
                <a
                  href={rawSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  開啟 Google Sheet ↗
                </a>
              </div>
              <form onSubmit={handleSheetSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={inputSheetId}
                  onChange={(e) => setInputSheetId(e.target.value)}
                  placeholder="請輸入 Google Sheet ID 或完整網址"
                  className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={isFetching}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-medium px-4 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  更換
                </button>
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isFetching}
                  className="bg-stone-700 hover:bg-stone-600 text-stone-200 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  {isFetching ? "同步中..." : "🔄 重新同步"}
                </button>
              </form>
            </div>

            {/* 3. 狀態摘要指標卡 */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-stone-800/60 border border-stone-700/60 p-3 rounded-xl text-center">
                <div className="text-xs text-stone-400">資料總筆數</div>
                <div className="text-lg font-bold text-stone-100">{status.totalCount}</div>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-800/50 p-3 rounded-xl text-center">
                <div className="text-xs text-emerald-400">已發布 (Public)</div>
                <div className="text-lg font-bold text-emerald-300">{status.publishedCount}</div>
              </div>
              <div className="bg-stone-800/40 border border-stone-700/40 p-3 rounded-xl text-center">
                <div className="text-xs text-stone-400">草稿 (Draft)</div>
                <div className="text-lg font-bold text-stone-300">{status.draftCount}</div>
              </div>
              <div
                className={`p-3 rounded-xl text-center border ${
                  status.warningCount > 0
                    ? "bg-amber-950/40 border-amber-800/60 text-amber-300"
                    : "bg-stone-800/40 border-stone-700/40 text-stone-400"
                }`}
              >
                <div className="text-xs">警告/異常列</div>
                <div className="text-lg font-bold">{status.warningCount}</div>
              </div>
            </div>

            {/* 錯誤提示 (若連線或權限有問題) */}
            {status.errorDetails && (
              <div className="p-3 bg-red-950/70 border border-red-800 rounded-xl text-xs text-red-200 space-y-1">
                <div className="font-bold flex items-center gap-1">⚠️ 雲端連線異常・自動切換至備援庫</div>
                <div>{status.errorDetails}</div>
                <div className="text-[11px] opacity-80 mt-1">
                  請確認試算表已開啟「知道連結的人皆可檢視」公開檢視權限。
                </div>
              </div>
            )}

            {/* 4. 搜尋與過濾標籤 */}
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
              <div className="flex gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800 w-full sm:w-auto">
                {(
                  [
                    { key: "all", label: "全部" },
                    { key: "published", label: "已發布" },
                    { key: "draft", label: "草稿" },
                    { key: "warning", label: `有警告 (${status.warningCount})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilterType(tab.key)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      filterType === tab.key ? "bg-amber-600 text-white" : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋籤號、法語關鍵字..."
                className="w-full sm:w-48 bg-stone-950 border border-stone-800 rounded-lg px-3 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* 5. 法語資料列清單與診斷項 */}
            <div className="space-y-2">
              {filteredChits.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500 bg-stone-950/40 rounded-xl border border-stone-800">
                  沒有符合篩選條件的法語資料
                </div>
              ) : (
                filteredChits.map((chit) => {
                  const isExpanded = expandedId === chit.id;
                  return (
                    <div
                      key={chit.id}
                      className={`bg-stone-950/70 border rounded-xl overflow-hidden transition-colors ${
                        chit.hasWarning ? "border-amber-700/60 bg-amber-950/10" : "border-stone-800 hover:border-stone-700"
                      }`}
                    >
                      {/* 標題列 */}
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : chit.id)}
                        className="p-3 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <span className="text-xs font-mono px-2 py-0.5 bg-stone-800 rounded text-amber-300 font-bold shrink-0">
                            #{chit.id}
                          </span>
                          <span className="text-xs font-medium text-stone-200 truncate">
                            {chit.chinese || chit.english || "（無內容）"}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {chit.status === "draft" ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-400">草稿</span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                              發布
                            </span>
                          )}

                          {chit.hasWarning && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/80 text-amber-200 font-bold">
                              ⚠️ 警告
                            </span>
                          )}

                          <span className="text-stone-500 text-xs">{isExpanded ? "▲" : "▼"}</span>
                        </div>
                      </div>

                      {/* 展開之診斷詳細細節 */}
                      {isExpanded && (
                        <div className="p-3 border-t border-stone-800 bg-stone-900/90 text-xs space-y-3">
                          <div className="flex gap-3 items-start">
                            {chit.image_url && (
                              <img
                                src={chit.image_url}
                                alt={`籤號 ${chit.id}`}
                                className="w-16 h-20 object-cover rounded border border-stone-700 bg-stone-950 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            )}
                            <div className="flex-1 space-y-1">
                              <div className="text-[11px] text-stone-400">
                                <b>中文法語：</b> {chit.chinese || "（空）"}
                              </div>
                              <div className="text-[11px] text-stone-400">
                                <b>白話解析：</b> {chit.interpretation || "（空）"}
                              </div>
                              <div className="text-[11px] text-stone-400">
                                <b>英文法語：</b> {chit.english || "（空）"}
                              </div>
                              <div className="text-[11px] text-stone-400">
                                <b>他加祿語：</b> {chit.filipino || "（空）"}
                              </div>
                              <div className="text-[11px] text-stone-400 truncate">
                                <b>圖片網址：</b> {chit.image_url || "（空）"}
                              </div>
                            </div>
                          </div>

                          {chit.issues && chit.issues.length > 0 && (
                            <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg p-2 space-y-1">
                              <div className="font-semibold text-amber-300 text-[11px]">
                                診斷檢測結果 ({chit.issues.length} 項)：
                              </div>
                              {chit.issues.map((issue, idx) => (
                                <div key={idx} className="text-[11px] text-amber-200 flex items-center gap-1">
                                  <span>•</span>
                                  <span className="font-mono text-[10px] text-amber-400">[{issue.field}]</span>
                                  <span>{issue.message}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 頁尾最後更新時間與隱藏按鈕 */}
          <div className="p-3 border-t border-stone-800 bg-stone-950 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-2">
            <div>
              {status.lastUpdated ? `最後同步時間：${status.lastUpdated}` : "狀態：使用本地備援資料庫"}
            </div>
            {onExitAdminMode && (
              <button
                type="button"
                onClick={() => {
                  onExitAdminMode();
                  onClose();
                }}
                className="text-stone-400 hover:text-red-400 underline transition-colors cursor-pointer"
              >
                🔒 隱藏管理員按鈕並切回一般模式
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
