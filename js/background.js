var mk=null;
var id_win=null;
var key=null;

//chrome.storage.local.remove("no_confirm");
steem.api.setOptions({ url: 'https://api.steemit.com' });

//Listen to the other parts of the extension
chrome.runtime.onMessage.addListener(function(msg,sender,sendResp){
  // Send mk upon request from the extension popup.
  if(msg.command=="getMk"){
    chrome.runtime.sendMessage({command:"sendBackMk",mk:mk},function(response){});
  }
  else if(msg.command=="sendMk"){//Receive mk from the popup (upon registration or unlocking)
    mk=msg.mk;
  }
  else if(msg.command=="sendRequest"){ // Receive request (website -> content_script -> background)
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      // create a window to let users confirm the transaction
      checkBeforeCreate(msg.request,tabs[0].id,msg.domain);
    });
  }
  else if(msg.command=="unlockFromDialog"){ // Receive unlock request from dialog
    chrome.storage.local.get(['accounts'], function (items) { // Check user
      if(items.accounts==null||items.accounts==undefined)
      {
        sendErrors(msg.tab,"no_wallet","No wallet!",msg.data);
      }
      else{
        if(decryptToJson(items.accounts,msg.mk)!=null)
        {
          mk=msg.mk;
          console.log(msg);
          checkBeforeCreate(msg.data,msg.tab,msg.domain);
        }
        else {
          chrome.runtime.sendMessage({command:"wrongMk"});
        }
      }
    });
  }
  else if(msg.command=="acceptTransaction"){
    if(msg.keep){
      chrome.storage.local.get(['no_confirm'], function (items) {
        var keep=(items.no_confirm==null||items.no_confirm==undefined)?{}:JSON.parse(items.no_confirm);
        if(keep[msg.data.username]==undefined){
          keep[msg.data.username]={};
        }
        if(keep[msg.data.username][msg.domain]==undefined){
          keep[msg.data.username][msg.domain]={};
        }
        keep[msg.data.username][msg.domain][msg.data.type]=true;
        chrome.storage.local.set({
              no_confirm:JSON.stringify(keep)
          });
      });
    }
    performTransaction(msg.data,msg.tab);
      // upon receiving the confirmation from user, perform the transaction and notify content_script. Content script will then notify the website.


  }
});

function performTransaction(data,tab){
  try{
    switch (data.type){
      case "vote":
        steem.broadcast.vote(key, data.username, data.author,  data.permlink,  parseInt(data.weight), function(err, result) {
          chrome.tabs.sendMessage(tab,{command:"answerRequest",msg:{success:err==null,error:err,result:result,data:data,message:err==null?"Success!":"Transaction error!"}});
        });
      break;
      case "custom":
        steem.broadcast.customJson(key, data.method.toLowerCase()=="active"?[data.username]:null, data.method.toLowerCase()=="posting"?[data.username]:null, data.id, data.json, function(err, result) {
          chrome.tabs.sendMessage(tab,{command:"answerRequest",msg:{success:err==null,error:err,result:result,data:data,message:err==null?"Success!":"Transaction error!"}});
        });
      break;
      case "transfer":
        steem.broadcast.transfer(key, data.username, data.to, data.amount+" "+data.currency, data.memo, function(err, result) {
          chrome.tabs.sendMessage(tab,{command:"answerRequest",msg:{success:err==null,error:err,result:result,data:data,message:err==null?"Success!":"Transaction error!"}});
        });
      break;
      case "post":
        steem.broadcast.comment(key, data.parent_username, data.parent_perm, data.username, data.permlink, data.title, data.body, data.json_metadata, function(err, result) {
          chrome.tabs.sendMessage(tab,{command:"answerRequest",msg:{success:err==null,error:err,result:result,data:data,message:err==null?"Success!":"Transaction error!"}});
        });
      break;
      case "decode":
        var decoded=window.decodeMemo(key, data.message);
        chrome.tabs.sendMessage(tab,{command:"answerRequest",msg:{success:true,error:null,result:decoded,data:data,message:"Success!"}});
      break;
    }
    key=null;
  }
  catch(e){
    sendErrors(tab,"wrong_transaction","The transaction failed for an unknown reason!",data);
  }
}
function createPopup(callback){
  var width=250;
  //Ensuring only one window is opened by the extension at a time.
  if(id_win!=null){
    chrome.windows.remove(id_win);
    id_win=null;
  }
  //Create new window on the top right of the screen
  chrome.windows.create({
     url: chrome.runtime.getURL("html/dialog.html"),
     type: "popup",
     height: 500,
     width:width,
     left:screen.availWidth-200,
     top:0
      }, function(win) {
        id_win=win.id;
        setTimeout(function(){
          callback();
        },100);
      });

}

function checkBeforeCreate(request,tab,domain){
    if(mk==null){ // Check if locked
      function callback(){chrome.runtime.sendMessage({command:"sendDialogError",msg:{success:false,error:"locked",result:null,data:request,message:"The wallet is locked!"},tab:tab,domain:domain});}
      createPopup(callback);
      }
    else{
      chrome.storage.local.get(['accounts','no_confirm'], function (items) { // Check user
        if(items.accounts==null||items.accounts==undefined){
          function callback(){sendErrors(tab,"no_wallet","No wallet!",request);}
          createPopup(callback);
        }
        else{
          // Check that user and wanted keys are in the wallet
          var accounts=(items.accounts==undefined||items.accounts=={list:[]})?null:decryptToJson(items.accounts,mk);
          if(!accounts.list.find(function(e){return e.name==request.username;})){
            function callback(){sendErrors(tab,"no_user","No wallet for this user!",request);}
            createPopup(callback);
          }
          else{
            var account=accounts.list.find(function(e){return e.name==request.username;});
            var typeWif=getRequiredWifType(request);
            console.log(typeWif);
            var req=request;
            if(req.type=="custom")
              req.method=typeWif;
            if(account.keys[typeWif]==undefined){
              function callback(){sendErrors(tab,"no_key_"+typeWif,"No "+typeWif+" key for user @"+account.name+"!",request);}
              createPopup(callback);
            }
            else{
              key=account.keys[typeWif];
              console.log(hasNoConfirm(JSON.parse(items.no_confirm),req,domain));
              if(!hasNoConfirm(JSON.parse(items.no_confirm),req,domain)){
                function callback(){chrome.runtime.sendMessage({command:"sendDialogConfirm",data:req,domain:domain,tab:tab});}
                createPopup(callback);
                // Send the request to confirmation window
              }
              else{
                chrome.windows.remove(id_win);
                performTransaction(req,tab);
              }
            }
          }
        }
    });
  }
 }

function hasNoConfirm(arr,data,domain){
  try{
    return arr[data.username][domain][data.type]==true;
  }
  catch(e){
    console.log(e);
    return false;
  }
}
// Send errors back to the content_script, it will forward it to website
function sendErrors(tab,error,message,request){
  chrome.tabs.sendMessage(tab,{command:"answerRequest",msg:{success:false,error:error,result:null,data:request,message:message}});
  chrome.runtime.sendMessage({command:"sendDialogError",msg:{success:false,error:error,result:null,data:request,message:message},tab:tab});
}

// Get the key needed for each type of transaction
function getRequiredWifType(request){
  switch(request.type){
    case "decode":
      return request.method.toLowerCase();
    break;
    case "post":
    case "vote":
      return "posting";
    break;
    case "custom":
        return (request.method==null||request.method==undefined)?"posting":request.method.toLowerCase();
    break;
    case "transfer":
       return"active";
    break;
  }
}
