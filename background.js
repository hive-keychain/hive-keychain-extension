chrome.runtime.onMessage.addListener(function(msg,sender,sendResp){
  console.log(msg);
  if(msg.command="isUnlocked"){
    chrome.runtime.sendMessage({isUnlocked:false,accounts:null},function(response){});
  }
});
