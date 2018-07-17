var mk=null;
var id_win=null;

chrome.runtime.onMessage.addListener(function(msg,sender,sendResp){
  if(msg.command=="getMk"){
    chrome.runtime.sendMessage({command:"sendBackMk",mk:mk},function(response){});
  }
});

chrome.runtime.onMessage.addListener(function(msg,sender,sendResp){
  if(msg.command=="sendMk"){
    mk=msg.mk;
    console.log(mk);
  }
});

chrome.runtime.onMessage.addListener(function(msg,sender,sendResp){
  if(msg.command=="sendRequest"){
    console.log(msg);
    createConfirmationPopup(msg.request);
  }
});
function createConfirmationPopup(request){
  console.log(request);
  var width=250;

  //Ensuring only one window is opened by the extension at a time.
  if(id_win!=null){
    chrome.windows.remove(id_win);
    id_win=null;
  }

  //Process the data received from the content script
  switch(request.type){
    case "decode":
    break;
    case "post":
    break;
    case "vote":
    break;
    case "custom":
    break;
    case "transfer":
    break;
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
          chrome.runtime.sendMessage({command:"sendDialogInfo",request},function(response){});
        },100);
   });
 }
