const RPCs=[
"https://api.steemit.com",
"https://api.steemitdev.com",
"https://api.steemitstage.com",
"https://api.steem.house",
"https://appbasetest.timcliff.com",
"https://appbase.buildteam.io",
"https://gtg.steem.house:8090",
"https://rpc.buildteam.io",
"https://rpc.curiesteem.com",
"https://rpc.steemliberator.com",
"https://rpc.steemviz.com",
"https://steemd.minnowsupportproject.org",
"https://steemd.privex.io"];

function loadRPC(localRPCS){
    $("#custom_select_rpc select").html("");
    if(localRPCS!=undefined){
      for (localRPC of localRPCs){
        $("#custom_select_rpc select").append("<option>"+localRPC+"</option>")
      }
    }
    for (RPC of RPCs){
      $("#custom_select_rpc select").append("<option>"+RPC+"</option>")
    }
}

function switchRPC(rpc){
  steem.api.setOptions({
      url: rpc
  });
  chrome.storage.local.set({current_rpc:rpc});
}
