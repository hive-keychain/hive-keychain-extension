let conversions = [];
let collateralized_conversions = [];
let nextRequestId = 0;

$("#convert_hbd").click(() => {
  $("#main").hide();
  $("#convert_div").show();
  getNextRequestID();
});

$("#convert_hive").click(() => {
  $("#main").hide();
  $("#convert_hive_div").show();
  getNextRequestID();
});

$("#amt_convert_max").click(async () => {
  $("#amt_convert").val(await activeAccount.getHBD());
});
$("#amt_convert_max_hive").click(async () => {
  $("#amt_convert_hive").val(await activeAccount.getHive());
});

$("#send_convert_hive").click(async () => {
  $("#send_convert_hive").hide();
  $("#convert_hive_loading").show();

  hive.broadcast.collateralizedConvert(
    await activeAccount.getKey("active"),
    await activeAccount.getName(),
    nextRequestId,
    `${parseFloat($("#amt_convert_hive").val()).toFixed(3)} ${
      rpcs.isTestnet ? "TESTS" : "HIVE"
    }`,
    function (err, result) {
      if (!err) {
        initializeVisibility();
        loadAccount(activeAccount.getName());
        showConfirm(chrome.i18n.getMessage("popup_html_convert_hive_success"));
      } else {
        showError(chrome.i18n.getMessage("popup_html_convert_error"));
        console.log(err);
      }
    }
  );
});

$("#send_convert").click(async () => {
  $("#send_convert").hide();
  $("#convert_loading").show();
  hive.broadcast.convert(
    await activeAccount.getKey("active"),
    await activeAccount.getName(),
    nextRequestId,
    `${parseFloat($("#amt_convert").val()).toFixed(3)} HBD`,
    function (err, result) {
      if (!err) {
        initializeVisibility();
        loadAccount(activeAccount.getName());
        showConfirm(chrome.i18n.getMessage("popup_html_convert_success"));
      } else {
        showError(chrome.i18n.getMessage("popup_html_convert_error"));
        console.log(err);
      }
    }
  );
});

const getNextRequestID = async () => {
  conversions = await hive.api.getConversionRequestsAsync(
    await activeAccount.getName()
  );
  console.log(conversions);
  try {
    collateralized_conversions = await hive.api.callAsync(
      "condenser_api.get_collateralized_conversion_requests",
      [await activeAccount.getName()]
    );
  } catch (e) {
    console.error(e);
  }
  const conv = [...conversions, ...collateralized_conversions];
  nextRequestId = Math.max(...conv.map((e) => e.requestid), 0) + 1;
};
