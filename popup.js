var accounts_json=null;

steem.api.setOptions({ url: 'https://api.steemit.com' });
InitializePopup();

$("#add_account").click(function(){
  $("#add_account_div").css("display","block");
  $("#main").css("display","none");
});

$(".back_menu").click(function(){
    InitializePopup();
});

$("#check_add_account").click(function(){
  $("#message_account_checked").css("display","block");
  $("#master_check").css("display","none");
  const username=$("#username").val();
  const pwd=$("#pwd").val();
  if(username!==""&&pwd!==""){
    if(accounts_json.list.find(function (element) {return element.name==username}))
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
        $("#message_account_checked").html("Incorrect username");
      }
    });
  }
  else
    $("#message_account_checked").html("Please fill the fields");
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
  console.log(account);
  chrome.storage.local.get(['accounts'], function (items) {
    var accounts=null;
    var saved_accounts=items.accounts;
    if(saved_accounts==undefined)
      accounts={list:[account]};
    else{
      saved_accounts.list.push(account)
      accounts=saved_accounts;
    }
    console.log(accounts);
    chrome.storage.local.set({
          accounts:accounts
      });
    InitializePopup();
  });
}

// Set visibilities back to normal when coming back to main menu
function InitializePopup()
{
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
    chrome.storage.local.get(['accounts'], function (items) {
      accounts_json=items.accounts==undefined?null:items.accounts;
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
          console.log();
          const account=accounts_json.list[$(this).index()];
          console.log(account);
          $(".account_info").attr("id","a"+$(this).index());
          $("#account_info_name").html(account.name);
          $("#main").hide();
          $(".account_info").show();
        });
      }
    });
}

$(".account_info_menu").click(function(){
  $(".account_info_content").eq($(this).index()/2-1).slideToggle();
  if($(this).hasClass("rotate180"))
    $(this).removeClass("rotate180");
  else $(this).addClass("rotate180");
});

$("#confirm_forget_account").click(function(){
  const i=parseInt($(".account_info").attr("id").replace("a",""));
  accounts_json.list.splice(i,1);
  chrome.storage.local.set({
        accounts:accounts_json
    },function(){
      InitializePopup();
    });

});
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
