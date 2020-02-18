const broadcastCustomJson = data => {
  return new Promise((resolve, reject) => {
    steem.broadcast.customJson(
      key,
      data.method.toLowerCase() == "active" ? [data.username] : null,
      data.method.toLowerCase() == "posting" ? [data.username] : null,
      data.id,
      data.json,
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
