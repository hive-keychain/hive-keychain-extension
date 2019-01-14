let tokens=[];
let accountTokenBalances=[];
const ssc = new SSC('https://steemsmartcontracts.tk:5000');

getTokens().then(function(tok){
  tokens=tok;
});

tokens=[{name:"SteemPlus Points",symbol:"SPP",issuer:"steem-plus",supply:"1000000000"},{name:"SteemMonsters Team Token",symbol:"SMTT",issuer:"steemmonsters",supply:"1000000000"}]
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

function showTokenBalances(account){
/*  getAccountBalances(account).then((tokenBalances)=>{
    console.log(tokenBalances);
    accountTokenBalances=tokenBalances;*/
      $("#tokens_list").empty();
      const tokenBalances=[{balance:1000,symbol:"SMTT"},{balance:1500000,symbol:"SPP"}];
    for(token of tokenBalances){
      $("#tokens_list").append("<div class='row_token_balance'>\
      <span>"+numberWithCommas(token.balance)+"</span>\
      <span>"+token.symbol+"</span>\
      <img src='../images/transfer.png'/>\
      </div>");
    }
  /*});*/
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
