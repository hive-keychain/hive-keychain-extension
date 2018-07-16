var accounts_json=null,mk=null;

steem.api.setOptions({ url: 'https://api.steemit.com' });

chrome.runtime.sendMessage({command:"getMk"},function(response){});
chrome.runtime.onMessage.addListener(function(msg,sender,sendResp){
  if(msg.command=="sendBackMk"){
    console.log(msg);
    chrome.storage.local.get(['accounts'], function (items) {
        if(msg.mk==null||msg.mk==undefined){
          if(items.accounts==null||items.accounts==undefined)
            showRegister();
          else{
            showUnlock();
          }
        }
        else{
          mk=msg.mk;
          initializeMainMenu();
        }
      });
    }
});

$("#lock").click(function(){
  chrome.runtime.sendMessage({command:"sendMk",mk:null},function(response){});
  if(accounts_json==null)
  {
    accounts_json={list:[]};
    chrome.storage.local.set({accounts:encryptJson(accounts_json,mk)});
    mk=null;
  }
  showUnlock();
});

$("#forgot").click(function(){
  $("#forgot_div").show();
});

$("#submit_unlock").click(function(){
  chrome.storage.local.get(['accounts'], function (items) {
    var pwd=$("#unlock_pwd").val();
    if(decryptToJson(items.accounts,pwd)!=null)
    {
      mk=pwd;
      chrome.runtime.sendMessage({command:"sendMk",mk:mk},function(response){});
      $("#error_unlock").html("");
      $("#unlock_pwd").val("");
      initializeMainMenu();
    }
    else
      $("#error_unlock").html("Wrong password!");
  });
});

$('#unlock_pwd').keypress(function(e){
    if(e.keyCode==13)
    $('#submit_unlock').click();
});

$('#confirm_master_pwd').keypress(function(e){
    if(e.keyCode==13)
    $('#submit_master_pwd').click();
});

$("#forgot_div button").click(function(){
  chrome.storage.local.clear(function(){
      accounts_json=null;
      mk=null;
      $("#forgot_div").hide();
      $("#unlock").hide();
      $("#register").show();
  });
});

$("#submit_master_pwd").click(function(){
  if(!$("#master_pwd").val().match(/^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/)){
    if($("#master_pwd").val()==$("#confirm_master_pwd").val())
    {
      mk=$("#master_pwd").val();
      chrome.runtime.sendMessage({command:"sendMk",mk:mk},function(response){});
      initializeMainMenu();
    }
    else
      $("#error_register").html("Your passwords do not match");
  }
  else
    $("#error_register").html("Please use a stronger password. At least 8 characters (upper and lower case, digits and special characters).");
});

$("#add_account").click(function(){
  showAddAccount();
});

$(".back_menu").click(function(){
  initializeMainMenu();
});

$("#check_add_account").click(function(){
  $("#message_account_checked").css("display","block");
  $("#master_check").css("display","none");
  const username=$("#username").val();
  const pwd=$("#pwd").val();
  if(username!==""&&pwd!==""){
    if(accounts_json && accounts_json.list.find(function (element) {return element.name==username}))
      $("#message_account_checked").html("You already registered an account for @"+username+"!");
    else
    steem.api.getAccounts([username], function(err, result) {
      console.log(err, result);
      if (result.length!=0)
      {
        const pub_active=result["0"].active.key_auths["0"]["0"];
        const pub_posting=result["0"].posting.key_auths["0"]["0"];
        const pub_memo=result["0"].memo_key;
        if(steem.auth.isWif(pwd)){
          if(isMemoWif(pwd,pub_memo)){
            $("#message_account_checked").html("Saved memo key for user @"+username+"!");
            addAccount({name:username,keys:{memo:pwd,memoPubkey:pub_memo}});
          }
          else if(isPostingWif(pwd,pub_posting)){
            $("#message_account_checked").html("Saved posting key for user @"+username+"!");
            addAccount({name:username,keys:{posting:pwd,postingPubkey:pub_posting}});
          }
          else if(isActiveWif(pwd,pub_active)){
            $("#message_account_checked").html("Saved active key for user @"+username+"!");
            addAccount({name:username,keys:{active:pwd,activePubkey:pub_active}});
          }
        }
        else {
          const keys=steem.auth.getPrivateKeys(username, pwd, ["posting","active","memo"]);
          if(keys.activePubkey==pub_active&&keys.postingPubkey==pub_posting&&keys.memoPubkey==pub_memo)
          {
            $("#message_account_checked").html("You entered your master key, select which private keys you wish to save. Your master key will not be saved.");
            $("#master_check").css("display","block");
          }
          else
            $("#message_account_checked").html("Incorrect private key or password.");
        }
      }
      else{
        console.log(err);
        $("#message_account_checked").html("Please check the username and try again.");
      }
    });
  }
  else
    $("#message_account_checked").html("Please fill the fields.");
});

