import React, { useCallback, useRef } from 'react';

const SCROLL_EPSILON = 0.01;
export const WALLET_SCROLL_HANDOFF_PX = 60;
export const HIVE_WALLET_SCROLL_HANDOFF_PX = 150;

interface WalletScrollRelayOptions {
  onScrollDirectionChange?: (isScrollingDown: boolean) => void;
  scrollHandoffPx?: number;
}

const getWalletWrapper = (walletScroll: HTMLDivElement) => {
  return walletScroll.parentElement as HTMLDivElement | null;
};

const getMaxScrollTop = (element: HTMLDivElement) => {
  return Math.max(0, element.scrollHeight - element.clientHeight);
};

const applyScrollDelta = (
  element: HTMLDivElement,
  delta: number,
  maxScrollTop: number,
) => {
  const initialScrollTop = element.scrollTop;
  const nextScrollTop = Math.min(
    maxScrollTop,
    Math.max(0, initialScrollTop + delta),
  );

  element.scrollTop = nextScrollTop;
  return delta - (nextScrollTop - initialScrollTop);
};

const getWalletWrapperHeight = (
  walletWrapper: HTMLDivElement,
  walletScroll: HTMLDivElement,
) => {
  return (
    walletWrapper.getBoundingClientRect().height ||
    walletWrapper.clientHeight ||
    walletScroll.clientHeight
  );
};

export const useWalletScrollRelay = ({
  onScrollDirectionChange,
  scrollHandoffPx = WALLET_SCROLL_HANDOFF_PX,
}: WalletScrollRelayOptions = {}) => {
  const homeContentRef = useRef<HTMLDivElement>(null);
  const walletScrollRef = useRef<HTMLDivElement>(null);
  const walletExpansionRef = useRef(0);
  const walletBaseHeightRef = useRef<number>();
  const scrollHandoffMax = Math.max(0, scrollHandoffPx);

  const getWalletBaseHeight = useCallback(
    (walletWrapper: HTMLDivElement, walletScroll: HTMLDivElement) => {
      const walletWrapperHeight = getWalletWrapperHeight(
        walletWrapper,
        walletScroll,
      );
      if (
        walletBaseHeightRef.current === undefined ||
        walletExpansionRef.current === 0
      ) {
        walletBaseHeightRef.current = Math.max(
          0,
          walletWrapperHeight - walletExpansionRef.current,
        );
      }
      return walletBaseHeightRef.current;
    },
    [],
  );

  const setWalletExpansion = useCallback(
    (
      homeContent: HTMLDivElement,
      walletWrapper: HTMLDivElement,
      walletScroll: HTMLDivElement,
      nextExpansion: number,
    ) => {
      const walletBaseHeight = getWalletBaseHeight(walletWrapper, walletScroll);
      const clampedExpansion = Math.min(
        scrollHandoffMax,
        Math.max(0, nextExpansion),
      );

      walletExpansionRef.current = clampedExpansion;
      homeContent.scrollTop = clampedExpansion;

      if (clampedExpansion <= SCROLL_EPSILON) {
        walletWrapper.style.removeProperty('min-height');
        walletBaseHeightRef.current = undefined;
        return;
      }

      walletWrapper.style.minHeight = `${
        walletBaseHeight + clampedExpansion
      }px`;
    },
    [getWalletBaseHeight, scrollHandoffMax],
  );

  const syncWalletExpansion = useCallback(
    (
      homeContent: HTMLDivElement,
      walletWrapper: HTMLDivElement,
      walletScroll: HTMLDivElement,
    ) => {
      const currentExpansion = Math.min(
        scrollHandoffMax,
        Math.max(0, walletExpansionRef.current, homeContent.scrollTop),
      );

      walletExpansionRef.current = currentExpansion;
      setWalletExpansion(
        homeContent,
        walletWrapper,
        walletScroll,
        currentExpansion,
      );
      return currentExpansion;
    },
    [scrollHandoffMax, setWalletExpansion],
  );

  const relayWheelToWallet = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      const homeContent = homeContentRef.current;
      const walletScroll = walletScrollRef.current;
      const walletWrapper = walletScroll
        ? getWalletWrapper(walletScroll)
        : null;
      if (
        !homeContent ||
        !walletScroll ||
        !walletWrapper ||
        event.deltaY === 0
      ) {
        return;
      }

      event.preventDefault();
      onScrollDirectionChange?.(event.deltaY > 0);

      let walletExpansion = syncWalletExpansion(
        homeContent,
        walletWrapper,
        walletScroll,
      );
      let remainingDelta = event.deltaY;

      if (remainingDelta > 0) {
        const expansionDelta = Math.min(
          remainingDelta,
          scrollHandoffMax - walletExpansion,
        );

        if (expansionDelta > SCROLL_EPSILON) {
          walletExpansion += expansionDelta;
          setWalletExpansion(
            homeContent,
            walletWrapper,
            walletScroll,
            walletExpansion,
          );
          remainingDelta -= expansionDelta;
        }

        applyScrollDelta(
          walletScroll,
          remainingDelta,
          getMaxScrollTop(walletScroll),
        );
        return;
      }

      remainingDelta = applyScrollDelta(
        walletScroll,
        remainingDelta,
        getMaxScrollTop(walletScroll),
      );

      if (remainingDelta < -SCROLL_EPSILON) {
        const collapseDelta = Math.min(
          Math.abs(remainingDelta),
          walletExpansion,
        );

        if (collapseDelta > SCROLL_EPSILON) {
          setWalletExpansion(
            homeContent,
            walletWrapper,
            walletScroll,
            walletExpansion - collapseDelta,
          );
        }
      }
    },
    [
      onScrollDirectionChange,
      scrollHandoffMax,
      setWalletExpansion,
      syncWalletExpansion,
    ],
  );

  return {
    homeContentRef,
    walletScrollRef,
    relayWheelToWallet,
  };
};
