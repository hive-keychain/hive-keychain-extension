const broadcastData = data => {
  return new Promise((resolve, reject) => {
    const operations = data.operations;
    const broadcastKeys = {};
    broadcastKeys[data.typeWif] = key;
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
