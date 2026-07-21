/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Chit {
  id: string;
  image_url: string;
  filipino?: string;
  chinese?: string;
  interpretation?: string;
  english?: string;
  englishInterpretation?: string;
  filipinoInterpretation?: string;
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
