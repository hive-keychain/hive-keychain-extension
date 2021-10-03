const recurrentTransfer = (data) => {
  return new Promise((resolve) => {
    const { username, to, amount, currency, recurrence, executions, memo } =
      data;
    const ac = accountsList.get(username);
    const key_rec = ac.getKey("active");
    hive.broadcast.recurrentTransfer(
      key_rec,
      username,
      to,
      `${amount} ${currency}`,
      memo || "",
      recurrence,
      executions,
      [],
      (err, result) => {
        console.log(result, err);
        const err_message = beautifyErrorMessage(err);
        const message = createMessage(
          err,
          result,
          data,
          parseFloat(amount) === 0
            ? chrome.i18n.getMessage("bgd_ops_stop_recurrent_transfer")
            : chrome.i18n.getMessage("bgd_ops_recurrent_transfer"),
          err_message
        );
        resolve(message);
      }
    );
  });
};
