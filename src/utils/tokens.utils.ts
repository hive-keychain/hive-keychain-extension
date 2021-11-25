import { hsc } from '@api/hiveEngine';

const tryConfirmTransaction = (trxId: string) => {
  let result: any;
  return new Promise(async function (fulfill, reject) {
    for (let i = 0; i < 20; i++) {
      result = await getDelayedTransactionInfo(trxId);
      if (result != null) break;
    }

    var error = null;
    if (result && result.logs) {
      var logs = JSON.parse(result.logs);

      if (logs.errors && logs.errors.length > 0) error = logs.errors[0];
    }

    fulfill({ confirmed: result != null, error: error });
  });
};

const getDelayedTransactionInfo = (trxID: string) => {
  return new Promise(function (fulfill, reject) {
    setTimeout(async function () {
      fulfill(hsc.getTransactionInfo(trxID));
    }, 1000);
  });
};

const TokensUtils = { tryConfirmTransaction };

export default TokensUtils;
