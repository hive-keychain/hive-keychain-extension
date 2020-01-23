const decodeMessage = data => {
  let message = null;
  let decoded = null;
  let error = null;
  try {
    decoded = window.decodeMemo(key, data.message);
  } catch (err) {
    error = err;
  } finally {
    return createMessage(
      error,
      decoded,
      data,
      chrome.i18n.getMessage("bgd_ops_decode"),
      chrome.i18n.getMessage("bgd_ops_decode_err")
    );
  }
};
