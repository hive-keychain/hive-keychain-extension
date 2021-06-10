const signBuffer = data => {
  let message = null;
  let signed = null;
  let error = null;
  try {
    const ac = accountsList.get(data.username);
    public = ac.getKey(`${data.method.toLowerCase()}Pubkey`);
    const key_buffer = ac.getKey(data.method.toLowerCase());
    signed = window.signBuffer(data.message, key_buffer);
  } catch (err) {
    error = err;
  } finally {
    return createMessage(
      error,
      signed,
      data,
      chrome.i18n.getMessage("bgd_ops_sign_success"),
      chrome.i18n.getMessage("bgd_ops_sign_error"),
      public
    );
  }
};
