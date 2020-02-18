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
      "Memo decoded succesfully",
      "Could not verify key."
    );
  }
};
