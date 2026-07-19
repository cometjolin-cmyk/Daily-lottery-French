/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Chit {
  id: string;
  image_url: string;
  french?: string;
  chinese?: string;
  interpretation?: string;
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
