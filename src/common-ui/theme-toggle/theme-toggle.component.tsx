import { Theme } from '@popup/theme.context';
import React, { Fragment } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface ThemeToggleOption {
  value: Theme;
  label: string;
  icon: SVGIcons;
  testId: string;
}

const THEME_TOGGLE_OPTIONS: ThemeToggleOption[] = [
  {
    value: Theme.LIGHT,
    label: 'popup_html_light_mode',
    icon: SVGIcons.THEME_TOGGLE_SUN,
    testId: 'theme-toggle-light',
  },
  {
    value: Theme.DARK,
    label: 'popup_html_dark_mode',
    icon: SVGIcons.THEME_TOGGLE_MOON,
    testId: 'theme-toggle-dark',
  },
];

interface ThemeToggleProps {
  selectedTheme: Theme;
  onChange: (theme: Theme) => void;
  dataTestId?: string;
}

export const ThemeToggleComponent = ({
  selectedTheme,
  onChange,
  dataTestId = 'theme-toggle',
}: ThemeToggleProps) => {
  const selectedIndex = THEME_TOGGLE_OPTIONS.findIndex(
    (option) => option.value === selectedTheme,
  );

  return (
    <div className="theme-toggle" data-testid={dataTestId}>
      <div className="theme-toggle-tabs">
        {THEME_TOGGLE_OPTIONS.map((option) => {
          const isSelected = option.value === selectedTheme;

          return (
            <Fragment key={option.value}>
              <input
                type="radio"
                id={`${dataTestId}-${option.value}`}
                name={dataTestId}
                checked={isSelected}
                onChange={() => onChange(option.value)}
              />
              <label
                data-testid={option.testId}
                className={`theme-toggle-tab ${isSelected ? 'selected' : ''}`}
                htmlFor={`${dataTestId}-${option.value}`}>
                <SVGIcon icon={option.icon} />
                <span className="theme-toggle-label">
                  {chrome.i18n.getMessage(option.label)}
                </span>
              </label>
            </Fragment>
          );
        })}
        <span
          className="theme-toggle-glider"
          style={{
            transform: `translateX(calc(${selectedIndex} * 100%))`,
          }}
        />
      </div>
    </div>
  );
};
