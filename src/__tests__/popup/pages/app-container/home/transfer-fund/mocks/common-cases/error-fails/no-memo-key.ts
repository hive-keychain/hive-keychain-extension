import transferFund from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/transfer-fund';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alCheckbox from 'src/__tests__/utils-for-testing/aria-labels/al-checkbox';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import {
  EventType,
  KeyToUse,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import { clickTypeAwait } from 'src/__tests__/utils-for-testing/setups/events';
const { constants } = transferFund;
const run = async () => {
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
      ariaLabel: alInput.memoOptional,
      event: EventType.TYPE,
      text: constants.memoMessage.toEncrypt,
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
  await assertion.awaitFor(
    constants.keyMessage.missingMemoKey(KeyToUse.MEMO),
    QueryDOM.BYTEXT,
  );
};

export default { run };
