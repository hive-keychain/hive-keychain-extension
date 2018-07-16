var mk=null;

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

alert('Hello, World!');
