const encodeMessage = async data => {
  let message = null;
  let encoded = null;
  let error = null;
  try {
    const receiver = (await hive.api.getAccountsAsync([data.receiver]))[0];
    let publicKey;
    if (data.method === "Memo") {
      publicKey = receiver.memo_key;
    } else {
      publicKey = receiver.posting.key_auths[0][0];
    }

    encoded = window.encodeMemo(key, publicKey, data.message);
  } catch (err) {
    error = err;
  } finally {
    return createMessage(
      error,
      encoded,
      data,
      chrome.i18n.getMessage("bgd_ops_encode"),
      chrome.i18n.getMessage("bgd_ops_encode_err")
    );
  }
};
