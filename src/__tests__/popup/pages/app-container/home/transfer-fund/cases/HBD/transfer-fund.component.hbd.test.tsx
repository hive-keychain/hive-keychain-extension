import App from '@popup/App';
import React from 'react';
import clickCancel from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/confirmation/click-cancel';
import recurrentCancellationConfirmation from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/confirmation/recurrent-cancellation-confirmation';
import transferBlankMemo from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/confirmation/transfer-blank-memo';
import emptyReceiverUsername from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/error-fails/empty-receiver-username';
import negativeAmount from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/error-fails/negative-amount';
import recurrentCancellationNoActiveKey from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/error-fails/no-active-key/recurrent-cancellation-no-active-key';
import recurrentNoActiveKey from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/error-fails/no-active-key/recurrent-no-active-key';
import transferNoActiveKey from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/error-fails/no-active-key/transfer-no-active-key';
import noAmount from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/error-fails/no-amount';
import noFrequency from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/error-fails/no-frequency';
import noIterations from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/error-fails/no-iterations';
import noMemoKey from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/error-fails/no-memo-key';
import noReceiverUsername from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/error-fails/no-receiver-username';
import notEnoughBalance from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/error-fails/not-enough-balance';
import recurrentCancellationFailed from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/error-fails/recurrent-cancellation-failed';
import recurrentFailed from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/error-fails/recurrent-failed';
import transactionFailed from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/error-fails/transaction-failed';
import assertBalance from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/success/assert-balance';
import encodeMemo from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/success/encode-memo';
import recurrentCancellationSuccess from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/success/recurrent-cancellation-success';
import recurrentSuccess from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/success/recurrent-success';
import transferSuccess from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/success/transfer-success';
import exchangeNeedsMemo from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/warnings/exchange-needs-memo';
import exchangeNotAccept from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/warnings/exchange-not-accept';
import phishing from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/common-cases/warnings/phishing';
import transferFund from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/transfer-fund';
import { KeyToUse } from 'src/__tests__/utils-for-testing/enums/enums';
import config from 'src/__tests__/utils-for-testing/setups/config';
config.byDefault();
describe('transfer-fund.component tests:\n', () => {
  const { methods } = transferFund;
  methods.afterEach;
  describe('HBD cases:\n', () => {
    const currency = 'HBD';
    describe('Having all keys:\n', () => {
      beforeEach(async () => {
        await transferFund.beforeEach(<App />, currency);
      });
      it('Must show transfer fund page and user data', () => {
        assertBalance.run(currency);
      });
      it('Must show error if no amount', async () => {
        await noAmount.run();
      });
      it('Must show error if no receiverUsername', async () => {
        await noReceiverUsername.run();
      });
      it('Must show error if empty receiverUsername', async () => {
        await emptyReceiverUsername.run();
      });
      it('Must show error if negative amount', async () => {
        await negativeAmount.run();
      });
      it('Must show error if not enough balance', async () => {
        await notEnoughBalance.run();
      });
      it('Must show error if no frequency', async () => {
        await noFrequency.run();
      });
      it('Must show error if no iteration', async () => {
        await noIterations.run();
      });
      it('Must show warningMessage if exchange do not accepts currency', async () => {
        await exchangeNotAccept.run(currency);
      });
      it('Must show memo warning when transferring to exchange account', async () => {
        await exchangeNeedsMemo.run();
      });
      it('Must show phishing warning', async () => {
        await phishing.run();
      });
      it('Must load confimation page on recurrent cancelation', async () => {
        await recurrentCancellationConfirmation.run();
      });
      it('Must show confirmation page on transfer with blank memo', async () => {
        await transferBlankMemo.run();
      });
      it('Must return to transfer page after clicking cancel confirmation', async () => {
        await clickCancel.run();
      });
      it('Must encode memo', async () => {
        await encodeMemo.run();
      });
      it('Must show success message on transfer', async () => {
        await transferSuccess.run(currency);
      });
      it('Must show success message on recurrent cancellation', async () => {
        await recurrentCancellationSuccess.run();
      });
      it('Must show success message on recurrent', async () => {
        await recurrentSuccess.run(currency);
      });
      it('Must show error when failed transaction', async () => {
        await transactionFailed.run();
      });
      it('Must show error on failed recurrent transfer', async () => {
        await recurrentFailed.run();
      });
      it('Must show error on failed recurrent cancellation', async () => {
        await recurrentCancellationFailed.run();
      });
    });
    describe('No memo Key:\n', () => {
      beforeEach(async () => {
        await transferFund.beforeEach(<App />, currency, {
          memoKey: KeyToUse.MEMO,
        });
      });
      it('Must show error if no memo key', async () => {
        await noMemoKey.run();
      });
    });
    describe('No Active key:\n', () => {
      beforeEach(async () => {
        await transferFund.beforeEach(<App />, currency, {
          activeKey: KeyToUse.ACTIVE,
        });
      });
      it('Must show error making a transfer', async () => {
        await transferNoActiveKey.run();
      });
      it('Must show error making a recurrent transfer', async () => {
        await recurrentNoActiveKey.run();
      });
      it('Must show error making a recurrent cancellation', async () => {
        await recurrentCancellationNoActiveKey.run();
      });
    });
  });
});
