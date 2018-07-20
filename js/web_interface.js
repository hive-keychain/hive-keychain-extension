document.addEventListener('swHandshake', function(request) {
  location.href="javascript:onGetHandshake(); void 0";
});

document.addEventListener('swRequest', function(request) {
  var req=request.detail;
  if(req!=null&&req!=undefined&&req.type!=undefined&&req.type!=null&&((req.type=="decode"&&isFilled(req.username)&&isFilled(req.message)&&isFilledKey(req.method))||
    (req.type=="vote"&&isFilled(req.username)&&isFilledWeight(req.weight)&&isFilled(req.url))||
    (req.type=="post"&&isFilled(req.username)&&isFilled(req.title)&&isFilled(req.body)&&isFilled(req.permlink)&&isFilled(req.parent_perm)&&isFilled(req.parent_username)&&isFilled(req.json_metadata)||
    (req.type=="custom"&&isFilled(req.username)&&isFilled(req.json))||
    (req.type=="transfer"&&isFilled(req.username)&&isFilledAmt(req.amount)&&isFilled(req.to)&&isFilledCurrency(req.currency))))){
        chrome.runtime.sendMessage({command:"sendRequest",request:req,domain:window.location.hostname},function(response){});
    }
  else{
    var response={success:false,error:"incomplete",result:null,message:"Incomplete data",data:req};
    sendResponse(response);
  }
});

chrome.runtime.onMessage.addListener(function(obj,sender,sendResp){
  if(obj.command=="answerRequest"){
    sendResponse(obj.msg);
  }
});

function sendResponse(response){
  location.href="javascript:onGetResponse("+JSON.stringify(response)+"); void 0";
}

// Functions used to check the incoming data

function isFilled(obj){
  return obj!=undefined&&obj!=null&&obj!="";
}

function isFilledAmt(obj){
  return isFilled(obj)&&!isNaN(obj)&&obj>0&&countDecimals(obj)==3;
}

function isFilledWeight(obj){
  return isFilled(obj)&&!isNaN(obj)&&obj>=0&&obj<=10000&&countDecimals(obj)==0;
}

function isFilledCurrency(obj){
  return isFilled(obj)&&(obj=="STEEM"||obj=="SBD");
}

function isFilledKey(obj){
  return isFilled(obj)&&(obj=="Memo"||obj=="Active"||obj=="Posting");
}

function countDecimals(nb) {
    return nb.toString().split(".")[1]==undefined?0:(nb.toString().split(".")[1].length || 0);
}