$("#save_master").click(function(){
  if($("#posting_key").prop("checked")||$("#active_key").prop("checked")||$("#memo_key").prop("checked")){
    var permissions=[];
    if($("#posting_key").prop("checked"))
      permissions.push("posting");
    if($("#active_key").prop("checked"))
      permissions.push("active");
    if($("#memo_key").prop("checked"))
      permissions.push("memo");
    const keys=steem.auth.getPrivateKeys($("#username").val(), $("#pwd").val(), permissions);
    addAccount({name:$("#username").val(),keys:keys});
  }
});

// Add new account to Chrome local storage
function addAccount(account)
{
    var saved_accounts=accounts_json;
    if(saved_accounts==undefined||saved_accounts==null||saved_accounts.list==0)
      accounts={list:[account]};
    else{
      saved_accounts.list.push(account)
      accounts=saved_accounts;
    }
    chrome.storage.local.set({
          accounts:encryptJson(accounts,mk)
      });
    initializeMainMenu();
}

// Set visibilities back to normal when coming back to main menu
function initializeMainMenu()
{
    $("#accounts").html("");
    $("#add_account_div").hide();
    $("#message_account_checked").hide();
    $("#master_check").hide();
    $("#username").val("");
    $("#pwd").val("");
    $("#message_account_checked").html("");
    $("#posting_key").prop("checked",true);
    $("#active_key").prop("checked",true);
    $("#memo_key").prop("checked",true);
    $("#main").css("display","block");
    $(".account_info").hide();
    $(".account_info_content").hide();
    $("#acc_transfers").empty();
    $(".account_info_menu").removeClass("rotate180");
    $("#transfer_to").hide();
    $("#add_key_div").hide();
    $("#new_key").val("");
    $("#keys_info").empty();
    $("#balance_steem").html("");
    $("#balance_sbd").html("");
    $("#balance_sp").html("");
    $("#balance_loader").show();
    $("#register").hide();
    $("#unlock").hide();

    chrome.storage.local.get(['accounts'], function (items) {
      accounts_json=(items.accounts==undefined||items.accounts=={list:[]})?null:decryptToJson(items.accounts,mk);
      if(accounts_json!=null){
        $("#accounts").empty();
        for(account of accounts_json.list){
          $("#accounts").append("<div class='account_row'><span class='account_name'>@"+account.name+"</span><span class='acc_keys'>"
            +(account.keys.hasOwnProperty("posting")?"<span class='acc_key'>P</span>":"")
            +(account.keys.hasOwnProperty("active")?"<span class='acc_key'>A</span>":"")
            +(account.keys.hasOwnProperty("memo")?"<span class='acc_key'>M</span>":"")+"</span></div>");
        }

        //OnClick on account
        $(".account_row").click(function(){
          const account=accounts_json.list[$(this).index()];
          steem.api.getAccounts([account.name], function(err, result) {
            console.log(result,err);
            if (result.length!=0)
            {
            steem.api.getDynamicGlobalProperties(function(err, res) {
              if (res.length!=0)
                showBalances(result,res);
            });
          }
          });
          $("#acc_transfers").html("Loading...");
          showAccountInfo(account,this);
        });
      }
    });
}

