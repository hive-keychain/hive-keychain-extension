import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => <span aria-hidden="true" />,
}));

const options: OptionItem[] = [
  { label: 'First option', value: 'first' },
  { label: 'Second option', value: 'second' },
];

const renderSelect = (
  setSelectedItem = jest.fn(),
  footer?: React.ReactElement,
) => {
  render(
    <ComplexeCustomSelect
      ariaLabel="Test dropdown"
      options={options}
      selectedItem={options[0]}
      setSelectedItem={setSelectedItem}
      footer={footer}
    />,
  );

  return {
    select: screen.getByRole('combobox', { name: 'Test dropdown' }),
    setSelectedItem,
  };
};

describe('ComplexeCustomSelect', () => {
  it('opens with Space and exposes its options', async () => {
    const user = userEvent.setup();
    const { select } = renderSelect();

    select.focus();
    await user.keyboard(' ');

    expect(select).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('selects the keyboard-active option with Enter', async () => {
    const user = userEvent.setup();
    const { select, setSelectedItem } = renderSelect();

    select.focus();
    await user.keyboard('{Enter}{ArrowDown}{Enter}');

    expect(setSelectedItem).toHaveBeenCalledWith(options[1]);
    await waitFor(() => expect(select).toHaveAttribute('aria-expanded', 'false'));
    expect(select).toHaveFocus();
  });

  it('closes with Escape and restores focus', async () => {
    const user = userEvent.setup();
    const { select } = renderSelect();

    select.focus();
    await user.keyboard('{Enter}{Escape}');

    await waitFor(() => expect(select).toHaveAttribute('aria-expanded', 'false'));
    expect(select).toHaveFocus();
  });

  it('scrolls the keyboard-active option into view', async () => {
    const user = userEvent.setup();
    const scrollIntoView = jest.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    const { select } = renderSelect();

    select.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    scrollIntoView.mockClear();
    await user.keyboard('{ArrowDown}');

    await waitFor(() =>
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' }),
    );
    expect(screen.getAllByRole('option')[1]).toHaveClass('keyboard-active');
  });

  it('moves focus to the footer with Tab', async () => {
    const user = userEvent.setup();
    const handleFooterClick = jest.fn();
    const { select } = renderSelect(
      jest.fn(),
      <button type="button" onClick={handleFooterClick}>
        Add custom chain
      </button>,
    );

    select.focus();
    await user.keyboard('{Enter}{Tab}');

    const footerButton = screen.getByRole('button', {
      name: 'Add custom chain',
    });
    expect(footerButton).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(handleFooterClick).toHaveBeenCalledTimes(1);
  });
});
