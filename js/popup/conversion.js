let conversions = [];
let nextRequestId = 0;

$("#convert_hbd").click(() => {
  $("#main").hide();
  $("#convert_div").show();
  getNextRequestID();
});

$("#amt_convert_max").click(async () => {
  $("#amt_convert").val(await activeAccount.getHBD());
});

$("#send_convert").click(async () => {
  $("#send_convert").hide();
  $("#convert_loading").show();
  hive.broadcast.convert(
    await activeAccount.getKey("active"),
    await activeAccount.getName(),
    nextRequestId,
    `${$("#amt_convert").val()} HBD`,
    function(err, result) {
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
  nextRequestId = Math.max(...conversions.map(e => e.requestid)) + 1;
  console.log(nextRequestId);
};
