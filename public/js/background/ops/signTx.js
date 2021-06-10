const signTx = data => {
  return new Promise((resolve, reject) => {
    let result = null,
      err = null;

    try {
      result = hive.auth.signTransaction(data.tx, [key]);
    } catch (e) {
      err = e;
    }

    console.log(result, err);
    const err_message = beautifyErrorMessage(err);

    const message = createMessage(
      err,
      result,
      data,
      chrome.i18n.getMessage("bgd_ops_sign_tx"),
      err_message
    );
    resolve(message);
  });
};
