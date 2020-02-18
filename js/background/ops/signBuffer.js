const signBuffer = data => {
  let message = null;
  let signed = null;
  let error = null;
  try {
    signed = window.signBuffer(data.message, key);
  } catch (err) {
    error = err;
  } finally {
    return createMessage(
      error,
      signed,
      data,
      chrome.i18n.getMessage("bgd_ops_sign_success"),
      chrome.i18n.getMessage("bgd_ops_sign_error")
    );
  }
};
