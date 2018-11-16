chrome.runtime.onMessage.addListener(function(msg, sender, sendResp) {
    if (msg.command == "sendDialogError") {
        // Display error window

        if (!msg.msg.success) {

            $("#tx_loading").hide();
            if (msg.msg.error == "locked") {
                $(".unlock").show();
                $("#error-ok").hide();
                $("#no-unlock").click(function() {
                    window.close();
                });
                $("#yes-unlock").click(function() {
                    chrome.runtime.sendMessage({
                        command: "unlockFromDialog",
                        data: msg.msg.data,
                        tab: msg.tab,
                        mk: $("#unlock-dialog").val(),
                        domain: msg.domain,
                        request_id: msg.request_id
                    });
                });
                $('#unlock-dialog').keypress(function(e) {
                    if (e.keyCode == 13)
                        $('#yes-unlock').click();
                });
                $('#unlock-dialog').focus();
            }
            $("#dialog_header").text((msg.msg.error == "locked") ? "Unlock Keychain" : "Error");
            $("#dialog_header").addClass("error_header");
            $("#error_dialog").text(msg.msg.display_msg);
            $("#modal-body-msg").hide();
            $(".modal-body-error").show();
            $(".dialog-message").hide();
            $("#error-ok").click(function() {
                window.close();
            });
        }
    } else if (msg.command == "wrongMk") {
        $("#error-mk").html("Wrong password!");
    } else if (msg.command == "sendDialogConfirm") {

        let enforce = null;
        let encode=null;
        // Display confirmation window
        $("#confirm_footer").show();
        $('#modal-body-msg').show();
        var type = msg.data.type;

        var titles = {
            'custom': 'Custom Transaction',
            'decode': 'Verify Key',
            'signBuffer': 'Sign Message',
            'broadcast': 'Broadcast',
            'signedCall': 'Signed Call',
            'post': 'Post',
            'vote': 'Vote',
            'transfer': 'Transfer',
            'delegation': 'Delegation'
        };
        var title = titles[type];
        $("#dialog_header").html(title);

        if (msg.data.display_msg) {
            $('#modal-body-msg .msg-data').css('max-height', '245px');
            $("#dialog_message").show();
            $("#dialog_message").text(msg.data.display_msg);
        }

        if (type == "transfer") {
            $('#modal-body-msg .msg-data').css('max-height', '200px');
            let accounts = msg.accounts;
            if (msg.data.username !== undefined) {
                let i = msg.accounts.findIndex(function(elt) {
                    return elt.name == msg.data.username;
                });

                let first = [accounts[i]];
                delete accounts[i];
                accounts = first.concat(accounts);
            }
            for (acc of accounts) {
                if (acc != undefined)
                    $("#select_transfer").append("<option>" + acc.name + "</option>");
            }
            initiateCustomSelect();
        }
        var message = "";
        $("." + type).show();
        $(".modal-body-error").hide();
        $("#username").text("@" + msg.data.username);
        $("#modal-content").css("align-items", "flex-start");
        const keyVerifyAction = msg.data.type == 'decode' || msg.data.type == 'signBuffer';
        if (type != "transfer" && type != "delegation") {
            $("#keep_div").show();
            var prompt_msg = keyVerifyAction ? "Do not prompt again to verify keys for the @" + msg.data.username + " account on " + msg.domain :
                "Do not prompt again to send " + msg.data.type + " transactions from the @" + msg.data.username + " account on " + msg.domain
            $("#keep_label").text(prompt_msg);
        } else {
            $(".keep_checkbox").css("display", "none");
        }
        switch (type) {
            case "decode":
                $("#wif").html(msg.data.method);
                $('#modal-body-msg').css('max-height', '235px');
                $("#dialog_message").show();
                $("#dialog_message").text('The website ' + msg.domain + ' would like to verify that you have access to the private ' + msg.data.method + ' key for the account: @' + msg.data.username);
                break;
            case "signBuffer":
              $("#dialog_message").show();
              $("#dialog_message").text('The website ' + msg.domain + ' would like you to sign a message using the ' + msg.data.method + ' key for the account: @' + msg.data.username);
              $("#message_sign").text(msg.data.message);
                break;
            case "broadcast":
                $("#custom_data").click(function() {
                    $("#custom_json").slideToggle();
                });
                $("#custom_json").html(JSON.stringify(msg.data.operations));
                $("#custom_key").text(msg.data.method);
                break;
            case "signedCall":
                $("#custom_data").click(function() {
                    $("#custom_json").slideToggle();
                });
                $("#custom_json div").eq(0).text(msg.data.method);
                $("#custom_json div").eq(1).text(msg.data.json);

                $("#custom_key").text(msg.data.typeWif);
                break;
            case "vote":
                $("#weight").text(msg.data.weight / 100 + " %");
                $("#author").text('@' + msg.data.author);
                $("#perm").text(msg.data.permlink);
                break;
            case "custom":
                $("#custom_data").click(function() {
                    $("#custom_json").slideToggle();
                });
                $("#custom_json div").eq(0).text(msg.data.id );
                $("#custom_json div").eq(1).text(msg.data.json);
                $("#custom_key").text(msg.data.method);
                break;
            case "transfer":
                encode=(msg.data.memo!=undefined&&msg.data.memo.length>0&&msg.data.memo[0]=="#");
                enforce=msg.data.enforce||encode;
                if(enforce){
                  $("#username").show();
                  $("#username").prev().show();
                  $("#transfer_acct_list").hide();
                }
                $("#to").text('@' + msg.data.to);
                $("#amount").text(msg.data.amount + " " + msg.data.currency);
                $("#memo").text(msg.data.memo);
                if (msg.data.memo.length > 0)
                    $(".transfer_memo").show();
                break;
            case "post":
                $("#body_toggle").click(function() {
                    $("#body").slideToggle();
                });
                $("#options_toggle").click(function() {
                    $("#options").slideToggle();
                });
                $("#title").text(msg.data.title);
                $("#permlink").text(msg.data.permlink);
                $("#body").text(msg.data.body);
                $("#json_metadata").text(msg.data.json_metadata);
                $("#parent_url").text(msg.data.parent_perm);
                $("#parent_username").text(msg.data.parent_username);
                if (msg.data.comment_options != "") {
                    let options = JSON.parse(msg.data.comment_options);
                    $("#max_payout").text(options.max_accepted_payout);
                    $("#percent_sbd").text(options.percent_steem_dollars);
                    $("#allow_votes").text(options.allow_votes);
                    $("#allow_curation_rewards").text(options.allow_curation_rewards);
                    let beneficiaries = "";
                    for (benef of options.extensions[0][1].beneficiaries) {
                        beneficiaries += "@" + benef.account + " (" + (benef.weight / 100).toFixed(2) + "%) ";
                    }
                    if (beneficiaries != "")
                        $("#beneficiaries").text(beneficiaries);
                    else
                        $("#beneficiaries_div").hide();
                } else $("#options_toggle").hide();
                if (msg.data.parent_username == "" || msg.data.parent_username == null || msg.data.parent_username == undefined) {
                    $("#parent_username").hide();
                    $("#parent_username_title").hide();
                }
                break;
            case "delegation":
                $("#delegatee").text("@" + msg.data.delegatee);
                $("#amt_sp").text(msg.data.amount +" "+ msg.data.unit);
                break;
        }

        // Closes the window and launch the transaction in background
        $("#proceed").click(function() {
            let data = msg.data;
            if (data.type == "transfer"&&!enforce)
                data.username = $("#select_transfer option:selected").val();
            chrome.runtime.sendMessage({
                command: "acceptTransaction",
                data: data,
                tab: msg.tab,
                domain: msg.domain,
                keep: $("#keep").is(':checked')
            });
            if (type == 'decode' || type == 'signBuffer')
                window.close();
            else {
                $("#confirm_footer").hide();
                $("#modal-body-msg").hide();
                $(".dialog-message").hide();
                $('#tx_loading').show();
            }
        });

        // Closes the window and notify the content script (and then the website) that the user refused the transaction.
        $("#cancel").click(function() {
            window.close();
        });
    } else if (msg.command == "answerRequest") {
        $('#tx_loading').hide();
        $("#dialog_header").text((msg.msg.success == true) ? "Success!" : "Error!");
        $("#error_dialog").text(msg.msg.message);
        $(".modal-body-error").show();
        $("#error-ok").click(function() {
            window.close();
        });
    }
});

