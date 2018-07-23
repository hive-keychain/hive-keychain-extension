chrome.runtime.onMessage.addListener(function(msg,sender,sendResp){
  if(msg.command=="sendDialogError"){
    if(!msg.msg.success){
      console.log(msg);
      $(".modal-content").addClass("modal-content-error");
      $("#dialog_header").html("Error");
      $("#dialog_header").addClass("error_header");
      $("#error_dialog").html(msg.msg.message);
      $("#modal-body-msg button").css("display","none");
      $(".modal-body-error button").click(function(){
          window.close();
      });
    }
  }
  else if(msg.command=="sendDialogConfirm"){
    var type=msg.data.type;
    var title=type=="custom"?"custom JSON":msg.data.type;
    title=title.charAt(0).toUpperCase()+title.slice(1);
    $("#dialog_header").html(title);
    var message="";
    $("."+type).css("display","block");
    $(".modal-body-error").css("display","none");
    $("#username").html("@"+msg.data.username);
    $("#modal-content").css("align-items","flex-start");
    switch (type) {
      case "decode":
        $("#wif").html(msg.data.method);
        break;
      case "vote":
        $("#weight").html(msg.data.weight/100+" %");
        $("#url").html(msg.data.url);
        break;
      case "custom":
        $("#custom_json").html(msg.data.json);
        break;
      case "transfer":
        $("#to").html(msg.data.to);
        $("#amount").html(msg.data.amount+" "+msg.data.currency);
        $("#memo").html(msg.data.memo);
        if(msg.data.memo.length>0)
          $(".transfer_memo").css("display","block");
        break;
      case "post":
      $("#title").html(msg.data.title);
      $("#permlink").html(msg.data.permlink);
      $("#body").html(msg.data.body);
      $("#json_metadata").html(msg.data.json_metadata);
      $("#parent_url").html(msg.data.parent_perm);
      $("#parent_username").html(msg.data.parent_username);
      if(msg.data.parent_username==null||msg.data.parent_username==undefined)
        $("#parent_username").css("display","none");
        break;
    }

    $("#proceed").click(function(){
      chrome.runtime.sendMessage({command:"acceptTransaction",data:msg.data,tab:msg.tab});
    });

    $("#cancel").click(function(){
      chrome.tabs.sendMessage(msg.tab,{command:"answerRequest",msg:{success:false,error:"user_cancel",result:null,data:msg.data,message:"Request canceled by user!"}});
      window.close();
    });
  }
});
