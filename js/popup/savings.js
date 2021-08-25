$("#save_hive").click(async () => {
  $("#main").hide();
  $("#savings_div").show();
  $("#currency_savings").text("HIVE");
  $("#available_savings").text((await activeAccount.getHive()) + " HIVE");
  $("#current_savings").text((await activeAccount.getHiveSavings()) + " HIVE");
  $("#savings_div .back_enabled").text(
    chrome.i18n.getMessage("popup_html_save_hive")
  );
  if (
    $("#savings_div .select-selected").html() ===
    chrome.i18n.getMessage("popup_html_deposit")
  ) {
    $("#savings_div button").text(
      chrome.i18n.getMessage("popup_html_deposit", ["HIVE"])
    );
  } else {
    $("#savings_div button").text(
      chrome.i18n.getMessage("popup_html_withdraw", ["HIVE"])
    );
  }
  $("#savings_div .send_max").text("MAX");
  $("#recipient_savings").val(activeAccount.getName());
  $("#savings_div .send_max")
    .unbind("click")
    .click(async () => {
      let value = 0;
      console.log;
      if (
        $("#savings_div .select-selected").html() ===
        chrome.i18n.getMessage("popup_html_deposit")
      )
        value = await activeAccount.getHive();
      else value = await activeAccount.getHiveSavings();
      $("#amt_savings").val(value);
    });
});

$("#save_hbd").click(async () => {
  $("#main").hide();
  $("#savings_div").show();
  $("#currency_savings").text("HBD");
  $("#available_savings").text((await activeAccount.getHBD()) + " HBD");
  $("#current_savings").text((await activeAccount.getHBDSavings()) + " HBD");
  $("#savings_div .back_enabled").text(
    chrome.i18n.getMessage("popup_html_save_hbd")
  );
  $("#savings_div .send_max").text("MAX");
  const wif = activeAccount.getKey("active");
  if (
    $("#savings_div .select-selected").html() ===
    chrome.i18n.getMessage("popup_html_deposit")
  ) {
    $("#savings_div button").text(
      chrome.i18n.getMessage("popup_html_deposit", ["HBD"])
    );
  } else {
    $("#savings_div button").text(
      chrome.i18n.getMessage("popup_html_withdraw", ["HBD"])
    );
  }
  $("#recipient_savings").val(activeAccount.getName());

  $("#savings_div .send_max")
    .unbind("click")
    .click(async () => {
      let value = 0;
      console.log;
      if (
        $("#savings_div .select-selected").html() ===
        chrome.i18n.getMessage("popup_html_deposit")
      )
        value = await activeAccount.getHBD();
      else value = await activeAccount.getHBDSavings();
      $("#amt_savings").val(value);
    });
});

$("#savings_div button")
  .unbind("click")
  .click(() => {
    const amt = $("#amt_savings").val();
    const currency = $("#currency_savings").text();
    const from = activeAccount.getName();
    const wif = activeAccount.getKey("active");
    if (
      $("#savings_div .select-selected").html() ===
      chrome.i18n.getMessage("popup_html_deposit")
    ) {
      //deposit
      const to = $("#recipient_savings").val();
      hive.broadcast.transferToSavings(
        wif,
        from,
        to,
        `${amt} ${currency}`,
        "",
        function (err, result) {
          console.log(err, result);
        }
      );
    } else {
      //withdraw
    }
  });
