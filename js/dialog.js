chrome.runtime.onMessage.addListener(function(msg, sender, sendResp) {
  console.log("b",msg);

    if (msg.command == "sendDialogError") {
        // Display error window

        if (!msg.msg.success) {

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
            $("#dialog_header").html((msg.msg.error == "locked") ? "Unlock Wallet" : "Error");
            $("#dialog_header").addClass("error_header");
            $("#error_dialog").html(msg.msg.display_msg);
            $("#modal-body-msg").hide();
            $(".modal-body-error").show();
            $(".dialog-message").hide();
            $("#error-ok").click(function() { window.close(); });
        }
    } else if (msg.command == "wrongMk") {
        $("#error-mk").html("Wrong password!");
    } else if (msg.command == "sendDialogConfirm") {
        // Display confirmation window
        $("#confirm_footer").show();
				var type = msg.data.type;

				var titles = {
					'custom': 'Custom Transaction',
					'decode': 'Verify Key',
					'post': 'Post',
					'vote': 'Vote',
					'transfer': 'Transfer'
				};
				var title = titles[type];
				$("#dialog_header").html(title);

				if(msg.data.display_msg) {
					$('#modal-body-msg').css('max-height', '235px');
					$("#dialog_message").show();
					$("#dialog_message").html(msg.data.display_msg);
				}

        var message = "";
        $("." + type).show();
        $(".modal-body-error").hide();
        $("#username").html("@" + msg.data.username);
        $("#modal-content").css("align-items", "flex-start");
        if (type != "transfer") {
						$("#keep_div").show();
						var prompt_msg = (msg.data.type == 'decode') ? "Do not prompt again to verify keys for the @" + msg.data.username + " account on " + msg.domain
						 : "Do not prompt again to send " + msg.data.type + " transactions from the @" + msg.data.username + " account on " + msg.domain
            $("#keep_label").text(prompt_msg);
        }
        else {
          $(".keep_checkbox").css("visibility","hidden");
        }
        switch (type) {
            case "decode":
								$("#wif").html(msg.data.method);
								$('#modal-body-msg').css('max-height', '235px');
								$("#dialog_message").show();
								$("#dialog_message").html('The website ' + msg.domain + ' would like to verify that you have access to the private ' + msg.data.method + ' key for the account: @' + msg.data.username);
                break;
            case "vote":
                $("#weight").html(msg.data.weight / 100 + " %");
                $("#author").html('@' + msg.data.author);
                $("#perm").html(msg.data.permlink);
                break;
						case "custom":
								$("#custom_data").click(function() {
									$("#custom_json").slideToggle();
								});
                $("#custom_json").html(msg.data.id + '<br/>' + msg.data.json);
                $("#custom_key").html(msg.data.method);
                break;
            case "transfer":
                $("#to").html('@' + msg.data.to);
                $("#amount").html(msg.data.amount + " " + msg.data.currency);
                $("#memo").html(msg.data.memo);
                if (msg.data.memo.length > 0)
                    $(".transfer_memo").show();
                break;
            case "post":
                $("#title").html(msg.data.title);
                $("#permlink").html(msg.data.permlink);
                $("#body").html(msg.data.body);
                $("#json_metadata").html(msg.data.json_metadata);
                $("#parent_url").html(msg.data.parent_perm);
                $("#parent_username").html(msg.data.parent_username);
                if (msg.data.parent_username == null || msg.data.parent_username == undefined)
                    $("#parent_username").hide();
                break;
        }

        // Closes the window and launch the transaction in background
        $("#proceed").click(function() {
            chrome.runtime.sendMessage({
                command: "acceptTransaction",
                data: msg.data,
                tab: msg.tab,
                domain: msg.domain,
                keep: $("#keep").is(':checked')
            });
            $("#confirm_footer").hide();
            $("#modal-body-msg").hide();
            $(".dialog-message").hide();

        });

        // Closes the window and notify the content script (and then the website) that the user refused the transaction.
        $("#cancel").click(function() {
            window.close();
        });
    }
    else if(msg.command=="answerRequest"){
        console.log("a",msg);
        $("#dialog_header").html((msg.msg.success == true) ? "Success!" : "Error!");
        $("#error_dialog").html(msg.msg.message);
        $(".modal-body-error").show();
        $("#error-ok").click(function() { window.close(); });
    }
});
