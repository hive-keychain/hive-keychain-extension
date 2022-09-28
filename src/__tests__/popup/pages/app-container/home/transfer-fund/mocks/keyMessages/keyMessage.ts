import { KeyMessage } from 'src/__tests__/utils-for-testing/enums/enums';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const i18n = {
  get: (message: string, options?: string[]) =>
    mocksImplementation.i18nGetMessageCustom(message, options),
};

const extraConstants = {
  fields: i18n.get(KeyMessage.MISSING_FIELDS),
  negative: i18n.get(KeyMessage.NEGATIVE_AMOUNT),
  insufficient: i18n.get(KeyMessage.NOT_ENOUGH_BALANCE),
  recurrentFields: i18n.get(KeyMessage.RECURRENT_MISSING_FIELDS),
  successRecurrent: (options: string[]) =>
    i18n.get(KeyMessage.SUCCESS_RECURRENT, options),
  successCancelRecurrent: (options: string[]) =>
    i18n.get(KeyMessage.SUCCESS_CANCEL_RECURRENT, options),
  warningPhising: (receiverUsername: string) =>
    i18n.get(KeyMessage.WARNING_PHISHING, [receiverUsername]),
  confirmRecurrent: i18n.get(KeyMessage.CONFIRM_RECURRENT).replace('<br>', ''),
  confirmTransfer: i18n.get(KeyMessage.CONFIRM_TRANSFER).split('<br>')[0],
  failTransfer: i18n.get(KeyMessage.FAILED_TRANSFER),
  exchangeWarning: (currency: string) =>
    i18n.get(KeyMessage.EXCHANGE_WARNING, [currency]),
  memoWarning: i18n.get(KeyMessage.EXCHANGE_MEMO),
  warningRecurrent: i18n.get(KeyMessage.EXCHANGE_WARNING_RECURRENT),
  successTransfer: (options: string[]) =>
    i18n.get(KeyMessage.SUCCESS_TRANSFER, options),
  missingKey: (requiredKey: string) =>
    i18n.get(KeyMessage.MISSING_KEY, [requiredKey]),
  missingMemoKey: (requiredKey: string) =>
    i18n.get(KeyMessage.MEMO_MISSING, [requiredKey]),
};

export default { extraConstants };
