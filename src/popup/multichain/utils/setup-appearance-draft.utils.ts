import { Theme } from '@popup/theme.context';

type SetupAppearanceDraftDisplayMode = 'popup' | 'side-panel';

interface SetupAppearanceDraft {
  displayMode: SetupAppearanceDraftDisplayMode;
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