$(".account_info_menu").click(function(){
  $(".account_info_content").eq(($(this).index()-3)/2).slideToggle();
  if($(this).hasClass("rotate180"))
    $(this).removeClass("rotate180");
  else $(this).addClass("rotate180");
});

$("#confirm_forget_account").click(function(){
  const i=parseInt($(".account_info").attr("id").replace("a",""));
  deleteAccount(i);
});

// Manage keys
$(".account_info_menu").eq(0).click(function(){
  manageKeys();
});

function manageKeys(){
  if($(".row_account_keys").length==0){
    const i=parseInt($(".account_info").attr("id").replace("a",""));
    const keys=accounts_json.list[i].keys;
    for(keyName in keys)
    {
      if(!keyName.includes("Pubkey"))
      {
        $("#keys_info").append("<div class='row_account_keys'><div class='type_key'>"+keyName[0]+"</div><div class='div_keys'><div class='privateRow'><input type='text' readOnly='true' value='"+keys[keyName]+"' class='privKey'></input><img class='copyKey'/><img id='"+keyName+"' class='deleteKey'/></div><div class='publicRow'><input type='text' readOnly='true' value='"+keys[keyName+"Pubkey"]+"' class='pubKey'></input><img class='copyKey'/></div></div></div>");
      }
    }

    $(".copyKey").click(function(){
      $(this).parent().children().eq(0).select();
      document.execCommand("copy");
      document.selection.empty();
    });

    $(".deleteKey").click(function(){
        delete accounts_json.list[i].keys[$(this).attr("id")];
        delete accounts_json.list[i].keys[$(this).attr("id")+"Pubkey"];
        $(this).closest($(".row_account_keys")).remove();
        if($(".row_account_keys").length==0)
          deleteAccount();
        else {
          updateAccount();
        }
    });
  }
}
// Show add a new key
$('#add_key').click(function(){
  $('#add_key_div').show();
});

// Try to add the new key
$('#add_new_key').click(function(){
  const username=$("#account_info_name").html().replace("@","");
  const i=parseInt($(".account_info").attr("id").replace("a",""));
  const keys=accounts_json.list[i].keys;
  const pwd=$("#new_key").val();
  if(steem.auth.isWif(pwd)){
    steem.api.getAccounts([username], function(err, result) {
      console.log(err, result);
      if (result.length!=0)
      {
        const pub_active=result["0"].active.key_auths["0"]["0"];
        const pub_posting=result["0"].posting.key_auths["0"]["0"];
        const pub_memo=result["0"].memo_key;
        if(isMemoWif(pwd,pub_memo)){
          if(keys.hasOwnProperty("memo"))
            $("#error_add_key").html("You already entered your memo key!");
          else
            addKeys(i,"memo",pwd,pub_memo);
        }
        else if(isPostingWif(pwd,pub_posting)){
          if(keys.hasOwnProperty("posting"))
            $("#error_add_key").html("You already entered your posting key!");
          else
            addKeys(i,"posting",pwd,pub_posting);
        }
        else if(isActiveWif(pwd,pub_active)){
          if(keys.hasOwnProperty("active"))
            $("#error_add_key").html("You already entered your active key!");
          else
            addKeys(i,"active",pwd,pub_active);
        } else
          $("#error_add_key").html("This is not one of your keys!");
        }
    });
  }
  else
    $("#error_add_key").html("Not a private WIF!");
});

