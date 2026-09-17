import {
  GuidedTourDefinition,
  GuidedTourEligibilityContext,
  GuidedTourOverlayLayout,
  GuidedTourProgress,
  GuidedTourRect,
  GuidedTourStep,
  GuidedToursStorage,
} from '@interfaces/guided-tour.interface';
import {
  GUIDED_TOUR_TARGET_ATTRIBUTE,
  GuidedTourStatus,
} from '@reference-data/guided-tour.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { ObjectUtils } from 'src/utils/object.utils';

const HOLE_PADDING = 0;
const VIEWPORT_PADDING = 8;
const TOOLTIP_GAP = 12;
const TOOLTIP_MAX_WIDTH = 260;
const DEFAULT_TOOLTIP_HEIGHT = 120;
const BLOCKING_OVERLAY_SELECTOR =
  '.popup-container, .change-rpc-popup, .loading-container:not(.hide)';

const TERMINAL_STATUSES: GuidedTourStatus[] = [
  GuidedTourStatus.COMPLETED,
  GuidedTourStatus.DISMISSED,
];

const isGuidedTourStatus = (value: unknown): value is GuidedTourStatus =>
  value === GuidedTourStatus.IN_PROGRESS ||
  value === GuidedTourStatus.COMPLETED ||
  value === GuidedTourStatus.DISMISSED;

const isValidProgress = (value: unknown): value is GuidedTourProgress => {
  if (!ObjectUtils.isPureObject(value)) {
    return false;
  }
  const progress = value as Partial<GuidedTourProgress>;
  return (
    isGuidedTourStatus(progress.status) &&
    typeof progress.currentStep === 'number' &&
    Number.isInteger(progress.currentStep) &&
    progress.currentStep >= 0
  );
};

const isFinished = (progress?: GuidedTourProgress): boolean =>
  !!progress && TERMINAL_STATUSES.includes(progress.status);

const getStatusRank = (status: GuidedTourStatus): number =>
  status === GuidedTourStatus.IN_PROGRESS ? 0 : 1;

const pickFurtherProgress = (
  left: GuidedTourProgress,
  right: GuidedTourProgress,
): GuidedTourProgress => {
  const leftRank = getStatusRank(left.status);
  const rightRank = getStatusRank(right.status);
  if (rightRank !== leftRank) {
    return rightRank > leftRank ? right : left;
  }
  if (
    left.status === GuidedTourStatus.IN_PROGRESS &&
    right.status === GuidedTourStatus.IN_PROGRESS
  ) {
    return right.currentStep > left.currentStep ? right : left;
  }
  if (right.status === GuidedTourStatus.COMPLETED) {
    return right;
  }
  if (left.status === GuidedTourStatus.COMPLETED) {
    return left;
  }
  return left;
};

const parseProgressMap = (value: unknown): GuidedToursStorage => {
  if (!ObjectUtils.isPureObject(value)) {
    return {};
  }

  const storedRecord = value as Record<string, unknown>;
  const progressMap: GuidedToursStorage = {};
  for (const [tourId, progress] of Object.entries(storedRecord)) {
    if (isValidProgress(progress)) {
      progressMap[tourId] = progress;
    }
  }
  return progressMap;
};

const mergeProgressMaps = (
  existingValue: unknown,
  importedValue: unknown,
): GuidedToursStorage => {
  const existingMap = parseProgressMap(existingValue);
  const importedMap = parseProgressMap(importedValue);
  const merged: GuidedToursStorage = { ...existingMap };

  for (const [tourId, importedProgress] of Object.entries(importedMap)) {
    if (!importedProgress) {
      continue;
    }
    const existingProgress = merged[tourId];
    merged[tourId] = existingProgress
      ? pickFurtherProgress(existingProgress, importedProgress)
      : importedProgress;
  }

  return merged;
};

const getTargetSelector = (target: string): string =>
  `[${GUIDED_TOUR_TARGET_ATTRIBUTE}="${target}"]`;

const getTargetElement = (target: string): HTMLElement | null =>
  document.querySelector<HTMLElement>(getTargetSelector(target));

const hasTarget = (target: string): boolean => !!getTargetElement(target);

const hasBlockingOverlay = (): boolean =>
  !!document.querySelector(BLOCKING_OVERLAY_SELECTOR);

const mergeTourProgress = (
  existingProgress: GuidedTourProgress | undefined,
  incomingProgress: GuidedTourProgress,
): GuidedTourProgress =>
  existingProgress
    ? pickFurtherProgress(existingProgress, incomingProgress)
    : incomingProgress;

const getRenderableStepIndex = (
  steps: GuidedTourStep[],
  currentStep: number,
  isTargetPresent: (target: string) => boolean = hasTarget,
): number | null => {
  if (!steps.length) {
    return null;
  }
  const start = Math.min(Math.max(currentStep, 0), steps.length - 1);
  if (isTargetPresent(steps[start].target)) {
    return start;
  }

  const nextStepIndex = start + 1;
  if (
    nextStepIndex < steps.length &&
    isTargetPresent(steps[nextStepIndex].target)
  ) {
    return nextStepIndex;
  }

  for (let index = start - 1; index >= 0; index -= 1) {
    if (isTargetPresent(steps[index].target)) {
      return index;
    }
  }
  return null;
};

