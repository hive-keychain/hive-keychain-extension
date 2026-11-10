import { Theme } from '@popup/theme.context';
import { DisplayMode } from '@reference-data/display-mode.enum';

interface SetupAppearanceDraft {
  displayMode: DisplayMode;
  language: string;
  theme?: Theme;
}

let setupAppearanceDraft: SetupAppearanceDraft | null = null;

const getDraft = (): SetupAppearanceDraft | null => setupAppearanceDraft;

const saveDraft = (draft: SetupAppearanceDraft): void => {
  setupAppearanceDraft = draft;
};

const clearDraft = (): void => {
  setupAppearanceDraft = null;
};

export const SetupAppearanceDraftUtils = {
  clearDraft,
  getDraft,
  saveDraft,
};
