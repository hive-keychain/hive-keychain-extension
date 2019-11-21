const broadcastTransfer = data => {
  return new Promise(async (resolve, reject) => {
    let ac = accounts.list.find(function(e) {
      return e.name == data.username;
    });
    let memo = data.memo || "";
    let key_transfer = ac.keys.active;
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
        const message = createMessage(
          err,
          result,
          data,
          "The transaction has been broadcasted successfully.",
          "There was an error broadcasting this transaction, please try again."
        );
        resolve(message);
      }
    );
  });
};
