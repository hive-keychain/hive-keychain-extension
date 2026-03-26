import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import InputComponent from 'src/common-ui/input/input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import { SVGIcons } from 'src/common-ui/icons.enum';

describe('input.component', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  describe('right action (set to max)', () => {
    it('calls rightActionClicked when the set-to-max wrapper is clicked', () => {
      const onChange = jest.fn();
      const rightActionClicked = jest.fn();
      render(
        <InputComponent
          value=""
          type={InputType.TEXT}
          onChange={onChange}
          rightActionClicked={rightActionClicked}
          rightActionIcon={SVGIcons.INPUT_MAX}
        />,
      );
      fireEvent.click(screen.getByTestId('set-to-max-button'));
      expect(rightActionClicked).toHaveBeenCalledTimes(1);
    });

    it('calls rightActionClicked on Enter when the set-to-max control is focused', () => {
      const onChange = jest.fn();
      const rightActionClicked = jest.fn();
      render(
        <InputComponent
          value=""
          type={InputType.TEXT}
          onChange={onChange}
          rightActionClicked={rightActionClicked}
          rightActionIcon={SVGIcons.INPUT_MAX}
        />,
      );
      const control = screen.getByTestId('set-to-max-button');
      control.focus();
      fireEvent.keyDown(control, { key: 'Enter' });
      expect(rightActionClicked).toHaveBeenCalledTimes(1);
    });

    it('calls rightActionClicked on Space and prevents default', () => {
      const onChange = jest.fn();
      const rightActionClicked = jest.fn();
      render(
        <InputComponent
          value=""
          type={InputType.TEXT}
          onChange={onChange}
          rightActionClicked={rightActionClicked}
          rightActionIcon={SVGIcons.INPUT_MAX}
        />,
      );
      const control = screen.getByTestId('set-to-max-button');
      const event = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      });
      const preventDefault = jest.spyOn(event, 'preventDefault');
      fireEvent(control, event);
      expect(rightActionClicked).toHaveBeenCalledTimes(1);
      expect(preventDefault).toHaveBeenCalled();
    });

    it('uses data-testid right-action when the icon is not INPUT_MAX', () => {
      const onChange = jest.fn();
      const rightActionClicked = jest.fn();
      render(
        <InputComponent
          value=""
          type={InputType.TEXT}
          onChange={onChange}
          rightActionClicked={rightActionClicked}
          rightActionIcon={SVGIcons.INPUT_CLEAR}
        />,
      );
      fireEvent.click(screen.getByTestId('right-action'));
      expect(rightActionClicked).toHaveBeenCalledTimes(1);
    });
  });
});