function addKeys(i,key,priv,pub){
  accounts_json.list[i].keys[key]=priv;
  accounts_json.list[i].keys[key+"Pubkey"]=pub;
  updateAccount();
  $("#keys_info").empty();
  manageKeys();
}
// Display Wallet history
$(".account_info_menu").eq(2).click(function(){
  if($(".transfer_row").length==0){
    const username=$("#account_info_name").html().replace("@","");
    steem.api.getAccountHistory(username, -1, 1000, function(err, result) {
      $("#acc_transfers").empty();
      if(result!=null){
          var transfers = result.filter(tx => tx[1].op[0] === 'transfer');
          transfers=transfers.slice(-10).reverse();
          if(transfers.length!=0){
          for (transfer of transfers){
            var memo=transfer[1].op[1].memo;
            if(memo[0]=="#"){
              if(accounts_json.list[parseInt($(".account_info").attr("id").replace("a",""))].keys.hasOwnProperty("memo"))
                memo=window.decodeMemo(accounts_json.list[parseInt($(".account_info").attr("id").replace("a",""))].keys.memo, memo);
              else
                memo="Add your private memo key to read this memo";
            }
            $("#acc_transfers").append("<div class='transfer_row "+(transfer[1].op[1].from==username?"red":"green")+"'><span class='transfer_name'>"+(transfer[1].op[1].from==username?"To @"+transfer[1].op[1].to:"From @"+transfer[1].op[1].from)+":</span><span class='transfer_val'>"+transfer[1].op[1].amount+"</span></div><div class='memo'>"+memo+"</div><hr>");
          }
          $(".transfer_row").click(function(){
              console.log("a",$(this).index());
              $(".memo").eq($(this).index()/3).slideToggle();
          });
        }
        else
          $("#acc_transfers").append("No recent transfers");
      }
        else
          $("#acc_transfers").append("Something went wrong! Please try again later!");
    });
  }
});

// Send STEEM or SBD to an user
$("#send_transfer").click(function(){
  showLoader();
  sendTransfer();
});

function sendTransfer(){
  const to=$("#recipient").val();
  const amount=$("#amt_send").val();
  const currency=$("#currency").val();
  const memo=$("#memo_send").val();
  const account=accounts_json.list[parseInt($(".account_info").attr("id").replace("a",""))];
  if(to!=""&&amount!=""&&amount>=0.001){
    steem.broadcast.transfer(account.keys.active, account.name, to, parseFloat(amount).toFixed(3) + " " + currency, memo, function(err, result) {
      $("#message_send_transfer").empty();
      $("#send_loader").hide();
      if(err==null)
        $("#message_send_transfer").append("<span class='green'>Transaction successful!</span>");
      else {
        $("#message_send_transfer").append("<span class='red'>Something went wrong! Make sure you have enough STEEM/SBD, check the recipient's username and your internet connexion and try again!</span>");
      }
    });
  }
}


function deleteAccount(i){
  accounts_json.list.splice(i,1);
  chrome.storage.local.set({
        accounts:encryptJson(accounts_json,mk)
    },function(){
      initializeMainMenu();
    });
}

function updateAccount(){
  chrome.storage.local.set({
        accounts:encryptJson(accounts_json,mk)
    });
}

//Check WIF validity
function isActiveWif(pwd,active)
{
  return steem.auth.wifToPublic(pwd)==active;
}

function isPostingWif(pwd,posting)
{
  return steem.auth.wifToPublic(pwd)==posting;
}

function isMemoWif(pwd,memo)
{
  return steem.auth.wifToPublic(pwd)==memo;
}

var numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Handle pages visibility

function showRegister(){
  $("#main").hide();
  $("#register").show();
}

function showUnlock(){
  $("#main").hide();
  $("#unlock").show();
}

function showLoader(){
  $("#send_loader").show();
  $("#send_transfer").hide();
}

function showAccountInfo(account,that){
  if(account.keys.hasOwnProperty("active"))
    $("#transfer_to").show();
  $(".account_info").attr("id","a"+$(that).index());
  $("#account_info_name").html("@"+account.name);
  $("#main").hide();
  $(".account_info").show();
}

function showBalances(result,res){
  const sbd=result["0"].sbd_balance;
  const vs=result["0"].vesting_shares;
  const steem_v=result["0"].balance;
  const total_vesting_shares=res.total_vesting_shares;
  const total_vesting_fund=res.total_vesting_fund_steem;
  const sp=steem.formatter.vestToSteem(vs, total_vesting_shares, total_vesting_fund);
  $("#balance_steem").html(numberWithCommas(steem_v));
  $("#balance_sbd").html(numberWithCommas(sbd));
  $("#balance_sp").html(numberWithCommas(sp.toFixed(3))+" SP");
  $("#balance_loader").hide();
}

function showAddAccount(){
  $("#add_account_div").css("display","block");
  $("#main").css("display","none");
}
