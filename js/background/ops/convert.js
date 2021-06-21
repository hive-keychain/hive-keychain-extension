const convert = async (data) => {
  const { username, amount, collaterized } = data;
  let request_id = await getNextRequestID(username);
  const isTestnet = (await rpc.initList()).find(
    (e) => e.uri === rpc.currentRpc
  ).testnet;
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
const getNextRequestID = async (username) => {
  const conversions = await hive.api.getConversionRequestsAsync(username);
  console.log(conversions);
  let collateralized_conversions = [];
  try {
    collateralized_conversions =
      (await hive.api.callAsync(
        "condenser_api.get_collateralized_conversion_requests",
        [username]
      )) | [];
  } catch (e) {
    console.log(e);
  }
  const conv = [...conversions, ...collateralized_conversions];

  return Math.max(...conv.map((e) => e.requestid), 0) + 1;
};
