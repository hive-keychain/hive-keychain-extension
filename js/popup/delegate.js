function prepareDelegationTab(){
  Promise.all([ getDelegatees(active_account.name), getDelegators(active_account.name)])
        .then(function(result) {
          console.log(result);
          const delegatees=result[0];
          const delegators=result[1];
        });
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
