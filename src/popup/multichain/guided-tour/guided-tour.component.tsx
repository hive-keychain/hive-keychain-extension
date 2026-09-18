import { Screen } from '@interfaces/screen.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { GuidedTourOverlayComponent } from '@popup/multichain/guided-tour/guided-tour-overlay.component';
import { GUIDED_TOURS } from '@popup/multichain/guided-tour/guided-tours.list';
import { RootState } from '@popup/multichain/store';
import { GuidedTourStatus } from '@reference-data/guided-tour.enum';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ConnectedProps, connect } from 'react-redux';
import {
  GuidedTourProgress,
  GuidedTourRect,
  GuidedToursStorage,
} from 'src/interfaces/guided-tour.interface';
import { GuidedTourUtils } from 'src/utils/guided-tour.utils';

const toTargetRect = (element: HTMLElement): GuidedTourRect => {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    borderRadius: GuidedTourUtils.getTargetBorderRadius(element),
  };
};

const areRectsEqual = (
  left: GuidedTourRect | null,
  right: GuidedTourRect,
): boolean =>
  !!left &&
  left.top === right.top &&
  left.left === right.left &&
  left.width === right.width &&
  left.height === right.height &&
  left.borderRadius === right.borderRadius;

const GuidedTour = ({
  currentPage,
  evmAccounts,
  hiveAccountsCount,
  loading,
  mk,
  modal,
}: PropsFromRedux) => {
  const [progressMap, setProgressMap] = useState<GuidedToursStorage>({});
  const [hasHydrated, setHasHydrated] = useState(false);
  const [displayedStepIndex, setDisplayedStepIndex] = useState<number | null>(
    null,
  );
  const [targetRect, setTargetRect] = useState<GuidedTourRect | null>(null);
  const persistInFlightRef = useRef(false);
  const persistWriteSeqRef = useRef(0);
  const progressMapRef = useRef(progressMap);
  progressMapRef.current = progressMap;

  const visibleEvmAccountsCount = evmAccounts.filter(
    (account) => !account.hide,
  ).length;

  const activeTour = useMemo(() => {
    if (!hasHydrated || !mk || modal || loading > 0) {
      return undefined;
    }
    return GuidedTourUtils.getActiveTour(GUIDED_TOURS, progressMap, {
      hiveAccountsCount,
      evmAccountsCount: visibleEvmAccountsCount,
    });
  }, [
    hasHydrated,
    hiveAccountsCount,
    loading,
    mk,
    modal,
    progressMap,
    visibleEvmAccountsCount,
  ]);

  const persistProgress = useCallback(
    async (tourId: string, progress: GuidedTourProgress) => {
      const nextProgress = GuidedTourUtils.mergeTourProgress(
        progressMapRef.current[tourId],
        progress,
      );
      const existingProgress = progressMapRef.current[tourId];
      if (
        existingProgress &&
        existingProgress.status === nextProgress.status &&
        existingProgress.currentStep === nextProgress.currentStep
      ) {
        return;
      }
      const nextMap: GuidedToursStorage = {
        ...progressMapRef.current,
        [tourId]: nextProgress,
      };
      progressMapRef.current = nextMap;
      setProgressMap(nextMap);

      persistWriteSeqRef.current += 1;
      const writeSeq = persistWriteSeqRef.current;
      persistInFlightRef.current = true;
      try {
        const snapshot = progressMapRef.current;
        await GuidedTourUtils.saveProgressMap(snapshot);
        if (writeSeq !== persistWriteSeqRef.current) {
          return;
        }
        if (progressMapRef.current !== snapshot) {
          await GuidedTourUtils.saveProgressMap(progressMapRef.current);
        }
      } finally {
        if (writeSeq === persistWriteSeqRef.current) {
          persistInFlightRef.current = false;
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!mk) {
      setHasHydrated(false);
      setProgressMap({});
      return;
    }

    let isCancelled = false;
    void GuidedTourUtils.loadProgressMap().then((storedProgress) => {
      if (!isCancelled) {
        setProgressMap(storedProgress);
        setHasHydrated(true);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [mk]);

  useEffect(() => {
    if (!activeTour) {
      setDisplayedStepIndex(null);
      setTargetRect(null);
      return;
    }

    const storedStep = progressMap[activeTour.id]?.currentStep ?? 0;

    const refreshDisplayedStep = () => {
      if (GuidedTourUtils.hasBlockingOverlay()) {
        setDisplayedStepIndex(null);
        setTargetRect(null);
        return;
      }

      const stepIndex = GuidedTourUtils.getRenderableStepIndex(
        activeTour.steps,
        storedStep,
      );
      if (stepIndex === null) {
        setDisplayedStepIndex(null);
        setTargetRect(null);
        return;
      }

      const targetElement = GuidedTourUtils.getTargetElement(
        activeTour.steps[stepIndex].target,
      );
      if (!targetElement) {
        setDisplayedStepIndex(null);
        setTargetRect(null);
        return;
      }

      const nextRect = toTargetRect(targetElement);
      setDisplayedStepIndex((currentIndex) =>
        currentIndex === stepIndex ? currentIndex : stepIndex,
      );
      setTargetRect((currentRect) =>
        areRectsEqual(currentRect, nextRect) ? currentRect : nextRect,
      );

      if (!progressMap[activeTour.id] && !persistInFlightRef.current) {
        void persistProgress(activeTour.id, GuidedTourUtils.getStartedProgress());
      } else if (stepIndex > storedStep) {
        void persistProgress(activeTour.id, {
          status: GuidedTourStatus.IN_PROGRESS,
          currentStep: stepIndex,
        });
      }
    };

    refreshDisplayedStep();
    const observer = new MutationObserver(refreshDisplayedStep);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', refreshDisplayedStep);
    window.addEventListener('scroll', refreshDisplayedStep, true);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', refreshDisplayedStep);
      window.removeEventListener('scroll', refreshDisplayedStep, true);
    };
  }, [activeTour, persistProgress, progressMap]);

  useEffect(() => {
    if (displayedStepIndex === null || !activeTour) {
      return;
    }

    const storedStep = progressMap[activeTour.id]?.currentStep ?? 0;
    const lastStepIndex = activeTour.steps.length - 1;

    const handleDocumentClick = (event: MouseEvent) => {
      const step = activeTour.steps[displayedStepIndex];
      if (step.advanceOn === 'next') {
        return;
      }
      const targetElement = GuidedTourUtils.getTargetElement(step.target);
      const eventTarget = event.target;
      if (
        !targetElement ||
        !(eventTarget instanceof Node) ||
        !targetElement.contains(eventTarget)
      ) {
        return;
      }
      if (displayedStepIndex < storedStep) {
        return;
      }

      void persistProgress(
        activeTour.id,
        GuidedTourUtils.getAdvancedProgress(
          displayedStepIndex,
          lastStepIndex,
        ),
      );
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [activeTour, displayedStepIndex, persistProgress, progressMap]);

  if (
    !activeTour ||
    displayedStepIndex === null ||
    !targetRect ||
    currentPage === Screen.SIGN_IN_PAGE ||
    currentPage === Screen.SIGN_UP_PAGE
  ) {
    return null;
  }

  const lastStepIndex = activeTour.steps.length - 1;
  const displayedStep = activeTour.steps[displayedStepIndex];
  const showDismiss = displayedStepIndex === lastStepIndex;
  const showNext = displayedStep.advanceOn === 'next';

  const handleDismiss = () => {
    void persistProgress(
      activeTour.id,
      GuidedTourUtils.getDismissedProgress(lastStepIndex),
    );
  };

  const handleNext = () => {
    void persistProgress(
      activeTour.id,
      GuidedTourUtils.getAdvancedProgress(displayedStepIndex, lastStepIndex),
    );
  };

  return createPortal(
    <GuidedTourOverlayComponent
      blockTargetClick={showNext}
      descriptionKey={displayedStep.descriptionKey}
      onDismiss={handleDismiss}
      onNext={handleNext}
      showDismiss={showDismiss}
      showNext={showNext}
      targetRect={targetRect}
      titleKey={displayedStep.titleKey}
    />,
    document.body,
  );
};

const mapStateToProps = (state: RootState) => ({
  mk: state.mk,
  hiveAccountsCount: state.hive.accounts.length,
  evmAccounts: state.evm.accounts as EvmAccount[],
  currentPage: state.navigation.stack[0]?.currentPage,
  modal: state.modal,
  loading: state.loading.loadingOperations.length,
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export const GuidedTourComponent = connector(GuidedTour);
