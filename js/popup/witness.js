let witness_votes=[];
let proxy="";
let witness_ranks=null;

function prepareWitnessDiv(){
  $("#votes_remaining span").html(30-witness_votes.length);
  if(proxy!=""){
    $("#proxy div").html("PROXY: @ "+proxy);
    $("#proxy").show();
  }
  else
    $("#proxy").hide();
  if(!active_account.keys.hasOwnProperty("active"))
      $("#proxy div").addClass("no_active");
  else
    $("#proxy div").removeClass("no_active");

$("#list_wit").empty();
  for(wit of witness_votes){
    const isActive=(witness_ranks.filter((e)=>{return e.name==wit}).length==1)?"active":"disabled";
    $("#list_wit").append("<div class='witness-row'><span class='witName'>@"+wit+"</span><span class='isActive'>"+isActive+"</span></div>");
  }
  $("#top100_div").empty();

  let i=0;
  for(wit of witness_ranks){
    const isVoted=witness_votes.includes(wit.name)?"wit-vote wit-voted":"wit-vote wit-not-voted";
    i++;
    if(i<=100)
      $("#top100_div").append("<div class='witness-row'><span class='wit-rank'>"+wit.rank+"</span><span class='witName'>@"+wit.name+"</span><span class='"+isVoted+"'></span></div>");
  }


    if(!active_account.keys.hasOwnProperty("active"))
      $('.wit-vote').addClass("no_posting");
    else
      $(".wit-vote").removeClass("no_posting");

  $("#proxy div").click(function(){
    $("#proxy").hide();
    steem.broadcast.accountWitnessProxy(active_account.keys.active, active_account.name, "", function(err, result) {
      console.log(err, result);
    });
  });

  $(".wit-vote").click(function(){
    const voted_wit=$(this).hasClass("wit-voted");
    const that=this;

    console.log(voted_wit);
    steem.broadcast.accountWitnessVote(active_account.keys.active, active_account.name, $(this).prev().html().replace("@",""), $(this).hasClass("wit-voted")?0:1, function(err, result) {
      console.log(err, result);
      if(err==null){
        if(voted_wit){
          console.log("unvoted");
          $(that).removeClass("wit-voted");
          $(that).addClass("wit-not-voted");
          $("#votes_remaining span").html(parseInt($("#votes_remaining span").html())+1);
        }
        else {
          console.log("voted");
            $(that).removeClass("wit-not-voted");
            $(that).addClass("wit-voted");
            $("#votes_remaining span").html(parseInt($("#votes_remaining span").html())-1);
        }
      }
    });
  });

  $("#vote_wit").click(function(){
    //console.log($("#witness_div select option:selected").val());
    if($("#witness_div select option:selected").val()=="Wit"){
      steem.broadcast.accountWitnessVote(active_account.keys.active, active_account.name, $("#wit-username").val(), 1, function(err, result) {
        if(err==null){
            loadAccount(active_account.name);
        }
      });
    }
    else {
      steem.broadcast.accountWitnessProxy(active_account.keys.active, active_account.name, $("#wit-username").val(), function(err, result) {
        if(err==null){
            loadAccount(active_account.name);
        }
      });
    }
  });
}
