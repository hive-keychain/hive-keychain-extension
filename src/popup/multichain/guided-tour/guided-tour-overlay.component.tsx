import { GuidedTourRect } from '@interfaces/guided-tour.interface';
import { Theme, useThemeContext } from '@popup/theme.context';
import React, { useLayoutEffect, useRef, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { GuidedTourUtils } from 'src/utils/guided-tour.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

interface Props {
  targetRect: GuidedTourRect;
  titleKey: string;
  descriptionKey?: string;
  showDismiss: boolean;
  showNext: boolean;
  blockTargetClick: boolean;
  onDismiss: () => void;
  onNext: () => void;
}

const toPaneStyle = (rect: GuidedTourRect): React.CSSProperties => ({
  top: rect.top,
  left: rect.left,
  width: rect.width,
  height: rect.height,
});

const GuidedTourOverlay = ({
  targetRect,
  titleKey,
  descriptionKey,
  showDismiss,
  showNext,
  blockTargetClick,
  onDismiss,
  onNext,
}: Props) => {
  const { theme: contextTheme } = useThemeContext();
  const portalTheme = contextTheme ?? Theme.DARK;
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [tooltipHeight, setTooltipHeight] = useState(
    GuidedTourUtils.DEFAULT_TOOLTIP_HEIGHT,
  );

  useLayoutEffect(() => {
    const tooltipElement = tooltipRef.current;
    if (!tooltipElement) {
      return;
    }
    const nextHeight = Math.ceil(tooltipElement.getBoundingClientRect().height);
    if (nextHeight > 0 && nextHeight !== tooltipHeight) {
      setTooltipHeight(nextHeight);
    }
  }, [
    descriptionKey,
    showDismiss,
    showNext,
    targetRect,
    titleKey,
    tooltipHeight,
  ]);

  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  const layout = GuidedTourUtils.getOverlayLayout(
    targetRect,
    viewport,
    tooltipHeight,
  );

  const title = I18nUtils.getMessage(titleKey);
  const description = descriptionKey
    ? I18nUtils.getMessage(descriptionKey)
    : '';

  return (
    <div
      className={`guided-tour-root theme ${portalTheme}`}
      data-testid="guided-tour-overlay">
      <div
        className="guided-tour-pane"
        data-testid="guided-tour-pane-top"
        style={toPaneStyle(layout.panes.top)}
      />
      <div
        className="guided-tour-pane"
        data-testid="guided-tour-pane-left"
        style={toPaneStyle(layout.panes.left)}
      />
      <div
        className="guided-tour-pane"
        data-testid="guided-tour-pane-right"
        style={toPaneStyle(layout.panes.right)}
      />
      <div
        className="guided-tour-pane"
        data-testid="guided-tour-pane-bottom"
        style={toPaneStyle(layout.panes.bottom)}
      />
      <div
        className={`guided-tour-highlight${
          blockTargetClick ? ' blocking' : ''
        }`}
        data-testid="guided-tour-highlight"
        style={{
          ...toPaneStyle(layout.hole),
          borderRadius: layout.borderRadius,
        }}
      />
      <div
        ref={tooltipRef}
        className={`guided-tour-tooltip ${layout.tooltip.placement}`}
        data-testid="guided-tour-tooltip"
        role="tooltip"
        style={{
          top: layout.tooltip.top,
          left: layout.tooltip.left,
          width: layout.tooltip.width,
        }}>
        <div className="guided-tour-tooltip-title">{title}</div>
        {description && (
          <div className="guided-tour-tooltip-description">{description}</div>
        )}
        {showNext && (
          <ButtonComponent
            additionalClass="guided-tour-dismiss-button"
            dataTestId="guided-tour-next-button"
            height="small"
            label="popup_html_next"
            onClick={onNext}
            type={ButtonType.IMPORTANT}
          />
        )}
        {showDismiss && (
          <ButtonComponent
            additionalClass="guided-tour-dismiss-button"
            dataTestId="guided-tour-dismiss-button"
            height="small"
            label="popup_html_guided_tour_got_it"
            onClick={onDismiss}
            type={ButtonType.IMPORTANT}
          />
        )}
      </div>
    </div>
  );
};

export const GuidedTourOverlayComponent = GuidedTourOverlay;
