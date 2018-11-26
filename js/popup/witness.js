let witness_votes=[];
let proxy="";

function prepareWitnessDiv(){
  console.log(witness_votes.length);
  $("#votes_remaining span").html(30-witness_votes.length);
  if(proxy!=""){
    $("#proxy div").html("PROXY: @ "+proxy);
    $("#proxy").show();
  }
}
