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
      "Message signed succesfully",
      "Could not sign"
    );
  }
};
