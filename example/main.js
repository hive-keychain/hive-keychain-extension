// Send Handshake event
$("#sw-handshake").click(function(){
  dispatchCustomEvent("swHandshake", "")
});

// All transactions are sent via a swRequest event.
// Send decryption request
$("#send_decode").click(function(){
  var request={
              type:"decode",
              username:$("#decode_user").val(),
              message:$("#decode_message").val(), //must start by #
              method:$("#decode_method option:selected").text()
            };
  dispatchCustomEvent("swRequest",request);
});

// Send post request
$("#send_post").click(function(){
  var request={type:"post",
              username:$("#post_username").val(),
              title:$("#post_title").val(),
              body:$("#post_body").val(),
              parent_perm:$("#post_pp").val(),
              parent_username:$("#post_pu").val(), //optional
              json_metadata:$("#post_json").val(),
              permlink:$("#post_perm").val()
            };
  dispatchCustomEvent("swRequest",request);
});

// Send vote request
$("#send_vote").click(function(){
  var request={type:"vote",
              username:$("#vote_username").val(),
              permlink:$("#vote_perm").val(),
              author:$("#vote_author").val(),
              weight:$("#vote_weight").val()
              };
    dispatchCustomEvent("swRequest",request);
});

// Send Custom JSON request
$("#send_custom").click(function(){
  var request={type:"custom",
              username:$("#custom_username").val(),
              id:$("#custom_id").val(), //can be "custom", "follow", "reblog" etc.
              method:$("#custom_method option:selected").text(), // Posting key is used by default, active can be specified for id=custom .
              json:$("#custom_json").val() //content of your json
              };
    dispatchCustomEvent("swRequest",request);
});

// Send transfer request
$("#send_tra").click(function(){
  var request={type:"transfer",
              username:$("#transfer_from").val(),
              to:$("#transfer_to").val(),
              amount:$("#transfer_val").val(), // must contain 3 decimals
              memo:$("#transfer_memo").val(), // optional
              currency:$("#transfer_currency option:selected").text()
            };
  dispatchCustomEvent("swRequest",request);
});

//Send the customEvent
function dispatchCustomEvent(name,data){
    var event = new CustomEvent(name,{detail:data});
    document.dispatchEvent(event);
}

// Listener for Handshake response
function onGetHandshake(){
  //TODO: do what you want after receiving handshake.
  console.log("Handshake received from Steem Wallet!");
}

// Listener for transactions response
function onGetResponse(json){
  //TODO: do what you want after receiving response from SW
  console.log(json);
}
