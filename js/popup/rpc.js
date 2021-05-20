async function loadRPC(current_rpc) {
  const listRPC = await rpcs.getList();
  $("#custom_select_rpc").html("<select></select>");
  $("#pref_div .usernames .select-selected").remove();
  $("#pref_div .usernames .select-items").remove();
  $("#custom_select_rpc select").html(
    listRPC.reduce((acc, val) => {
      return (
        acc + `<option>${val.uri} ${val.testnet ? "(TESTNET)" : ""}</option>`
      );
    }, "")
  );
  $("#custom_select_rpc select").append(
    `<option>${chrome.i18n.getMessage("popup_rpc_add")}</option>`
  );

  initiateCustomSelect();
  const curRPCObj = listRPC.find((e) => e.uri === current_rpc);
  if (curRPCObj.testnet) {
    $("#currency_send select").children("option:first").text("TESTS");
    $("#currency_send select").children("option:first").val("TESTS");
    $("#currency_send select").children("option:nth-child(2)").text("TBD");
    $("#currency_send select").children("option:nth-child(2)").val("TBD");
    $("#wallet_currency .wallet_currency").eq(0).text("TESTS");
    $("#wallet_currency .wallet_currency").eq(1).text("TBD");
    $("#wallet_currency .wallet_currency").eq(2).text("TP");
  } else {
    $("#currency_send select").children("option:first").text("HIVE");
    $("#currency_send select").children("option:first").val("HIVE");
    $("#currency_send select").children("option:nth-child(2)").text("HBD");
    $("#currency_send select").children("option:nth-child(2)").val("HBD");
    $("#wallet_currency .wallet_currency").eq(0).text("HIVE");
    $("#wallet_currency .wallet_currency").eq(1).text("HBD");
    $("#wallet_currency .wallet_currency").eq(2).text("HP");
  }
}

function switchRPC(rpc) {
  rpcs.setOptions(rpc);
  setRPC(rpc);
  chrome.storage.local.set({
    current_rpc: rpc,
  });
}

function addNewRPC(rpc) {
  chrome.storage.local.get(["rpc"], function (items) {
    let customRPCs = [];
    if (items.rpc != undefined) customRPCs = JSON.parse(items.rpc);
    customRPCs.push(rpc);
    chrome.storage.local.set(
      {
        rpc: JSON.stringify(customRPCs),
      },
      function () {
        $(".success_div")
          .html(chrome.i18n.getMessage("popup_rpc_added"))
          .show();
        showCustomRPC();
        setTimeout(function () {
          $(".success_div").html("").hide();
        }, 5000);
      }
    );
  });
}

function showCustomRPC() {
  $("#custom_rpc").empty();
  chrome.storage.local.get(["rpc"], function (items) {
    if (items.rpc) {
      let rpcs = JSON.parse(items.rpc).map((e) => {
        if (typeof e === "string") {
          return { uri: e, testnet: false };
        } else return e;
      });

      for (rpc of rpcs) {
        $("#custom_rpc").append(
          `<div><div class='pref_name'>${rpc.uri} ${
            rpc.testnet ? "(TESTNET)" : ""
          }</div><img class='deleteCustomRPC' src='../images/delete.png'/></div>`
        );
      }
      $(".deleteCustomRPC")
        .unbind("click")
        .click(function () {
          rpcs = rpcs.filter((e) => {
            if (typeof e === "string") {
              return e !== $(this).prev().html().trim();
            } else {
              return (
                e.uri !== $(this).prev().html().replace("(TESTNET)", "").trim()
              );
            }
          });

          chrome.storage.local.set(
            {
              rpc: JSON.stringify(rpcs),
            },
            function () {
              showCustomRPC();
            }
          );
        });
    }
  });
}

$(".checkbox_testnet").click(() => {
  const checked = $(".checkbox_testnet").find("input").prop("checked");
  $("#chain_id").css("display", checked ? "block" : "none");
});
