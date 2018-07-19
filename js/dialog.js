chrome.runtime.onMessage.addListener(function(msg,sender,sendResp){
  if(msg.command=="sendDialogInfo"){
    if(!msg.msg.success){
      $("#dialog_header").html("Error");
      $("#dialog_header").addClass("error_header");
      $("#error_dialog").html(msg.msg.message);
      $(".modal-body button").click(function(){
          window.close();
      });
    }
  }
});
