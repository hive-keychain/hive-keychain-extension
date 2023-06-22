import { AutoLockType } from '@interfaces/autolock.interface';
import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import arialabelCheckbox from 'src/__tests__/utils-for-testing/aria-labels/aria-label-checkbox';
import ariaLabelInput from 'src/__tests__/utils-for-testing/aria-labels/aria-label-input';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
describe('auto-lock.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
      initialStates.iniStateAs.defaultExistent,
    );
    await act(async () => {
      await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
      await userEvent.click(
        screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.SETTINGS),
      );
      await userEvent.click(
        screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.AUTO_LOCK),
      );
    });
  });
  it('Must show autolock page', () => {
    expect(
      screen.getByLabelText(`${Screen.SETTINGS_AUTO_LOCK}-page`),
    ).toBeInTheDocument();
  });

  it('Must set autolock to DEFAULT, show message and goback to advanced menu', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(
          arialabelCheckbox.autoLock.preFix + AutoLockType.DEFAULT,
        ),
      );
      await userEvent.click(screen.getByLabelText(ariaLabelButton.save));
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_html_save_successful'),
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText(`${Screen.SETTINGS_ADVANCED}-page`),
    ).toBeInTheDocument();
  });

  it('Must set autolock to Device_lock, show message and goback to advanced menu', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(
          arialabelCheckbox.autoLock.preFix + AutoLockType.DEVICE_LOCK,
        ),
      );
      await userEvent.click(screen.getByLabelText(ariaLabelButton.save));
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_html_save_successful'),
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText(`${Screen.SETTINGS_ADVANCED}-page`),
    ).toBeInTheDocument();
  });

  it('Must set autolock to Idle_Lock, show message and goback to advanced menu', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(
          arialabelCheckbox.autoLock.preFix + AutoLockType.IDLE_LOCK,
        ),
      );
      await userEvent.type(screen.getByLabelText(ariaLabelInput.amount), '10');
      await userEvent.click(screen.getByLabelText(ariaLabelButton.save));
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_html_save_successful'),
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText(`${Screen.SETTINGS_ADVANCED}-page`),
    ).toBeInTheDocument();
  });
});
