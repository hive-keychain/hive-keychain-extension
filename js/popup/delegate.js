function prepareDelegationTab(){
  Promise.all([ getDelegatees(active_account.name), getDelegators(active_account.name),steem.api.getDynamicGlobalPropertiesAsync()])
        .then(function(result) {
          let delegatees=result[0];
          delegatees=delegatees.filter(function(elt){
            return elt.vesting_shares!=0;
          });
          let delegators=result[1];
          delegators=delegators.filter(function(elt){
            return elt.vesting_shares!=0;
          });
          const totalSteem = Number(result["2"].total_vesting_fund_steem.split(' ')[0]);
          const totalVests = Number(result["2"].total_vesting_shares.split(' ')[0]);
          if(delegatees.length>0)
            delegatees=delegatees.map(function(elt){
              elt.sp=steem.formatter.vestToSteem(
                parseFloat(
                  elt.vesting_shares.replace(' VESTS','')),
                   totalVests,
                    totalSteem
                  ).toFixed(3);
              return elt;
            });
          if(delegators.length>0)
            delegators=delegators.map(function(elt){
              elt.sp=steem.formatter.vestToSteem(elt.vesting_shares, totalVests, totalSteem).toFixed(3);
              return elt;
            });
          if(!active_account.keys.hasOwnProperty("active")){
            $("#send_del").addClass("disabled");
            $("#wrap_send_del").attr("title","Please add your active key to send delegations!");
          }
          else
            $("#send_del").removeClass("disabled");
          displayDelegationMain(delegators,delegatees);
          displayOutgoingDelegations(delegatees);
          $("#send_del").unbind("click").click(function(){
            let delegated_vest = parseFloat($("#amt_del").val()) * totalVests / totalSteem;
            delegated_vest = delegated_vest.toFixed(6);
            delegated_vest = delegated_vest.toString() + ' VESTS';

            steem.broadcast.delegateVestingShares(active_account.keys.active, active_account.name, $("#username_del").val(), delegated_vest, function(err, result) {
              console.log(err, result);
              if(err){
                showError("Something went wrong! Please try again!");
              }
              else{
                showConfirm("Your delegation was succesful!");
                loadAccount(active_account.name);
              }
            });
          });
  });
}

  function getSumOutgoing(delegatees){
    return delegatees.reduce(function(total,elt){
      return total+parseFloat(elt.sp);
    },0);
  }

  function getSumIncoming(delegators){
    return delegators.reduce(function(total,elt){
      return total+parseFloat(elt.sp);
    },0);
  }

  function displayOutgoingDelegations(delegatees){
    const sumOutgoing=getSumOutgoing(delegatees);
    $("#total_outgoing span").eq(1).html("- "+numberWithCommas(sumOutgoing.toFixed(3))+" SP");
    $("#list_outgoing").empty();
    for(delegatee of delegatees){
      $("#list_outgoing").append("<div class='line_outgoing'><span>@"+delegatee.delegatee+"</span><span>"+numberWithCommas(delegatee.sp)+"</span><img src='../images/edit.png'/></div>");
    }
  }

  function displayDelegationMain(delegators,delegatees){
    const sumIncoming=getSumIncoming(delegators);
    const sumOutgoing=getSumOutgoing(delegatees);
    console.log(sumIncoming,sumOutgoing,sp-5-sumOutgoing);
    $("#incoming_del").html("+ "+numberWithCommas(sumIncoming.toFixed(3)));
    $("#outgoing_del").html("- "+numberWithCommas(sumOutgoing.toFixed(3)));
    $("#available_del").html(numberWithCommas((sp-5-sumOutgoing).toFixed(3)));
  }

  function getDelegatees(name){
        return new Promise(function(fulfill,reject){
          steem.api.getVestingDelegations(name, null, 1000, function(err, outgoingDelegations) {
            console.log(err,outgoingDelegations);
            if(!err)
              fulfill(outgoingDelegations);
            else
              reject(err);
          });
        });
      }


function getDelegators(name){
      return new Promise(function(fulfill,reject){
        $.ajax({
          type: "GET",
          beforeSend: function(xhttp) {
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
          },
          url: 'https://api.steemplus.app/delegators/' + name,
          success: function(incomingDelegations) {
            fulfill(incomingDelegations);
          },
          error: function(msg) {
            console.log(msg);
            reject(msg);
          }
        });
      });
    }
