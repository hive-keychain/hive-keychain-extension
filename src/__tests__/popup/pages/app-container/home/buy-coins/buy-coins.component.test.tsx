//TODO; fix and finish
// import App from '@popup/App';
// import { BuyCoinType } from '@popup/pages/app-container/home/buy-coins/buy-coin-type.enum';
// import { BuyCoinsListItem } from '@popup/pages/app-container/home/buy-coins/buy-coins-list-item.list';
// import { RootState } from '@popup/store';
// import '@testing-library/jest-dom';
// import { act, cleanup, screen } from '@testing-library/react';
// import React from 'react';
// import al from 'src/__tests__/utils-for-testing/end-to-end-aria-labels';
// import fakeData from 'src/__tests__/utils-for-testing/end-to-end-data';
// import { userEventPendingTimers } from 'src/__tests__/utils-for-testing/end-to-end-events';
// import mocks from 'src/__tests__/utils-for-testing/end-to-end-mocks';
// import { customRender } from 'src/__tests__/utils-for-testing/renderSetUp';

// const chrome = require('chrome-mock');
// global.chrome = chrome;
// jest.setTimeout(10000);

// const mk = fakeData.mk.userData1;
// const accounts = fakeData.accounts.twoAccounts;

// afterAll(() => {
//   jest.clearAllMocks();
// });

// beforeEach(async () => {
//   jest.useFakeTimers('legacy');
//   act(() => {
//     jest.advanceTimersByTime(4300);
//   });
//   mocks.mocksApp({
//     fixPopupOnMacOs: jest.fn(),
//     getValueFromLocalStorage: jest
//       .fn()
//       .mockImplementation(mocks.getValuefromLS),
//     getCurrentRpc: fakeData.rpc.fake,
//     activeAccountUsername: mk,
//     getRCMana: fakeData.manabar.manabarMin,
//     getAccounts: fakeData.accounts.extendedAccountFull,
//     rpcStatus: true,
//     setRpc: jest.fn(),
//     chromeSendMessage: jest.fn(),
//     hasStoredAccounts: true,
//     mkLocal: mk,
//     getAccountsFromLocalStorage: fakeData.accounts.twoAccounts,
//     hasVotedForProposal: true,
//     voteForKeychainProposal: jest.fn(),
//     chromeTabsCreate: jest.fn(),
//     i18nGetMessage: jest.fn().mockImplementation(mocks.i18nGetMessage),
//     saveValueInLocalStorage: jest.fn(),
//     clearLocalStorage: jest.fn(),
//     removeFromLocalStorage: jest.fn(),
//   });
//   mocks.mocksHome({
//     getPrices: fakeData.prices,
//     getAccountValue: '100000',
//   });
//   mocks.mocksTopBar({
//     hasReward: false,
//   });
//   customRender(<App />, {
//     initialState: { mk: mk, accounts: accounts } as RootState,
//   });
//   expect(await screen.findByText(mk)).toBeDefined();
// });
// afterEach(() => {
//   jest.runOnlyPendingTimers();
//   jest.useRealTimers();
//   cleanup();
// });
// describe('buy-coins.component tests:\n', () => {
//   it('Must show the list of exchanges for hive', async () => {
//     const arrowMenu = screen.getByLabelText(
//       al.dropdown.arrow.hive,
//     ) as HTMLImageElement;
//     await act(async () => {
//       await userEventPendingTimers.click(arrowMenu);
//     });
//     const buyHiveButton = screen.getByLabelText(
//       al.button.dropdownMenu.item.shoppingCart,
//     );
//     await act(async () => {
//       await userEventPendingTimers.click(buyHiveButton);
//     });
//     const linksFound = screen.getAllByRole('link');
//     let index = 0;
//     BuyCoinsListItem(BuyCoinType.BUY_HIVE).map((category) => {
//       category.items.map((currElement) => {
//         expect(linksFound[index]).toHaveAttribute('href', currElement.link);
//         index += 1;
//       });
//     });
//   });
//   it('Must show the list of exchanges for hbd', async () => {
//     const arrowMenu = screen.getByLabelText(
//       al.dropdown.arrow.hbd,
//     ) as HTMLImageElement;
//     await act(async () => {
//       await userEventPendingTimers.click(arrowMenu);
//     });
//     const buyHiveButton = screen.getByLabelText(
//       al.button.dropdownMenu.item.shoppingCart,
//     );
//     await act(async () => {
//       await userEventPendingTimers.click(buyHiveButton);
//     });
//     const linksFound = screen.getAllByRole('link');
//     let index = 0;
//     BuyCoinsListItem(BuyCoinType.BUY_HDB).map((category) => {
//       category.items.map((currElement) => {
//         expect(linksFound[index]).toHaveAttribute('href', currElement.link);
//         index += 1;
//       });
//     });
//   });
// });

export {};
