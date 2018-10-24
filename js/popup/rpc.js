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
"https://steemd.privex.io",
"https://steemplus.app"];

function loadRPC(local,current_rpc){
    $("#custom_select_rpc").html("<select></select>");
    $("#pref_div .usernames .select-selected").remove();
    $("#pref_div .usernames .select-items").remove();
    let listRPC=[];
    listRPC=local!=undefined?JSON.parse(local).concat(RPCs):RPCs;
    console.log(listRPC);
    console.log(RPCs);
    const currentrpc =current_rpc ==undefined?"https://api.steemit.com":current_rpc;
    listRPC=[current_rpc].concat(listRPC.filter((e)=>{ return e!=current_rpc }));
    $("#custom_select_rpc select").html(listRPC.reduce((acc,val)=>{return acc+"<option>"+val+"</option>";},""));
    $("#custom_select_rpc select").append("<option>ADD RPC</option>");
}

function switchRPC(rpc){
  steem.api.setOptions({
      url: rpc
  });
  setRPC(rpc);
  chrome.storage.local.set({current_rpc:rpc});
}

function addNewRPC(rpc){
  chrome.storage.local.get(["rpc"],function(items){
      let customRPCs=[];
      if(items.rpc!=undefined)
        customRPCs=JSON.parse(items.rpc);
      customRPCs.push(rpc);
      chrome.storage.local.set({rpc:JSON.stringify(customRPCs)},function(){
        $(".success_div").html("RPC added succesfully!").show();
        showCustomRPC();
        setTimeout(function(){
          $(".success_div").html("").hide();
        },5000);
      });
  });
}

function showCustomRPC(){
  $("#custom_rpc").empty();
  chrome.storage.local.get(["rpc"],function(items){
    if (items.rpc){
      let rpcs=JSON.parse(items.rpc);
      for (rpc of rpcs){
        $("#custom_rpc").append("<div><div class='pref_name'>" + rpc + "</div><img class='deleteCustomRPC' src='../images/delete.png'/></div>");
      }
      $(".deleteCustomRPC").unbind("click").click(function(){
          rpcs=rpcs.filter((e)=>{return e!=$(this).prev().html();});
          chrome.storage.local.set({rpc:JSON.stringify(rpcs)},function(){
            showCustomRPC();
          });
      });
    }
  });
}
