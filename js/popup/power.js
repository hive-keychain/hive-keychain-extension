function preparePowerUpDown(){
  const SP=numberWithCommas(sp.toFixed(3))+"    SP";
  const STEEM=numberWithCommas(parseFloat(steem_p).toFixed(3))+" STEEM";
  $(".power_sp").html(SP);
  $(".power_steem").html(STEEM);

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
  steem.broadcast.transferToVesting(active_account.keys.active, active_account.name, active_account.name, amount, function(err, result) {
    console.log(err, result);
    if(err){
      showError("Something went wrong! Please try again!");
    }
    else{
      showConfirm("Your succesfully powered up!");
      loadAccount(active_account.name);
    }
  });
});

$("#power_down").unbind("click").click(async function(){
  const result=await steem.api.getDynamicGlobalPropertiesAsync();
  const totalSteem = Number(result.total_vesting_fund_steem.split(' ')[0]);
  const totalVests = Number(result.total_vesting_shares.split(' ')[0]);

  let vestingShares = parseFloat($("#amt_pd").val()) * totalVests / totalSteem;
  vestingShares = vestingShares.toFixed(6);
  vestingShares = vestingShares.toString() + ' VESTS';

  steem.broadcast.withdrawVesting(active_account.keys.active, active_account.name, vestingShares, function(err, result) {
    console.log(err, result);
    if(err){
      showError("Something went wrong! Please try again!");
    }
    else{
      showConfirm("Your succesfully started a power down!");
      loadAccount(active_account.name);
    }
  });
});

}
