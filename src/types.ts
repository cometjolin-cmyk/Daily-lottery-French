/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Chit {
  id: string;
  image_url: string;
  chinese: string;
  interpretation?: string;
  french?: string;
  filipino?: string;
  english?: string;
  englishInterpretation?: string;
  filipinoInterpretation?: string;
  status?: string;
}

// 診斷發生的欄位警告/錯誤
export interface ChitIssue {
  field: string;
  message: string;
  severity: 'warning' | 'error';
}

// 擴充包含診斷資訊的法語項目
export interface ExtendedChit extends Chit {
  status?: 'published' | 'draft' | string;
  issues?: ChitIssue[];
  hasWarning?: boolean;
  rowIndex?: number;
}

// 診斷儀表板總體狀態
export interface SheetDataStatus {
  source: 'sheet' | 'default' | 'loading' | 'error';
  spreadsheetId: string;
  lastUpdated: string | null;
  totalCount: number;
  publishedCount: number;
  draftCount: number;
  warningCount: number;
  errorDetails: string | null;
  chits: ExtendedChit[];
}

export interface AppState {
  isShaking: boolean;
  selectedChit: Chit | null;
  protrudedStickIndex: number | null;
  showModal: boolean;
  isMuted: boolean;
  spreadsheetId: string;
  chitsList: Chit[];
  isLoading: boolean;
  errorMsg: string | null;
}
