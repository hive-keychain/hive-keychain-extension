const broadcastTransfer = data => {
  return new Promise(async (resolve, reject) => {
    let ac = accountsList.get(data.username);
    let memo = data.memo || "";
    let key_transfer = ac.getKey("active");
    if (data.memo && data.memo.length > 0 && data.memo[0] == "#") {
      try {
        const receiver = await steem.api.getAccountsAsync([data.to]);
        const memoReceiver = receiver["0"].memo_key;
        memo = window.encodeMemo(ac.keys.memo, memoReceiver, memo);
      } catch (e) {
        console.log(e);
      }
    }
    steem.broadcast.transfer(
      key_transfer,
      data.username,
      data.to,
      data.amount + " " + data.currency,
      memo,
      (err, result) => {
        console.log(result, err);
        let err_message = "";
        if (err) {
          console.log(err.data.stack[0].context.method);
          switch (err.data.stack[0].context.method) {
            case "adjust_balance":
              err_message = `Insufficient ${data.currency} balance on account @${data.username}.`;
              break;
            case "get_account":
              err_message = `Cannot find account @${data.to}.`;
              break;
            default:
              err_message =
                "There was an error broadcasting this transaction, please try again.";
              break;
          }
        }
        const message = createMessage(
          err,
          result,
          data,
          `Successfully transfered ${data.amount} ${data.currency} from @${data.username} to @${data.to}.`,
          err_message
        );
        resolve(message);
      }
    );
  });
};
