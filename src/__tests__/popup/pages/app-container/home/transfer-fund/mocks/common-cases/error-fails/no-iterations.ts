import transferFund from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/transfer-fund';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alCheckbox from 'src/__tests__/utils-for-testing/aria-labels/al-checkbox';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import {
  EventType,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import { clickTypeAwait } from 'src/__tests__/utils-for-testing/setups/events';
const { constants } = transferFund;
const { keyMessage } = constants;
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
};

export default { run };
