import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { TextAreaComponent } from 'src/common-ui/text-area/textarea.component';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: ({ className, dataTestId, onClick }: any) => {
    const React = require('react');
    return React.createElement('div', {
      className,
      'data-testid': dataTestId,
      onClick,
    });
  },
}));

describe('textarea.component', () => {
  const addChip = (value: string) => {
    const textarea = screen.getByTestId('seed-phrase-input');
    fireEvent.change(textarea, { target: { value } });
    fireEvent.keyPress(textarea, { key: ' ', code: 'Space', charCode: 32 });
  };

  it('keeps duplicate chips and deletes only the selected position', () => {
    const onChange = jest.fn();
    const { container } = render(
      <TextAreaComponent
        dataTestId="seed-phrase-input"
        value={[]}
        onChange={onChange}
        useChips
      />,
    );

    addChip('alpha');
    addChip('beta');
    addChip('alpha');

    expect(
      Array.from(container.querySelectorAll('.chip-label')).map(
        (chip) => chip.textContent,
      ),
    ).toEqual(['alpha', 'beta', 'alpha']);

    fireEvent.click(container.querySelectorAll('.chip-delete')[0]);

    expect(
      Array.from(container.querySelectorAll('.chip-label')).map(
        (chip) => chip.textContent,
      ),
    ).toEqual(['beta', 'alpha']);
    expect(onChange).toHaveBeenLastCalledWith(['beta', 'alpha']);
  });

  it('deletes the previous chip with Backspace only when the text buffer is empty', () => {
    const onChange = jest.fn();
    const { container } = render(
      <TextAreaComponent
        dataTestId="seed-phrase-input"
        value={[]}
        onChange={onChange}
        useChips
      />,
    );
    const textarea = screen.getByTestId('seed-phrase-input');

    addChip('alpha');
    addChip('beta');

    fireEvent.change(textarea, { target: { value: 'g' } });
    fireEvent.keyDown(textarea, { key: 'Backspace' });

    expect(
      Array.from(container.querySelectorAll('.chip-label')).map(
        (chip) => chip.textContent,
      ),
    ).toEqual(['alpha', 'beta']);

    fireEvent.change(textarea, { target: { value: '' } });
    fireEvent.keyDown(textarea, { key: 'Backspace' });

    expect(
      Array.from(container.querySelectorAll('.chip-label')).map(
        (chip) => chip.textContent,
      ),
    ).toEqual(['alpha']);
    expect(onChange).toHaveBeenLastCalledWith(['alpha']);
  });
});
