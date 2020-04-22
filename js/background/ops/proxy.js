const broadcastProxy = data => {
  return new Promise((resolve, reject) => {
    const ac = accountsList.get(data.username);
    const key_proxy = ac.getKey("active");
    steem.broadcast.accountWitnessProxy(
      key_proxy,
      data.username,
      data.proxy,
      (err, result) => {
        console.log(result, err);
        const err_message = beautifyErrorMessage(err);
        const message = createMessage(
          err,
          result,
          data,
          data.proxy.length
            ? chrome.i18n.getMessage("popup_success_proxy", [data.proxy])
            : chrome.i18n.getMessage("bgd_ops_unproxy"),
          err_message
        );
        resolve(message);
      }
    );
  });
};
