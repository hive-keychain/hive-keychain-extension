import App from '@popup/App';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import transferFund from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/transfer-fund';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alCheckbox from 'src/__tests__/utils-for-testing/aria-labels/al-checkbox';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import {
  EventType,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('transfer-fund.component tests:\n', () => {
  const { constants, methods, extraMocks } = transferFund;
  const { keyMessage } = constants;
  methods.afterEach;
  describe('HIVE:\n', () => {
    const currency = 'HIVE';
    describe('as default, having all keys:\n', () => {
      beforeEach(async () => {
        await transferFund.beforeEach(<App />, 'hive');
      });
      it('Must show transfer fund page and user data', () => {
        assertion.getByLabelText(alComponent.transfersFundsPage);
        assertion.getManyByText(constants.balanceTextOnScreen.hive);
      });
      it('Must show error if no amount', async () => {
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: constants.anotherUser,
          },
          {
            ariaLabel: alButton.operation.transfer.send,
            event: EventType.CLICK,
          },
        ]);
        await assertion.awaitFor(keyMessage.fields, QueryDOM.BYTEXT);
      });
      it('Must show error if no receiverUsername', async () => {
        //popup_html_fill_form_error
        await clickTypeAwait([
          {
            ariaLabel: alInput.amount,
            event: EventType.TYPE,
            text: '10',
          },
          {
            ariaLabel: alButton.operation.transfer.send,
            event: EventType.CLICK,
          },
        ]);
        await assertion.awaitFor(keyMessage.fields, QueryDOM.BYTEXT);
      });
      it('Must show error if empty receiverUsername', async () => {
        //popup_html_fill_form_error
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: ' ',
          },
          {
            ariaLabel: alInput.amount,
            event: EventType.TYPE,
            text: '10',
          },
          {
            ariaLabel: alButton.operation.transfer.send,
            event: EventType.CLICK,
          },
        ]);
        await assertion.awaitFor(keyMessage.fields, QueryDOM.BYTEXT);
      });
      it('Must show error if negative amount and no recurrent', async () => {
        //popup_html_need_positive_amount
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: constants.anotherUser,
          },
          {
            ariaLabel: alInput.amount,
            event: EventType.TYPE,
            text: '-10',
          },
          {
            ariaLabel: alButton.operation.transfer.send,
            event: EventType.CLICK,
          },
        ]);
        await assertion.awaitFor(keyMessage.negative, QueryDOM.BYTEXT);
      });
      it('Must show error if not enough balance', async () => {
        //popup_html_power_up_down_error
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: constants.anotherUser,
          },
          {
            ariaLabel: alInput.amount,
            event: EventType.TYPE,
            text: '10000000',
          },
          {
            ariaLabel: alButton.operation.transfer.send,
            event: EventType.CLICK,
          },
        ]);
        await assertion.awaitFor(keyMessage.insufficient, QueryDOM.BYTEXT);
      });
      it('Must show error if no frequency', async () => {
        //popup_html_transfer_recurrent_missing_field
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: constants.anotherUser,
          },
          {
            ariaLabel: alInput.amount,
            event: EventType.TYPE,
            text: '10',
          },
          {
            ariaLabel: alCheckbox.transfer.recurrent,
            event: EventType.CLICK,
          },
          {
            ariaLabel: alButton.operation.transfer.send,
            event: EventType.CLICK,
          },
        ]);
        await assertion.awaitFor(keyMessage.recurrentFields, QueryDOM.BYTEXT);
      });
      it('Must show error if no iteration', async () => {
        //popup_html_transfer_recurrent_missing_field
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: constants.anotherUser,
          },
          {
            ariaLabel: alInput.amount,
            event: EventType.TYPE,
            text: '10',
          },
          {
            ariaLabel: alCheckbox.transfer.recurrent,
            event: EventType.CLICK,
          },
          {
            ariaLabel: alInput.recurrent.frecuency,
            event: EventType.TYPE,
            text: '10',
          },
          {
            ariaLabel: alButton.operation.transfer.send,
            event: EventType.CLICK,
          },
        ]);
        await assertion.awaitFor(keyMessage.recurrentFields, QueryDOM.BYTEXT);
      });
      it.skip('Must show error if frequency as zero', async () => {
        //popup_html_transfer_recurrent_missing_field
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: constants.anotherUser,
          },
          {
            ariaLabel: alInput.amount,
            event: EventType.TYPE,
            text: '10',
          },
          {
            ariaLabel: alCheckbox.transfer.recurrent,
            event: EventType.CLICK,
          },
          {
            ariaLabel: alInput.recurrent.frecuency,
            event: EventType.TYPE,
            text: '0',
          },
          {
            ariaLabel: alInput.recurrent.iterations,
            event: EventType.TYPE,
            text: '10',
          },
          {
            ariaLabel: alButton.operation.transfer.send,
            event: EventType.CLICK,
          },
        ]);
        await assertion.awaitFor(keyMessage.recurrentFields, QueryDOM.BYTEXT);
      });
      it.skip('Must show error if iteration as zero', async () => {
        //popup_html_transfer_recurrent_missing_field
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: constants.anotherUser,
          },
          {
            ariaLabel: alInput.amount,
            event: EventType.TYPE,
            text: '10',
          },
          {
            ariaLabel: alCheckbox.transfer.recurrent,
            event: EventType.CLICK,
          },
          {
            ariaLabel: alInput.recurrent.frecuency,
            event: EventType.TYPE,
            text: '10',
          },
          {
            ariaLabel: alInput.recurrent.iterations,
            event: EventType.TYPE,
            text: '0',
          },
          {
            ariaLabel: alButton.operation.transfer.send,
            event: EventType.CLICK,
          },
          {
            ariaLabel: alButton.dialog.confirm,
            event: EventType.CLICK,
          },
        ]);
        await assertion.awaitFor(keyMessage.recurrentFields, QueryDOM.BYTEXT);
      });
      it('Must show warningMessage if exchange do not accepts HIVE', async () => {
        //check in deep to see if more cases are needed.
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: constants.exchange.notAccepting.hive,
          },
          {
            ariaLabel: alInput.amount,
            event: EventType.TYPE,
            text: '10',
          },
          //   {
          //     ariaLabel: alInput.memoOptional,
          //     event: EventType.TYPE,
          //     text: constants.memoMessage.nonEncrypted,
          //   },
          {
            ariaLabel: alButton.operation.transfer.send,
            event: EventType.CLICK,
          },
        ]);
        assertion.toHaveTextContent([
          {
            arialabel: alDiv.warning.message,
            text: keyMessage.exchangeWarning(currency),
          },
        ]);
      });
      it('Must show memo warning when transferring to exchange account', async () => {
        //check in deep to see if more cases are needed.
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: constants.exchange.accepting.hive,
          },
          {
            ariaLabel: alInput.amount,
            event: EventType.TYPE,
            text: '10',
          },
          //   {
          //     ariaLabel: alInput.memoOptional,
          //     event: EventType.TYPE,
          //     text: constants.memoMessage.nonEncrypted,
          //   },
          {
            ariaLabel: alButton.operation.transfer.send,
            event: EventType.CLICK,
          },
        ]);
        assertion.toHaveTextContent([
          {
            arialabel: alDiv.warning.message,
            text: keyMessage.memoWarning,
          },
        ]);
      });
      it('Must show phishing warning', async () => {
        //popup_warning_phishing
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: constants.phishingAccount,
          },
          {
            ariaLabel: alInput.amount,
            event: EventType.TYPE,
            text: '10',
          },
          //   {
          //     ariaLabel: alInput.memoOptional,
          //     event: EventType.TYPE,
          //     text: constants.memoMessage.nonEncrypted,
          //   },
          {
            ariaLabel: alButton.operation.transfer.send,
            event: EventType.CLICK,
          },
        ]);
        assertion.toHaveTextContent([
          {
            arialabel: alDiv.warning.message,
            text: keyMessage.warningPhising(constants.phishingAccount),
          },
        ]);
      });
      it('Must load confimation page on recurrent cancelation', async () => {
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: constants.anotherUser,
          },
          {
            ariaLabel: alInput.amount,
            event: EventType.TYPE,
            text: '0',
          },
          {
            ariaLabel: alCheckbox.transfer.recurrent,
            event: EventType.CLICK,
          },
          {
            ariaLabel: alButton.operation.transfer.send,
            event: EventType.CLICK,
          },
        ]);
        await assertion.awaitFor(keyMessage.confirmRecurrent, QueryDOM.BYTEXT);
      });
      it('Must show confirmation page on transfer', async () => {
        // text to find: popup_html_transfer_confirm_text
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: constants.anotherUser,
          },
          {
            ariaLabel: alInput.amount,
            event: EventType.TYPE,
            text: '10',
          },
          {
            ariaLabel: alButton.operation.transfer.send,
            event: EventType.CLICK,
          },
        ]);
        await waitFor(() => {
          screen.getByText(keyMessage.confirmTransfer, { exact: false });
        });
      });
      it('Must return to transfer page after clicking cancel confirmation', async () => {
        // text to find: popup_html_transfer_confirm_text
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: constants.anotherUser,
          },
          {
            ariaLabel: alInput.amount,
            event: EventType.TYPE,
            text: '10',
          },
          {
            ariaLabel: alButton.operation.transfer.send,
            event: EventType.CLICK,
          },
        ]);
        await waitFor(() => {
          screen.getByText(keyMessage.confirmTransfer, { exact: false });
        });
        await clickAwait([alButton.dialog.cancel]);
        await assertion.awaitFor(
          alComponent.transfersFundsPage,
          QueryDOM.BYLABEL,
        );
      });
      it('Must encode memo', async () => {
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: constants.anotherUser,
          },
          {
            ariaLabel: alInput.amount,
            event: EventType.TYPE,
            text: '10',
          },
          {
            ariaLabel: alInput.memoOptional,
            event: EventType.TYPE,
            text: constants.memoMessage.toEncrypt,
          },
          {
            ariaLabel: alButton.operation.transfer.send,
            event: EventType.CLICK,
          },
        ]);
        await assertion.awaitFor(
          constants.memoMessage.encryptedLabel,
          QueryDOM.BYTEXT,
        );
      });
      it('Must show success message on transfer', async () => {
        //popup_html_transfer_successful
        extraMocks.transfer(true);
        await clickTypeAwait([
          {
            ariaLabel: alInput.username,
            event: EventType.TYPE,
            text: constants.anotherUser,
          },
          {
            ariaLabel: alInput.amount,
            event: EventType.TYPE,
            text: '10',
          },
          {
            ariaLabel: alInput.memoOptional,
            event: EventType.TYPE,
            text: constants.memoMessage.toEncrypt,
          },
          {
            ariaLabel: alButton.operation.transfer.send,
            event: EventType.CLICK,
          },
          {
            ariaLabel: alButton.dialog.confirm,
            event: EventType.CLICK,
          },
        ]);
        await assertion.awaitFor(
          constants.keyMessage.successTransfer(
            constants.anotherUser,
            `10.000 ${currency}`,
          ),
          QueryDOM.BYTEXT,
        );
      });
      it.todo('Must show success message on cancel recurrent'); //popup_html_cancel_transfer_recurrent_successful
      it.todo('Must show success message on recurrent'); //popup_html_transfer_recurrent_successful
      //  maybe on the next, make a common failed but using:
      //  - transfer
      //  - recurrent
      //  - cancellation recurrent
      it.todo('Must show error when failed transaction'); //popup_html_transfer_failed
    });
    describe('without an specific key\n:', () => {
      //TODO add an extraMock to remove(key) from initial state.
      it.todo('Must show error if no active key');
      it.todo('Must show error if no memo key');
    });
  });
  //TODO all both blocks for HIVE & HBD.
  describe('HBD', () => {});
});
