import App from '@popup/App';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import React from 'react';
import AccountUtils from 'src/utils/account.utils';
import al from 'src/__tests__/utils-for-testing/end-to-end-aria-labels';
import fakeData from 'src/__tests__/utils-for-testing/end-to-end-data';
import { userEventPendingTimers } from 'src/__tests__/utils-for-testing/end-to-end-events';
import mockPreset, {
  MockPreset,
} from 'src/__tests__/utils-for-testing/end-to-end-mocks-presets';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import { customRender } from 'src/__tests__/utils-for-testing/renderSetUp';

const chrome = require('chrome-mock');
global.chrome = chrome;
jest.setTimeout(10000);
const mk = fakeData.mk.userData1;
const accounts = fakeData.accounts.twoAccounts;

describe('estimated-account-value-section.component tests:\n', () => {
  let customRerender: (
    ui: React.ReactElement<any, string | React.JSXElementConstructor<any>>,
  ) => void;
  beforeEach(async () => {
    jest.useFakeTimers('legacy');
    act(() => {
      jest.advanceTimersByTime(4300);
    });
    mockPreset.load(MockPreset.HOMEDEFAULT, mk, accounts).preset;
    const { rerender } = customRender(<App />, {
      initialState: { mk: mk, accounts: accounts } as RootState,
    });
    expect(await screen.findByText(mk)).toBeDefined();
    customRerender = rerender;
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    cleanup();
  });
  const labelEstimatedAccountValue = 'Estimated Account Value';
  it('Must display the estimated account value', () => {
    expect(screen.getByText(labelEstimatedAccountValue)).toBeInTheDocument();
    expect(screen.getByText('$ 100000 USD')).toBeInTheDocument();
  });
  it('Must display custom tooltip on mouse enter', async () => {
    await act(async () => {
      await userEventPendingTimers.hover(
        screen.getByLabelText(al.toolTip.custom),
      );
    });
    expect(screen.getByLabelText(al.toolTip.content)).toBeInTheDocument();
    expect(
      screen.getByText(
        /The estimated account value is a ballpark idea of what your funds are worth in USD./i,
      ),
    ).toBeInTheDocument();
  });
  it('Must remove custom tooltip on mouse leave', async () => {
    await act(async () => {
      await userEventPendingTimers.hover(
        screen.getByLabelText(al.toolTip.custom),
      );
    });
    expect(screen.getByLabelText(al.toolTip.content)).toBeInTheDocument();
    expect(
      screen.getByText(
        /The estimated account value is a ballpark idea of what your funds are worth in USD./i,
      ),
    ).toBeInTheDocument();
    await act(async () => {
      await userEventPendingTimers.unhover(
        screen.getByLabelText(al.toolTip.custom),
      );
    });
    expect(
      screen.queryByText(
        /The estimated account value is a ballpark idea of what your funds are worth in USD./i,
      ),
    ).not.toBeInTheDocument();
  });
  it('Must display ... when account value not received', async () => {
    AccountUtils.getAccountValue = jest.fn().mockReturnValue(undefined);
    customRerender(<App />);
    act(() => {
      jest.advanceTimersByTime(4300);
    });
    expect(await screen.findByText(mk)).toBeDefined();
    const divValue = screen.getByLabelText(
      al.div.estimatedAccountValue,
    ) as HTMLDivElement;
    expect(divValue.textContent).toBe('...');
  });
});
