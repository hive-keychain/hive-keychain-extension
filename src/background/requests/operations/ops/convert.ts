import LedgerModule from '@background/ledger.module';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import { RequestConvert, RequestId } from '@interfaces/keychain.interface';
import { PrivateKeyType, TransactionOptions } from '@interfaces/keys.interface';
import { KeychainError } from 'src/keychain-error';
import { ConversionType } from 'src/popup/hive/pages/app-container/home/conversion/conversion-type.enum';
import { ConversionUtils } from 'src/popup/hive/utils/conversion.utils';
import CurrencyUtils, {
  BaseCurrencies,
} from 'src/popup/hive/utils/currency.utils';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import Logger from 'src/utils/logger.utils';

export const convert = async (
  requestHandler: RequestsHandler,
  data: RequestConvert & RequestId,
  options?: TransactionOptions,
) => {
  let result, err, err_message;
  const { username, amount, collaterized } = data;
  const key = requestHandler.data.key;
  const rpc = requestHandler.data.rpc;
  const requestId = await getNextRequestID(username);
  const conversionType = collaterized
    ? ConversionType.CONVERT_HIVE_TO_HBD
    : ConversionType.CONVERT_HBD_TO_HIVE;
  const currency = collaterized ? BaseCurrencies.HIVE : BaseCurrencies.HBD;
  const amountS = `${amount} ${CurrencyUtils.getCurrencyLabel(
    currency,
    rpc!.testnet,
  )}`;
  const successMessage = collaterized
    ? 'bgd_ops_convert_collaterized'
    : 'bgd_ops_convert';

  try {
    switch (KeysUtils.getKeyType(key!)) {
      case PrivateKeyType.LEDGER: {
        const tx = await ConversionUtils.getConvertTransaction(
          username,
          requestId,
          amountS,
          conversionType,
        );
        LedgerModule.signTransactionFromLedger({
          transaction: tx,
          key: key!,
        });
        const signature = await LedgerModule.getSignatureFromLedger();
        result = await HiveTxUtils.broadcastAndConfirmTransactionWithSignature(
          tx,
          signature,
        );
        break;
      }
      default: {
        result = await ConversionUtils.sendConvert(
          username,
          requestId,
          amountS,
          conversionType,
          key!,
          options,
        );
        break;
      }
    }
  } catch (e: any) {
    Logger.error(e);
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    const message = await createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage(successMessage, [amount, username]),
      err_message,
    );
    return message;
  }
};

// export const convert = async (
//   requestHandler: RequestsHandler,
//   data: RequestConvert & RequestId,
// ) => {
//   const { username, amount, collaterized } = data;
//   const key = requestHandler.data.key;
//   const rpc = requestHandler.data.rpc;
//   const requestId = await getNextRequestID(username);
//   let result, err, err_message;
//   if (collaterized) {
//     try {
//       const amountS = `${amount} ${CurrencyUtils.getCurrencyLabel(
//         'HBD',
//         rpc!.testnet,
//       )}`;
//       result = await ConversionUtils.sendConvert(
//         username,
//         requestId,
//         amountS,
//         ConversionType.CONVERT_HIVE_TO_HBD,
//         key!,
//       );
//     } catch (e) {
//       Logger.error(e);
//       err = (e as KeychainError).trace || e;
//       err_message = await chrome.i18n.getMessage(
//         (e as KeychainError).message,
//         (e as KeychainError).messageParams,
//       );
//     } finally {
//       const message = createMessage(
//         err,
//         result,
//         data,
//         await chrome.i18n.getMessage('bgd_ops_convert_collaterized', [
//           amount,
//           username,
//         ]),
//         err_message,
//       );
//       return message;
//     }
//   } else {
//     try {
//       const amountS = `${amount} ${CurrencyUtils.getCurrencyLabel(
//         'HBD',
//         rpc!.testnet,
//       )}`;
//       result = await ConversionUtils.sendConvert(
//         username,
//         requestId,
//         amountS,
//         ConversionType.CONVERT_HBD_TO_HIVE,
//         key!,
//       );
//     } catch (e) {
//       Logger.error(e);
//       err = (e as KeychainError).trace || e;
//       err_message = await chrome.i18n.getMessage(
//         (e as KeychainError).message,
//         (e as KeychainError).messageParams,
//       );
//     } finally {
//       const message = createMessage(
//         err,
//         result,
//         data,
//         await chrome.i18n.getMessage('bgd_ops_convert', [amount, username]),
//         err_message,
//       );
//       return message;
//     }
//   }
// };

const getNextRequestID = async (username: string) => {
  let conversions = await ConversionUtils.getConversionRequests(username);

  return Math.max(...conversions.map((conv) => conv.requestid), 0) + 1;
};
