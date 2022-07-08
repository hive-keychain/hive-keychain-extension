import { screen, waitFor } from '@testing-library/react';
import transferFund from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/transfer-fund';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import {
  EventType,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import {
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
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
      ariaLabel: alButton.operation.transfer.send,
      event: EventType.CLICK,
    },
  ]);
  await waitFor(() => {
    screen.getByText(keyMessage.confirmTransfer, { exact: false });
  });
  await clickAwait([alButton.dialog.cancel]);
  await assertion.awaitFor(alComponent.transfersFundsPage, QueryDOM.BYLABEL);
};

export default { run };
