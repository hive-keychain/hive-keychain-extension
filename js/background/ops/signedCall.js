const broadcastSignedCall = data => {
  return new Promise((resolve, reject) => {
    window.signedCall(
      data.method,
      data.params,
      data.username,
      key,
      (err, result) => {
        console.log(result, err);
        const err_message = beautifyErrorMessage(err);
        const message = createMessage(
          err,
          result,
          data,
          chrome.i18n.getMessage("bgd_ops_signed_call"),
          err_message
        );
        resolve(message);
      }
    );
  });
};
