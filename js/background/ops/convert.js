const convert = async (data) => {
  const { username, amount, collaterized } = data;
  let request_id = await getNextRequestID(username);
  console.log(request_id);
  const isTestnet = (await rpc.initList()).find(
    (e) => e.uri === rpc.currentRpc
  ).testnet;
  console.log(isTestnet);
  return new Promise((resolve) => {
    if (collaterized) {
      hive.broadcast.collateralizedConvert(
        key,
        username,
        request_id,
        `${amount} ${isTestnet ? "TESTS" : "HIVE"}`,
        (err, result) => {
          const err_message = beautifyErrorMessage(err);
          const message = createMessage(
            err,
            result,
            data,
            chrome.i18n.getMessage("bgd_ops_convert_collaterized", [
              amount,
              username,
            ]),
            err_message
          );
          resolve(message);
        }
      );
    } else {
      hive.broadcast.convert(
        key,
        username,
        request_id,
        `${amount} ${isTestnet ? "TBD" : "HBD"}`,
        (err, result) => {
          const err_message = beautifyErrorMessage(err);
          const message = createMessage(
            err,
            result,
            data,
            chrome.i18n.getMessage("bgd_ops_convert", [amount, username]),
            err_message
          );
          console.log(message);
          resolve(message);
        }
      );
    }
  });
};

// TODO: put in utils, use from both front and bgd
// TODO: getConversionRequest does not give back collaterized convs at the moment
const getNextRequestID = async (username) => {
  const conversions = await hive.api.getConversionRequestsAsync(username);
  console.log(conversions);
  return Math.max(...conversions.map((e) => e.requestid), 0) + 1;
};
