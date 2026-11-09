import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  logo?: React.ReactNode;
  headerAction?: React.ReactNode;
  dataTestId?: string;
  /** No price chart, so the side panel can size this sheet to its content. */
  compact?: boolean;
}

const getFocusableElements = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  );

const getThemePortalRoot = (): HTMLElement =>
  document.querySelector<HTMLElement>('#root .theme') ?? document.body;

const TOKEN_DETAIL_PANEL_POPUP_MAX_HEIGHT_RATIO = 0.95;
const TOKEN_DETAIL_PANEL_EXTENDED_SURFACE_MAX_HEIGHT_RATIO = 0.75;

const getTokenDetailPanelMaxHeightRatio = (): number => {
  const pageClasses = document.documentElement.classList;
  if (
    pageClasses.contains('sidepanel-page') ||
    pageClasses.contains('detached-window-page')
  ) {
    return TOKEN_DETAIL_PANEL_EXTENDED_SURFACE_MAX_HEIGHT_RATIO;
  }
  return TOKEN_DETAIL_PANEL_POPUP_MAX_HEIGHT_RATIO;
};

export const getTokenDetailPanelHeight = (
  panelHeight: number,
  contentClientHeight: number,
  contentScrollHeight: number,
  frameHeight: number,
  maximumHeightRatio: number,
): number | undefined => {
  if (panelHeight <= 0 || frameHeight <= 0 || maximumHeightRatio <= 0) {
    return undefined;
  }

  const hiddenContentHeight = Math.max(
    0,
    contentScrollHeight - contentClientHeight,
  );
  const naturalPanelHeight = panelHeight + hiddenContentHeight;
  const maximumPanelHeight = Math.floor(frameHeight * maximumHeightRatio);

  return Math.min(naturalPanelHeight, maximumPanelHeight);
};

export const scrollTokenDetailPanelContent = (
  scrollTop: number,
  deltaY: number,
  scrollHeight: number,
  clientHeight: number,
): number => {
  const maxScroll = Math.max(0, scrollHeight - clientHeight);
  return Math.min(maxScroll, Math.max(0, scrollTop + deltaY));
};

const isTokenDetailPanelWheelTarget = (target: EventTarget | null): boolean =>
  target instanceof Element &&
  Boolean(target.closest('.wallet-token-detail-panel-overlay'));

export const WalletTokenDetailPanel = ({
  isOpen,
  onClose,
  title,
  titleId,
  children,
  footer,
  logo,
  headerAction,
  dataTestId = 'wallet-token-detail-panel',
  compact = false,
}: Props) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previouslyFocusedElementRef.current =
      document.activeElement as HTMLElement | null;

    const animationFrame = requestAnimationFrame(() => {
      const firstElement = cardRef.current
        ? getFocusableElements(cardRef.current)[0]
        : undefined;
      (firstElement ?? cardRef.current)?.focus();
    });

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      cancelAnimationFrame(animationFrame);
      document.removeEventListener('keydown', handleEscape);
      previouslyFocusedElementRef.current?.focus();
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    const card = cardRef.current;
    const content = contentRef.current;
    const overlay = overlayRef.current;
    if (!card || !content || !overlay) {
      return;
    }

    let animationFrame = 0;
    const fitPanelToContent = () => {
      card.style.height = '';

      const panelHeight = getTokenDetailPanelHeight(
        card.getBoundingClientRect().height,
        content.clientHeight,
        content.scrollHeight,
        overlay.clientHeight,
        getTokenDetailPanelMaxHeightRatio(),
      );
      if (panelHeight !== undefined) {
        card.style.height = `${panelHeight}px`;
      }
    };
    const schedulePanelFit = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(fitPanelToContent);
    };

    fitPanelToContent();
    window.addEventListener('resize', schedulePanelFit);

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(schedulePanelFit);
    Array.from(content.children).forEach((child) =>
      resizeObserver?.observe(child),
    );

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', schedulePanelFit);
      resizeObserver?.disconnect();
      card.style.height = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      const overlay = overlayRef.current;
      const card = cardRef.current;
      const content = contentRef.current;
      if (
        !overlay ||
        !card ||
        !content ||
        !isTokenDetailPanelWheelTarget(event.target)
      ) {
        return;
      }
      if (!overlay.contains(event.target as Node)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const target = event.target;
      if (!(target instanceof Node) || !card.contains(target)) {
        return;
      }
      if (content.scrollHeight <= content.clientHeight) {
        return;
      }

      const lineHeight = 16;
      const delta =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? event.deltaY * lineHeight
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? event.deltaY * content.clientHeight
            : event.deltaY;

      content.scrollTop = scrollTokenDetailPanelContent(
        content.scrollTop,
        delta,
        content.scrollHeight,
        content.clientHeight,
      );
    };

    window.addEventListener('wheel', handleWheel, {
      capture: true,
      passive: false,
    });
    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab' || !cardRef.current) {
      return;
    }

    const focusableElements = getFocusableElements(cardRef.current);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  };

  if (!isOpen) {
    return null;
  }

  // Portal into `#root .theme` so sidepanel/detached-window CSS matches the
  // account selector overlay (same frame width), while escaping the token row.
  return createPortal(
    <div
      ref={overlayRef}
      className="wallet-token-detail-panel-overlay"
      data-testid={`${dataTestId}-overlay`}
      onKeyDown={handleKeyDown}>
      <div
        className="wallet-token-detail-panel-backdrop"
        data-testid={`${dataTestId}-backdrop`}
        onClick={onClose}
      />
      <div
        id={titleId}
        ref={cardRef}
        className={`wallet-token-detail-panel-card${
          compact ? ' is-compact' : ''
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${titleId}-title`}
        data-testid={dataTestId}
        tabIndex={-1}>
        <div className="wallet-token-detail-panel-header">
          <div className="wallet-token-detail-panel-identity">
            {logo && (
              <div
                className="wallet-token-detail-panel-logo"
                data-testid={`${dataTestId}-logo`}>
                {logo}
              </div>
            )}
            <div
              id={`${titleId}-title`}
              className="wallet-token-detail-panel-title">
              {title}
            </div>
          </div>
          {headerAction}
        </div>
        <div className="wallet-token-detail-panel-content" ref={contentRef}>
          {children}
        </div>
        {footer && (
          <div
            className="wallet-token-detail-panel-footer"
            data-testid={`${dataTestId}-footer`}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    getThemePortalRoot(),
  );
};
