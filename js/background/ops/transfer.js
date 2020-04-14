const broadcastTransfer = data => {
  return new Promise(async (resolve, reject) => {
    let ac = accountsList.get(data.username);
    let memo = data.memo || "";
    let key_transfer = ac.getKey("active");
    if (data.memo && data.memo.length > 0 && data.memo[0] == "#") {
      try {
        const receiver = await steem.api.getAccountsAsync([data.to]);
        if (!receiver) {
           throw new Error("Failed to load receiver memo key");
        }        
        const memoReceiver = receiver[0].memo_key;
        memo = window.encodeMemo(ac.getKey("memo"), memoReceiver, memo);
      } catch (e) {
        console.log(e);
        const message = createMessage(
          true,
          null,
          data,
          null,
          "Could not encode transfer."
        );
        resolve(message);
        return;
      }
    }
    steem.broadcast.transfer(
      key_transfer,
      data.username,
      data.to,
      data.amount +
        " " +
        data.currency.replace("HIVE", "STEEM").replace("HBD", "SBD"),
      memo,
      (err, result) => {
        console.log(result, err);
        let err_message = "";
        if (err) {
          console.log(err.data.stack[0].context.method);
          switch (err.data.stack[0].context.method) {
            case "adjust_balance":
              err_message = chrome.i18n.getMessage(
                "bgd_ops_transfer_adjust_balance",
                [data.currency]
              );
              break;
            case "get_account":
              err_message = chrome.i18n.getMessage(
                "bgd_ops_transfer_get_account",
                [data.to]
              );
              break;
            default:
              err_message = chrome.i18n.getMessage(
                "bgd_ops_error_broadcasting"
              );
              break;
          }
        }
        const message = createMessage(
          err,
          result,
          data,
          chrome.i18n.getMessage("bgd_ops_transfer_success", [
            data.amount,
            data.currency,
            data.username,
            data.to
          ]),
          err_message
        );
        resolve(message);
      }
    );
  });
};
