const prepareDelegationTab = async () => {
  const [delegatees, delegators] = [
    await activeAccount.getDelegatees(),
    await activeAccount.getDelegators()
  ];
  console.log(delegatees, delegators);
  if (!activeAccount.hasKey("active")) {
    $("#send_del").addClass("disabled");
    $("#wrap_send_del").attr(
      "title",
      chrome.i18n.getMessage("popup_delegate_key")
    );
    $("#edit_del").addClass("disabled");
    $("#wrap_edit_del").attr(
      "title",
      chrome.i18n.getMessage("popup_delegate_key")
    );
  } else {
    $("#send_del").removeClass("disabled");
    $("#edit_del").removeClass("disabled");
    $("#wrap_edit_del").removeAttr("title");
    $("#wrap_send_del").removeAttr("title");
  }

  displayDelegationMain(delegators, delegatees);
  displayOutgoingDelegations(delegatees);
  displayIncomingDelegations(delegators);

  $("#send_del")
    .unbind("click")
    .click(function() {
      $("#send_del").hide();
      $("#del_loading").show();
      activeAccount.delegateHP(
        $("#amt_del").val(),
        $("#username_del").val(),
        function(err, result) {
          console.log(err, result);
          $("#send_del").show();
          $("#del_loading").hide();
          if (err) {
            showError(chrome.i18n.getMessage("unknown_error"));
          } else {
            showConfirm(chrome.i18n.getMessage("popup_delegate_success"));
            loadAccount(activeAccount.getName());
          }
        }
      );
    });
};

function getSumOutgoing(delegatees) {
  return delegatees.reduce(function(total, elt) {
    return total + parseFloat(elt.hp);
  }, 0);
}

function getSumIncoming(delegators) {
  return delegators.reduce(function(total, elt) {
    return total + parseFloat(elt.hp);
  }, 0);
}

const displayIncomingDelegations = delegators => {
  const sumIncoming = getSumIncoming(delegators);
  delegators = delegators.sort(function(a, b) {
    return b.hp - a.hp;
  });
  $("#total_incoming span")
    .eq(1)
    .html(numberWithCommas(sumIncoming.toFixed(3)) + " HP");
  $("#list_incoming").empty();
  for (delegator of delegators) {
    $("#list_incoming").append(
      "<div class='line_incoming'><span>@" +
        delegator.delegator +
        "</span><span>" +
        numberWithCommas(delegator.hp) +
        "</span></div>"
    );
  }
};

const displayDelegationMain = async (delegators, delegatees) => {
  const sumIncoming = getSumIncoming(delegators);
  const sumOutgoing = getSumOutgoing(delegatees);
  $("#incoming_del").html("+ " + numberWithCommas(sumIncoming.toFixed(3)));
  $("#outgoing_del").html("- " + numberWithCommas(sumOutgoing.toFixed(3)));
  $("#available_del").html(
    numberWithCommas(
      ((await activeAccount.getHP()) - 5 - sumOutgoing).toFixed(3)
    )
  );
};

const displayOutgoingDelegations = delegatees => {
  const sumOutgoing = getSumOutgoing(delegatees);
  $("#total_outgoing span")
    .eq(1)
    .html("- " + numberWithCommas(sumOutgoing.toFixed(3)) + " HP");
  $("#list_outgoing").empty();
  for (delegatee of delegatees) {
    $("#list_outgoing").append(
      "<div class='line_outgoing'><span>@" +
        delegatee.delegatee +
        "</span><span>" +
        numberWithCommas(delegatee.hp) +
        "</span><img src='../images/edit.png'/></div>"
    );
  }

  $(".line_outgoing img")
    .unbind("click")
    .click(function() {
      $("#outgoing_del_div").hide();
      $("#edit_del_div").show();
      let that = $(this);
      let this_delegatee = delegatees.filter(function(elt) {
        return (
          elt.delegatee ==
          that
            .parent()
            .children()
            .eq(0)
            .html()
            .replace("@", "")
        );
      });
      showEditDiv(this_delegatee);
    });
};

const showEditDiv = async delegatees => {
  const delegatee = delegatees[0];
  $("#this_outgoing_del").html(
    numberWithCommas(parseFloat(delegatee.hp)) + " HP"
  );
  $("#this_available_del").html(
    numberWithCommas(
      (
        parseFloat(
          $("#available_del")
            .html()
            .replace(",", "")
        ) + parseFloat(delegatee.hp)
      ).toFixed(3)
    ) + " HP"
  );
  $("#username_del span").html(delegatee.delegatee);
  $("#edit_del")
    .unbind("click")
    .click(function() {
      $("#edit_del").hide();
      $("#edit_del_loading").show();
      activeAccount.delegateHP(
        $("#amt_edit_del").val(),
        delegatee.delegatee,
        function(err, result) {
          console.log(err, result);
          $("#edit_del").show();
          $("#edit_del_loading").hide();
          if (err) {
            showError(chrome.i18n.getMessage("unknown_error"));
          } else {
            showConfirm(
              chrome.i18n.getMessage("popup_delegate_change_success")
            );
            loadAccount(activeAccount.getName());
            $("#edit_del_div").hide();
            $("#outgoing_del_div").show();
          }
        }
      );
    });
};
