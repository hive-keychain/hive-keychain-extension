import tokensTransfer from 'src/__tests__/popup/pages/app-container/home/tokens/tokens-transfer/mocks/tokens-transfer';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import {
  KeyToUse,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('tokens-transfer.component tests:\n', () => {
  const { methods, constants, extraMocks } = tokensTransfer;
  const { snapshotName, messages, selectedToken, memo } = constants;
  let _asFragment: () => {};
  methods.afterEach;
  describe('Snapshot cases:\n', () => {
    describe('Having balances:\n', () => {
      beforeEach(async () => {
        _asFragment = await tokensTransfer.beforeEach();
      });
      it('Must show tokens balances with send icon', () => {
        expect(_asFragment()).toMatchSnapshot(
          snapshotName.tokens.with.transferIcons,
        );
      });
    });
    describe('No tokens balances:\n', () => {
      beforeEach(async () => {
        _asFragment = await tokensTransfer.beforeEach({
          noTokensBalance: true,
        });
      });
      it('Must show no balances', () => {
        expect(_asFragment()).toMatchSnapshot(snapshotName.tokens.noBalances);
      });
    });
  });
  describe('With tokens balances:\n', () => {
    beforeEach(async () => {
      await tokensTransfer.beforeEach();
      await clickAwait([alIcon.tokens.prefix.send + 'LEO']);
    });
    it('Must show error message if empty receiverUsername', async () => {
      await clickAwait([alButton.operation.tokens.transfer.send]);
      await assertion.awaitFor(messages.missingField, QueryDOM.BYTEXT);
    });
    it('Must show error message if empty amount', async () => {
      await methods.userInteraction({
        receiverUsername: 'theghost1980',
        amount: '{space}',
      });
      await assertion.awaitFor(messages.missingField, QueryDOM.BYTEXT);
    });
    it('Must show error if negative amount', async () => {
      await methods.userInteraction({
        receiverUsername: 'theghost1980',
        amount: '-1',
      });
      await assertion.awaitFor(messages.negativeAmount, QueryDOM.BYTEXT);
    });
    it('Must show error if unexistent user', async () => {
      extraMocks.doesAccountExist(false);
      await methods.userInteraction({
        receiverUsername: 'theghost1980',
        amount: '1',
      });
      await assertion.awaitFor(messages.wrongUser, QueryDOM.BYTEXT);
    });
    it('Must show error if not enough balance', async () => {
      await methods.userInteraction({
        receiverUsername: 'theghost1980',
        amount: (parseFloat(selectedToken.data.balance) + 1).toString(),
      });
      await assertion.awaitFor(messages.notEnoughBalance, QueryDOM.BYTEXT);
    });
    it('Must show confirmation page and encrypted memo', async () => {
      extraMocks.doesAccountExist(true);
      extraMocks.getPublicMemo();
      await methods.userInteraction({
        receiverUsername: 'cedricguillas',
        amount: '1',
        hasMemo: true,
      });
      await assertion.awaitFor(alComponent.confirmationPage, QueryDOM.BYLABEL);
      assertion.getOneByText(memo.encrypted);
    });
    it('Must show popup_warning_phishing', async () => {
      extraMocks.doesAccountExist(true);
      extraMocks.getPublicMemo();
      await methods.userInteraction({
        receiverUsername: constants.phishingAccount,
        amount: '1',
        hasMemo: true,
      });
      await assertion.awaitFor(messages.phishingWarning, QueryDOM.BYTEXT);
    });
    it('Must show timeout if confirmation fails', async () => {
      extraMocks.doesAccountExist(true);
      extraMocks.getPublicMemo();
      extraMocks.sendCustomJson(true);
      extraMocks.tryConfirmTransaction({ confirmed: false, error: null });
      await methods.userInteraction({
        receiverUsername: 'theghost1980',
        amount: '1',
        hasMemo: true,
        confirm: true,
      });
      await assertion.awaitFor(messages.timeOut, QueryDOM.BYTEXT);
    });
    it('Must show error if transfer fails', async () => {
      extraMocks.doesAccountExist(true);
      extraMocks.getPublicMemo();
      extraMocks.sendCustomJson(undefined);
      await methods.userInteraction({
        receiverUsername: 'theghost1980',
        amount: '1',
        hasMemo: true,
        confirm: true,
      });
      await assertion.awaitFor(messages.failed, QueryDOM.BYTEXT);
    });
    it('Must send transfer', async () => {
      extraMocks.doesAccountExist(true);
      extraMocks.getPublicMemo();
      extraMocks.sendCustomJson(true);
      extraMocks.tryConfirmTransaction({ confirmed: true, error: null });
      await methods.userInteraction({
        receiverUsername: 'theghost1980',
        amount: '1',
        hasMemo: true,
        confirm: true,
      });
      await assertion.awaitFor(messages.success, QueryDOM.BYTEXT);
    });
  });
  describe('No Memo Key:\n', () => {
    beforeEach(async () => {
      await tokensTransfer.beforeEach({ noKey: KeyToUse.MEMO });
      await clickAwait([alIcon.tokens.prefix.send + 'LEO']);
    });
    it('Must error missing key', async () => {
      extraMocks.doesAccountExist(true);
      await methods.userInteraction({
        receiverUsername: 'theghost1980',
        amount: '1',
        hasMemo: true,
      });
      await assertion.awaitFor(messages.missingMemoKey, QueryDOM.BYTEXT);
    });
  });
  describe('No Active Key:\n', () => {
    beforeEach(async () => {
      await tokensTransfer.beforeEach({ noKey: KeyToUse.ACTIVE });
      await clickAwait([alIcon.tokens.prefix.send + 'LEO']);
    });
    it('Must show error trying to transfer', async () => {
      extraMocks.doesAccountExist(true);
      extraMocks.getPublicMemo();
      await methods.userInteraction({
        receiverUsername: 'theghost1980',
        amount: '1',
      });
      await assertion.awaitFor(messages.missingActiveKey, QueryDOM.BYTEXT);
    });
  });
});