const getActiveTour = (
  tours: GuidedTourDefinition[],
  progressMap: GuidedToursStorage,
  eligibility: GuidedTourEligibilityContext,
): GuidedTourDefinition | undefined =>
  tours.find(
    (tour) => tour.isEligible(eligibility) && !isFinished(progressMap[tour.id]),
  );

const getStartedProgress = (): GuidedTourProgress => ({
  status: GuidedTourStatus.IN_PROGRESS,
  currentStep: 0,
});

const getAdvancedProgress = (
  currentStep: number,
  lastStepIndex: number,
): GuidedTourProgress => {
  if (currentStep >= lastStepIndex) {
    return {
      status: GuidedTourStatus.COMPLETED,
      currentStep: lastStepIndex,
    };
  }
  return {
    status: GuidedTourStatus.IN_PROGRESS,
    currentStep: currentStep + 1,
  };
};

const getDismissedProgress = (currentStep: number): GuidedTourProgress => ({
  status: GuidedTourStatus.DISMISSED,
  currentStep,
});

const loadProgressMap = async (): Promise<GuidedToursStorage> => {
  const storedValue = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.GUIDED_TOURS,
  );
  return parseProgressMap(storedValue);
};

const saveProgressMap = async (
  progressMap: GuidedToursStorage,
): Promise<void> => {
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.GUIDED_TOURS,
    progressMap,
  );
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const toRect = (
  top: number,
  left: number,
  width: number,
  height: number,
): GuidedTourRect => ({
  top,
  left,
  width: Math.max(0, width),
  height: Math.max(0, height),
});

const expandCssLength = (token: string, padding: number): string => {
  const match = token.match(/^(-?\d+(?:\.\d+)?)px$/i);
  if (!match) {
    return token;
  }
  const amount = Number(match[1]);
  if (amount === 0) {
    return '0px';
  }
  return `${amount + padding}px`;
};

const expandBorderRadius = (
  borderRadius: string | undefined,
  padding: number,
): string => {
  const radius = borderRadius?.trim();
  if (!radius || padding === 0) {
    return radius || '0px';
  }
  return radius
    .split('/')
    .map((part) =>
      part
        .trim()
        .split(/\s+/)
        .filter((token) => token.length > 0)
        .map((token) => expandCssLength(token, padding))
        .join(' '),
    )
    .join(' / ');
};

const getTargetBorderRadius = (element: HTMLElement): string => {
  const computedRadius = window.getComputedStyle(element).borderRadius;
  return computedRadius?.trim() || '0px';
};

const getOverlayLayout = (
  targetRect: GuidedTourRect,
  viewport: { width: number; height: number },
  tooltipHeight = DEFAULT_TOOLTIP_HEIGHT,
): GuidedTourOverlayLayout => {
  const holeTop = clamp(targetRect.top - HOLE_PADDING, 0, viewport.height);
  const holeLeft = clamp(targetRect.left - HOLE_PADDING, 0, viewport.width);
  const holeRight = clamp(
    targetRect.left + targetRect.width + HOLE_PADDING,
    0,
    viewport.width,
  );
  const holeBottom = clamp(
    targetRect.top + targetRect.height + HOLE_PADDING,
    0,
    viewport.height,
  );
  const hole = toRect(holeTop, holeLeft, holeRight - holeLeft, holeBottom - holeTop);

  const tooltipWidth = Math.min(
    TOOLTIP_MAX_WIDTH,
    Math.max(0, viewport.width - VIEWPORT_PADDING * 2),
  );
  const targetCenterX = hole.left + hole.width / 2;
  const tooltipLeft = clamp(
    targetCenterX - tooltipWidth / 2,
    VIEWPORT_PADDING,
    Math.max(VIEWPORT_PADDING, viewport.width - tooltipWidth - VIEWPORT_PADDING),
  );
  const belowTop = hole.top + hole.height + TOOLTIP_GAP;
  const canPlaceBelow =
    belowTop + tooltipHeight <= viewport.height - VIEWPORT_PADDING;
  const tooltipTop = canPlaceBelow
    ? belowTop
    : Math.max(
        VIEWPORT_PADDING,
        hole.top - TOOLTIP_GAP - tooltipHeight,
      );

  return {
    hole,
    borderRadius: expandBorderRadius(targetRect.borderRadius, HOLE_PADDING),
    panes: {
      top: toRect(0, 0, viewport.width, hole.top),
      left: toRect(hole.top, 0, hole.left, hole.height),
      right: toRect(
        hole.top,
        hole.left + hole.width,
        viewport.width - (hole.left + hole.width),
        hole.height,
      ),
      bottom: toRect(
        hole.top + hole.height,
        0,
        viewport.width,
        viewport.height - (hole.top + hole.height),
      ),
    },
    tooltip: {
      top: tooltipTop,
      left: tooltipLeft,
      width: tooltipWidth,
      placement: canPlaceBelow ? 'below' : 'above',
    },
  };
};

export const GuidedTourUtils = {
  DEFAULT_TOOLTIP_HEIGHT,
  BLOCKING_OVERLAY_SELECTOR,
  isValidProgress,
  isFinished,
  parseProgressMap,
  mergeProgressMaps,
  mergeTourProgress,
  getTargetSelector,
  getTargetElement,
  hasTarget,
  hasBlockingOverlay,
  getRenderableStepIndex,
  getActiveTour,
  getStartedProgress,
  getAdvancedProgress,
  getDismissedProgress,
  loadProgressMap,
  saveProgressMap,
  expandBorderRadius,
  getTargetBorderRadius,
  getOverlayLayout,
};
