const broadcastData = data => {
  return new Promise((resolve, reject) => {
    const operations = JSON.parse(data.operations);
    const broadcastKeys = {};
    broadcastKeys[data.typeWif] = key;
    let account = accountsList.get(data.username);

    // check if operations contains any transfer wich requires memo encryption
    try {
      operations.map(async op => {
        if (op[0] == "transfer") {
          const memo = op[1].memo;
          if (memo && memo.length > 0 && memo[0] == "#") {
            const receiver = await steem.api.getAccountsAsync([op[1].to]);
            console.log("receiver", receiver);
            const memoReceiver = receiver[0].memo_key;
            console.log("memoReceiver", memoReceiver);
            op[1].memo = window.encodeMemo(
              account.getKey("memo"),
              memoReceiver,
              memo
            );
            console.log(op[1].memo);
            return op;
          }
        }
      });
      console.log(operations);

      steem.broadcast.send(
        {
          operations: operations,
          extensions: []
        },
        broadcastKeys,
        (err, result) => {
          console.log(result, err);
          const err_message = beautifyErrorMessage(err);

          const message = createMessage(
            err,
            result,
            data,
            chrome.i18n.getMessage("bgd_ops_broadcast"),
            err_message
          );
          resolve(message);
        }
      );
    } catch (e) {
      const message = createMessage(
        true,
        null,
        data,
        null,
        "Could not encode transfer."
      );
      resolve(message);
    }
  });
};
