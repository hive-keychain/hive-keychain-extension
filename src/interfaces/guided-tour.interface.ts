import {
  GuidedTourId,
  GuidedTourStatus,
  GuidedTourTarget,
} from '@reference-data/guided-tour.enum';

export interface GuidedTourProgress {
  status: GuidedTourStatus;
  currentStep: number;
}

export type GuidedToursStorage = Partial<
  Record<GuidedTourId | string, GuidedTourProgress>
>;

export interface GuidedTourEligibilityContext {
  hiveAccountsCount: number;
  evmAccountsCount: number;
}

export type GuidedTourStepAdvanceOn = 'target-click' | 'next';

export interface GuidedTourStep {
  target: GuidedTourTarget;
  titleKey: string;
  descriptionKey: string;
  advanceOn?: GuidedTourStepAdvanceOn;
}

export interface GuidedTourDefinition {
  id: GuidedTourId;
  steps: GuidedTourStep[];
  isEligible: (context: GuidedTourEligibilityContext) => boolean;
}

export interface GuidedTourRect {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius?: string;
}

export interface GuidedTourOverlayLayout {
  hole: GuidedTourRect;
  borderRadius: string;
  panes: {
    top: GuidedTourRect;
    left: GuidedTourRect;
    right: GuidedTourRect;
    bottom: GuidedTourRect;
  };
  tooltip: {
    top: number;
    left: number;
    width: number;
    placement: 'below' | 'above';
  };
}
