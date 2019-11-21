const broadcastSignedCall = data => {
  return new Promise((resolve, reject) => {
    window.signedCall(
      data.method,
      data.params,
      data.username,
      key,
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
