async function preparePowerUpDown(account){
  const SP=numberWithCommas(sp.toFixed(3))+"    SP";
  const STEEM=numberWithCommas(parseFloat(steem_p).toFixed(3))+" STEEM";
  const dynamicProp=await steem.api.getDynamicGlobalPropertiesAsync();
  const totalSteem = Number(dynamicProp.total_vesting_fund_steem.split(' ')[0]);
  const totalVests = Number(dynamicProp.total_vesting_shares.split(' ')[0]);

  $(".power_sp").html(SP);
  $(".power_steem").html(STEEM);
  const withdrawn=(account[0].withdrawn/totalVests*totalSteem/1000000).toFixed(0);
  const total_withdrawing=(account[0].to_withdraw/totalVests*totalSteem/1000000).toFixed(0);
  if(total_withdrawing!=0){
    $("#powerdown_div .power").eq(1).show();
    $("#powering_down").html(withdrawn+" / "+total_withdrawing+" SP");
    $("#powering_down").attr("title","Next power down on "+account[0].next_vesting_withdrawal);
  }
  else {
      $("#powerdown_div .power").eq(1).hide();
  }

  if(!active_account.keys.hasOwnProperty("active")){
    $("#power_up").addClass("disabled");
    $("#wrap_power_up").attr("title","Please add your active key to send delegations!");
    $("#power_down").addClass("disabled");
    $("#wrap_power_down").attr("title","Please add your active key to send delegations!");
  }
  else{
    $("#power_up").removeClass("disabled");
    $("#power_down").removeClass("disabled");
    $("#wrap_power_up").removeAttr("title");
    $("#wrap_power_down").removeAttr("title");
  }
$("#power_up").unbind("click").click(function(){
  const amount=parseFloat($("#amt_pu").val()).toFixed(3)+" STEEM";
  $("#power_up").hide();
  $("#powerup_loading").show();
  steem.broadcast.transferToVesting(active_account.keys.active, active_account.name, active_account.name, amount, function(err, result) {
    console.log(err, result);
    $("#power_up").show();
    $("#powerup_loading").hide();
    if(err){
      showError("Something went wrong! Please try again!");
    }
    else{
      showConfirm("You succesfully powered up!");
      loadAccount(active_account.name);
    }
  });
});

$("#power_down").unbind("click").click(function(){
  $("#power_down").hide();
  $("#powerdown_loading").show();
  let vestingShares = parseFloat($("#amt_pd").val()) * totalVests / totalSteem;
  vestingShares = vestingShares.toFixed(6);
  vestingShares = vestingShares.toString() + ' VESTS';

  steem.broadcast.withdrawVesting(active_account.keys.active, active_account.name, vestingShares, function(err, result) {
    console.log(err, result);
    $("#power_down").show();
    $("#powerdown_loading").hide();
    if(err){
      showError("Something went wrong! Please try again!");
    }
    else{
      showConfirm("You succesfully started a power down!");
      loadAccount(active_account.name);
    }
  });
});

}
