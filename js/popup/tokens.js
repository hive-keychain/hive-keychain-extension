let tokens=[];
let accountTokenBalances=[];
const urlSSC=[
  "https://steemsmartcontracts.tk",
  "https://testapi.steem-engine.com:5000"
];
const ssc = new SSC(urlSSC[1]);

getTokens().then(function(tok){
  tokens=tok;
  console.log(tokens);
  for (token of tokens){
    $("#existing_tokens").append("<div class='row_existing_tokens'>\
    <span class='name_token'>"+token.name+"</span>\
    <span class='symbol_token'>"+token.symbol+"</span>\
    <span class='issuer_token'>by @"+token.issuer+"</span>\
    <spanclass='supply_token'>Supply: "+numberWithCommas(token.supply)+"</span>\
    <div class='key_checkbox'>\
      <input type='checkbox' checked=true/>\
      <span class='checkmark'/>\
    </label>\
    </div>\
    ");
  }
});

function showTokenBalances(account){
  getAccountBalances(account.name).then((tokenBalances)=>{
    console.log(tokenBalances);
    accountTokenBalances=tokenBalances;
      $("#tokens_list").empty();
      //const tokenBalances=[{balance:1000,symbol:"SMTT"},{balance:1500000,symbol:"SPP"}];
    for(token of tokenBalances){
      $("#tokens_list").append("<div class='row_token_balance'>\
      <span>"+numberWithCommas(token.balance)+"</span>\
      <span>"+token.symbol+"</span>\
      <img src='../images/transfer.png' class='send_token_icon'/>\
      </div>");
    }

    if(tokenBalances.length){
        $("#tokens_div p").html("Displays every non-null token balance. You can hide some balances and check information about the tokens by clicking the Settings wheel.");
    }
    else {
        $("#tokens_div p").html("You currently don't have any token, click on the settings wheel to get information about the tokens available.");
    }

    if(!active_account.keys.hasOwnProperty("active")){
      $("#send_tok").addClass("disabled");
      $("#wrap_tok").attr("title","Please add your active key to send tokens!");
    }
    else{
      $("#send_tok").removeClass("disabled");
      $("#wrap_tok").removeAttr("title");
    }

    $(".send_token_icon").unbind("click").click(function(){
      const symbol=$(this).prev().html();
      const balance=accountTokenBalances.filter((e)=>{return e.symbol==symbol;})[0].balance;
      $("#token_send_div .back_enabled").html("Send "+symbol);
      $("#tok").html(symbol);
      $(".token_right").html(numberWithCommas(balance));
      $("#token_send_div").show();
      $("#tokens_div").hide();
    });
  });
}

function getTokens(){
  return ssc.find(
    "tokens",
    "tokens",
    {
    });
}

function getAccountBalances(account){
  return ssc.find(
	'tokens',
	'balances',
	{
		"account":  account
	});
}

function sendToken(account_to,token,amount){
  const id="ssc-00000000000000000002";
  const json={
     "contractName": "tokens",
     "contractAction": "transfer",
     "contractPayload": {
       "symbol": token,
       "to": account_to,
       "quantity": parseFloat(amount)
     }
   };
  $("#tok_loading").show();
steem.broadcast.customJson(active_account.keys.active, [active_account.name], null, id, JSON.stringify(json), function(err, result) {
    $("#tok_loading").hide();
    if(err)
      showError("Something went wrong! Please try again!");
    else
      showConfirm("Transaction broadcasted succesfully! Please double check that the tokens have been sent.");
  });
}

$("#send_tok").click(function(){
  sendToken($("#send_tok_to").val(),$("#tok").html(),$("#amt_tok").val());
});
