import tokensTransfer from 'src/__tests__/popup/pages/app-container/home/tokens/tokens-transfer/mocks/tokens-transfer';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
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
const { methods, constants, extraMocks } = tokensTransfer;
const { snapshotName, messages, selectedToken } = constants;
let _asFragment: () => {};
describe('tokens-transfer.component tests:\n', () => {
  methods.afterEach;
  describe('Snapshot cases', () => {
    beforeEach(async () => {
      _asFragment = await tokensTransfer.beforeEach();
    });
    it('Must show tokens balances with send icon', () => {
      expect(_asFragment()).toMatchSnapshot(
        snapshotName.tokens.with.transferIcons,
      );
    });
  });
  describe('With tokens balances', () => {
    beforeEach(async () => {
      await tokensTransfer.beforeEach();
      await clickAwait([alIcon.tokens.prefix.send + 'LEO']);
    });
    it('Must show error message if empty receiverUsername', async () => {
      await clickAwait([alButton.operation.tokens.transfer.send]);
      await assertion.awaitFor(messages.missingField, QueryDOM.BYTEXT);
    });
    it('Must show error message if 0 as amount', async () => {
      await clickAwait([alButton.operation.tokens.transfer.send]);
      await clickTypeAwait([
        {
          ariaLabel: alInput.username,
          event: EventType.TYPE,
          text: 'theghost1980',
        },
        {
          ariaLabel: alButton.operation.tokens.transfer.send,
          event: EventType.CLICK,
        },
      ]);
      await assertion.awaitFor(messages.missingField, QueryDOM.BYTEXT);
    });
    it('Must show error if negative amount', async () => {
      await clickAwait([alButton.operation.tokens.transfer.send]);
      await clickTypeAwait([
        {
          ariaLabel: alInput.username,
          event: EventType.TYPE,
          text: 'theghost1980',
        },
        {
          ariaLabel: alInput.amount,
          event: EventType.TYPE,
          text: '-1',
        },
        {
          ariaLabel: alButton.operation.tokens.transfer.send,
          event: EventType.CLICK,
        },
      ]);
      await assertion.awaitFor(messages.negativeAmount, QueryDOM.BYTEXT);
    });
    it('Must show error if unexistent user', async () => {
      extraMocks.doesAccountExist(false);
      await clickAwait([alButton.operation.tokens.transfer.send]);
      await clickTypeAwait([
        {
          ariaLabel: alInput.username,
          event: EventType.TYPE,
          text: 'theghost1980',
        },
        {
          ariaLabel: alInput.amount,
          event: EventType.TYPE,
          text: '1',
        },
        {
          ariaLabel: alButton.operation.tokens.transfer.send,
          event: EventType.CLICK,
        },
      ]);
      await assertion.awaitFor(messages.wrongUser, QueryDOM.BYTEXT);
    });
    it('Must show error if not enough balance', async () => {
      await clickAwait([alButton.operation.tokens.transfer.send]);
      await clickTypeAwait([
        {
          ariaLabel: alInput.username,
          event: EventType.TYPE,
          text: 'theghost1980',
        },
        {
          ariaLabel: alInput.amount,
          event: EventType.TYPE,
          text: (parseFloat(selectedToken.data.balance) + 1).toString(),
        },
        {
          ariaLabel: alButton.operation.tokens.transfer.send,
          event: EventType.CLICK,
        },
      ]);
      await assertion.awaitFor(messages.notEnoughBalance, QueryDOM.BYTEXT);
    });
    it.skip('Must show confirmation page and encrypted memo', async () => {
      //TODO check why the fill in teh fields is showing???
      extraMocks.doesAccountExist(true);
      extraMocks.getPublicMemo();
      await clickAwait([alButton.operation.tokens.transfer.send]);
      await clickTypeAwait([
        {
          ariaLabel: alInput.username,
          event: EventType.TYPE,
          text: 'cedricguillas',
        },
        {
          ariaLabel: alInput.amount,
          event: EventType.TYPE,
          text: '1',
        },
        {
          ariaLabel: alButton.operation.tokens.transfer.send,
          event: EventType.CLICK,
        },
      ]);
      await assertion.awaitFor(
        alComponent.confirmationPage + '0',
        QueryDOM.BYLABEL,
      );
    });
    it.todo('Must go back when cancelling transfer');
    it.todo('Must show popup_warning_phishing');
  });
  describe('No tokens balances', () => {});
  describe('No Active Key', () => {});
  describe('No Memo Key', () => {
    it.todo('Must show exhange validation warning');
  });
});
