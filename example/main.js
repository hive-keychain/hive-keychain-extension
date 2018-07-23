$("#sw-handshake").click(function(){
  var event = new CustomEvent("swHandshake", {"detail":"a"});
  document.dispatchEvent(event);
});

// Send decryption request
$("#send_decode").click(function(){
  var request={
              type:"decode",
              username:$("#decode_user").val(),
              message:$("#decode_message").val(),
              method:$("#decode_method option:selected").text()
            };
  var event = new CustomEvent("swRequest", {detail:request});
  document.dispatchEvent(event);
});

// Send post request
$("#send_post").click(function(){
  var request={type:"post",
              username:$("#post_username").val(),
              title:$("#post_title").val(),
              body:$("#post_body").val(),
              parent_perm:$("#post_pp").val(),
              parent_username:$("#post_pu").val(),
              json_metadata:$("#post_json").val(),
              permlink:$("#post_perm").val()
            };
  var event = new CustomEvent("swRequest", {detail:request});
  document.dispatchEvent(event);
});

// Send vote request
$("#send_vote").click(function(){
  var request={type:"vote",
              username:$("#vote_username").val(),
              permlink:$("#vote_perm").val(),
              author:$("#vote_author").val(),
              weight:$("#vote_weight").val()
              };
  var event = new CustomEvent("swRequest", {detail:request});
  document.dispatchEvent(event);
});

// Send Custom JSON request
$("#send_custom").click(function(){
  var request={type:"custom",
              username:$("#custom_username").val(),
              json:$("#custom_json").val()
              };
  var event = new CustomEvent("swRequest", {detail:request});
  document.dispatchEvent(event);
});

// Send transfer request
$("#send_tra").click(function(){
  var request={type:"transfer",
              username:$("#transfer_from").val(),
              to:$("#transfer_to").val(),
              amount:$("#transfer_val").val(),
              memo:$("#transfer_memo").val(),
              currency:$("#transfer_currency option:selected").text()
            };
  var event = new CustomEvent("swRequest", {detail:request});
  document.dispatchEvent(event);
});

function onGetHandshake(){
  //TODO: do what you want after receiving handshake.
  console.log("Handshake received from Steem Wallet!");
}

function onGetResponse(json){
  //TODO: do what you want after receiving response from SW
  console.log(json);
}
