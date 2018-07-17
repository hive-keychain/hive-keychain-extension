console.log("js load");
chrome.runtime.onMessage.addListener(function(msg,sender,sendResp){
  console.log("received");
  if(msg.command=="sendDialogInfo"){
    $("#dialog_header").html(msg.request);
  }
});
