import React, { useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { I18nUtils } from 'src/utils/i18n.utils';

export interface EvmNftOptionsMenuItem {
  label: string;
  onClick: () => void;
  testId?: string;
  selected?: boolean;
}

interface PanelProps {
  items: EvmNftOptionsMenuItem[];
  onClose: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const EvmNftOptionsPanel = ({
  items,
  onClose,
  className,
  style,
}: PanelProps) => (
  <>
    <button
      type="button"
      className="nft-menu-backdrop"
      aria-label={I18nUtils.getMessage('popup_html_close')}
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
    />
    <div
      className={`nft-options-panel ${className ?? ''}`}
      role="menu"
      style={style}>
      {items.map((item) => (
        <button
          key={item.testId ?? item.label}
          type="button"
          role="menuitem"
          className={item.selected ? 'is-selected' : ''}
          data-testid={item.testId}
          onClick={(event) => {
            event.stopPropagation();
            onClose();
            item.onClick();
          }}>
          {I18nUtils.getMessage(item.label)}
        </button>
      ))}
    </div>
  </>
);

interface MenuProps {
  items: EvmNftOptionsMenuItem[];
  triggerLabel: string;
  icon?: SVGIcons;
  active?: boolean;
  testId?: string;
  additionalClass?: string;
}

export const EvmNftOptionsMenu = ({
  items,
  triggerLabel,
  icon,
  active,
  testId,
  additionalClass,
}: MenuProps) => {
  const [anchor, setAnchor] = useState<{ top: number; right: number }>();

  const toggleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (anchor) {
      setAnchor(undefined);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setAnchor({
      top: rect.bottom + 4,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  };

  return (
    <div
      className={`nft-options ${additionalClass ?? ''}`}
      onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        className={`nft-options-trigger ${icon ? 'is-icon' : ''} ${
          active ? 'is-active' : ''
        }`}
        aria-label={I18nUtils.getMessage(triggerLabel)}
        aria-haspopup="menu"
        aria-expanded={!!anchor}
        data-testid={testId}
        onClick={toggleMenu}>
        {icon ? (
          <SVGIcon icon={icon} />
        ) : (
          I18nUtils.getMessage(triggerLabel)
        )}
      </button>
      {anchor && (
        <EvmNftOptionsPanel
          items={items}
          onClose={() => setAnchor(undefined)}
          style={{ top: anchor.top, right: anchor.right }}
        />
      )}
    </div>
  );
};
