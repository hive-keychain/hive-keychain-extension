import App from '@popup/App';
import '@testing-library/jest-dom';
import React from 'react';
import delegations from 'src/__tests__/popup/pages/app-container/home/delegations/mocks/delegations';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
config.byDefault();
//const mk = fakeData.mk.userData1;
//const accounts = fakeData.accounts.twoAccounts;

describe('delegations.component tests:\n', () => {
  afterEach(() => {
    afterTests.clean();
  });
  describe('handling errors on load:\n', () => {
    beforeEach(async () => {
      await delegations.beforeEach(<App />, true);
    });
    it('Must load delegations page, and show error', async () => {
      const errorMessage = mocksImplementation.i18nGetMessageCustom(
        'popup_html_error_retrieving_incoming_delegations',
      );
      await assertion.awaitFor(errorMessage, QueryDOM.BYTEXT);
    });
  });
  describe('no errors on load:\n', () => {
    beforeEach(async () => {
      // jest.useFakeTimers('legacy');
      // act(() => {
      //   jest.advanceTimersByTime(4300);
      // });
      // mockPreset.load(MockPreset.HOMEDEFAULT, mk, accounts).preset;
      // customRender(<App />, {
      //   initialState: { mk: mk, accounts: accounts } as RootState,
      // });
      // expect(await screen.findByText(mk)).toBeDefined();
      // await act(async () => {
      //   await userEventPendingTimers.click(
      //     screen.getByLabelText(al.dropdown.arrow.hp),
      //   );
      // });
      // await act(async () => {
      //   await userEventPendingTimers.click(
      //     screen.getByLabelText(al.dropdown.span.delegations),
      //   );
      // });
      await delegations.beforeEach(<App />, false);
    });
    it('Must navigate to delegations page', () => {
      assertion.getByLabelText(alComponent.delegationsPage);
    });
    // it.skip('Must navigate to INCOMING_OUTGOING_PAGE when clicking incomming', async () => {
    //   await act(async () => {
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.delegations.total.incoming),
    //     );
    //   });
    //   expect(
    //     screen.getByLabelText(al.component.incomingOutgoingPage),
    //   ).toBeInTheDocument();
    //   expect(screen.getByText('Total Incoming')).toBeInTheDocument();

    //   await clickAwait([]);
    // });
    // it('Must navigate to INCOMING_OUTGOING_PAGE when clicking outcomming', async () => {
    //   await act(async () => {
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.delegations.total.outgoing),
    //     );
    //   });
    //   expect(
    //     screen.getByLabelText(al.component.incomingOutgoingPage),
    //   ).toBeInTheDocument();
    //   expect(screen.getByText('Total Outgoing')).toBeInTheDocument();
    // });
    // it('Must navigate to INCOMING_OUTGOING_PAGE, and go back when clicking on back icon', async () => {
    //   await act(async () => {
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.delegations.total.incoming),
    //     );
    //   });
    //   expect(
    //     screen.getByLabelText(al.component.incomingOutgoingPage),
    //   ).toBeInTheDocument();
    //   await act(async () => {
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.icon.arrowBack),
    //     );
    //   });
    //   expect(
    //     screen.getByLabelText(al.component.delegationsPage),
    //   ).toBeInTheDocument();
    // });
    // it('Must set delegation amount to max when pressing max button', async () => {
    //   await act(async () => {
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.setToMax),
    //     );
    //   });
    //   const inputAmount = screen.getByLabelText(
    //     al.input.amount,
    //   ) as HTMLInputElement;
    //   expect(inputAmount.value).toBe('0.459');
    // });
    // it('Must show error if wrong requested value', async () => {
    //   await act(async () => {
    //     await userEventPendingTimers.type(
    //       screen.getByLabelText(al.input.username),
    //       'theghost1980',
    //     );
    //     await userEventPendingTimers.type(
    //       screen.getByLabelText(al.input.amount),
    //       '1000',
    //     );
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.operation.delegate.submit),
    //     );
    //   });
    //   expect(
    //     await screen.findByText(fakeData.messages.error.greaterThan),
    //   ).toBeInTheDocument();
    // });
    // it('Must show error when delegation fails', async () => {
    //   HiveUtils.delegateVestingShares = jest.fn().mockResolvedValue(false);
    //   await act(async () => {
    //     await userEventPendingTimers.type(
    //       screen.getByLabelText(al.input.username),
    //       'theghost1980',
    //     );
    //     await userEventPendingTimers.type(
    //       screen.getByLabelText(al.input.amount),
    //       '0.1',
    //     );
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.operation.delegate.submit),
    //     );
    //   });
    //   await act(async () => {
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.dialog.confirm),
    //     );
    //   });
    //   expect(
    //     await screen.findByText(fakeData.messages.error.delegations.failed),
    //   ).toBeInTheDocument();
    // });
    // it('Must navigate to confirmation page and go back when pressing cancel', async () => {
    //   await act(async () => {
    //     await userEventPendingTimers.type(
    //       screen.getByLabelText(al.input.username),
    //       'theghost1980',
    //     );
    //     await userEventPendingTimers.type(
    //       screen.getByLabelText(al.input.amount),
    //       '0.1',
    //     );
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.operation.delegate.submit),
    //     );
    //   });
    //   expect(
    //     screen.getByLabelText(al.component.confirmationPage),
    //   ).toBeInTheDocument();
    //   await act(async () => {
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.dialog.cancel),
    //     );
    //   });
    //   expect(
    //     screen.getByLabelText(al.component.delegationsPage),
    //   ).toBeInTheDocument();
    // });
    // it('Must navigate to home page after successful delegation and show message', async () => {
    //   HiveUtils.delegateVestingShares = jest.fn().mockResolvedValue(true);
    //   await act(async () => {
    //     await userEventPendingTimers.type(
    //       screen.getByLabelText(al.input.username),
    //       'theghost1980',
    //     );
    //     await userEventPendingTimers.type(
    //       screen.getByLabelText(al.input.amount),
    //       '0.1',
    //     );
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.operation.delegate.submit),
    //     );
    //   });
    //   await act(async () => {
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.dialog.confirm),
    //     );
    //   });
    //   expect(
    //     await screen.findByText(fakeData.messages.success.delegation),
    //   ).toBeInTheDocument();
    //   expect(
    //     await screen.findByLabelText(al.component.homePage),
    //   ).toBeInTheDocument();
    // });
    // it('Must cancel a delegation when submitting with 0 HP value, show message and navigate to home', async () => {
    //   HiveUtils.delegateVestingShares = jest.fn().mockResolvedValue(true);
    //   await act(async () => {
    //     await userEventPendingTimers.type(
    //       screen.getByLabelText(al.input.username),
    //       'theghost1980',
    //     );
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.operation.delegate.submit),
    //     );
    //   });
    //   await act(async () => {
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.dialog.confirm),
    //     );
    //   });
    //   expect(
    //     await screen.findByText(fakeData.messages.success.delegationCanceled),
    //   ).toBeInTheDocument();
    //   expect(
    //     await screen.findByLabelText(al.component.homePage),
    //   ).toBeInTheDocument();
    // });
    // it('Must show message if cancellation fails', async () => {
    //   HiveUtils.delegateVestingShares = jest.fn().mockResolvedValue(false);
    //   await act(async () => {
    //     await userEventPendingTimers.type(
    //       screen.getByLabelText(al.input.username),
    //       'theghost1980',
    //     );
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.operation.delegate.submit),
    //     );
    //   });
    //   await act(async () => {
    //     await userEventPendingTimers.click(
    //       screen.getByLabelText(al.button.dialog.confirm),
    //     );
    //   });
    //   expect(
    //     await screen.findByText(
    //       fakeData.messages.error.delegations.failedCancelation,
    //     ),
    //   ).toBeInTheDocument();
    // });
  });
});
