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
    $("#custom_select_rpc select").html("");
    let listRPC=[];
    listRPC=local!=undefined?JSON.parse(local).concat(RPCs):RPCs;
    console.log(listRPC);
    console.log(RPCs);
    const currentrpc =current_rpc ==undefined?"https://api.steemit.com":current_rpc;
    listRPC=[current_rpc].concat(listRPC.filter((e)=>{ return e!=current_rpc }));
    $("#custom_select_rpc select").html(listRPC.reduce((acc,val)=>{return acc+"<option>"+val+"</option>";},""));

}

function switchRPC(rpc){
  console.log(rpc);
  steem.api.setOptions({
      url: rpc
  });
  setRPC(rpc);
  chrome.storage.local.set({current_rpc:rpc});
}