function initiateCustomSelect() {
    /*look for any elements with the class "custom-select":*/
    x = document.getElementsByClassName("custom-select");

    for (i = 0; i < x.length; i++) {
        selElmnt = x[i].getElementsByTagName("select")[0];

        /*for each element, create a new DIV that will act as the selected item:*/
        a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);
        /*for each element, create a new DIV that will contain the option list:*/
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");
        for (j = 0; j < selElmnt.length; j++) {
            /*for each option in the original select element,
            create a new DIV that will act as an option item:*/
            c = document.createElement("DIV");
            c.innerHTML = selElmnt.options[j].innerHTML;
            c.addEventListener("click", function(e) {
                /*when an item is clicked, update the original select box,
                and the selected item:*/
                var y, i, k, s, h;
                s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                h = this.parentNode.previousSibling;
                for (i = 0; i < s.length; i++) {
                    if (s.options[i].innerHTML == this.innerHTML) {
                        s.selectedIndex = i;
                        h.innerHTML = this.innerHTML;
                        y = this.parentNode.getElementsByClassName("same-as-selected");
                        for (k = 0; k < y.length; k++) {
                            y[k].removeAttribute("class");
                        }
                        this.setAttribute("class", "same-as-selected");
                        break;
                    }
                }
                h.click();
            });
            b.appendChild(c);
        }
        x[i].appendChild(b);
        a.addEventListener("click", function(e) {
            /*when the select box is clicked, close any other select boxes,
            and open/close the current select box:*/
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
        });
    }

    function closeAllSelect(elmnt) {
        /*a function that will close all select boxes in the document,
        except the current select box:*/
        var x, y, i, arrNo = [];
        x = document.getElementsByClassName("select-items");
        y = document.getElementsByClassName("select-selected");
        for (i = 0; i < y.length; i++) {
            if (elmnt == y[i]) {
                arrNo.push(i)
            } else {
                y[i].classList.remove("select-arrow-active");
            }
        }
        for (i = 0; i < x.length; i++) {
            if (arrNo.indexOf(i)) {
                x[i].classList.add("select-hide");
            }
        }
    }
    /*if the user clicks anywhere outside the select box,
    then close all select boxes:*/
    document.addEventListener("click", closeAllSelect);
}
