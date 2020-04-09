const broadcastData = data => {
  return new Promise((resolve, reject) => {
    const operations = data.operations;
    const broadcastKeys = {};
    broadcastKeys[data.typeWif] = key;
    
    // check if operations contains any transfer wich requires memo encryption
    for(op of operations) {
      if(op[0]=="transfer") {
        const memo = op[1].memo
        if (memo && memo.length > 0 && memo[0] == "#") {
          try {
            const receiver = await steem.api.getAccountsAsync([op[1].to]);
            const memoReceiver = receiver[0].memo_key;
            op[1].memo = window.encodeMemo(ac.getKey("memo"), memoReceiver, memo);
          } catch (e) {
            console.log(e);
          }
        }
      }
    }    
    
    steem.broadcast.send(
      {
        operations,
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
  });
};
