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

const renderSelect = (setSelectedItem = jest.fn()) => {
  render(
    <ComplexeCustomSelect
      ariaLabel="Test dropdown"
      options={options}
      selectedItem={options[0]}
      setSelectedItem={setSelectedItem}
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
});
