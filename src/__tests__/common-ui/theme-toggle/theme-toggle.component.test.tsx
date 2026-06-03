import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Theme } from '@popup/theme.context';
import { ThemeToggleComponent } from 'src/common-ui/theme-toggle/theme-toggle.component';

describe('ThemeToggleComponent', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders light and dark options with icons', () => {
    render(
      <ThemeToggleComponent
        selectedTheme={Theme.LIGHT}
        onChange={onChange}
      />,
    );

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle-light')).toHaveClass('selected');
    expect(screen.getByTestId('theme-toggle-dark')).not.toHaveClass('selected');
  });

  it('calls onChange when dark mode is selected', () => {
    render(
      <ThemeToggleComponent
        selectedTheme={Theme.LIGHT}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByTestId('theme-toggle-dark'));

    expect(onChange).toHaveBeenCalledWith(Theme.DARK);
  });

  it('calls onChange when light mode is selected', () => {
    render(
      <ThemeToggleComponent
        selectedTheme={Theme.DARK}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByTestId('theme-toggle-light'));

    expect(onChange).toHaveBeenCalledWith(Theme.LIGHT);
  });
});
