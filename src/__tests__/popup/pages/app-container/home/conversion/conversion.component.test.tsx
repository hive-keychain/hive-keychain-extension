import App from '@popup/App';
import '@testing-library/jest-dom';
import React from 'react';
import conversion from 'src/__tests__/popup/pages/app-container/home/conversion/mocks/conversion';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import {
  EventType,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  actRunAllTimers,
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';

config.byDefault();

//const mk = fakeData.mk.userData1;
//const accounts = fakeData.accounts.twoAccounts;

beforeEach(async () => {
  // jest.useFakeTimers('legacy');
  // act(() => {
  //   jest.advanceTimersByTime(4300);
  // });
  // mocks.mocksApp({
  //   fixPopupOnMacOs: jest.fn(),
  //   getValueFromLocalStorage: jest
  //     .fn()
  //     .mockImplementation(mocks.getValuefromLS),
  //   getCurrentRpc: fakeData.rpc.fake,
  //   activeAccountUsername: mk,
  //   getRCMana: fakeData.manabar.manabarMin,
  //   getAccounts: fakeData.accounts.extendedAccountFull,
  //   rpcStatus: true,
  //   setRpc: jest.fn(),
  //   chromeSendMessage: jest.fn(),
  //   hasStoredAccounts: true,
  //   mkLocal: mk,
  //   getAccountsFromLocalStorage: accounts,
  //   hasVotedForProposal: true,
  //   voteForKeychainProposal: jest.fn(),
  //   chromeTabsCreate: jest.fn(),
  //   i18nGetMessage: jest.fn().mockImplementation(mocks.i18nGetMessage),
  //   saveValueInLocalStorage: jest.fn(),
  //   clearLocalStorage: jest.fn(),
  //   removeFromLocalStorage: jest.fn(),
  // });
  // mocks.mocksHome({
  //   getPrices: fakeData.prices,
  //   getAccountValue: '100000',
  // });
  // mocks.mocksTopBar({
  //   hasReward: false,
  // });
  // mocks.mocksPowerUp({
  //   getVestingDelegations: jest
  //     .fn()
  //     .mockResolvedValue(utilsT.fakeGetDelegateesResponse),
  // });
  // mocks.mocksDelegations({
  //   getDelegators: jest.fn().mockResolvedValue({
  //     data: utilsT.fakeGetDelegatorsResponse,
  //   }),
  // });
  // mocks.mocksWalletHistory({
  //   getAccountTransactions: jest
  //     .fn()
  //     .mockResolvedValue(utilsT.expectedDataGetAccountHistory),
  // });
  // mocks.mocksTokens({
  //   getAllTokens: jest.fn().mockResolvedValue(utilsT.fakeTokensResponse),
  //   getUserBalance: jest
  //     .fn()
  //     .mockResolvedValue(utilsT.fakeGetUserBalanceResponse),
  // });
  // mockPreset.setOrDefault({});
  // customRender(<App />, {
  //   initialState: { mk: mk.user.one, accounts: accounts.twoAccounts } as RootState,
  // });
  // expect(await screen.findByText(mk.user.one)).toBeDefined();
  await conversion.beforeEach(<App />);
});
afterEach(() => {
  afterTests.clean();
});

describe('conversion.component tests:\n', () => {
  describe('HIVE to HBD:\n', () => {
    beforeEach(async () => {
      // await act(async () => {
      //   await userEventPendingTimers.click(
      //     screen.getByLabelText(al.dropdown.arrow.hive),
      //   );
      // });
      // await act(async () => {
      //   await userEventPendingTimers.click(
      //     screen.getByLabelText(al.dropdown.span.convert),
      //   );
      // });
      await conversion.methods.clickAwaitDrop(alDropdown.arrow.hive);
    });
    it('Must show error if wrong requested value', async () => {
      await clickTypeAwait([
        { ariaLabel: alInput.amount, event: EventType.TYPE, text: '2000' },
        { ariaLabel: alButton.submit, event: EventType.CLICK },
      ]);
      await assertion.awaitFor(
        conversion.methods.message('popup_html_power_up_down_error'),
        QueryDOM.BYTEXT,
      );
    });
    it('Must show confirmation page and after cancel go back', async () => {
      await clickTypeAwait([
        { ariaLabel: alInput.amount, event: EventType.TYPE, text: '500' },
        { ariaLabel: alButton.submit, event: EventType.CLICK },
      ]);
      await assertion.awaitFor(alComponent.confirmationPage, QueryDOM.BYLABEL);
      await clickAwait([alButton.dialog.cancel]);
      assertion.getByLabelText(alComponent.conversionPage);
    });
    it('Must navigate to home page after successful conversion and show message', async () => {
      conversion.extraMocks(true);
      await clickTypeAwait([
        { ariaLabel: alInput.amount, event: EventType.TYPE, text: '500' },
        { ariaLabel: alButton.submit, event: EventType.CLICK },
        { ariaLabel: alButton.dialog.confirm, event: EventType.CLICK },
      ]);
      actRunAllTimers();
      assertion.getByText([
        {
          arialabelOrText: conversion.methods.message(
            'popup_html_hive_to_hbd_conversion_success',
          ),
          query: QueryDOM.BYTEXT,
        },
      ]);
    });
    // it('Must set convertion value to max when pressing to max button', async () => {
    //   const amountInputDefault = screen.getByLabelText(
    //     al.input.amount,
    //   ) as HTMLInputElement;
    //   expect(amountInputDefault.value).toBe('0');
    //   await act(async () => {
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.setToMax),
    //     );
    //   });
    //   const amountInput = (await screen.findByLabelText(
    //     al.input.amount,
    //   )) as HTMLInputElement;
    //   expect(amountInput.value).toBe('1000');
    // });
    // it('Must show error if convertion fails', async () => {
    //   await act(async () => {
    //     await userEventPendingTimers.type(
    //       screen.getByLabelText(al.input.amount),
    //       '500',
    //     );
    //   });
    //   await act(async () => {
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.submit),
    //     );
    //     jest.runAllTimers();
    //   });
    //   expect(
    //     screen.getByLabelText(al.component.confirmationPage),
    //   ).toBeInTheDocument();
    //   HiveUtils.convertOperation = jest.fn().mockResolvedValue(false);
    //   await act(async () => {
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.dialog.confirm),
    //     );
    //     jest.runAllTimers();
    //   });
    //   expect(
    //     screen.getByText(fakeData.messages.error.conversion.hive),
    //   ).toBeInTheDocument();
    // });
  });
  // describe('HBD to HIVE:\n', () => {
  //   beforeEach(async () => {
  //     // await act(async () => {
  //     //   await userEventPendingTimers.click(
  //     //     screen.getByLabelText(al.dropdown.arrow.hbd),
  //     //   );
  //     // });
  //     // await act(async () => {
  //     //   await userEventPendingTimers.click(
  //     //     screen.getByLabelText(al.dropdown.span.convert),
  //     //   );
  //     // });
  //     await conversion.methods.clickAwaitDrop(alDropdown.arrow.hbd);
  //   });
  //   it('Must show error if wrong requested value', async () => {
  //     await act(async () => {
  //       await userEventPendingTimers.type(
  //         screen.getByLabelText(al.input.amount),
  //         '2000',
  //       );
  //     });
  //     await act(async () => {
  //       await userEventPendingTimers.click(
  //         screen.getByLabelText(al.button.submit),
  //       );
  //       jest.runAllTimers();
  //     });
  //     expect(
  //       screen.getByText(fakeData.messages.error.greaterThan),
  //     ).toBeInTheDocument();
  //   });
  //   it('Must show confirmation page and after cancel go back', async () => {
  //     await act(async () => {
  //       await userEventPendingTimers.type(
  //         screen.getByLabelText(al.input.amount),
  //         '500',
  //       );
  //     });
  //     await act(async () => {
  //       await userEventPendingTimers.click(
  //         screen.getByLabelText(al.button.submit),
  //       );
  //       jest.runAllTimers();
  //     });
  //     expect(
  //       screen.getByLabelText(al.component.confirmationPage),
  //     ).toBeInTheDocument();
  //     await act(async () => {
  //       await userEventPendingTimers.click(
  //         screen.getByLabelText(al.button.dialog.cancel),
  //       );
  //     });
  //     expect(
  //       screen.getByLabelText(al.component.conversionPage),
  //     ).toBeInTheDocument();
  //   });
  //   it('Must navigate to home page after successful conversion and show message', async () => {
  //     await act(async () => {
  //       await userEventPendingTimers.type(
  //         screen.getByLabelText(al.input.amount),
  //         '500',
  //       );
  //     });
  //     await act(async () => {
  //       await userEventPendingTimers.click(
  //         screen.getByLabelText(al.button.submit),
  //       );
  //       jest.runAllTimers();
  //     });
  //     expect(
  //       screen.getByLabelText(al.component.confirmationPage),
  //     ).toBeInTheDocument();
  //     HiveUtils.convertOperation = jest.fn().mockResolvedValue(true);
  //     await act(async () => {
  //       await userEventPendingTimers.click(
  //         screen.getByLabelText(al.button.dialog.confirm),
  //       );
  //       jest.runAllTimers();
  //     });
  //     expect(screen.getByLabelText(al.component.homePage)).toBeInTheDocument();
  //     expect(
  //       screen.getByText(fakeData.messages.success.convertion.hbd),
  //     ).toBeInTheDocument();
  //   });
  //   it('Must set convertion value to max when pressing to max button', async () => {
  //     const amountInputDefault = screen.getByLabelText(
  //       al.input.amount,
  //     ) as HTMLInputElement;
  //     expect(amountInputDefault.value).toBe('0');
  //     await act(async () => {
  //       await userEventPendingTimers.click(
  //         screen.getByLabelText(al.button.setToMax),
  //       );
  //     });
  //     const amountInput = (await screen.findByLabelText(
  //       al.input.amount,
  //     )) as HTMLInputElement;
  //     expect(amountInput.value).toBe('1000');
  //   });
  //   it('Must show error if convertion fails', async () => {
  //     await act(async () => {
  //       await userEventPendingTimers.type(
  //         screen.getByLabelText(al.input.amount),
  //         '500',
  //       );
  //     });
  //     await act(async () => {
  //       await userEventPendingTimers.click(
  //         screen.getByLabelText(al.button.submit),
  //       );
  //       jest.runAllTimers();
  //     });
  //     expect(
  //       screen.getByLabelText(al.component.confirmationPage),
  //     ).toBeInTheDocument();
  //     HiveUtils.convertOperation = jest.fn().mockResolvedValue(false);
  //     await act(async () => {
  //       await userEventPendingTimers.click(
  //         screen.getByLabelText(al.button.dialog.confirm),
  //       );
  //       jest.runAllTimers();
  //     });
  //     expect(
  //       screen.getByText(fakeData.messages.error.conversion.hbd),
  //     ).toBeInTheDocument();
  //   });
  // });
});
