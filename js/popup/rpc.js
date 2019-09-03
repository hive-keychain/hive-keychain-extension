function loadRPC(local, current_rpc) {
  $("#custom_select_rpc").html("<select></select>");
  $("#pref_div .usernames .select-selected").remove();
  $("#pref_div .usernames .select-items").remove();
  let listRPC = [];
  listRPC = local != undefined ? JSON.parse(local).concat(RPCs) : RPCs;
  const currentrpc = current_rpc || "https://api.steemit.com";
  listRPC = [currentrpc].concat(listRPC.filter((e) => {
    return e != currentrpc
  }));
  $("#custom_select_rpc select").html(listRPC.reduce((acc, val) => {
    return acc + "<option>" + val + "</option>";
  }, ""));
  $("#custom_select_rpc select").append("<option>ADD RPC</option>");
  if (current_rpc === 'TESTNET') {
    $("#currency_send select").children("option:first").text('TESTS');
    $("#currency_send select").children("option:first").val('TESTS');
    $("#currency_send select").children("option:nth-child(2)").text('TBD');
    $("#currency_send select").children("option:nth-child(2)").val('TBD');
    $('#wallet_currency .wallet_currency').eq(0).text('TESTS')
    $('#wallet_currency .wallet_currency').eq(1).text('TBD')
    $('#wallet_currency .wallet_currency').eq(2).text('TP')
  } else {
    $("#currency_send select").children("option:first").text('STEEM');
    $("#currency_send select").children("option:first").val('STEEM');
    $("#currency_send select").children("option:nth-child(2)").text('SBD');
    $("#currency_send select").children("option:nth-child(2)").val('SBD');
    $('#wallet_currency .wallet_currency').eq(0).text('STEEM')
    $('#wallet_currency .wallet_currency').eq(1).text('SBD')
    $('#wallet_currency .wallet_currency').eq(2).text('SP')

  }
}

function switchRPC(rpc) {
  steem.api.setOptions({
    url: rpc,
    useAppbaseApi: true
  });
  if (rpc === 'TESTNET') {
    steem.api.setOptions({
      url: 'https://testnet.steemitdev.com',
      useAppbaseApi: true,
    });
    steem.config.set('address_prefix', 'TST');
    steem.config.set('chain_id', '46d82ab7d8db682eb1959aed0ada039a6d49afa1602491f93dde9cac3e8e6c32');
  } else {
    steem.config.set('address_prefix', 'STM');
    steem.config.set('chain_id', '0000000000000000000000000000000000000000000000000000000000000000');
  }
  setRPC(rpc);
  chrome.storage.local.set({
    current_rpc: rpc
  });
}

function addNewRPC(rpc) {
  chrome.storage.local.get(["rpc"], function(items) {
    let customRPCs = [];
    if (items.rpc != undefined)
      customRPCs = JSON.parse(items.rpc);
    customRPCs.push(rpc);
    chrome.storage.local.set({
      rpc: JSON.stringify(customRPCs)
    }, function() {
      $(".success_div").html("RPC added succesfully!").show();
      showCustomRPC();
      setTimeout(function() {
        $(".success_div").html("").hide();
      }, 5000);
    });
  });
}

function showCustomRPC() {
  $("#custom_rpc").empty();
  chrome.storage.local.get(["rpc"], function(items) {
    if (items.rpc) {
      let rpcs = JSON.parse(items.rpc);
      for (rpc of rpcs) {
        $("#custom_rpc").append("<div><div class='pref_name'>" + rpc + "</div><img class='deleteCustomRPC' src='../images/delete.png'/></div>");
      }
      $(".deleteCustomRPC").unbind("click").click(function() {
        rpcs = rpcs.filter((e) => {
          return e != $(this).prev().html();
        });
        chrome.storage.local.set({
          rpc: JSON.stringify(rpcs)
        }, function() {
          showCustomRPC();
        });
      });
    }
  });
}