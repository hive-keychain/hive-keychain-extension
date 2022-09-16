import AccountUtils from 'src/utils/account.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import {
  EventType,
  InputField,
} from 'src/__tests__/utils-for-testing/enums/enums';
import {
  actPendingTimers,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';

const extraMocks = {
  getAccount: () => {
    AccountUtils.getAccount = jest
      .fn()
      .mockResolvedValue(accounts.asArray.extended);
  },
};
/**
 * Using userdata one username as default
 */
const typeAndSubmit = async (privateKey: string) => {
  await clickTypeAwait([
    { ariaLabel: alButton.addByKeys, event: EventType.CLICK },
    {
      ariaLabel: alInput.username,
      event: EventType.TYPE,
      text: userData.one.username,
    },
    {
      ariaLabel: alInput.privateKey,
      event: EventType.TYPE,
      text: privateKey,
    },
    { ariaLabel: alButton.submit, event: EventType.CLICK },
  ]);
  await actPendingTimers();
};

const typeAndSubmitWEmpty = async (
  keyOrUsername: string,
  empty: InputField,
) => {
  let toClickNType = [
    { ariaLabel: alButton.addByKeys, event: EventType.CLICK },
    {
      ariaLabel: alInput.username,
      event: EventType.TYPE,
      text: keyOrUsername,
    },
    {
      ariaLabel: alInput.privateKey,
      event: EventType.TYPE,
      text: keyOrUsername,
    },
    { ariaLabel: alButton.submit, event: EventType.CLICK },
  ];
  if (empty) {
    if (empty === InputField.PRIVATEKEY) {
      toClickNType.splice(2, 1);
    } else if (empty === InputField.USERNAME) {
      toClickNType.splice(1, 1);
    }
  }
  await clickTypeAwait(toClickNType);
  await actPendingTimers();
};

export default { typeAndSubmit, typeAndSubmitWEmpty, extraMocks };
