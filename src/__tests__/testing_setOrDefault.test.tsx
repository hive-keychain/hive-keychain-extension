import { ExtendedAccount } from '@hiveio/dhive';
import App from '@popup/App';
import '@testing-library/jest-dom';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { overWriteMocks } from 'src/__tests__/utils-for-testing/defaults/overwrite';
import al from 'src/__tests__/utils-for-testing/end-to-end-aria-labels';
import fakeData from 'src/__tests__/utils-for-testing/end-to-end-data';
import { userEventPendingTimers } from 'src/__tests__/utils-for-testing/end-to-end-events';
import mockPreset from 'src/__tests__/utils-for-testing/end-to-end-mocks-presets';
import { OverwriteMock } from 'src/__tests__/utils-for-testing/enums/enums';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import { customRender } from 'src/__tests__/utils-for-testing/renderSetUp';
//TODO remove this file or leave it if you need to have a test for the mockings
const chrome = require('chrome-mock');
global.chrome = chrome;
jest.setTimeout(10000);
const mk = fakeData.mk.userData1;
const accounts = fakeData.accounts.twoAccounts;
const extendedAccountNoProxy = [
  {
    ...fakeData.accounts.extendedAccountFull[0],
    proxy: '',
    witnesses_voted_for: 0,
  } as ExtendedAccount,
];

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  cleanup();
});

it('must load homepage with by default values', async () => {
  jest.useFakeTimers('legacy');
  act(() => {
    jest.advanceTimersByTime(4300);
  });
  mockPreset.setOrDefault({});
  customRender(<App />, {
    initialState: { mk: mk, accounts: accounts } as RootState,
  });
  expect(await screen.findByText('yolo')).toBeInTheDocument();
});

it('must load proxy suggestion on homepage', async () => {
  jest.useFakeTimers('legacy');
  act(() => {
    jest.advanceTimersByTime(4300);
  });
  mockPreset.setOrDefault({
    app: { getAccounts: extendedAccountNoProxy },
    home: { getAccountValue: '300' },
  });
  customRender(<App />, {
    initialState: { mk: mk, accounts: accounts } as RootState,
  });
  expect(await screen.findByText('yolo')).toBeInTheDocument();
});

it('Must load delegations page, and show error', async () => {
  const OW = OverwriteMock.SET_AS_NOT_IMPLEMENTED;
  jest.useFakeTimers('legacy');
  act(() => {
    jest.advanceTimersByTime(4300);
  });
  mockPreset.setOrDefault({});
  //overwrite
  overWriteMocks({
    powerUp: { getVestingDelegations: OW },
    delegations: { getDelegators: OW },
  });
  customRender(<App />, {
    initialState: { mk: mk, accounts: accounts } as RootState,
  });
  expect(await screen.findByText(mk)).toBeDefined();
  await act(async () => {
    await userEventPendingTimers.click(
      screen.getByLabelText(al.dropdown.arrow.hp),
    );
    await userEventPendingTimers.click(
      screen.getByLabelText(al.dropdown.span.delegations),
    );
  });
  await waitFor(() => {
    expect(screen.getByText('yolo')).toBeInTheDocument();
  });
});
