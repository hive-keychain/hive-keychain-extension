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
          "The transaction has been broadcasted successfully.",
          err_message
        );
        resolve(message);
      }
    );
  });
};
