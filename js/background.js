var mk=null;
var id_win=null;

chrome.runtime.onMessage.addListener(function(msg,sender,sendResp){
  if(msg.command=="getMk"){
    chrome.runtime.sendMessage({command:"sendBackMk",mk:mk},function(response){});
  }
  else if(msg.command=="sendMk"){
    mk=msg.mk;
    console.log(mk);
  }
  else if(msg.command=="sendRequest"){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      createConfirmationPopup(msg.request,tabs[0].id,msg.domain);
    });
  }
  else if(msg.command=="acceptTransaction"){

  }
});


function createConfirmationPopup(request,tab,domain){
  console.log(request);
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
          if(mk==null){
              sendErrors(tab,"locked","The wallet is locked!",request);
            }
          else{
            chrome.storage.local.get(['accounts'], function (items) {
                  if(items.accounts==null||items.accounts==undefined)
                    sendErrors(tab,"no_user","No wallet for this user!",request);
                  else{
                    var accounts=(items.accounts==undefined||items.accounts=={list:[]})?null:decryptToJson(items.accounts,mk);
                    if(!accounts.list.find(function(e){return e.name==request.username;}))
                      sendErrors(tab,"no_user","No wallet for this user!",request);
                    else{
                      var account=accounts.list.find(function(e){return e.name==request.username;});
                      var typeWif=getRequiredWifType(request);
                      if(account.keys[typeWif]==undefined)
                        sendErrors(tab,"no_key_"+typeWif,"No "+typeWif+" key for user @"+account.name+"!",request);
                      else
                        chrome.runtime.sendMessage({command:"sendDialogConfirm",data:request,domain:domain,tab:tab});
                    }
                  }
              });
          }
        },100);
   });
 }

function sendErrors(tab,error,message,request){
  chrome.tabs.sendMessage(tab,{command:"answerRequest",msg:{success:false,error:error,result:null,data:request,message:message}});
  chrome.runtime.sendMessage({command:"sendDialogError",msg:{success:false,error:error,result:null,data:request,message:message}});
}

function getRequiredWifType(request){
  switch(request.type){
    case "decode":
      return request.method.toLowerCase();
    break;
    case "post":
    case "vote":
    case "custom":
      return "posting";
    break;
    case "transfer":
       return"active";
    break;
  }
}
