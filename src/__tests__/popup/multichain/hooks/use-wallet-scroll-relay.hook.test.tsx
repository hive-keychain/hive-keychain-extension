import {
  cleanup,
  createEvent,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import React from 'react';
import {
  HIVE_WALLET_SCROLL_HANDOFF_PX,
  useWalletScrollRelay,
  WALLET_SCROLL_HANDOFF_PX,
} from 'src/popup/multichain/hooks/use-wallet-scroll-relay.hook';

const setScrollMetrics = (
  element: HTMLElement,
  { clientHeight, scrollHeight }: { clientHeight: number; scrollHeight: number },
) => {
  Object.defineProperty(element, 'clientHeight', {
    configurable: true,
    value: clientHeight,
  });
  Object.defineProperty(element, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
};

const setElementHeight = (element: HTMLElement, height: number) => {
  Object.defineProperty(element, 'clientHeight', {
    configurable: true,
    value: height,
  });
  element.getBoundingClientRect = jest.fn(
    () =>
      ({
        height,
      } as DOMRect),
  );
};

interface TestScrollRelayProps {
  onScrollDirectionChange?: (isScrollingDown: boolean) => void;
  scrollHandoffPx?: number;
}

const TestScrollRelayComponent = ({
  onScrollDirectionChange,
  scrollHandoffPx,
}: TestScrollRelayProps) => {
  const { homeContentRef, walletScrollRef, relayWheelToWallet } =
    useWalletScrollRelay({ onScrollDirectionChange, scrollHandoffPx });

  return (
    <div
      data-testid="home-content"
      onWheelCapture={relayWheelToWallet}
      ref={homeContentRef}>
      <div data-testid="wallet-wrapper">
        <div data-testid="wallet-scroll" ref={walletScrollRef} />
      </div>
    </div>
  );
};

const setupScrollRelay = ({
  parentScrollTop = 0,
  childScrollTop = 0,
  onScrollDirectionChange,
  scrollHandoffPx,
}: {
  parentScrollTop?: number;
  childScrollTop?: number;
  onScrollDirectionChange?: (isScrollingDown: boolean) => void;
  scrollHandoffPx?: number;
} = {}) => {
  render(
    <TestScrollRelayComponent
      onScrollDirectionChange={onScrollDirectionChange}
      scrollHandoffPx={scrollHandoffPx}
    />,
  );

  const homeContent = screen.getByTestId('home-content');
  const walletWrapper = screen.getByTestId('wallet-wrapper');
  const walletScroll = screen.getByTestId('wallet-scroll');

  setScrollMetrics(homeContent, { clientHeight: 100, scrollHeight: 300 });
  setScrollMetrics(walletScroll, { clientHeight: 100, scrollHeight: 300 });
  setElementHeight(
    walletWrapper,
    300 + Math.min(parentScrollTop, scrollHandoffPx ?? WALLET_SCROLL_HANDOFF_PX),
  );
  homeContent.scrollTop = parentScrollTop;
  walletScroll.scrollTop = childScrollTop;

  return { homeContent, walletWrapper, walletScroll };
};

const dispatchWheel = (element: HTMLElement, deltaY: number) => {
  const event = createEvent.wheel(element, { deltaY });
  const preventDefault = jest.spyOn(event, 'preventDefault');
  fireEvent(element, event);
  return { preventDefault };
};

describe('useWalletScrollRelay', () => {
  afterEach(() => {
    cleanup();
  });

  it('expands the wallet section first while it is below the handoff point', () => {
    const { homeContent, walletWrapper, walletScroll } = setupScrollRelay();

    const { preventDefault } = dispatchWheel(walletScroll, 40);

    expect(homeContent.scrollTop).toBe(40);
    expect(walletWrapper.style.minHeight).toBe('340px');
    expect(walletScroll.scrollTop).toBe(0);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('passes remaining downward wheel delta to the wallet after full expansion', () => {
    const { homeContent, walletWrapper, walletScroll } = setupScrollRelay();

    dispatchWheel(walletScroll, 80);

    expect(homeContent.scrollTop).toBe(60);
    expect(walletWrapper.style.minHeight).toBe('360px');
    expect(walletScroll.scrollTop).toBe(20);
  });

  it('scrolls the wallet immediately when the handoff point is zero', () => {
    const { homeContent, walletWrapper, walletScroll } = setupScrollRelay({
      scrollHandoffPx: 0,
    });

    dispatchWheel(walletScroll, 40);

    expect(homeContent.scrollTop).toBe(0);
    expect(walletWrapper.style.minHeight).toBe('');
    expect(walletScroll.scrollTop).toBe(40);
  });

  it('uses a custom handoff point before scrolling the wallet', () => {
    const { homeContent, walletWrapper, walletScroll } = setupScrollRelay({
      scrollHandoffPx: HIVE_WALLET_SCROLL_HANDOFF_PX,
    });

    dispatchWheel(walletScroll, HIVE_WALLET_SCROLL_HANDOFF_PX + 20);

    expect(homeContent.scrollTop).toBe(HIVE_WALLET_SCROLL_HANDOFF_PX);
    expect(walletWrapper.style.minHeight).toBe(
      `${300 + HIVE_WALLET_SCROLL_HANDOFF_PX}px`,
    );
    expect(walletScroll.scrollTop).toBe(20);
  });

  it('drops extra downward wheel delta at the wallet bottom without parent overshoot', () => {
    const { homeContent, walletWrapper, walletScroll } = setupScrollRelay({
      parentScrollTop: 60,
      childScrollTop: 190,
    });

    const { preventDefault } = dispatchWheel(walletScroll, 40);

    expect(homeContent.scrollTop).toBe(60);
    expect(walletWrapper.style.minHeight).toBe('360px');
    expect(walletScroll.scrollTop).toBe(200);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('scrolls the wallet first on reverse wheel while the wallet can scroll up', () => {
    const { homeContent, walletWrapper, walletScroll } = setupScrollRelay({
      parentScrollTop: 60,
      childScrollTop: 100,
    });

    dispatchWheel(walletScroll, -40);

    expect(homeContent.scrollTop).toBe(60);
    expect(walletWrapper.style.minHeight).toBe('360px');
    expect(walletScroll.scrollTop).toBe(60);
  });

  it('reports scroll direction changes', () => {
    const onScrollDirectionChange = jest.fn();
    const { walletScroll } = setupScrollRelay({
      childScrollTop: 40,
      onScrollDirectionChange,
    });

    dispatchWheel(walletScroll, 10);
    dispatchWheel(walletScroll, -10);

    expect(onScrollDirectionChange).toHaveBeenNthCalledWith(1, true);
    expect(onScrollDirectionChange).toHaveBeenNthCalledWith(2, false);
  });

  it('collapses the wallet section after the wallet reaches top on reverse wheel', () => {
    const { homeContent, walletWrapper, walletScroll } = setupScrollRelay({
      parentScrollTop: 60,
      childScrollTop: 20,
    });

    dispatchWheel(walletScroll, -50);

    expect(homeContent.scrollTop).toBe(30);
    expect(walletWrapper.style.minHeight).toBe('330px');
    expect(walletScroll.scrollTop).toBe(0);
  });

  it('clamps parent scroll to the handoff point before applying downward delta', () => {
    const { homeContent, walletWrapper, walletScroll } = setupScrollRelay({
      parentScrollTop: 90,
    });

    dispatchWheel(walletScroll, 10);

    expect(homeContent.scrollTop).toBe(60);
    expect(walletWrapper.style.minHeight).toBe('360px');
    expect(walletScroll.scrollTop).toBe(10);
  });
});
