import { AutoLockType } from '@interfaces/autolock.interface';
import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdCheckbox from 'src/__tests__/utils-for-testing/data-testid/data-testid-checkbox';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
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
      await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.SETTINGS),
      );
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.AUTO_LOCK),
      );
    });
  });
  it('Must show autolock page', () => {
    expect(
      screen.getByTestId(`${Screen.SETTINGS_AUTO_LOCK}-page`),
    ).toBeInTheDocument();
  });

  it('Must set autolock to DEFAULT, show message and goback to advanced menu', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(
          dataTestIdCheckbox.autoLock.preFix + AutoLockType.DEFAULT,
        ),
      );
      await userEvent.click(screen.getByTestId(dataTestIdButton.save));
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_html_save_successful'),
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId(`${Screen.SETTINGS_ADVANCED}-page`),
    ).toBeInTheDocument();
  });

  it('Must set autolock to Device_lock, show message and goback to advanced menu', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(
          dataTestIdCheckbox.autoLock.preFix + AutoLockType.DEVICE_LOCK,
        ),
      );
      await userEvent.click(screen.getByTestId(dataTestIdButton.save));
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_html_save_successful'),
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId(`${Screen.SETTINGS_ADVANCED}-page`),
    ).toBeInTheDocument();
  });

  it('Must set autolock to Idle_Lock, show message and goback to advanced menu', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(
          dataTestIdCheckbox.autoLock.preFix + AutoLockType.IDLE_LOCK,
        ),
      );
      await userEvent.type(screen.getByTestId(dataTestIdInput.amount), '10');
      await userEvent.click(screen.getByTestId(dataTestIdButton.save));
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_html_save_successful'),
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId(`${Screen.SETTINGS_ADVANCED}-page`),
    ).toBeInTheDocument();
  });
});
