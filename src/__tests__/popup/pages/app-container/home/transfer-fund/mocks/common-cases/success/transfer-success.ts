import transferFund from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/transfer-fund';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import {
  EventType,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import { clickTypeAwait } from 'src/__tests__/utils-for-testing/setups/events';
const { constants, extraMocks } = transferFund;
const run = async (currency: string) => {
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
    constants.keyMessage.successTransfer([
      `@${constants.anotherUser}`,
      `10.000 ${currency}`,
    ]),
    QueryDOM.BYTEXT,
  );
};

export default { run };
